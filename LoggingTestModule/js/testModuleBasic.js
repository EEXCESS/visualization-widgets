function testModuleBasic(moduleName) {

    var origin = {
        module: moduleName
    };

    return {
        init: function () {

        },
        runModule: function () {
            var documentBadge = {
                id: "995eb36f-151d-356c-b00c-4ef419bc2124",
                uri: "http://www.mendeley.com/research/hellenism-homoeroticism-shelley-circle",
                provider: "Mendeley"
            };
            var queryID = "849384894839";

            $('#query').submit(function(evt) {
                //evt.preventDefault();
                var profile = {
                    origin: origin,
                    contextKeywords: [{
                        text: "woman",
                        weight: 1.0
                    }]
                    //contextKeywords: [
                    //    {
                    //        "text": "women",
                    //        "type": "misc",
                    //        "uri": "http://dbpedia.com/resource/woman",
                    //        "isMainTopic": false
                    //    }]
                };
                window.top.postMessage({event: "eexcess.queryTriggered", data: profile}, '*');
                return false;
            });
            $('#moOp').click(function (evt) {
                LOGGING.moduleOpened(origin, "anotherModuleName"); return false;
            });
            $('#moCl').submit(function (evt) {
                LOGGING.moduleClosed(origin, "anotherModuleName", 475839); return false;
            });
            $('#moSt').submit(function (evt) {
                LOGGING.moduleStatisticsCollected(origin, {mystats: "lalelu"}); return false;
            });
            $('#itOp').submit(function (evt) {
                LOGGING.itemOpened(origin, documentBadge, queryID); return false;
            });
            $('#itCl').submit(function (evt) {
                LOGGING.itemClosed(origin, documentBadge, queryID, 8437); return false;
            });
            $('#itCiAsIm').submit(function (evt) {
                LOGGING.itemCitedAsImage(origin, documentBadge, queryID); return false;
            });
            $('#itCiAsTe').submit(function (evt) {
                LOGGING.itemCitedAsText(origin, documentBadge, queryID); return false;
            });
            $('#itCiAsHy').submit(function (evt) {
                LOGGING.itemCitedAsHyperlink(origin, documentBadge, queryID); return false;
            });
            $('#itRa').submit(function (evt) {
                LOGGING.itemRated(origin, documentBadge, queryID, 0, 4, 3); return false;
            });
        }
    }
}