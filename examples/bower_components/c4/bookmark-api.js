/**
 * Accesing the Recommendation-Dashboard-Bookmarking-API globally
 * @todo implement me
 * @author Peter Hasitschka
 */

console.warn("TODO: Consider to load this file in a proper way!");

var C4 = C4 || {};
C4.Bookmarking = {
    BOOKMARKS: {
        currentBookmark: {
            'bookmark-name': '',
            'color': '',
            'type': ''
        },
        currentItem: {},
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

        STR_NEW: "New Collecction..."
    }
};
