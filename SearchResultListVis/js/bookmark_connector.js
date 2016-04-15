jQuery(document).ready(function () {


    BOOKMARKDIALOG.populate(jQuery('#eexcess-isotope-filtering-and-sorting'));

    BookmarkingAPI = new Bookmarking();
    BookmarkingAPI.init();
    BOOKMARKDIALOG.BOOKMARKS.updateBookmarkedItems();
    BOOKMARKDIALOG.FILTER.buildFilterBookmark([], [], [], {});
    BOOKMARKDIALOG.BOOKMARKS.exportBookmarks();
    BOOKMARKDIALOG.BOOKMARKS.importBookmarks();
    BOOKMARKDIALOG.BOOKMARKS.handleBookmarkEditButton();



    jQuery('.eexcess-isotope-grid').on('layoutComplete', function () {

        jQuery('.resultvis_bookmark_icon').remove();
        jQuery('.eexcess-isotope-grid-item').prepend('<div class="resultvis_bookmark_icon"><strong>B</strong></div>');


        /*
         * Demo for accesing bookmark list from a single item
         * 'd' is the item-object
         */
        jQuery('.resultvis_bookmark_icon').click(function (e) {
            e.stopPropagation();

            var item_clicked = jQuery(e.currentTarget).parent();

            var item_title = item_clicked.find(".title").length ? item_clicked.find(".title").html() : "-notitlefound-";
            var item_id = item_clicked.attr("itemid");
            BOOKMARKDIALOG.BOOKMARKS.buildSaveBookmarkDialog(
                {id: item_id, title: item_title},
                function () {
                    console.log("SET CURRENT ITEM HERE");
                },
                function (bookmarkDetails) {
                    bookmarkDetails.append('p').text(item_title);
                },
                function () {
                    console.log("AFTER SAVE BUTTON CLICK CALLBACK");
                }, BOOKMARKDIALOG.BOOKMARKS);

        });
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