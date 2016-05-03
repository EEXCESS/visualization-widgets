var CollaborativeBookmarkingAPI = {
    active: true,
    server: "http://ext250.know-center.tugraz.at/dashboard/visualization-widgets/collaborativebookmarking/bookmarks.php"
};

CollaborativeBookmarkingAPI.storeBookmarks = function (user_id, bms) {

    var on_success = function (data) {
        console.log(data);
    };

    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "storebms",
                user: user_id,
                bms: bms
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });

};


CollaborativeBookmarkingAPI.loadBookmarks = function (user_id, on_bookmarks_received) {


    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "getbms",
                user: user_id
            },
            success: function (data) {
                console.log(data);
            },
            error: function (data) {
                console.error(data);
            },
            dataType: 'json'
        }
    );

    var bms = [];

    on_bookmarks_received(bms);
};
