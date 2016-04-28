/**
 * Accesing the Recommendation-Dashboard-Bookmarking-API globally
 * @todo implement me
 * @author Peter Hasitschka
 */

var BOOKMARKDIALOG = {
    /**
     * Fills a container with the EEXCESS-Bookmark-Skeleton
     * @param {jQuery Object} container
     * @param {boolean} at_beginning If true object will be prepended
     */
    populate: function (container, at_beginning) {

        var eexcess_collections_element = jQuery('<div />', {
            id: 'eexcess_collections'}).append(
            jQuery('<span />', {
                id: 'bookmarklist-label',
                text: 'Showing:'
            }),
            jQuery('<span />', {
                id: 'eexcess_bookmarkingcollections-placeholder'
            }),
            jQuery('<input />', {
                id: 'eexcess_editBookmark_button',
                type: 'button',
                value: '',
                title: 'edit bookmarks'
            }),
            jQuery('<div />', {
                id: 'eexcess_bookmarkEditContainer',
                class: 'hidden'
            }).append(
            jQuery('<input />', {
                id: 'eexcess_deleteBookmark_button',
                type: 'button',
                value: 'x',
                title: 'delete selected bookmark collections'
            }),
            jQuery('<a />', {
                id: 'eexcess_export_bookmark',
                type: 'button',
                title: 'export bookmark',
                text: '↓'
            }),
            jQuery('<button />', {
                id: 'eexcess_import_bookmark_style',
                type: 'button',
                value: '',
                title: 'import bookmark',
                text: '↑'
            }),
            jQuery('<input />', {
                id: 'eexcess_import_bookmark',
                type: 'file',
            })
            ),
            jQuery('<br />')
            );

        if (!at_beginning)
            container.append(eexcess_collections_element);
        else
            container.prepend(eexcess_collections_element);
    },
    BOOKMARKS: {
        /*
         * INTERNAL
         */

        currentBookmark: {
            'bookmark-name': '',
            'color': '',
            'type': ''
        },
        currentItem: {},
        currentSelectIndex: 0,
        currentSelectIndexPerFilter: 0,
        isBookmarkDialogOpen: false,
        bookmarkedItems: null,
        list_obj_getter_fct: null,
        setListObjGetter: function (getter) {
            this.list_obj_getter_fct = getter;
        },
        mediapathprefix: "",
        getCurrentBookmark: function () {
            var bookmarkName = $(BOOKMARKDIALOG.Config.bookmarkDropdownList).find('span').text();
            var color = '', type = '';
            if (bookmarkName === BOOKMARKDIALOG.Config.STR_NEW) {
                bookmarkName = $(BOOKMARKDIALOG.Config.bookmarkDialogInputWrapper).find('input').val();
                color = $(BOOKMARKDIALOG.Config.colorPickerId).css('backgroundColor');
                type = 'new';
            }
            this.currentBookmark['bookmark-name'] = bookmarkName;
            this.currentBookmark['color'] = color;
            this.currentBookmark['type'] = type;
            return this.currentBookmark;
        },
        setCurrentItem: function (item, index, query) {
            //this.currentItem['item'] = item;
            this.currentItem['item'] = {
                'id': item.id,
                'title': item.title,
                'facets': item.facets,
                'uri': item.uri,
                'coordinate': item.coordinate,
                'query': query
            };
            this.currentItem['index'] = index;
        },
        getCurrentItem: function () {
            return this.currentItem['item'];
        },
        getCurrentItemIndex: function () {
            return this.currentItem['index'];
        },
        validateBookmarkToSave: function () {
            //console.log("-- VALIDATEBOOKMARKTOSAVE");
            var $message = $(BOOKMARKDIALOG.Config.newBookmarkOptionsId).find('p');

            // validation for new bookmark name
            if (
                (this.currentBookmark['type'] == 'new' && this.currentBookmark['bookmark-name'] == '') ||
                this.currentBookmark['bookmark-name'].length > 15) {
                $message.fadeIn('slow');
                return false;
            }

            $message.fadeOut('fast');
            return true;
        },
        /*
         * EXTERNAL
         */

        handleBookmarkEditButton: function () {
            //console.log("-- HANDLEBOOKMARKEDITBUTTON");
            jQuery(BOOKMARKDIALOG.Config.editBookmarkButton).click(function () {
                jQuery(BOOKMARKDIALOG.Config.editBookmarkContainer).toggle();
            });
        },
        updateBookmarkedItems: function () {
            //console.log("-- UPDATEBOOKMARKEDITEMS");
            //bookmarkedItems = BookmarkingAPI.getBookmarkedItemsById(idsArray);
            //console.log('bisher: ');
            //console.log(bookmarkedItems);

            this.bookmarkedItems = {};
            var allBookmarks = BookmarkingAPI.getAllBookmarks();
            if (!allBookmarks) {
                console.log("No bookmarks returned");
                return;
            }


            Object.keys(allBookmarks).forEach(function (bookmarkKey) {
                allBookmarks[bookmarkKey].items.forEach(function (itemsElement) {

                    var itemEntry = itemsElement['id'];
                    if (typeof this.bookmarkedItems[itemEntry] === 'undefined'
                        || this.bookmarkedItems[itemEntry] === 'undefined') {
                        this.bookmarkedItems[itemEntry] = {'bookmarked': new Array()};
                    }

                    this.bookmarkedItems[itemEntry].bookmarked.push({
                        'bookmark-name': bookmarkKey,
                        'bookmark-id': allBookmarks[bookmarkKey].id,
                        'color': allBookmarks[bookmarkKey].color
                    });
                }.bind(this));
            }.bind(this));

            //experimental code end to do ask cecillia ??
            //console.log('neu: ');
            //console.log(bookmarkedItems);

            //console.log('----- BOOKMARKED ITEMS -----');
            //console.log(bookmarkedItems);
        },
        buildSaveBookmarkDialog: function (datum, firstFunc, titleOutput, savebutton, sender) {
            //console.log("-- BUILDSAVEBOOKMARKDIALOG", datum, firstFunc, titleOutput, savebutton, sender);
            $(BOOKMARKDIALOG.Config.filterBookmarkDialogId + ">div").removeClass("active").children("ul").slideUp('slow');

            this.destroyBookmarkDialog();
            this.isBookmarkDialogOpen = true;

            firstFunc(this);
            //this.internal.setCurrentItem(d, i);

            var topOffset = $(BOOKMARKDIALOG.Config.contentPanel).length ? $(BOOKMARKDIALOG.Config.contentPanel).offset().top : 0;

            // Append bookmark form to content item
            var dialogBookmark = d3.select("body").append("div")
                .attr("id", "eexcess-save-bookmark-dialog")
                .attr("class", "eexcess-bookmark-dialog")
                .style('display', 'none')
                .style("top", topOffset + "px");

            dialogBookmark.on('click', function () {
                d3.event.stopPropagation();
            });

            dialogBookmark.append("div")
                .attr("class", "eexcess-bookmark-dialog-title")
                .text("Bookmark Item");

            // Append details section
            var bookmarkDetails = dialogBookmark.append('div')
                .attr('class', 'eexcess-boookmark-dialog-details');

            bookmarkDetails.append('span').attr('class', 'label').text('Title:');
            //bookmarkDetails.append('p').text(d.title);
            titleOutput(bookmarkDetails);
            //bookmarkDetails.append('span').text('Query:');
            //bookmarkDetails.append('p').text(query);

            // Append settings section (for bookmark selection or definition of new bookmark)
            var bookmarkSettings = dialogBookmark.append("div")
                .attr("class", "eexcess-bookmark-dialog-settings");

            bookmarkSettings.append("span").attr('class', 'label').text("Add to:");

            // array to be sent to plugin building the dropdown list with the list items and the corresponding colors
            var optionsData = $.merge([{'bookmark-name': BOOKMARKDIALOG.Config.STR_NEW, 'color': ''}], BookmarkingAPI.getAllBookmarkNamesAndColors());

            var bookmarksListContainer = bookmarkSettings.append("div").attr("class", "eexcess-bookmark-dropdown-list")
                .append('ul');

            var bookmarksListData = bookmarksListContainer.selectAll('li').data(optionsData);

            var bookmarksList = bookmarksListData.enter().append('li');
            bookmarksList.append('a').text(function (b) {
                return b["bookmark-name"];
            });
            bookmarksList.append('div').text(function (b) {
                return b.color;
            });

            // Create dropdown list to select bookmark
            $(BOOKMARKDIALOG.Config.bookmarkDropdownList).dropdown({
                'change': BOOKMARKDIALOG.EVTHANDLER.bookmarkDropdownListChanged
            });

            // Add wrapper div containing icon for color picking, text input and legendbookmarkDetails.append('p').text(d.title);
            var newBookmarkOptions = bookmarkSettings.append("div")
                .attr("class", "eexcess-bookmark-dialog-optional");

            /*newBookmarkOptions.append("div")
             .attr("id", "eexcess-bookmak-dialog-color-picker")
             .attr("title", "Select Color"); */

            newBookmarkOptions.append("div")
                .attr("class", "eexcess-bookmark-dialog-input-wrapper")
                .append("input");

            newBookmarkOptions.append('p')
                .text(BOOKMARKDIALOG.Config.STR_BOOKMARK_NAME_MISSING)
                .style('display', 'none');

            var bookmarkButtonsWrapper1 = dialogBookmark.append("div")
                .attr("class", "eexcess-bookmark-buttons-wrapper");

            bookmarkButtonsWrapper1.append("input")
                .attr("type", "button")
                .attr("class", "eexcess-bookmark-button")
                .attr("style", "width:65px;")
                .attr("value", "Save new")
                .on("click", savebutton);
            //.on("click", EVTHANDLER.bookmarkSaveButtonClicked);

            // Also show delete - buttons in this dialog.
            // Todo: remove the old bookmark-info popup
            if (datum && this.bookmarkedItems[datum.id]) {
                //var bookmarkListToDelete = dialogBookmark.append("div")
                //    .attr("class", "eexcess-bookmark-bookmarkList");

                var bookmarkedInSection = dialogBookmark.append('div').attr('class', 'eexcess-bookmark-bookmarked-in-section');
                bookmarkedInSection.append('span').attr('class', 'label').style('width', '100%').text('Already bookmarked in:');

                var itemBookmarksData = bookmarkedInSection.selectAll('div')
                    .data(this.bookmarkedItems[datum.id].bookmarked);

                var itemInBookmarks = itemBookmarksData.enter().append('div')
                    .attr('class', 'eexcess-bookmark-bookmarked-in');

                itemInBookmarks.append('div')
                    .attr('class', 'eexcess-bookmark-color-icon')
                    .style('background-color', function (d) {
                        return d.color;
                    });

                itemInBookmarks.append('span').text(function (d) {
                    return d["bookmark-name"];
                });

                itemInBookmarks.append('img')
                    .attr('src', BOOKMARKDIALOG.BOOKMARKS.mediapathprefix + BOOKMARKDIALOG.Config.REMOVE_SMALL_ICON)
                    .attr('title', 'Remove item from this bookmark')
                    .on('click', BOOKMARKDIALOG.EVTHANDLER.removeBookmarkIconClicked);
            }

            // Append save and cancel buttons within container
            var bookmarkButtonsWrapper = dialogBookmark.append("div")
                .attr("class", "eexcess-bookmark-buttons-wrapper");

            bookmarkButtonsWrapper.append("input")
                .attr("type", "button")
                .attr("class", "eexcess-bookmark-button")
                .attr("value", "Close")
                .on('click', BOOKMARKDIALOG.EVTHANDLER.bookmarkCancelButtonClicked);

            // show bookmark dialog
            $(BOOKMARKDIALOG.Config.saveBookmarkDialogId).slideDown('slow');
            // make div icon a color picker
            /* $( colorPickerId ).colorpicker({
             'img' : IMG_COLOR_WHEEL_LARGE,
             'width' : 200,
             'height' : 200
             }); */
        },
        destroyBookmarkDialog: function () {
            //console.log("-- DESTROYBOOKMARKDIALOG");
            //$( colorPickerId ).colorpicker('destroy');
            $(BOOKMARKDIALOG.Config.bookmarkDialogClass).remove();
            this.isBookmarkDialogOpen = false;
        },
        saveBookmark: function (LIST) {
            //console.log("-- SAVEBOOKMARK");
            var bookmark = this.getCurrentBookmark();
            var item = this.getCurrentItem();
            var index = this.getCurrentItemIndex();

            if (this.validateBookmarkToSave()) {

                if (LoggingHandler)
                    LoggingHandler.log({action: "Bookmark added", source: "List", itemId: item.id, value: bookmark['bookmark-name']});

                if (bookmark['type'] === 'new')
                    BookmarkingAPI.createBookmark(bookmark['bookmark-name'], bookmark['color'], bookmark['filters']);

                console.log(BookmarkingAPI.addItemToBookmark(bookmark['bookmark-name'], item));

                this.destroyBookmarkDialog();

                if (LIST)
                    LIST.turnFaviconOnAndShowDetailsIcon(index);
                else
                    console.warn("No List for turning on Favicon and showdetail icon given");

                // Update ancillary variable
                this.updateBookmarkedItems();
            } else
                console.warn("Validation of bookmark to save FAILED");
        },
        buildSeeAndEditBookmarkDialog: function (datum, index) {
            //console.log("-- BUILDSEEANDEDITBOOKMARKDIALOG");
            this.destroyBookmarkDialog();
            this.isBookmarkDialogOpen = true;
            this.setCurrentItem(datum, index);

            var topOffset = $(BOOKMARKDIALOG.Config.contentPanel).offset().top;

            var detailsDialog = d3.select('body').append('div')
                .attr('id', 'eexcess-see-and-edit-bookmark-dialog')
                .attr("class", "eexcess-bookmark-dialog")
                .style('top', topOffset + 'px')
                .style('display', 'none')
                .on("click", function () {
                    d3.event.stopPropagation();
                });

            detailsDialog.append("div")
                .attr("class", "eexcess-bookmark-dialog-title")
                .text('Bookmark Info');        // = datum.tilte

            var detailsSection = detailsDialog.append('div')
                .attr('class', 'eexcess-boookmark-dialog-details');

            detailsSection.append('span').text('Title');
            detailsSection.append('p').text(datum.title);


            var bookmarkedInSection = detailsDialog.append('div').attr('class', 'eexcess-bookmark-bookmarked-in-section');
            bookmarkedInSection.append('span').style('width', '100%').text('Bookmarked in:');

            var itemBookmarksData = bookmarkedInSection.selectAll('div')
                .data(this.bookmarkedItems[datum.id].bookmarked);

            var itemInBookmarks = itemBookmarksData.enter().append('div')
                //.attr('id', function(d, i){ return 'eexcess-bookmark-bookmarked-in-' + i; })
                .attr('class', 'eexcess-bookmark-bookmarked-in');

            itemInBookmarks.append('div')
                .attr('class', 'eexcess-bookmark-color-icon')
                .style('background-color', function (d) {
                    return d.color;
                });

            itemInBookmarks.append('span').text(function (d) {
                return d["bookmark-name"];
            });

            itemInBookmarks.append('img')
                .attr('src', BOOKMARKDIALOG.BOOKMARKS.mediapathprefix + BOOKMARKDIALOG.Config.REMOVE_SMALL_ICON)
                .attr('title', 'Remove item from this bookmark')
                .on('click', BOOKMARKDIALOG.EVTHANDLER.removeBookmarkIconClicked);


            // Append done button within container
            var bookmarkButtonsWrapper = detailsDialog.append("div")
                .attr("class", "eexcess-bookmark-buttons-wrapper");

            bookmarkButtonsWrapper.append("input")
                .attr("type", "button")
                .attr("class", "eexcess-bookmark-button")
                .attr("value", "Done")
                .on("click", BOOKMARKDIALOG.EVTHANDLER.bookmarkDoneButtonClicked);

            $(BOOKMARKDIALOG.Config.detailsBookmarkDialogId).slideDown('slow');
        },
        deleteBookmarkAndRefreshDetailsDialog: function (sender, bookmark, bookmarkIndex) {

            var item = this.getCurrentItem();

            if (typeof item === "undefined")
                console.warn("ATTENTION: Could not determine current item!");

            var itemIndex = this.getCurrentItemIndex();

            BookmarkingAPI.deleteItemFromBookmark(item.id, bookmark["bookmark-name"]);

            // sender is img element with remove icon
            $(sender.parentNode).remove();


            this.updateBookmarkedItems();

            if ((typeof this.bookmarkedItems[item.id] === 'undefined' ||
                this.bookmarkedItems[item.id] === 'undefined') && this.list_obj_getter_fct)
                var LIST = this.list_obj_getter_fct();

            if (typeof LIST !== "undefined")
                LIST.turnFaviconOffAndHideDetailsIcon(itemIndex);

            BOOKMARKDIALOG.FILTER.changeDropDownList();

            //update list and drop down list
            var fBmDialogId = BOOKMARKDIALOG.Config.filterBookmarkDialogId;

            $(fBmDialogId + ">div>ul>li:eq(" + this.currentSelectIndexPerFilter + ")").trigger("click");
            $(fBmDialogId + ">div>ul").css("display", "none");
            $(fBmDialogId + ">div").removeClass("active");

            if (typeof LoggingHandler !== "undefined")
                LoggingHandler.log({action: "Bookmark removed", itemId: item.id,
                    itemTitle: item.title, value: bookmark["bookmark-name"]});
        },
        exportBookmarks: function () {
            //console.log("-- EXPORTBOOKMARKS");
            window.URL = window.URL;// || window.webkitURL;

            //console.log(BookmarkingAPI.getAllBookmarks());

            var expBmElm = $(BOOKMARKDIALOG.Config.exportBookmark);
            expBmElm.on("click", function (evt) {

                var bookmarkData = JSON.stringify(BookmarkingAPI.getAllBookmarks());
                var blob = new Blob([bookmarkData], {type: 'text/plain'});
                expBmElm.attr("href", window.URL.createObjectURL(blob));
                expBmElm.attr("download", "bookmarks.txt");
            });
            //$(exportBookmark).attr("href", window.URL.createObjectURL(blob));
            //$(exportBookmark).attr("download", "bookmarks.txt");

        },
        importBookmarks: function () {
            //console.log("-- IMPORTBOOKMARKS");
            function doOpen(evt, func) {
                var files = evt.target.files;
                var reader = new FileReader();
                reader.onload = function () {
                    func(this.result);
                };
                reader.readAsText(files[0]);
            }

            $(BOOKMARKDIALOG.Config.importBookmarkStyle).on("click", function (evt) {
                $(BOOKMARKDIALOG.Config.importBookmark).trigger("click");
            });

            $(BOOKMARKDIALOG.Config.importBookmark).on("change", function (evt) {
                doOpen(evt, function (dataString) {

                    //update control
                    BOOKMARKDIALOG.FILTER.changeDropDownList();
                    BOOKMARKDIALOG.FILTER.showStars();
                    BOOKMARKDIALOG.FILTER.updateData();
                    BOOKMARKDIALOG.FILTER.showStars();
                    BOOKMARKDIALOG.FILTER.updateData();


                    var importBookmarks = JSON.parse(dataString);
                    //console.log(importBookmarks);
                    var allBookmarks = BookmarkingAPI.getAllBookmarks();
                    //console.log(allBookmarks);

                    //compare items id's
                    function searchItemId(items, searchedId) {
                        items.forEach(function (item) {
                            if (item.id == searchedId) {
                                return true;
                            }
                        });
                        return false;
                    }

                    //compare and create bookmark items
                    function importItems(bookmark) {
                        importBookmarks[bookmark].items.forEach(function (currentItem) {
                            if (!searchItemId(allBookmarks[bookmark].items, currentItem.id)) {
                                BookmarkingAPI.addItemToBookmark(bookmark, currentItem);
                            }
                        });
                    }

                    //compare and create two bookmarks
                    Object.keys(importBookmarks).forEach(function (currentBookmark) {
                        if (allBookmarks.hasOwnProperty(currentBookmark)) {
                            importItems(currentBookmark);
                        } else {
                            BookmarkingAPI.createBookmark(currentBookmark, importBookmarks[currentBookmark].color);
                            importItems(currentBookmark);
                        }
                    });


                });

                BOOKMARKDIALOG.FILTER.showStars();
                BOOKMARKDIALOG.FILTER.updateData();
                BOOKMARKDIALOG.FILTER.showStars();
                BOOKMARKDIALOG.FILTER.updateData();

            });
        }
    },
    FILTER: {
        bookmarkingListOffset: null,
        updateDataCb: null,
        setUpdateDataCb: function (cb) {
            //console.log("-- SETUPDATEDATACB", cb);
            this.updateDataCb = cb;
        },
        datasetter_fct: null,
        datagetter_fct: null,
        vis_panel_getter_fct: null,
        /*
         * Necessary getter if microvis needs to be updated
         */
        setVisPanelGetter: function (getter) {
            this.vis_panel_getter_fct = getter;
        },
        inputdata_getter_fct: null,
        /**
         * Called by 'showStars'
         */
        setInputDataGetter: function (getter) {
            this.inputdata_getter_fct = getter;
        },
        /**
         * onDataReceivedFct in starter.js originally
         * referenced from there
         */
        on_data_received_fct: function (arg) {
            console.warn("OnDataReceived - Function not set!");
        },
        get_demo_results_university_fct: function () {
            console.warn("getDemoResultsUniversity - Function not set!");
        },
        get_demo_results_historic_buildings: function () {
            console.warn("getDemoResultsHistoricBuildings - Function not set!");
        },
        buildFilterBookmark: function (data, originalData, inputData, LIST) {
            //console.log("-- BUILDFILTERBOOKMARK", data, originalData, inputData, LIST);
            BOOKMARKDIALOG.BOOKMARKS.destroyBookmarkDialog();

            // Set in vis.js directly...
            //inputData = data;
            //START.inputData = data;

            this.changeDropDownList();

            d3.select(BOOKMARKDIALOG.Config.addBookmarkItems).on("click", function (d, i) {
                this.buildAddBookmarkItems(d, i, data, originalData, LIST);
            }.bind(this));
            d3.select(BOOKMARKDIALOG.Config.saveFilterButton).on("click", function (d, i) {
                this.buildAddBookmarkItems(d, i, data, originalData, LIST);
            }.bind(this));

            d3.select(BOOKMARKDIALOG.Config.deleteBookmark).on("click", function () {

                if (confirm("Delete current bookmark?") == true) {
                    var bookmarkName = $(BOOKMARKDIALOG.Config.filterBookmarkDialogId + ">div>span").text().split(":")[0].trim();
                    BookmarkingAPI.deleteBookmark(bookmarkName);

                    this.changeDropDownList();

                    this.showStars();
                    this.updateData();
                    this.showStars();
                    this.updateData();
                    if (LoggingHandler)
                        LoggingHandler.log({action: "Bookmark collection removed", value: bookmarkName});
                }

            }.bind(this));
            $(BOOKMARKDIALOG.Config.deleteBookmark).prop("disabled", true);
        },
        /**
         * All parameters only needed when called from from Vis.Js
         * @param {type} indicesToHighlight OPTIONAL
         * @param {type} data   OPTIONAL
         * @param {type} originalData   OPTIONAL
         */
        changeDropDownList: function (indicesToHighlight, data, originalData) {
            //console.log("-- CHANGEDROPDOWNLIST", indicesToHighlight, data, originalData);
            $(BOOKMARKDIALOG.Config.filterBookmarkDialogId).remove();

            var topOffset = $('#eexcess_bookmarkingcollections-placeholder').offset().top;
            var dialogBookmark = d3.select("#eexcess_bookmarkingcollections-placeholder").append("span")//div
                .attr("id", "eexcess-filter-bookmark-dialog")
                .attr("class", "eexcess-filter-bookmark-dialog")
                .style("top", topOffset + "px")
                //.style("width","200px")
                ;

            var bookmarksListContainer = dialogBookmark.append("div")
                .attr("class", "eexcess-bookmark-dropdown-list")
                .append('ul');

            var bookmarks = BookmarkingAPI.getAllBookmarkNamesAndColors();

            var bookmarkCount = 0;
            bookmarks.forEach(function (elementData, indexData) {
                bookmarkCount = 0;
                bookmarkCount = BookmarkingAPI.getAllBookmarks()[elementData["bookmark-name"]].items.length;
                elementData["bookmark-name"] = elementData["bookmark-name"] + " : (" + bookmarkCount + ")";
            });

            var demoUniversityCampus = "Demo University campus";
            var demoHistoricBuildings = "Demo Historic buildings";
            var demoData = $.merge([{'bookmark-name': demoUniversityCampus, 'color': ''},
                {'bookmark-name': demoHistoricBuildings, 'color': ''}],
                bookmarks);

            this.bookmarkingListOffset = 2;
            var optionsData = $.merge([{'bookmark-name': BOOKMARKDIALOG.Config.STR_SHOWALLRESULTS, 'color': ''}], demoData);

            var bookmarksListData = bookmarksListContainer.selectAll('li').data(optionsData);

            var bookmarksList = bookmarksListData.enter().append('li');
            bookmarksList.append('a')
                //.attr("title", function(b){ return b["bookmark-name"];})
                .text(function (b) {
                    return b["bookmark-name"];
                })
                //.each(function(b) {
                //    var link = d3.select(this);
                //    link.attr("title", b["bookmark-name"]);
                //})
                ;
            bookmarksList.append('div').text(function (b) {
                return b.color;
            });

            $(BOOKMARKDIALOG.Config.filterBookmarkDropdownList).dropdown({
                'change': function (evt, index) {
                    BOOKMARKDIALOG.BOOKMARKS.currentSelectIndexPerFilter = index;

                    evt = evt.split(":")[0].trim();
                    var input = {};
                    indicesToHighlight = [];

                    if (evt === BOOKMARKDIALOG.Config.STR_SHOWALLRESULTS) {

                        BOOKMARKDIALOG.FILTER.showStars();
                        BOOKMARKDIALOG.FILTER.updateData();

                        $(BOOKMARKDIALOG.Config.deleteBookmark).prop("disabled", true);
                    } else if (evt === demoUniversityCampus) {
                        BOOKMARKDIALOG.FILTER.on_data_received_fct(BOOKMARKDIALOG.FILTER.get_demo_results_university_fct());
                    } else if (evt === demoHistoricBuildings) {
                        BOOKMARKDIALOG.FILTER.on_data_received_fct(BOOKMARKDIALOG.FILTER.get_demo_results_historic_buildings());
                    } else {
                        var currentBookmarkItems = BookmarkingAPI.getAllBookmarks()[evt].items;

                        //FILTER.filterBookmark(inputData,currentBookmarkItems,function(inputData,indexData){
                        //	input.data.push(inputData[indexData]);
                        //});

                        input.data = [];
                        data = [];
                        var bookmarkCount = 0;
                        currentBookmarkItems.forEach(function (item) {
                            input.data.push(item);
                            indicesToHighlight.push(++bookmarkCount);
                        });
                        data = input.data;
                        originalData = input.data;

                        // Setting external data (for example vis.js)
                        if (BOOKMARKDIALOG.FILTER.datasetter_fct)
                            BOOKMARKDIALOG.FILTER.datasetter_fct(data, originalData);

                        var bms = BookmarkingAPI.getAllBookmarks()[evt];
                        var bm_filters = bms.filters;

                        if (typeof FilterHandler !== "undefined") {
                            if (!bm_filters || !bm_filters.length) {
                                FilterHandler.reset();
                                BOOKMARKDIALOG.FILTER.updateData();
                            } else if (BOOKMARKDIALOG.FILTER.vis_panel_getter_fct) {
                                var vispanel = BOOKMARKDIALOG.FILTER.vis_panel_getter_fct();
                                FilterHandler.loadFilters(bms, vispanel.getMicroVisMapping());
                                BOOKMARKDIALOG.FILTER.updateData();
                            }
                        }


                        $(BOOKMARKDIALOG.Config.deleteBookmark).prop("disabled", false).css("background", "");
                    }
                    if (typeof LoggingHandler !== "undefined")
                        LoggingHandler.log({action: "Bookmark collection selected", value: evt})
                }
            });

            $(BOOKMARKDIALOG.Config.filterBookmarkDialogId).on("mousedown", function (evt) {
                BOOKMARKDIALOG.BOOKMARKS.destroyBookmarkDialog();
                BOOKMARKDIALOG.BOOKMARKS.isBookmarkDialogOpen = false;
            });

            $(BOOKMARKDIALOG.Config.filterBookmarkDialogId).slideDown('slow');
        },
        buildAddBookmarkItems: function (d, i, data, originalData, LIST) {
            //console.log("-- BUILDADDBOOKMARKITEMS", d, i, data, originalData);
            //BookmarkingAPI.deleteBookmark("")
            var is_savingfilters = (d3.event.target.id === "eexcess_saveFilter_button");

            d3.event.stopPropagation();
            BOOKMARKDIALOG.BOOKMARKS.buildSaveBookmarkDialog(
                d,
                function (thisValue) {},
                function (bookmarkDetails) {
                    if (is_savingfilters)
                        bookmarkDetails.append('p').text("Save current Filter");
                    else
                        bookmarkDetails.append('p').text("selected bookmarks items");
                },
                function () {

                    BOOKMARKDIALOG.FILTER.addBookmarkItems(is_savingfilters, data, originalData, null, LIST);
                    //$(filterBookmarkDialogId+">div>ul>li:eq("+currentSelectIndex+")").trigger("click");
                    var bookmark = BOOKMARKDIALOG.BOOKMARKS.getCurrentBookmark();
                    if (bookmark['type'] == 'new' || bookmark['type'] == '') {
                        $(BOOKMARKDIALOG.Config.filterBookmarkDialogId + ">div>ul>li:eq(" +
                            (BookmarkingAPI.getAllBookmarkNamesAndColors().length + BOOKMARKDIALOG.FILTER.bookmarkingListOffset)
                            + ")").trigger("click");
                    } else {
                        $(BOOKMARKDIALOG.Config.filterBookmarkDialogId + ">div>ul>li:eq(" + BOOKMARKDIALOG.BOOKMARKS.currentSelectIndex + ")").trigger("click");
                    }

                    $(BOOKMARKDIALOG.Config.filterBookmarkDialogId + ">div>ul").css("display", "none");
                    $(BOOKMARKDIALOG.Config.filterBookmarkDialogId + ">div").removeClass("active");
                }.bind(this),
                this
                );

            if (is_savingfilters)
                jQuery('.eexcess-bookmark-dropdown-list').hide();
        },
        /**
         * Executed as callback at save-bookmark-button.
         * Triggers saving the bookmark via the API
         * 
         * @param {type} save_filters   TRUE if Filter (and all elements) should be saved
         * @param {type} data
         * @param {type} originalData
         * @param {type} inputData
         * @param {type} query
         * @param {type} LIST
         * @param {} single_item taken if just one item - independent from a data-list needs to be saved
         * @returns {undefined}
         */
        addBookmarkItems: function (save_filters, data, originalData, query, LIST, single_item) {
            //console.log("-- ADDBOOKMARKITEMS", save_filters, data, originalData, inputData, query, LIST);
            //console.log(indicesToHighlight);
            var bookmark = BOOKMARKDIALOG.BOOKMARKS.getCurrentBookmark();

            if (!data)
                console.warn("No data provided in 'addBookmarkItems'");

            if (!originalData)
                console.warn("No originalData provided in 'addBookmarkItems'");

            if (BOOKMARKDIALOG.BOOKMARKS.validateBookmarkToSave()) {

                var filters = null;
                if (save_filters)
                    filters = FilterHandler.filters;

                //console.log("CREATE BOOKMARK: ", bookmark);
                //var bookmark = BOOKMARKS.internal.getCurrentBookmark();
                if (bookmark['type'] == 'new') {
                    BookmarkingAPI.createBookmark(bookmark['bookmark-name'], bookmark['color'], filters);
                    if (typeof LoggingHandler !== "undefined")
                        LoggingHandler.log({action: "Bookmark collection created", value: bookmark['bookmark-name']});
                }

                /*
                 * Called for every item to be saved
                 */
                function addBookmarkFunc(currentData, index) {
                    var bookmarkItem = {
                        'id': currentData.id,
                        'title': currentData.title,
                        'facets': currentData.facets,
                        'uri': currentData.uri,
                        'coordinate': currentData.coordinate,
                        'query': query
                    };
                    BookmarkingAPI.addItemToBookmark(bookmark['bookmark-name'], bookmarkItem);
                    if (LIST)
                        LIST.turnFaviconOnAndShowDetailsIcon(index);
                    //else
                    //    console.warn("No LIST provided");
                }

                var dataIdsToBookmark = null;
                if (!single_item) {
                    if (save_filters) {
                        dataIdsToBookmark = [];
                        originalData.forEach(function (item) {
                            dataIdsToBookmark.push(item.id);
                        });
                    } else
                        dataIdsToBookmark = FilterHandler.mergeFilteredDataIds();



                    if (dataIdsToBookmark.length > 0) {
                        dataIdsToBookmark.forEach(function (dataItemId) {

                            var data_src = data;
                            if (save_filters)
                                data_src = originalData;

                            var index = underscore.findIndex(data_src, function (d) {
                                return d.id == dataItemId;
                            });
                            var dataItem = underscore.find(data_src, function (d) {
                                return d.id == dataItemId;
                            });
                            addBookmarkFunc(dataItem, index);
                        });
                        if (LoggingHandler)
                            LoggingHandler.log({action: "Bookmarks added", value: bookmark['bookmark-name'], itemCount: dataIdsToBookmark.length});
                    } else
                        console.warn("dataIdsToBookmark empty");
                } else
                    addBookmarkFunc(single_item, 0);

                BOOKMARKDIALOG.BOOKMARKS.destroyBookmarkDialog();
                this.changeDropDownList();

                this.showStars();
                this.updateData();
                this.showStars();
                this.updateData();
            }
        },
        /**
         * Flagging each item as 'bookmarked' or not
         * @param {type} inputData
         * @returns {undefined}
         */
        showStars: function () {
            //console.log("-- SHOWSTARS");
            var input = {};
            input.data = [];

            if (!BOOKMARKDIALOG.FILTER.inputdata_getter_fct)
                return;

            var inputData = BOOKMARKDIALOG.FILTER.inputdata_getter_fct();

            input.data = inputData;
            // update bookmarking changes:
            input.data.forEach(function (dataItem) {
                if (typeof BOOKMARKDIALOG.BOOKMARKS.bookmarkedItems[dataItem.id] !== 'undefined' &&
                    BOOKMARKDIALOG.BOOKMARKS.bookmarkedItems[dataItem.id] !== 'undefined') {
                    dataItem['bookmarked'] = true;
                } else {
                    dataItem['bookmarked'] = false;
                }
            });

            if (BOOKMARKDIALOG.FILTER.datagetter_fct)
                var data_ = BOOKMARKDIALOG.FILTER.datagetter_fct();
            else
                return;

            data_ = input.data;

            if (BOOKMARKDIALOG.FILTER.datasetter_fct)
                BOOKMARKDIALOG.FILTER.datasetter_fct(data_);
        },
        /**
         * Triggering BOOKMARKDIALOG.BOOKMARKS.updateBookmarkedItems();
         * and a defined callback
         * @param {type} cb
         * @returns {undefined}
         */
        updateData: function (cb) {
            //console.log("-- UPDATEDATA");
            // Initialize template's elements
            //PREPROCESSING.setAncillaryVariables();
            BOOKMARKDIALOG.BOOKMARKS.updateBookmarkedItems();
            //PREPROCESSING.extendDataWithAncillaryDetails();

            if (this.updateDataCb)
                this.updateDataCb();
            //else
            //    console.warn("NO UPDATE DATA CB SET!");


        }
    },
    EVTHANDLER: {
        bookmarkDropdownListChanged: function (value, index) {
            //console.log("-- BOOKMARKDROPDOWNLISTCHANGED", value, index);
            BOOKMARKDIALOG.BOOKMARKS.currentSelectIndex = index;
            //console.log("##### >> " +currentSelectIndex);

            if (index === 0)
                $(BOOKMARKDIALOG.Config.newBookmarkOptionsId).slideDown("slow");
            else
                $(BOOKMARKDIALOG.Config.newBookmarkOptionsId).slideUp("slow");

            $(BOOKMARKDIALOG.Config.newBookmarkOptionsId).find('p').fadeOut('fast');      // error message hidden
        },
        removeBookmarkIconClicked: function (bookmark, bookmarkIndex) {
            BOOKMARKDIALOG.BOOKMARKS.deleteBookmarkAndRefreshDetailsDialog(this, bookmark, bookmarkIndex);
        },
        ////////	'Cancel' button clicked in save bookmark dialog 	////////
        bookmarkCancelButtonClicked: function () {
            if (typeof LoggingHandler !== 'undefined')
                LoggingHandler.log({action: "Bookmarkwindow closed"});
            BOOKMARKDIALOG.BOOKMARKS.destroyBookmarkDialog();
        },
        ////////	'Done' button clicked in bookmark details dialog 	////////
        bookmarkDoneButtonClicked: function () {
            BOOKMARKDIALOG.BOOKMARKS.destroyBookmarkDialog();
        }
    },
    Api: {
    },
    Config: {
        bookmarkDialogClass: ".eexcess-bookmark-dialog", // Class selector for both types of dialog: save bookmark and see-and-edit-bookmark
        editBookmarkButton: '#eexcess_editBookmark_button', // Id for a button that shows the other bookmark-related edit-buttons
        editBookmarkContainer: '#eexcess_bookmarkEditContainer', // Container holding the bookmark-edit-buttons.
        saveBookmarkDialogId: "#eexcess-save-bookmark-dialog", // Id for dialog poping up upon clicking on a "star" icon
        bookmarkDropdownList: "#eexcess-save-bookmark-dialog .eexcess-bookmark-dropdown-list", // Div wrapping drop down list in bookmark dialog
        newBookmarkOptionsId: "#eexcess-save-bookmark-dialog .eexcess-bookmark-dialog-optional", // Div wrapping color picker and input element in bookmark dialog
        colorPickerId: "#eexcess-bookmak-dialog-color-picker", // Div tranformed into a colorpicekr in bookmark dialog
        bookmarkDialogInputWrapper: "#eexcess-save-bookmark-dialog .eexcess-bookmark-dialog-input-wrapper", // Wrapper for input containing new bookmark name
        detailsBookmarkDialogId: "#eexcess-see-and-edit-bookmark-dialog", // Dialog displaying bookmark detials (when click on 3-dotted icon)
        bookmarkedInId: 'eexcess-bookmark-bookmarked-in-', // Divs in bookamark details dialog showing bookmarks in which the current item is recorded
        filterBookmarkDialogId: "#eexcess-filter-bookmark-dialog", // Id for dialog filter bookmark
        filterBookmarkDropdownList: "#eexcess-filter-bookmark-dialog .eexcess-bookmark-dropdown-list", // Div wrapping drop down list in filter bookmark dialog
        deleteBookmark: "#eexcess_deleteBookmark_button", // Button for boookmark deleted.
        addBookmarkItems: "#eexcess_addBookmarkItems_button", // Button for add boookmarkitems.
        saveFilterButton: "#eexcess_saveFilter_button", // Button for saving filters and its items
        exportBookmark: "#eexcess_export_bookmark", // Export bookmark data.
        importBookmark: "#eexcess_import_bookmark", // Import bookmark data.
        importBookmarkStyle: "#eexcess_import_bookmark_style", // Styles import bookmark button control.
        contentPanel: "#eexcess_content", // Selector for content div on the right side
        STR_NEW: "New Collecction...",
        STR_BOOKMARK_NAME_MISSING: "Indicate new bookmark name",
        REMOVE_SMALL_ICON: "media/batchmaster/remove.png",
        STR_SHOWALLRESULTS: "Search results"
    },
    Tools: {
        /**
         * Taken from starter.js to convert a single received item from V2 to V1
         * @param {type} v2DataItem
         * @returns {BOOKMARKDIALOG.Tools.mapItemFromV2toV1.v1DataItem}
         */
        mapItemFromV2toV1: function (v2DataItem) {
            
            var v1DataItem = {
                "id": v2DataItem.documentBadge.id,
                "title": v2DataItem.title,
                "description": v2DataItem.description,
                "previewImage": v2DataItem.previewImage,
                "uri": v2DataItem.documentBadge.uri,
                "eexcessURI": "", //"http://europeana.eu/api/405rd",
                "collectionName": "", // "09213_Ag_EU_EUscreen_Czech_Televison",
                "facets": {
                    "provider": v2DataItem.documentBadge.provider,
                    "type": v2DataItem.mediaType,
                    "language": v2DataItem.language,
                    "year": v2DataItem.date,
                    "license": v2DataItem.licence
                },
                "detailsV2": v2DataItem.details,
                "bookmarked": false,
                "provider-icon": "", //"media/icons/Europeana-favicon.ico",
                "coordinate": null, //[50.0596696, 14.4656239]
                "v2DataItem": v2DataItem
            };

            if (v2DataItem.detail) {
                console.warn('detail instead of details received !!');
            }

            // not sure, if the details-property is called "detail" or "details" (as i have seen both)
            var details = v2DataItem.details;
            if (v2DataItem.detail != undefined)
                details = v2DataItem.detail;

            if (details) {
                if (details.eexcessProxy
                    && details.eexcessProxy.wgs84lat && !isNaN(parseFloat(details.eexcessProxy.wgs84lat))
                    && details.eexcessProxy.wgs84long && !isNaN(parseFloat(details.eexcessProxy.wgs84long)))
                {
                    v1DataItem.coordinate = [parseFloat(details.eexcessProxy.wgs84lat), parseFloat(details.eexcessProxy.wgs84long)];
                } else if (details.eexcessProxyEnriched && details.eexcessProxyEnriched.wgs84Point) {
                    var listOfPoints = details.eexcessProxyEnriched.wgs84Point;
                    if (listOfPoints.length > 0) {
                        v1DataItem.coordinate = [listOfPoints[0].wgs84lat, listOfPoints[0].wgs84long];
                        v1DataItem.coordinateLabel = listOfPoints[0].rdfslabel;
                    }
                }
            }
            
            return v1DataItem;
        }
    }
};
