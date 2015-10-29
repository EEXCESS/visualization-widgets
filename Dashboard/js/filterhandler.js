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

    initialize: function (vis, ext, filterRootSelector) {
        FilterHandler.vis = vis;
        FilterHandler.ext = ext;
        FilterHandler.$filterRoot = $(filterRootSelector);

        FilterHandler.initializeFilterAreas();
        
        FilterHandler.chartNameChanged($("#eexcess_select_chart").val())     
    },
        
     initializeData: function (orignalData, mapping) {;
        var selectedColorDimension;
        var colorMapping = _.filter(mapping, { 'visualattribute': 'color' });
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
            if (!_.includes(categorySettings.dimensionValues, orignalData[i].facets[selectedColorDimension])) {
                categorySettings.dimensionValues.push(orignalData[i].facets[selectedColorDimension]);
            }
        }
        
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
            var filterType = $filterArea.attr('data-targetchart');
            LoggingHandler.log({ action: isCurrentFilter ? "Brush removed" : "Filter removed", component : filterType, widget: 'trash' }); // todo: old / new
        });
        FilterHandler.$filterRoot.find('.filter-keep').on('click', function (e) {
            e.stopPropagation();
            FilterHandler.makeCurrentPermanent();
            $(this).removeClass('active');
            var filterType = $(this).closest('.filterarea').attr('data-targetchart');
            LoggingHandler.log({ action: "Filter saved", component : filterType });
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
        var filterType = $area.attr('data-targetchart');
        $area.find('.chart-container').toggleClass('expanded', doExpand);
        $area.find('span.expand')
            .toggleClass('batch-sm-arrow-right', !doExpand)
            .toggleClass('batch-sm-arrow-down', doExpand);
            
        if (isDoneByClick)
            LoggingHandler.log({ action: "Filter " + (doExpand ? "expanded" : "collapsed") + " by User", source : filterType });
    },
    
    collapseCurrent: function(){
        if (!FilterHandler.currentFilter)
            return;
        var $filterArea = FilterHandler.getFilterArea(FilterHandler.currentFilter.type);
        FilterHandler.expandFilterArea($filterArea, false, false);
    },
    
    setActiveFilters: function(){
        var filterTypes = _(FilterHandler.filters).map(function(f){
            return f.type; 
            });
        if (FilterHandler.currentFilter != null)
            filterTypes.push(FilterHandler.currentFilter.type);
            
        FilterHandler.activeFiltersNames = _(filterTypes).uniq();
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

        newFilterVis.Object = PluginHandler.getFilterPluginForType(type).Object;
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
        filters = _(FilterHandler.filters).filter({ 'type': type });
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
            var existingItemIndex = _.findIndex(FilterHandler.listFilter.itemsClicked, function (d) { return d.data.id == dataItemSelected.id; });
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

        FilterHandler.listFilter.dataWithinFilter = _.map(FilterHandler.listFilter.itemsClicked, function (d) { return d.data; });
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
        filterVisualisation.Object.draw(
            FilterHandler.vis.getData(),
            FilterHandler.inputData[type],
            filterVisualisation.$container,
            filters,
            FilterHandler.visualisationSettings[type]);

        FilterHandler.ext.selectItems();
    },

    refreshListFilter: function () {

        if (FilterHandler.listFilter != null && FilterHandler.listFilter.itemsClicked.length == 0) {
            FilterHandler.clearList();
        }

        if (FilterHandler.listFilter != null) {

            var filterVisualisation = FilterHandler.getFilterVisualisation('list');
            filterVisualisation.Object.draw(
                filterVisualisation.$container,
                FilterHandler.listFilter.itemsClicked,
                FilterHandler.listFilter.dataWithinFilter);
        }

        FilterHandler.ext.selectItems();
    },

    clearCurrent: function () {
        if (FilterHandler.currentFilter == null)
            return;

        var type = FilterHandler.currentFilter.type;
        if (_(FilterHandler.filters).some(function(item){ return item.type != FilterHandler.currentFilter.type; })){
            FilterHandler.clearType(type);
        } else {
            FilterHandler.currentFilter = null;
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
        
        FilterHandler.filters = _(FilterHandler.filters).filter(function(item){ return item.type != type; });
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

    makeCurrentPermanent: function () {
        if (FilterHandler.currentFilter == null)
            return;

        // remove all previous filters of this type, as there is only one filter (and one brush) for each type.
        FilterHandler.filters = _(FilterHandler.filters).filter(function(filter){ return filter.type != FilterHandler.currentFilter.type; });        
        FilterHandler.filters.push(FilterHandler.currentFilter);
        FilterHandler.currentFilter = null;
        FilterHandler.ext.filterData(FilterHandler.mergeFilteredDataIds());
    },

    getTypeOfArea: function($filterArea){
        return $filterArea.attr('id').substring(11); //filterarea- prefix
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

        var filterGroups = _.groupBy(filters, function (f) { return f.type; })
        var filterGroupsDataIds = [];
        _.forEach(filterGroups, function (filterGroupList, type) {
            var filterGroupDataIds = [];
            for (var i = 0; i < filterGroupList.length; i++) {
                filterGroupDataIds = _.union(filterGroupDataIds, _.map(filterGroupList[i].dataWithinFilter, mapId));
            }
            filterGroupsDataIds.push(filterGroupDataIds);
        });
        // AND
        if (filterGroupsDataIds.length > 0) {
            dataToHighlightIds = filterGroupsDataIds[0];
            for (var i = 1; i < filterGroupsDataIds.length; i++) {
                var currentList = filterGroupsDataIds[i];
                dataToHighlightIds = _.filter(dataToHighlightIds, function (id) { return _.contains(currentList, id); });
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

            var idsToRemove = _.map(_.filter(FilterHandler.listFilter.itemsClicked, function (item) { return item.selectionMode == "remove"; }), function (d) { return d.data.id; });
            var idsToAdd = _.map(_.filter(FilterHandler.listFilter.itemsClicked, function (item) { return item.selectionMode == "single" || item.selectionMode == "add"; }), function (d) { return d.data.id; });

            dataToHighlightIds = _.difference(dataToHighlightIds, idsToRemove);
            dataToHighlightIds = _.union(dataToHighlightIds, idsToAdd);

        }

        //console.log('mergeFilteredData: ' + dataToHighlightIds.length);
        return dataToHighlightIds;
    }
}
