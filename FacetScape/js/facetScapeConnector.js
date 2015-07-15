var EEXCESS = EEXCESS || {};

if (!EEXCESS.WIDGETS) {
    EEXCESS.WIDGETS = {};
}

EEXCESS.WIDGETS.facetscape = {
    FS_DEFAULT_WIDTH: 900,
    FS_DEFAULT_HEIGHT: 500,
    FS_MIN_WIDTH: 500,
    FS_MIN_HEIGHT: 400,
    FS_NUM_RESULTS: 50,

    FS_FACET_NAMES: [{path: 'date', alias: 'date'},
        {path: 'documentBadge.provider', alias: 'provider'},
        {path: 'language', alias: 'language'},
        {path: 'licence', alias: 'licence'},
        {path: 'mediaType', alias: 'mediaType'}]
};

var FSCONNECTOR = (function() {

    var _loader = $('<div class="eexcess_loading" style="display:none"><img src="media/loading.gif" /></div>');
    var _error = $('<p style="display:none">sorry, something went wrong...</p>');

    var _loading = function() {
        _error.hide();
        $('#facetScape').hide();
        $('#RS_ResultList').hide();
        _loader.show();
    }

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

    var _getQueryTerms = function(keywords) {
        var queryTerms = [];
        for (var i = 0; i < keywords.length; i++) {
            queryTerms.push(keywords[i].text);
        }
        var queryTerms = queryTerms.join(' ');
    }

    var self = {
        width: $('#facetScapeArea').width(),
        height: $('#facetScapeArea').height(),
        facetscape: null,
        dom: d3.select("body").select('div#facetScapeArea'),
        onReceiveMessage: function(event) {
            if (event.data.event) {
                console.log(event);
                if (event.data.event === 'eexcess.newResults') {
                    var queryTerms = _getQueryTerms(event.data.data.profile.contextKeywords);
                    var data = self.preprocess(event.data.data.results.results);
                    self.rebuild(queryTerms, data.facets, data.items);
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
        rebuild: function(queryTerms, processedData, items) {
            _loader.hide();
            _error.hide();
            $('#facetScape').show();
            $('#RS_ResultList').show();
            self.width = $('#facetScapeArea').width();
            self.height = $('#facetScapeArea').height();
            if (self.facetScape) {
                self.facetScape.redraw(queryTerms, processedData, items)
            } else {
                self.facetScape = facetScape(self.dom, self.width, self.height, processedData, items, queryTerms);
            }
        },
        request: function(queryTerms) {
            var profile = {contextKeywords: [{
                text: queryTerms,
                weight: 1.0
            }], numResults: EEXCESS.WIDGETS.facetscape.FS_NUM_RESULTS};

            window.top.postMessage({event: 'eexcess.queryTriggered', data: profile}, '*');
        },
        onResize: function(event) {
            self.width = $(window).width();
            self.height = $(window).height();

            if (self.facetScape) {
                self.facetScape.resize(self.width, self.height);
            }
        }
    };

    self.dom = d3.select('div#facetScapeArea')

    /*
     * Hook into the window-messaging API and request the results of the most recent query
     */
    // Do not overwrite global listeners but instead add them
    window.self.onmessage = self.onReceiveMessage;
    window.self.onResize = self.onResize;
    window.top.postMessage({event: 'eexcess.currentResults'}, '*');

    return {
        buildFacetScape: function(queryTerms, container, width, height) {
            if (self.dom) {
                self.dom.empty();
            }
            self.dom = container;
            self.width = width;
            self.height = height;
            //if (!$.contains(self.dom, _loader)) {
            //    self.dom.append(_loader);
            //}
            //if (!$.contains(self.dom, _error)) {
            //    self.dom.append(_error);
            //}
            self.facetScape = facetScape(d3.select("#" + self.dom.attr("id")), self.width, self.height, [], [], queryTerms);
        }
    }
})();