/**
 * Accesing the Recommendation-Dashboard-Bookmarking-API globally
 * @todo implement me
 * @author Peter Hasitschka
 */

console.warn("TODO: Consider to load this file in a proper way!");

var C4 = C4 || {};
C4.Bookmarking = {
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
        getCurrentBookmark: function () {
            var bookmarkName = $(C4.Bookmarking.Config.bookmarkDropdownList).find('span').text();
            var color = '', type = '';
            if (bookmarkName === C4.Bookmarking.Config.STR_NEW) {
                bookmarkName = $(C4.Bookmarking.Config.bookmarkDialogInputWrapper).find('input').val();
                color = $(C4.Bookmarking.Config.colorPickerId).css('backgroundColor');
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
            console.log("-- VALIDATEBOOKMARKTOSAVE");
            var $message = $(C4.Bookmarking.Config.newBookmarkOptionsId).find('p');

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
            console.log("-- HANDLEBOOKMARKEDITBUTTON");
            jQuery(C4.Bookmarking.Config.editBookmarkButton).click(function () {
                jQuery(C4.Bookmarking.Config.editBookmarkContainer).toggle();
            });
        },
        updateBookmarkedItems: function () {
            console.log("-- UPDATEBOOKMARKEDITEMS");
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
            console.log("-- BUILDSAVEBOOKMARKDIALOG");
            $(C4.Bookmarking.Config.filterBookmarkDialogId + ">div").removeClass("active").children("ul").slideUp('slow');

            this.destroyBookmarkDialog();
            this.isBookmarkDialogOpen = true;

            firstFunc(this);
            //this.internal.setCurrentItem(d, i);

            var topOffset = $(C4.Bookmarking.Config.contentPanel).offset().top;

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
            var optionsData = $.merge([{'bookmark-name': C4.Bookmarking.Config.STR_NEW, 'color': ''}], BookmarkingAPI.getAllBookmarkNamesAndColors());

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
            $(C4.Bookmarking.Config.bookmarkDropdownList).dropdown({
                'change': C4.Bookmarking.EVTHANDLER.bookmarkDropdownListChanged
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
                .text(C4.Bookmarking.Config.STR_BOOKMARK_NAME_MISSING)
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
                    .attr('src', C4.Bookmarking.Config.REMOVE_SMALL_ICON)
                    .attr('title', 'Remove item from this bookmark')
                    .on('click', C4.Bookmarking.EVTHANDLER.removeBookmarkIconClicked);
            }

            // Append save and cancel buttons within container
            var bookmarkButtonsWrapper = dialogBookmark.append("div")
                .attr("class", "eexcess-bookmark-buttons-wrapper");

            bookmarkButtonsWrapper.append("input")
                .attr("type", "button")
                .attr("class", "eexcess-bookmark-button")
                .attr("value", "Close")
                .on('click', C4.Bookmarking.EVTHANDLER.bookmarkCancelButtonClicked);

            // show bookmark dialog
            $(C4.Bookmarking.Config.saveBookmarkDialogId).slideDown('slow');
            // make div icon a color picker
            /* $( colorPickerId ).colorpicker({
             'img' : IMG_COLOR_WHEEL_LARGE,
             'width' : 200,
             'height' : 200
             }); */
        },
        destroyBookmarkDialog: function () {
            console.log("-- DESTROYBOOKMARKDIALOG");
            //$( colorPickerId ).colorpicker('destroy');
            $(C4.Bookmarking.Config.bookmarkDialogClass).remove();
            this.isBookmarkDialogOpen = false;
        },
        saveBookmark: function (LIST) {
            console.log("-- SAVEBOOKMARK");
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
            console.log("-- BUILDSEEANDEDITBOOKMARKDIALOG");
            this.destroyBookmarkDialog();
            this.isBookmarkDialogOpen = true;
            this.setCurrentItem(datum, index);

            var topOffset = $(C4.Bookmarking.Config.contentPanel).offset().top;

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
                .attr('src', C4.Bookmarking.Config.REMOVE_SMALL_ICON)
                .attr('title', 'Remove item from this bookmark')
                .on('click', C4.Bookmarking.EVTHANDLER.removeBookmarkIconClicked);


            // Append done button within container
            var bookmarkButtonsWrapper = detailsDialog.append("div")
                .attr("class", "eexcess-bookmark-buttons-wrapper");

            bookmarkButtonsWrapper.append("input")
                .attr("type", "button")
                .attr("class", "eexcess-bookmark-button")
                .attr("value", "Done")
                .on("click", C4.Bookmarking.EVTHANDLER.bookmarkDoneButtonClicked);

            $(C4.Bookmarking.Config.detailsBookmarkDialogId).slideDown('slow');
        },
        deleteBookmarkAndRefreshDetailsDialog: function (sender, bookmark, bookmarkIndex) {

            var item = this.getCurrentItem();
            var itemIndex = this.getCurrentItemIndex();

            BookmarkingAPI.deleteItemFromBookmark(item.id, bookmark["bookmark-name"]);

            // sender is img element with remove icon
            $(sender.parentNode).remove();


            this.updateBookmarkedItems();

            if ((typeof this.bookmarkedItems[item.id] === 'undefined' ||
                this.bookmarkedItems[item.id] === 'undefined') && LIST)
                LIST.turnFaviconOffAndHideDetailsIcon(itemIndex);

            FILTER.changeDropDownList();

            //update list and drop down list
            var fBmDialogId = C4.Bookmarking.Config.filterBookmarkDialogId;

            $(fBmDialogId + ">div>ul>li:eq(" + this.currentSelectIndexPerFilter + ")").trigger("click");
            $(fBmDialogId + ">div>ul").css("display", "none");
            $(fBmDialogId + ">div").removeClass("active");

            if (LoggingHandler)
                LoggingHandler.log({action: "Bookmark removed", itemId: item.id,
                    itemTitle: item.title, value: bookmark["bookmark-name"]});
        },
        exportBookmarks: function () {
            console.log("-- EXPORTBOOKMARKS");
            window.URL = window.URL;// || window.webkitURL;

            //console.log(BookmarkingAPI.getAllBookmarks());

            var expBmElm = $(C4.Bookmarking.Config.exportBookmark);
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
            console.log("-- IMPORTBOOKMARKS");
            function doOpen(evt, func) {
                var files = evt.target.files;
                var reader = new FileReader();
                reader.onload = function () {
                    func(this.result);
                };
                reader.readAsText(files[0]);
            }

            $(C4.Bookmarking.Config.importBookmarkStyle).on("click", function (evt) {
                $(C4.Bookmarking.Config.importBookmark).trigger("click");
            });

            $(C4.Bookmarking.Config.importBookmark).on("change", function (evt) {
                doOpen(evt, function (dataString) {

                    //update control
                    C4.Bookmarking.FILTER.changeDropDownList();
                    C4.Bookmarking.FILTER.showStars();
                    C4.Bookmarking.FILTER.updateData();
                    C4.Bookmarking.FILTER.showStars();
                    C4.Bookmarking.FILTER.updateData();


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

                C4.Bookmarking.FILTER.showStars();
                C4.Bookmarking.FILTER.updateData();
                C4.Bookmarking.FILTER.showStars();
                C4.Bookmarking.FILTER.updateData();

            });
        }
    },
    FILTER: {
        bookmarkingListOffset: null,
        updateDataCb: null,
        setUpdateDataCb: function (cb) {
            console.log("-- SETUPDATEDATACB", cb);
            this.updateDataCb = cb;
        },
        buildFilterBookmark: function (data, originalData, inputData, LIST) {
            console.log("-- BUILDFILTERBOOKMARK", data, originalData, inputData, LIST);
            C4.Bookmarking.BOOKMARKS.destroyBookmarkDialog();

            // Set in vis.js directly...
            //inputData = data;
            //START.inputData = data;

            this.changeDropDownList();

            d3.select(C4.Bookmarking.Config.addBookmarkItems).on("click", function (d, i) {
                this.buildAddBookmarkItems(d, i, data, originalData, inputData, LIST);
            }.bind(this));
            d3.select(C4.Bookmarking.Config.saveFilterButton).on("click", function (d, i) {
                this.buildAddBookmarkItems(d, i, data, originalData, inputData, LIST);
            }.bind(this));

            d3.select(C4.Bookmarking.Config.deleteBookmark).on("click", function () {

                if (confirm("Delete current bookmark?") == true) {
                    var bookmarkName = $(C4.Bookmarking.Config.filterBookmarkDialogId + ">div>span").text().split(":")[0].trim();
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
            $(C4.Bookmarking.Config.deleteBookmark).prop("disabled", true);
        },
        /**
         * All parameters only needed when called from from Vis.Js
         * @param {type} indicesToHighlight OPTIONAL
         * @param {type} data   OPTIONAL
         * @param {type} originalData   OPTIONAL
         */
        changeDropDownList: function (indicesToHighlight, data, originalData) {
            console.log("-- CHANGEDROPDOWNLIST", indicesToHighlight, data, originalData);
            $(C4.Bookmarking.Config.filterBookmarkDialogId).remove();

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
            var optionsData = $.merge([{'bookmark-name': C4.Bookmarking.Config.STR_SHOWALLRESULTS, 'color': ''}], demoData);

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

            $(C4.Bookmarking.Config.filterBookmarkDropdownList).dropdown({
                'change': function (evt, index) {
                    C4.Bookmarking.BOOKMARKS.currentSelectIndexPerFilter = index;

                    evt = evt.split(":")[0].trim();
                    var input = {};
                    indicesToHighlight = [];

                    if (evt === C4.Bookmarking.Config.STR_SHOWALLRESULTS) {

                        C4.Bookmarking.FILTER.showStars();
                        C4.Bookmarking.FILTER.updateData();

                        $(C4.Bookmarking.Config.deleteBookmark).prop("disabled", true);
                    } else if (evt === demoUniversityCampus) {
                        onDataReceived(getDemoResultsUniversity());
                    } else if (evt === demoHistoricBuildings) {
                        onDataReceived(getDemoResultsHistoricBuildings());
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

                        var bms = BookmarkingAPI.getAllBookmarks()[evt];
                        var bm_filters = bms.filters;

                        if (!bm_filters || !bm_filters.length) {
                            FilterHandler.reset();
                            C4.Bookmarking.FILTER.updateData();
                        } else {
                            FilterHandler.loadFilters(bms, VISPANEL.getMicroVisMapping());
                            C4.Bookmarking.FILTER.updateData();
                        }

                        $(C4.Bookmarking.Config.deleteBookmark).prop("disabled", false).css("background", "");
                    }
                    if (LoggingHandler)
                        LoggingHandler.log({action: "Bookmark collection selected", value: evt})
                }
            });

            $(C4.Bookmarking.Config.filterBookmarkDialogId).on("mousedown", function (evt) {
                C4.Bookmarking.BOOKMARKS.destroyBookmarkDialog();
                C4.Bookmarking.BOOKMARKS.isBookmarkDialogOpen = false;
            });

            $(C4.Bookmarking.Config.filterBookmarkDialogId).slideDown('slow');
        },
        buildAddBookmarkItems: function (d, i, data, originalData, inputData, LIST) {
            console.log("-- BUILDADDBOOKMARKITEMS", d, i, data, originalData, inputData);
            //BookmarkingAPI.deleteBookmark("")
            var is_savingfilters = (d3.event.target.id === "eexcess_saveFilter_button");

            d3.event.stopPropagation();
            C4.Bookmarking.BOOKMARKS.buildSaveBookmarkDialog(
                d,
                function (thisValue) {},
                function (bookmarkDetails) {
                    if (is_savingfilters)
                        bookmarkDetails.append('p').text("Save current Filter");
                    else
                        bookmarkDetails.append('p').text("selected bookmarks items");
                },
                function () {

                    C4.Bookmarking.FILTER.addBookmarkItems(is_savingfilters, data, originalData, inputData, null, LIST);
                    //$(filterBookmarkDialogId+">div>ul>li:eq("+currentSelectIndex+")").trigger("click");
                    var bookmark = C4.Bookmarking.BOOKMARKS.getCurrentBookmark();
                    if (bookmark['type'] == 'new' || bookmark['type'] == '') {
                        $(C4.Bookmarking.Config.filterBookmarkDialogId + ">div>ul>li:eq(" +
                            (BookmarkingAPI.getAllBookmarkNamesAndColors().length + C4.Bookmarking.FILTER.bookmarkingListOffset)
                            + ")").trigger("click");
                    } else {
                        $(C4.Bookmarking.Config.filterBookmarkDialogId + ">div>ul>li:eq(" + C4.Bookmarking.BOOKMARKS.currentSelectIndex + ")").trigger("click");
                    }

                    $(C4.Bookmarking.Config.filterBookmarkDialogId + ">div>ul").css("display", "none");
                    $(C4.Bookmarking.Config.filterBookmarkDialogId + ">div").removeClass("active");
                }.bind(this),
                this
                );

            if (is_savingfilters)
                jQuery('.eexcess-bookmark-dropdown-list').hide();
        },
        addBookmarkItems: function (save_filters, data, originalData, inputData, query, LIST) {
            console.log("-- ADDBOOKMARKITEMS", save_filters, data, originalData, inputData, query, LIST);
            //console.log(indicesToHighlight);
            var bookmark = C4.Bookmarking.BOOKMARKS.getCurrentBookmark();

            if (!data)
                console.warn("No data provided in 'addBookmarkItems'");

            if (!originalData)
                console.warn("No originalData provided in 'addBookmarkItems'");

            if (C4.Bookmarking.BOOKMARKS.validateBookmarkToSave()) {

                var filters = null;
                if (save_filters)
                    filters = FilterHandler.filters;


                //var bookmark = BOOKMARKS.internal.getCurrentBookmark();
                if (bookmark['type'] == 'new') {
                    BookmarkingAPI.createBookmark(bookmark['bookmark-name'], bookmark['color'], filters);
                    if (LoggingHandler)
                        LoggingHandler.log({action: "Bookmark collection created", value: bookmark['bookmark-name']});
                }

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
                    else
                        console.warn("No LIST provided");
                }

                var dataIdsToBookmark = null;
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

                C4.Bookmarking.BOOKMARKS.destroyBookmarkDialog();
                this.changeDropDownList();

                this.showStars(inputData);
                this.updateData();
                this.showStars(inputData);
                this.updateData();
            }
        },
        showStars: function (inputData) {
            console.log("-- SHOWSTARS");
            var input = {};
            input.data = [];
            input.data = inputData;
            // update bookmarking changes:
            input.data.forEach(function (dataItem) {
                if (typeof C4.Bookmarking.BOOKMARKS.bookmarkedItems[dataItem.id] !== 'undefined' &&
                    C4.Bookmarking.BOOKMARKS.bookmarkedItems[dataItem.id] !== 'undefined') {
                    dataItem['bookmarked'] = true;
                } else {
                    dataItem['bookmarked'] = false;
                }
            });
            data = input.data;
        },
        updateData: function (cb) {
            console.log("-- UPDATEDATA");
            // Initialize template's elements
            //PREPROCESSING.setAncillaryVariables();
            C4.Bookmarking.BOOKMARKS.updateBookmarkedItems();
            //PREPROCESSING.extendDataWithAncillaryDetails();

            if (this.updateDataCb)
                this.updateDataCb();
            else
                console.warn("NO UPDATE DATA CB SET!");


        }
    },
    EVTHANDLER: {
        bookmarkDropdownListChanged: function (value, index) {
            console.log("-- BOOKMARKDROPDOWNLISTCHANGED", value, index);
            C4.Bookmarking.BOOKMARKS.currentSelectIndex = index;
            //console.log("##### >> " +currentSelectIndex);

            if (index == 0)
                $(C4.Bookmarking.Config.newBookmarkOptionsId).slideDown("slow");
            else
                $(C4.Bookmarking.Config.newBookmarkOptionsId).slideUp("slow");

            $(C4.Bookmarking.Config.newBookmarkOptionsId).find('p').fadeOut('fast');      // error message hidden
        },
        removeBookmarkIconClicked: function (bookmark, bookmarkIndex) {
            C4.Bookmarking.BOOKMARKS.deleteBookmarkAndRefreshDetailsDialog(this, bookmark, bookmarkIndex);
        },
        ////////	'Cancel' button clicked in save bookmark dialog 	////////
        bookmarkCancelButtonClicked: function () {
            if (LoggingHandler)
                LoggingHandler.log({action: "Bookmarkwindow closed"});
            C4.Bookmarking.BOOKMARKS.destroyBookmarkDialog();
        },
        ////////	'Done' button clicked in bookmark details dialog 	////////
        bookmarkDoneButtonClicked: function () {
            C4.Bookmarking.BOOKMARKS.destroyBookmarkDialog();
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
    }
};
