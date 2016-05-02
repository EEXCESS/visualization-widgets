var CollaborativeBookmarkingAPI = {
    active: true,
    server: "http://ext250.know-center.tugraz.at/bookmarking/bookmarks.php"
};


CollaborativeBookmarkingAPI.loadBookmarks = function (user_id, on_bookmarks_received) {


    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
            }
        }
    );

    var bms = [];

    on_bookmarks_received(bms);
};
