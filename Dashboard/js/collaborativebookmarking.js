var CollaborativeBookmarkingAPI = {
    active: true,
    server: "https://ext250.know-center.tugraz.at/dashboard/coll_bookmarking/collaborativebookmarking/bookmarks.php"
};


CollaborativeBookmarkingAPI.pullCollections = function (callback) {

    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "getAllCollections"

            },
            dataType: 'json'
        }
    )
        .done(callback)
        .error(function (data) {
            console.log("ERROR:", data);
        });
    ;
};



CollaborativeBookmarkingAPI.pushCollection = function (collection, callback) {

};