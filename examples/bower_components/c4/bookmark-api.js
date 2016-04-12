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
        
        currentSelectIndex : 0,
        currentSelectIndexPerFilter : 0,
        
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
            jQuery(C4.Bookmarking.Config.editBookmarkButton).click(function () {
                jQuery(C4.Bookmarking.Config.editBookmarkContainer).toggle();
            });
        },
        updateBookmarkedItems: function (bookmarkedItems) {
            //bookmarkedItems = BookmarkingAPI.getBookmarkedItemsById(idsArray);
            //console.log('bisher: ');
            //console.log(bookmarkedItems);

            bookmarkedItems = {};
            var allBookmarks = BookmarkingAPI.getAllBookmarks();
            if (!allBookmarks)
                return;
            Object.keys(allBookmarks).forEach(function (bookmarkKey) {
                allBookmarks[bookmarkKey].items.forEach(function (itemsElement) {

                    var itemEntry = itemsElement['id'];
                    if (typeof bookmarkedItems[itemEntry] == 'undefined' || bookmarkedItems[itemEntry] == 'undefined') {
                        bookmarkedItems[itemEntry] = {'bookmarked': new Array()};
                    }

                    bookmarkedItems[itemEntry].bookmarked.push({
                        'bookmark-name': bookmarkKey,
                        'bookmark-id': allBookmarks[bookmarkKey].id,
                        'color': allBookmarks[bookmarkKey].color
                    });

                });
            });

            //experimental code end to do ask cecillia ??
            //console.log('neu: ');
            //console.log(bookmarkedItems);

            //console.log('----- BOOKMARKED ITEMS -----');
            //console.log(bookmarkedItems);
        },
        buildSaveBookmarkDialog: function (datum, firstFunc, titleOutput, savebutton, sender) {

            $(C4.Bookmarking.Config.filterBookmarkDialogId + ">div").removeClass("active").children("ul").slideUp('slow');

            this.destroyBookmarkDialog();
            isBookmarkDialogOpen = true;

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

            bookmarksList = bookmarksListData.enter().append('li');
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
            if (datum && bookmarkedItems[datum.id]) {
                //var bookmarkListToDelete = dialogBookmark.append("div")
                //    .attr("class", "eexcess-bookmark-bookmarkList");

                var bookmarkedInSection = dialogBookmark.append('div').attr('class', 'eexcess-bookmark-bookmarked-in-section');
                bookmarkedInSection.append('span').attr('class', 'label').style('width', '100%').text('Already bookmarked in:');

                var itemBookmarksData = bookmarkedInSection.selectAll('div')
                    .data(bookmarkedItems[datum.id].bookmarked);

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
                    .attr('src', REMOVE_SMALL_ICON)
                    .attr('title', 'Remove item from this bookmark')
                    .on('click', EVTHANDLER.removeBookmarkIconClicked);
            }

            // Append save and cancel buttons within container
            var bookmarkButtonsWrapper = dialogBookmark.append("div")
                .attr("class", "eexcess-bookmark-buttons-wrapper");

            bookmarkButtonsWrapper.append("input")
                .attr("type", "button")
                .attr("class", "eexcess-bookmark-button")
                .attr("value", "Close")
                .on('click', EVTHANDLER.bookmarkCancelButtonClicked);

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
            //$( colorPickerId ).colorpicker('destroy');
            $(C4.Bookmarking.Config.bookmarkDialogClass).remove();
            isBookmarkDialogOpen = false;
        }
    },
    EVTHANDLER: {
        bookmarkDropdownListChanged: function (value, index) {

            C4.Bookmarking.BOOKMARKS.currentSelectIndex = index;
            //console.log("##### >> " +currentSelectIndex);

            if (index == 0)
                $(C4.Bookmarking.Config.newBookmarkOptionsId).slideDown("slow");
            else
                $(C4.Bookmarking.Config.newBookmarkOptionsId).slideUp("slow");

            $(C4.Bookmarking.Config.newBookmarkOptionsId).find('p').fadeOut('fast');      // error message hidden
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
        STR_BOOKMARK_NAME_MISSING: "Indicate new bookmark name"
    }
};
