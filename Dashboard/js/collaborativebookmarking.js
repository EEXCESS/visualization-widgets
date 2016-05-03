var CollaborativeBookmarkingAPI = {
    active: true,
    server: "http://ext250.know-center.tugraz.at/dashboard/visualization-widgets/collaborativebookmarking/bookmarks.php"




};

jQuery(document).ready(function () {
    jQuery('#share-collection-button').click(function(){
       
        alert("huhu");
        
    });
});

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
                bms: JSON.stringify(bms)
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });

};


CollaborativeBookmarkingAPI.loadBookmarks = function (user_id, on_bookmarks_received) {

    var on_success = function (data) {
        console.log(data);
        var bms = data.bookmarks;
        on_bookmarks_received(bms);
    };

    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "getbms",
                user: user_id
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });
    ;


};
