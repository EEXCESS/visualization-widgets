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

    initialize: function (vis, ext, filterRootSelector) {
        FilterHandler.vis = vis;
        FilterHandler.ext = ext;
        FilterHandler.$filterRoot = $(filterRootSelector);
        FilterHandler.$filterRoot.on('click', '.filter-remove', function () {
            FilterHandler.removeFilter($(this).parents('.filter-container-outer'));
        });
        FilterHandler.$filterRoot.on('click', '.filter-keep', function () {
            FilterHandler.makeCurrentPermanent();
        });

        FilterHandler.$filterRoot.find('.filterarea .expand').on('click', function (e) {
            var $area = $(this).closest('.filterarea');
            if ($(e.target).is('.expand-arrow')){                
                FilterHandler.expandFilterArea($area, !$area.find('.chart-container').hasClass('expanded'));                
            } else {
                $("#eexcess_select_chart").val($area.data('targetchart')).change();
            }
        });
    },

    setInputData: function (type, inputData) {
        FilterHandler.inputData[type] = inputData;
    },

    expandFilterArea: function ($area, doExpand) {
        $area.find('.chart-container').toggleClass('expanded', doExpand);
        $area.find('span.batch-sm')
            .toggleClass('batch-sm-arrow-right', !doExpand)
            .toggleClass('batch-sm-arrow-down', doExpand);
    },

    getFilterVisualisation: function (type, doIncludeControls) {
        if (FilterHandler.filterVisualisations[type]) {
            return FilterHandler.filterVisualisations[type];
        }
        var newFilterVis = { $container: $('<div class="filter-container"></div>') };
        var $filter = $('<div class="filter-container-outer current"></div>').append(newFilterVis.$container);
        if (doIncludeControls)
            $filter.prepend($('<div class="filter-controls"><a href="#" class="filter-keep"><span class="batch-sm-add"></span></a> <a href="#" class="filter-remove"><span class="batch-sm-delete"></span></a></div>'));

        var $filterArea = FilterHandler.$filterRoot.find('#filterarea-' + type);
        FilterHandler.expandFilterArea($filterArea, true);
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
        if (FilterHandler.currentFilter.type == type)
            filters.push(FilterHandler.currentFilter);
        //for (var i=0; i<FilterHandler.filters.length; i++){
        //    //FilterHandler.filters[i];
        //}
        return filters;
    },

    addEmptyFilter: function (type) {
        FilterHandler.currentFilter = { type: type, from: null, to: null, dataWithinFilter: [] };
    },

    addEmptyListFilter: function () {
        var currentFilterTemp = FilterHandler.currentFilter;
        FilterHandler.getFilterVisualisation('list', false);
        FilterHandler.addEmptyFilter('list');
        FilterHandler.listFilter = FilterHandler.currentFilter;
        FilterHandler.listFilter.itemsClicked = []; // { data: object, selectionMode: single/add/remove }
        FilterHandler.currentFilter = currentFilterTemp;
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

    refreshFiltervisualisation: function (type) {
        var filterVisualisation = FilterHandler.getFilterVisualisation(type);
        var filters = FilterHandler.getAllFilters(type);
        filterVisualisation.Object.draw(
            FilterHandler.vis.getData(),
            FilterHandler.inputData[type],
            filterVisualisation.$container,
            filters);

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

        FilterHandler.clear(FilterHandler.currentFilter);
        FilterHandler.currentFilter = null;
    },

    clearList: function () {
        if (FilterHandler.listFilter == null)
            return;

        FilterHandler.clear(FilterHandler.listFilter);
        FilterHandler.listFilter = null;
    },

    clearListAndRefresh: function () {
        FilterHandler.clearList();
        FilterHandler.ext.selectItems();
    },

    clear: function (filterToClear) {
        var filterVisualisation = FilterHandler.getFilterVisualisation(filterToClear.type);

        filterVisualisation.Object.finalize(filterVisualisation.$container);
        filterVisualisation.Object = null;
        filterVisualisation.$container.closest('.chart-container').addClass('no-filter');
        filterVisualisation.$container.closest('.filter-container-outer').remove();
        FilterHandler.filterVisualisations[filterToClear.type] = null;
    },

    reset: function () {
        FilterHandler.clearCurrent();
        FilterHandler.clearList();
        for (var i = 0; i < FilterHandler.filters.length; i++) {
            FilterHandler.clear(FilterHandler.filters[i]);
        }
        FilterHandler.ext.selectItems();
    },

    makeCurrentPermanent: function () {
        if (FilterHandler.currentFilter == null)
            return;

        var index = FilterHandler.filters.length;
        // todo:
        //FilterHandler.currentFilter.$container.data('filter-index', index);
        //FilterHandler.currentFilter.$container.parents('.filter-container-outer').removeClass('current').addClass('permanent');
        FilterHandler.filters.push(FilterHandler.currentFilter);
        FilterHandler.currentFilter = null;
        //  todo: remove filter in current chart, but highlight
        FilterHandler.ext.selectItems();
    },

    removeFilter: function ($filterOuter) {
        var filterIndex = $filterOuter.find('.filter-container').data('filter-index');
        if (filterIndex === undefined || filterIndex < 0)
            return;

        FilterHandler.filters.splice(filterIndex);
        $filterOuter.remove();
        FilterHandler.resetFilterIndex();
        FilterHandler.ext.selectItems();
    },

    resetFilterIndex: function (filterIndex, $filter) {
        for (var i = 0; i < FilterHandler.filters.length; i++) {
            var filter = FilterHandler.filters[i];
            // todo: check if needed?
            //filter.$container.data('filter-index', i);
        }
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
