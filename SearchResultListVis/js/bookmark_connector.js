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

            var data = [];
            var originalData = [];

            var item = {id: item_id, title: item_title};

            BOOKMARKDIALOG.BOOKMARKS.buildSaveBookmarkDialog(
                item,
                function () {
                    console.log("SET CURRENT ITEM HERE");
                },
                function (bookmarkDetails) {
                    bookmarkDetails.append('p').text("selected bookmarks item (" + item_title + ")");
                },
                function () {

                    BOOKMARKDIALOG.FILTER.addBookmarkItems(false, data, originalData, null, null, item);

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
                BOOKMARKDIALOG.BOOKMARKS);

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