jQuery(document).ready(function () {

 
    
    
     BookmarkingAPI = new Bookmarking();
     BookmarkingAPI.init();
     BOOKMARKDIALOG.BOOKMARKS.updateBookmarkedItems();
     BOOKMARKDIALOG.FILTER.buildFilterBookmark([], [], [], {});
     BOOKMARKDIALOG.BOOKMARKS.exportBookmarks();
     BOOKMARKDIALOG.BOOKMARKS.importBookmarks();
     BOOKMARKDIALOG.BOOKMARKS.handleBookmarkEditButton();
     
});