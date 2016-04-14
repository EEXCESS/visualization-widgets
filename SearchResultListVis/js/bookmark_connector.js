jQuery(document).ready(function () {


    BOOKMARKDIALOG.populate(jQuery('#eexcess-isotope-filtering-and-sorting'));

    BookmarkingAPI = new Bookmarking();
    BookmarkingAPI.init();
    BOOKMARKDIALOG.BOOKMARKS.updateBookmarkedItems();
    BOOKMARKDIALOG.FILTER.buildFilterBookmark([], [], [], {});
    BOOKMARKDIALOG.BOOKMARKS.exportBookmarks();
    BOOKMARKDIALOG.BOOKMARKS.importBookmarks();
    BOOKMARKDIALOG.BOOKMARKS.handleBookmarkEditButton();





    /*
     * Demo for accesing bookmark list from a single item
     * 'd' is the item-object
     */
    jQuery('.resultvis_bookmark_icon').click(function (e) {

        console.log("CLICK: ", e);
        BOOKMARKDIALOG.BOOKMARKS.buildSaveBookmarkDialog(
            {id: "DIST_000005173", title: "Soemthing"},
            function () {
                console.log("SET CURRENT ITEM HERE");
            },
            function (bookmarkDetails) {
                bookmarkDetails.append('p').text("the title");
            },
            function () {
                console.log("AFTER SAVE BUTTON CLICK CALLBACK");
            }, BOOKMARKDIALOG.BOOKMARKS);

    });


//    
//    EVTHANDLER.faviconClicked = function(d, i, event){
//
//        d3.event ? d3.event.stopPropagation() : event.stopPropagation();
//		BOOKMARKS.buildSaveBookmarkDialog(
//            d,
//			function(thisValue){
//				BOOKMARKDIALOG.BOOKMARKS.setCurrentItem(d, i, query);
//			},
//			function(bookmarkDetails){
//				bookmarkDetails.append('p').text(d.title);
//			},EVTHANDLER.bookmarkSaveButtonClicked,
//			this);
//    };

});