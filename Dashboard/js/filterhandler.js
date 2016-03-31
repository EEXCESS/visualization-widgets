var FilterHandler = {

    currentFilter: null,
    listFilter: null,
    registeredFilterVisualisations: [],
    filters: [],
    filterVisualisations: [],
    inputData: {},
    $filterRoot: null,
    vis: null,
    ext: null,
    doShowSingleChartPerType: true,
    Internal: {},
    visualisationSettings:[],
    activeFiltersNames: [],
    preferTextualViz: false,
    textualFilterMode: 'vizOnly', // 'textOnly', textAndViz', 'vizOnly' = undefined
    wasFilterIntroShown: localStorageCustom.getItem('wasFilterIntroShown'),
    //wasFilterIntroShown: false,
    
    // Used by WebGLVis-Plugin. Overwrites the data of the current collection to use
    // other collections' facets inside the miniviz.
    otherCollectionData : null,

    initialize: function (vis, ext, filterRootSelector) {
        FilterHandler.vis = vis;
        FilterHandler.ext = ext;
        FilterHandler.$filterRoot = $(filterRootSelector);

        FilterHandler.initializeFilterAreas();
        
        FilterHandler.chartNameChanged($("#eexcess_select_chart").val())     
    },
        
     initializeData: function (orignalData, mapping) {;
        var selectedColorDimension;
        var colorMapping = underscore.filter(mapping, { 'visualattribute': 'color' });
        if (colorMapping.length > 0)
            selectedColorDimension = colorMapping[0].facet;
        
        var timeSettings = { minYear: undefined, maxYear: undefined };
        var categorySettings = { dimension: selectedColorDimension, dimensionValues: [] };

        for (var i = 0; i < orignalData.length; i++) {
            var currentYear = orignalData[i].facets.year;
            currentYear = getCorrectedYear(currentYear)
            if ($.isNumeric(currentYear)) {
                if (timeSettings.minYear == undefined) {
                    timeSettings.minYear = currentYear;
                    timeSettings.maxYear = currentYear;
                }
                if (timeSettings.minYear > currentYear)
                    timeSettings.minYear = currentYear;
                if (timeSettings.maxYear < currentYear)
                    timeSettings.maxYear = currentYear;
            }
            if (!underscore.includes(categorySettings.dimensionValues, orignalData[i].facets[selectedColorDimension])) {
                categorySettings.dimensionValues.push(orignalData[i].facets[selectedColorDimension]);
            }
        }
        
        FilterHandler.reset();
        FilterHandler.visualisationSettings["time"] = timeSettings;
        FilterHandler.visualisationSettings["category"] = categorySettings;
    },
    
    initializeFilterAreas: function(){
        
        FilterHandler.$filterRoot.find('.filterarea header').on('click', function (e) {
            var $area = $(this).closest('.filterarea');
            // if ($(e.target).is('.expand')){                
                 FilterHandler.expandFilterArea($area, !$area.find('.chart-container').hasClass('expanded'), true);                
            // } else {
            //     $("#eexcess_select_chart").val($area.data('targetchart')).change();
            // }
        });
        
        FilterHandler.$filterRoot.find('.filterarea').each(function(){
            var $area = $(this);
            $area.append('<div class="chart-container no-filter"><div class="no-filter-text">No filter active</div></div>');
            $area.find('header').prepend('<span class="expand batch-sm batch-sm-arrow-right"></span>');
            $area.find('header').append('<div class="filter-controls"><span class="filter-keep batch-sm batch-sm-add"></span> <span class="filter-remove batch-sm batch-sm-delete"></span></div>');
        });
        
        FilterHandler.$filterRoot.find('.filter-remove').on('click', function (e) {
            e.stopPropagation();
            var $filterArea = $(this).closest('.filterarea');
            var isCurrentFilter = FilterHandler.currentFilter != null && FilterHandler.currentFilter.type == FilterHandler.getTypeOfArea($filterArea);
            FilterHandler.removeFilter($filterArea);
            var filterType = $filterArea.attr('data-filtertype');
            LoggingHandler.log({ action: isCurrentFilter ? "Brush removed" : "Filter removed", component : filterType, widget: 'trash' }); // todo: old / new
        });
        FilterHandler.$filterRoot.find('.filter-keep').on('click', function (e) {
            e.stopPropagation();
            var filterType = $(this).closest('.filterarea').attr('data-filtertype');
            FilterHandler.makeCurrentPermanent(filterType);
            $(this).removeClass('active');
            
            var filteredDataIds = FilterHandler.mergeFilteredDataIds();
            var count = 0;
            if (filteredDataIds != null)
                count = filteredDataIds.length;
            LoggingHandler.log({ action: "Filter saved", component : filterType, itemCount: count });
        });
        FilterHandler.$filterRoot.on('click', '.filter-container', function(){
            var filterType = $(this).closest('.filterarea').attr('data-filtertype');
            LoggingHandler.log({ action: "Microvis clicked", component : filterType });
        });
    },
    
    chartNameChanged:function(newName){
        $('.filterarea').removeClass('active');
        $('.filterarea[data-targetchart=' + newName + ']').addClass('active');
    },

    setInputData: function (type, inputData) {
        FilterHandler.inputData[type] = inputData;
    },

    expandFilterArea: function ($area, doExpand, isDoneByClick) {
        $area.find('.chart-container').toggleClass('expanded', doExpand);
        $area.find('span.expand')
            .toggleClass('batch-sm-arrow-right', !doExpand)
            .toggleClass('batch-sm-arrow-down', doExpand);
            
        if (isDoneByClick)
            LoggingHandler.log({ action: "Filter " + (doExpand ? "expanded" : "collapsed") + " by User", source : $area.attr('data-filtertype') });
    },
    
    collapseCurrent: function(){
        if (!FilterHandler.currentFilter)
            return;
        var $filterArea = FilterHandler.getFilterArea(FilterHandler.currentFilter.type);
        FilterHandler.expandFilterArea($filterArea, false, false);
    },
    
    setActiveFilters: function(){
        var filterTypes = underscore(FilterHandler.filters).map(function(f){
            return f.type; 
            });
        if (FilterHandler.currentFilter != null)
            filterTypes.push(FilterHandler.currentFilter.type);
            
        FilterHandler.activeFiltersNames = underscore(filterTypes).uniq();
        //console.log('filters set: ');
        //console.log(FilterHandler.activeFiltersNames);
    },
    
    getFilterArea: function (type) {
        return FilterHandler.$filterRoot.find('#filterarea-' + type);
    },

    getFilterVisualisation: function (type) {
        if (FilterHandler.filterVisualisations[type]) {
            return FilterHandler.filterVisualisations[type];
        }
        var newFilterVis = { $container: $('<div class="filter-container"></div>') };
        var $filter = $('<div class="filter-container-outer current"></div>').append(newFilterVis.$container);
        //if (doIncludeControls)
            //$filter.prepend($('<div class="filter-controls"><a href="#" class="filter-keep"><span class="batch-sm-add"></span></a> <a href="#" class="filter-remove"><span class="batch-sm-delete"></span></a></div>'));

        var $filterArea = FilterHandler.getFilterArea(type);
        FilterHandler.expandFilterArea($filterArea, true, false);
        $filterArea.find('.chart-container').removeClass('no-filter').prepend($filter);

        newFilterVis.Object = PluginHandler.getFilterPluginForType(type, FilterHandler.preferTextualViz).Object;
        newFilterVis.Object.initialize(FilterHandler.vis);

        FilterHandler.filterVisualisations[type] = newFilterVis;
        return newFilterVis;
    },

    scrollToShowFilter: function (type) {
        var filterVisualisation = this.getFilterVisualisation(type);
        var $scrollContainer = $('#eexcess_controls');        
        // does not work because of loading callbacks: element height is 0 at the beginning...
        //if (filterVisualisation.$container.height() == 0){
        filterVisualisation.$container.scrollintoview();
    },

    getAllFilters: function (type) {
        var filters = [];
        filters = underscore(FilterHandler.filters).filter({ 'type': type });
        if (FilterHandler.currentFilter != null && FilterHandler.currentFilter.type == type)
            filters.push(FilterHandler.currentFilter);
        
        return filters;
    },

    addEmptyFilter: function (type) {
        FilterHandler.currentFilter = { type: type, from: null, to: null, dataWithinFilter: [] };
        var $filterArea = FilterHandler.getFilterArea(type);
        $filterArea.find('.filter-keep, .filter-remove').addClass('active');
        FilterHandler.setActiveFilters();
    },

    addEmptyListFilter: function () {
        var currentFilterTemp = FilterHandler.currentFilter;
        FilterHandler.getFilterVisualisation('list');
        FilterHandler.addEmptyFilter('list');
        FilterHandler.listFilter = FilterHandler.currentFilter;
        FilterHandler.listFilter.itemsClicked = []; // { data: object, selectionMode: single/add/remove }
        FilterHandler.currentFilter = currentFilterTemp;
        FilterHandler.setActiveFilters();
        // todo: re-enable
        //// move sort order
        //if (FilterHandler.currentFilter != null)
        //    FilterHandler.listFilter.$container.parents('.filter-container-outer').insertAfter(FilterHandler.currentFilter.$container.parents('.filter-container-outer'));
    },

    setCurrentFilterRange: function (type, selectedData, from, to, timeCategory) {
        if (from == null && to == null)
            return FilterHandler.clearCurrent();

        if (FilterHandler.currentFilter !== null && type !== FilterHandler.currentFilter.type)
            FilterHandler.clearCurrent();

        FilterHandler.setCurrentFilter(type, selectedData, null, null, from, to, timeCategory);
    },

    setCurrentFilterCategories: function (type, selectedData, category, categoryValues) {
        if (categoryValues == null)
            return FilterHandler.clearCurrent();

        if (FilterHandler.currentFilter !== null && type !== FilterHandler.currentFilter.type)
            FilterHandler.clearCurrent();

        FilterHandler.setCurrentFilter(type, selectedData, category, categoryValues, null, null);
    },

    setCurrentFilterKeywords: function (selectedData, values) {
        FilterHandler.setCurrentFilterCategories('keyword', selectedData, null, values);
    },

    setCurrentFilter: function (type, selectedData, category, categoryValues, from, to, timeCategory) {
        FilterHandler.showFirstBrushIntro();
        if (FilterHandler.currentFilter == null)
            FilterHandler.addEmptyFilter(type);

        FilterHandler.currentFilter.type = type;
        FilterHandler.currentFilter.categoryValues = categoryValues;
        FilterHandler.currentFilter.category = category;
        FilterHandler.currentFilter.from = from;
        FilterHandler.currentFilter.to = to;
        FilterHandler.currentFilter.dataWithinFilter = selectedData
        FilterHandler.currentFilter.timeCategory = timeCategory;

        FilterHandler.refreshCurrent();
        FilterHandler.scrollToShowFilter(type);
    },
	
    // rename dataItemSelected --> selectedDataItem
    singleItemSelected: function (dataItemSelected, selectedWithAddingKey) {
        selectedWithAddingKey = selectedWithAddingKey || false;
        if (FilterHandler.listFilter == null)
            FilterHandler.addEmptyListFilter();

        if (selectedWithAddingKey) {
            // look if already selected before.
            var existingItemIndex = underscore.findIndex(FilterHandler.listFilter.itemsClicked, function (d) { return d.data.id == dataItemSelected.id; });
            if (existingItemIndex >= 0) {
                FilterHandler.listFilter.itemsClicked.splice(existingItemIndex, 1);
            } else {
                // look if item is already included in other filters:
                var selectionMode = "add";
                var rangeFilteredDataIds = FilterHandler.mergeRangeFiltersDataIds();
                if (rangeFilteredDataIds.indexOf(dataItemSelected.id) >= 0)
                    selectionMode = "remove";

                FilterHandler.listFilter.itemsClicked.push({ data: dataItemSelected, selectionMode: selectionMode });
            }
        } else {
            if (FilterHandler.listFilter.itemsClicked.length == 1 && FilterHandler.listFilter.itemsClicked[0].data.id == dataItemSelected.id)
                FilterHandler.listFilter.itemsClicked = [];
            else
                FilterHandler.listFilter.itemsClicked = [{ data: dataItemSelected, selectionMode: "single" }];
        }

        FilterHandler.listFilter.dataWithinFilter = underscore.map(FilterHandler.listFilter.itemsClicked, function (d) { return d.data; });
        FilterHandler.refreshListFilter();
        FilterHandler.scrollToShowFilter('list');
    },

    refreshCurrent: function () {
        FilterHandler.refreshFiltervisualisation(FilterHandler.currentFilter.type);
    },

    refreshAll: function () {
        for (var i=0; i<FilterHandler.filters.length; i++){
            FilterHandler.refreshFiltervisualisation(FilterHandler.filters[i].type);    
        }
        if (FilterHandler.currentFilter != null)
            FilterHandler.refreshFiltervisualisation(FilterHandler.currentFilter.type);
        if (FilterHandler.listFilter != null)
            FilterHandler.refreshListFilter();
    },

    refreshFiltervisualisation: function (type) {
        var filterVisualisation = FilterHandler.getFilterVisualisation(type);
        var filters = FilterHandler.getAllFilters(type);

        
        
        var allData =  FilterHandler.vis.getData();
        
        var settings = FilterHandler.visualisationSettings[type] || {};        
        // enhance settings with needed globalSettings
        settings.textualFilterMode = FilterHandler.textualFilterMode;

        
        
        /*
         * Visualize data of another collection
         * (P.H. 11.2.16)
         */
        if(FilterHandler.otherCollectionData) { 
            
            // Get collection-data, set in the plugin
            allData = FilterHandler.otherCollectionData;
            
            //Change *dimension-values* to those of the otherCollection
            new_vals  = [];
            for (var i=0; i< allData.length; i++) {
                
                var facet_val = allData[i].facets[settings.dimension];
                new_vals.push(facet_val);
            }
            settings.dimensionValues = _.uniq(new_vals);
        }
        
       
        
        filterVisualisation.Object.draw(
            allData,
            FilterHandler.inputData[type],
            filterVisualisation.$container,
            filters,
            settings);

        FilterHandler.ext.selectItems();
    },

    refreshListFilter: function () {

        if (FilterHandler.listFilter != null && FilterHandler.listFilter.itemsClicked.length == 0) {
            FilterHandler.clearList();
        }
        
        var settings = FilterHandler.visualisationSettings['list'] || {};
        // enhance settings with needed globalSettings
        settings.textualFilterMode = FilterHandler.textualFilterMode;

        if (FilterHandler.listFilter != null) {
            var filterVisualisation = FilterHandler.getFilterVisualisation('list');
            
            var allData = FilterHandler.otherCollectionData ?  FilterHandler.otherCollectionData : filterVisualisation.$container;
            filterVisualisation.Object.draw(
                allData,
                FilterHandler.listFilter.itemsClicked,
                FilterHandler.listFilter.dataWithinFilter,
                settings);
        }

        FilterHandler.ext.selectItems();
    },

    clearCurrent: function () {
        if (FilterHandler.currentFilter == null)
            return;

        var type = FilterHandler.currentFilter.type;
        if (!underscore(FilterHandler.filters).some(function(item){ return item.type == type; })){
            FilterHandler.clearType(type);
        } else {
            FilterHandler.currentFilter = null;
            FilterHandler.refreshFiltervisualisation(type);
        }
        
        FilterHandler.ext.selectItems();
    },

    clearList: function () {
        if (FilterHandler.listFilter == null)
            return;

        FilterHandler.clearType(FilterHandler.listFilter.type);
    },

    clearListAndRefresh: function () {
        FilterHandler.clearList();
        FilterHandler.ext.selectItems();
    },

    clearType: function (type) {       
        var filterVisualisation = FilterHandler.getFilterVisualisation(type);

        filterVisualisation.Object.finalize(filterVisualisation.$container);
        filterVisualisation.Object = null;
        filterVisualisation.$container.closest('.chart-container').addClass('no-filter');
        filterVisualisation.$container.closest('.filter-container-outer').remove();
        FilterHandler.filterVisualisations[type] = null;
        FilterHandler.getFilterArea(type).find('.filter-keep, .filter-remove').removeClass('active');
        
        FilterHandler.filters = underscore(FilterHandler.filters).filter(function(item){ return item.type != type; });
        if (FilterHandler.currentFilter != null && FilterHandler.currentFilter.type == type){
            FilterHandler.currentFilter = null;            
        }
        
        if (type == 'list'){
            FilterHandler.listFilter = null;
        }
        
        FilterHandler.setActiveFilters();
    },

    reset: function () {
        FilterHandler.clearCurrent();
        FilterHandler.clearList();
        for (var i = 0; i < FilterHandler.filters.length; i++) {
            FilterHandler.clearType(FilterHandler.filters[i].type);
        }
        
        FilterHandler.ext.filterData(null);
    },

    makeCurrentPermanent: function (type) {        
        if (type == "list" && FilterHandler.listFilter != null){
            // user wants to save the listFilter:
            FilterHandler.filters.push(FilterHandler.listFilter);
            FilterHandler.listFilter = null;
            FilterHandler.ext.filterData(FilterHandler.mergeFilteredDataIds());
            return;
        }
        
        if (FilterHandler.currentFilter == null){
            return;
        }

        // remove all previous filters of this type, as there is only one filter (and one brush) for each type.
        FilterHandler.filters = underscore(FilterHandler.filters).filter(function(filter){ return filter.type != FilterHandler.currentFilter.type; });
        FilterHandler.filters.push(FilterHandler.currentFilter);
        FilterHandler.currentFilter = null;
        FilterHandler.ext.filterData(FilterHandler.mergeFilteredDataIds());
    },

    getTypeOfArea: function($filterArea){
        return $filterArea.attr('id').substring(11); //filterarea- prefix
    },
    
    showFirstBrushIntro: function(){
        if (!FilterHandler.wasFilterIntroShown){
            FilterHandler.wasFilterIntroShown = true;
            
            setTimeout(function(){
                var intro = introJs();
                var $firstOpenedFilter = $('.chart-container.expanded').first();
                intro.setOptions({
                     'tooltipPosition': 'left',
                     'showStepNumbers': false,
                     'steps':[
                         {
                             element:'#eexcess-filtercontainer',
                             intro: '<h2>Short Introduction</h2><strong>Filter:</strong><br>Please have a very short look at the filter visualisation area here, where you can see all your applied brushes and filters.',
                             position: 'left'
                         },
                         {
                             element: $firstOpenedFilter.parent().find('.filter-keep')[0],
                             intro: '<strong>Apply brush:</strong><br>This button applies the current brush on the search result - until you remove it.',
                             position: 'left'
                         },
                         {
                             element: $firstOpenedFilter.parent().find('.filter-remove')[0],
                             intro: '<strong>Remove filter:</strong><br>This button removes the current brush or the applied filter.<br><br><em>Thank you, for your attention.</em>',
                             position: 'left'
                         }
                     ]
                });
                var stepCounter = 0;
                intro.onchange(function(targetElement) {
                    stepCounter ++;
                    if (stepCounter == 2){
                        console.log('We will not show the filter intro again...');
                        localStorageCustom.setItem('wasFilterIntroShown', 'true');
                    }
                });
                intro.start(); 
            }, 500);
        }
    },

    removeFilter: function ($filterArea) {        
        var type = FilterHandler.getTypeOfArea($filterArea);
        if (FilterHandler.currentFilter != null && FilterHandler.currentFilter.type == type){
            FilterHandler.ext.redrawChart(); // removes the current brush
        }
        
        FilterHandler.clearType(type);                    
        FilterHandler.ext.filterData(FilterHandler.filters.length == 0 ? null : FilterHandler.mergeFilteredDataIds());
    },

    mergeRangeFiltersDataIds: function () {
        var mapId = function (d) { return d.id; };
        var dataToHighlightIds = [];

        if (FilterHandler.currentFilter == null && FilterHandler.filters.length == 0)
            return dataToHighlightIds;

        // Combining filters by AND (different type) and OR (same type)
        var filters = FilterHandler.filters.slice(); // clone
        if (FilterHandler.currentFilter != null)
            filters.push(FilterHandler.currentFilter);

        var filterGroups = underscore.groupBy(filters, function (f) { return f.type; })
        var filterGroupsDataIds = [];
        underscore.forEach(filterGroups, function (filterGroupList, type) {
            var filterGroupDataIds = [];
            for (var i = 0; i < filterGroupList.length; i++) {
                filterGroupDataIds = underscore.union(filterGroupDataIds, underscore.map(filterGroupList[i].dataWithinFilter, mapId));
            }
            filterGroupsDataIds.push(filterGroupDataIds);
        });
        // AND
        if (filterGroupsDataIds.length > 0) {
            dataToHighlightIds = filterGroupsDataIds[0];
            for (var i = 1; i < filterGroupsDataIds.length; i++) {
                var currentList = filterGroupsDataIds[i];
                dataToHighlightIds = underscore.filter(dataToHighlightIds, function (id) { return underscore.some(currentList, id); });
            }
        }

        return dataToHighlightIds;
    },

    mergeFilteredDataIds: function () {

        if (FilterHandler.currentFilter == null && FilterHandler.filters.length == 0 && FilterHandler.listFilter == null)
            return null;

        var dataToHighlightIds = FilterHandler.mergeRangeFiltersDataIds();

        // Adding ListFilter
        if (FilterHandler.listFilter != null && FilterHandler.listFilter.itemsClicked.length > 0) {

            if (FilterHandler.listFilter.itemsClicked.length == 1 && FilterHandler.listFilter.itemsClicked[0].selectionMode == "single")
                return [FilterHandler.listFilter.itemsClicked[0].data.id];

            var idsToRemove = underscore.map(underscore.filter(FilterHandler.listFilter.itemsClicked, function (item) { return item.selectionMode == "remove"; }), function (d) { return d.data.id; });
            var idsToAdd = underscore.map(underscore.filter(FilterHandler.listFilter.itemsClicked, function (item) { return item.selectionMode == "single" || item.selectionMode == "add"; }), function (d) { return d.data.id; });

            dataToHighlightIds = underscore.difference(dataToHighlightIds, idsToRemove);
            dataToHighlightIds = underscore.union(dataToHighlightIds, idsToAdd);

        }

        //console.log('mergeFilteredData: ' + dataToHighlightIds.length);
        return dataToHighlightIds;
    },
    
    /**
     * Used by WebGLVis: used for overwriting the allData parameter in the draw
     * fct. array of objects containing collection data
     */
    setOverwriteCollectionData: function(data) {
        FilterHandler.otherCollectionData = data;
    },
    
    resetOverwriteCollectionData: function() {
        FilterHandler.otherCollectionData = null;
    }
    
}
