jQuery(document).ready(function () {

    var button_container = jQuery('#eexcess-isotope-filtering-and-sorting');

    var bookmark_container = jQuery('<div />', {
        id: 'searchreslistvis_bookmark_container'
    }).append(
        jQuery("<p>Bookmarks:</p>"),
        jQuery('<span />', {
            id: 'eexcess_bookmarkingcollections'
        })
        );

    button_container.append(bookmark_container);

    /*
     BookmarkingAPI = new Bookmarking();
     BookmarkingAPI.init();
     BOOKMARKDIALOG.BOOKMARKS.updateBookmarkedItems();
     BOOKMARKDIALOG.FILTER.buildFilterBookmark([], [], [], {});
     BOOKMARKDIALOG.BOOKMARKS.exportBookmarks();
     BOOKMARKDIALOG.BOOKMARKS.importBookmarks();
     BOOKMARKDIALOG.BOOKMARKS.handleBookmarkEditButton();
     */
});