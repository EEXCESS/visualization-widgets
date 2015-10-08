var EEXCESS = EEXCESS || {};

if (!EEXCESS.WIDGETS) {
    EEXCESS.WIDGETS = {};
}

EEXCESS.WIDGETS.facetscape = {
    FS_DEFAULT_WIDTH: 900,
    FS_DEFAULT_HEIGHT: 500,
    FS_MIN_WIDTH: 650,
    FS_MIN_HEIGHT: 400,
    FS_NUM_RESULTS: 50,

    FS_FACET_NAMES: [{path: 'date', alias: 'date'},
        {path: 'documentBadge.provider', alias: 'provider'},
        {path: 'language', alias: 'language'},
        {path: 'licence', alias: 'licence'},
        {path: 'mediaType', alias: 'mediaType'}]
};

var FSCONNECTOR = (function() {

    var _loader = $('<div id="loader"><img src="media/loading.gif" /></div>');
    var _error = $('<div id="errorMsg"><p>sorry, something went wrong...</p></div>');
    var _error_framesize = $('<div id="error-framesize"><p>This visualization requires a larger screen area.<br>Minimum width '+EEXCESS.WIDGETS.facetscape.FS_MIN_WIDTH+'px and minimum height '+EEXCESS.WIDGETS.facetscape.FS_MIN_HEIGHT+'px.</p></div>');

    var _loading = function() {
        _error.hide();
        $('#facetScape').hide();
        $('#RS_ResultList').hide();
        _loader.show();
    };

    var _showError = function(errorData) {
        _loader.hide();
        $('#facetScape').hide();
        $('#RS_ResultList').hide();
        if (errorData === 'timeout') {
            _error.text('Sorry, the server takes too long to respond. Please try again later');
        } else {
            _error.text('Sorry, something went wrong');
        }
        _error.show();
    };

    var _reachedLimit = function() {
        _loader.hide();
        _error.hide();
        $('#RS_Panel').remove();
        $('#facetScape').remove();
        $('#RS_ResultList').remove();
        _error_framesize.show();
    };

    var _getQueryTerms = function(keywords) {
        var queryTerms = [];
        for (var i = 0; i < keywords.length; i++) {
            queryTerms.push(keywords[i].text);
        }
        return queryTerms.join(' ');
    };

    var self = {
        dom: $('#facetScapeArea'),
        width: $('#facetScapeArea').width(),
        height: $('#facetScapeArea').height(),
        facetscape: null,
        data: {
            query: '',
            facets: [],
            items: []
        },
        onReceiveMessage: function(event) {
            if (event.data.event) {
                if (event.data.event === 'eexcess.newResults') {
                    var queryTerms = _getQueryTerms(event.data.data.profile.contextKeywords);
                    //console.log(event.data.data);
                    var data = self.preprocess(event.data.data.result);
                    self.data.query = queryTerms;
                    self.data.facets = data.facets;
                    self.data.items = data.items;
                    self.rebuild();
                } else if (event.data.event === 'eexcess.queryTriggered') {
                    _loading();
                } else if (event.data.event === 'eexcess.error') {
                    _showError(event.data.data)
                } else if (event.data.event === 'eexcess.rating') {
                    //console.log("rating");
                }
            }
        },
        preprocess: function(data) {
            var deep_value = function(obj, path){
                for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
                    obj = obj[path[i]];
                };
                return obj;
            };
            var processedData = [];
            var facets = {};
            var results = [];
            for (var i = 0; i < data.length; i++) {
                for (var n = 0; n < EEXCESS.WIDGETS.facetscape.FS_FACET_NAMES.length; n++) {
                    var key = EEXCESS.WIDGETS.facetscape.FS_FACET_NAMES[n].alias;
                    var value = deep_value(data[i], EEXCESS.WIDGETS.facetscape.FS_FACET_NAMES[n].path);
                    if (!facets.hasOwnProperty(key)) {
                        facets[key] = {};
                    }
                    facets[key][value] = (typeof facets[key][value] == "undefined" ? 1 : ++facets[key][value]);
                }
            }
            for (var facetName in facets) {
                var tags = [];
                var facet = {"name": facetName, "color": "#D6D0C4", "tags": tags};
                for (var tag in facets[facetName]) {
                    if (tag != "") {
                        tags.push({"word": tag, "frequency": facets[facetName][tag]});
                    }
                }
                facet.tags = tags;
                processedData.push(facet);
            }
            for (var i = 0; i < data.length; i++) {
                var resultItem = data[i];
                for (var n = 0; n < EEXCESS.WIDGETS.facetscape.FS_FACET_NAMES.length; n++) {
                    if (!resultItem.hasOwnProperty(EEXCESS.WIDGETS.facetscape.FS_FACET_NAMES[n].alias)) {
                        resultItem[EEXCESS.WIDGETS.facetscape.FS_FACET_NAMES[n].alias] = deep_value(data[i], EEXCESS.WIDGETS.facetscape.FS_FACET_NAMES[n].path);
                    }
                }
                results.push(resultItem);
            }
            delete facets;
            return {facets: processedData, items: results}
        },
        rebuild: function() {
            if (!$.contains(self.dom, _error_framesize)) {
                self.dom.append(_error_framesize);
            }
            _loader.hide();
            _error.hide();
            _error_framesize.hide();
            self.width = $(self.dom).width();
            self.height = $(self.dom).height();
            if (self.width >= EEXCESS.WIDGETS.facetscape.FS_MIN_WIDTH && self.height >= EEXCESS.WIDGETS.facetscape.FS_MIN_HEIGHT) {
                _error_framesize.hide();
                var d3root = d3.select("#" + self.dom.attr("id"));
                if(!self.facetscape) {
                    self.facetscape = facetScape(d3root, self.width, self.height, self.data.facets, self.data.items, self.data.query);
                } else {
                    self.facetscape.redraw(self.width, self.height, self.data.query, self.data.facets, self.data.items);
                }
            } else {
                _reachedLimit();
            }
            var scapeArea = $('#RS_Panel');
            scapeArea.after(_loader);
            scapeArea.after(_error)
        },
        onResize: function(event) {
            self.width = $(self.dom).width();
            self.height = $(self.dom).height();
            self.rebuild();
        }
    };

    self.dom = $('#facetScapeArea');

    /*
     * Hook into the window-messaging API and request the results of the most recent query
     */
    window.self.onmessage = self.onReceiveMessage;
    $(window).resize(self.onResize);
    window.top.postMessage({event: 'eexcess.currentResults'}, '*');

    return {
        buildFacetScape: function(queryTerms, container, width, height) {
            if (self.dom) {
                self.dom.empty();
            }
            self.dom = container;
            self.width = width;
            self.height = height;

            self.rebuild();
        }
    }
})();

FSCONNECTOR.buildFacetScape('', $('#facetScapeArea'), $(window).width(), $(window).height());