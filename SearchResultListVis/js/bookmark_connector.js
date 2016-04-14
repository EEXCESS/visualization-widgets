jQuery(document).ready(function () {


    BOOKMARKDIALOG.populate(jQuery('#eexcess-isotope-filtering-and-sorting'));

    BookmarkingAPI = new Bookmarking();
    BookmarkingAPI.init();
    BOOKMARKDIALOG.BOOKMARKS.updateBookmarkedItems();
    BOOKMARKDIALOG.FILTER.buildFilterBookmark([], [], [], {});
    BOOKMARKDIALOG.BOOKMARKS.exportBookmarks();
    BOOKMARKDIALOG.BOOKMARKS.importBookmarks();
    BOOKMARKDIALOG.BOOKMARKS.handleBookmarkEditButton();

});