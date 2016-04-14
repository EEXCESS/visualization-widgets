(function () {

    var WebGlVisPlugin = {
        scene: null,
        db_handler: null,
        bookmarks_to_visualize: false
    };
    var $root = null;



    WebGlVisPlugin.initialize = function (EEXCESSObj, rootSelector) {
        $root = $(rootSelector);
        this.loadCss("../WebGlVisualization/css/webglvis.css");
        this.loadCss("../WebGlVisualization/lib/jquery/fancybox/jquery.fancybox.css");

        this.librariesLoaded = false;
        // load other needed scripts (require.js is available)





        jQuery(document).ready(function () {

            var show_bm_in_graph_button = jQuery('<button id="eexcess_webglgraph_bookmarks" type="button" ' +
                    'value="" title="Visualize Bookmarks as graph">Visualize</button>');
            show_bm_in_graph_button.insertAfter('#eexcess_editBookmark_button');

            show_bm_in_graph_button.click(function () {

                var fancybox_file = "../WebGlVisualization/lib/jquery/fancybox/jquery.fancybox.pack.js";
                Modernizr.load({
                    load: fancybox_file,
                    test: fancybox_file,
                    callback: function (d) {
                        return;
                    },
                    complete: function (d) {
                        WebGlVisPlugin.showBookmarksList();
                        return;
                    }
                });
            }.bind(this));
        }.bind(this));
    };

    WebGlVisPlugin.showBookmarksList = function () {

        /**
         * Get Bookmark-Lists
         */
        var bookmarks = visTemplate.getBookmarkedItems();

        var available_lists = {
        };

        for (var key in bookmarks) {
            var bookmarked = bookmarks[key].bookmarked;

            for (var i = 0; i < bookmarked.length; i++) {
                var list_name = bookmarked[i]["bookmark-name"];

                if (available_lists[list_name] === undefined) {
                    available_lists[list_name] = 0;
                }
                available_lists[list_name]++;
            }
        }


        var title = jQuery("<h2/>", {
            text: "Visualize bookmarks"
        });

        var sub_title = jQuery("<p/>", {
            class: 'webgl_bookmark_popup_subtitle',
            text: "Please select the bookmark-lists you want to visualize"
        });


        var container = jQuery('<div/>', {
            class: 'webgl_bookmark_popup_container'
        });

        for (var l_name in available_lists) {

            var checkbox = jQuery('<input/>', {
                type: "checkbox",
                value: l_name
            });

            var l_string = l_name + " (" + available_lists[l_name] + ")";
            var l_html = jQuery('<div/>', {
                class: 'webgl_bookmark_popup_list_element'
            }).append(checkbox).append(
                    jQuery("<span/>").append(l_string)
                    );

            container.append(l_html);
        }


        var submit_button = jQuery('<button/>', {
            type: 'submit',
            id: 'webgl_bookmark_popup_submitbutton',
            text: 'Visualize selected bookmarks',
            style: 'margin-top : 20px'
        });

        container.append(submit_button);


        var content = jQuery('<div/>')
                .append(title)
                .append(sub_title)
                .append(container);



        /**
         * JQuery - Fancybox Stuff
         */

        var html = jQuery('<a/>', {
            id: 'webgl_form_link',
            href: '#webgl_bookmark_popup',
            style: 'display:none'
        }).append(
                jQuery('<div/>', {
                    style: 'display:none'
                }).append(
                jQuery('<div/>', {
                    id: 'webgl_bookmark_popup'
                }).append(content)
                )
                );

        jQuery('#webgl_form_container').remove();
        jQuery('body').append(jQuery('<div/>',
                {
                    id: 'webgl_form_container'
                }));

        jQuery('#webgl_form_container').append(html);

        jQuery("#webgl_form_link").fancybox({
            maxWidth: 700,
            maxHeight: 400,
            fitToView: false,
            width: '70%',
            height: '70%',
            autoSize: false,
            closeClick: false,
            openEffect: 'none',
            closeEffect: 'none'
        }).click();

        //jQuery('#webgl_form_container').html("");


        jQuery('#webgl_bookmark_popup_submitbutton').click(function (e) {
            e.stopPropagation();
            jQuery.fancybox.close();

            /**
             * Build a structure of bookmark-lists and result-ids from the checked boxes
             */

            var bms_to_vis = [];

            jQuery('.webgl_bookmark_popup_list_element').find('input:checked').each(function () {
                bms_to_vis.push(jQuery(this).val());
            });

            //Store data
            WebGlVisPlugin.bookmarks_to_visualize = bms_to_vis;

            //Trigger visualization
            jQuery('.chartbutton.webgl').click();

        });
    };

    WebGlVisPlugin.draw = function (receivedData, mappingCombination, iWidth, iHeight) {
        
        /**
         * All necessary libraries are getting loaded from the InitHandler.
         * Therefore only one file has to be required first.
         */

        jQuery('#eexcess_main_panel').addClass("webglvis");
        if (typeof (IQHN) === "undefined") {

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
                IQHN.InitHandler.init($root, null, this.bookmarks_to_visualize); 
        }     
    };



    // indexArray: array with items' indices to highlight. They match items in receivedData (parameter in Render.draw)
    WebGlVisPlugin.highlightItems = function (indexArray) {
    };

    WebGlVisPlugin.finalize = function () {
        IQHN.InitHandler.cleanup();
        jQuery('#eexcess_main_panel').removeClass("webglvis");

        //Unset bookmark data
        this.bookmarks_to_visualize = false;
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
