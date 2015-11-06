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

        jQuery(document).ready(function () {

            var show_bm_in_graph_button = jQuery('<button id="eexcess_webglgraph_bookmarks" type="button" value="" title="Show Bookmarks as graph">☢</button>');
            show_bm_in_graph_button.insertAfter('#eexcess_import_bookmark_style');

            show_bm_in_graph_button.click(function () {

                alert("TODO: Open Dialog for selecting bms. Then select Webgl-vis, set params and draw");

            }.bind(this));

        }.bind(this));
    };



    WebGlVisPlugin.draw = function (receivedData, mappingCombination, iWidth, iHeight) {

        /**
         * All necessary libraries are getting loaded from the InitHandler.
         * Therefore only one file has to be required first.
         */

        jQuery('#eexcess_main_panel').addClass("webglvis");
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
        jQuery('#eexcess_main_panel').removeClass("webglvis");
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
