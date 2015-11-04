(function () {

    var WebGlVisPlugin = {
        scene: null,
        db_handler: null
    };
    var $root = null;

    WebGlVisPlugin.initialize = function (EEXCESSObj, rootSelector) {
        $root = $(rootSelector);
        this.loadCss("../WebGlVisualization/css/webglvis.css");
        this.loadCss("../WebGlVisualization/lib/jquery/fancybox/jquery.fancybox.css");

        this.librariesLoaded = false;
        // load other needed scripts (require.js is available)
    };



    WebGlVisPlugin.draw = function (receivedData, mappingCombination, iWidth, iHeight) {

        /**
         * All necessary libraries are getting loaded from the InitHandler.
         * Therefore only one file has to be required first.
         */


        if (typeof (GLVIS) === "undefined") {

            var path = "../WebGlVisualization/js/inithandler.js";

            Modernizr.load({
                test: path,
                load: path,
                complete: function () {
                    WebGlVisPlugin.draw(receivedData, mappingCombination, iWidth, iHeight);
                    return;
                }
            });
        }
        else {
            /**
             * Init loads html framework via ajax and all other required libraries
             */
            GLVIS.InitHandler.init($root);
        }
    };



    // indexArray: array with items' indices to highlight. They match items in receivedData (parameter in Render.draw)
    WebGlVisPlugin.highlightItems = function (indexArray) {
    };

    WebGlVisPlugin.finalize = function () {
        GLVIS.InitHandler.cleanup();
    };





    WebGlVisPlugin.loadCss = function (url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    };



    PluginHandler.registerVisualisation(WebGlVisPlugin, {
        'displayName': 'WebGlVis'
    });
})();