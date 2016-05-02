var CollaborativeBookmarkingAPI = {
    active: true,
    server: "http://ext250.know-center.tugraz.at/dashboard/visualization-widgets/collaborativebookmarking/bookmarks.php"
};


CollaborativeBookmarkingAPI.loadBookmarks = function (user_id, on_bookmarks_received) {


    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method : "getbms"
            },
            success : function(data) {
                console.log(data);
            },
            error : function(data) {
                console.error(data);
            },
            dataType: 'json'
        }
    );

    var bms = [];

    on_bookmarks_received(bms);
};
