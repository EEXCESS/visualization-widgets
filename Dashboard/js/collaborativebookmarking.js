var CollaborativeBookmarkingAPI = {
    active: true,
    server: "http://ext250.know-center.tugraz.at/dashboard/visualization-widgets/collaborativebookmarking/bookmarks.php"




};

jQuery(document).ready(function () {
    jQuery('#share-collection-button').click(function () {
        CollaborativeBookmarkingAPI.storeCollection();
    });
    
    jQuery('#share-collection-close-button').click(function(){
        jQuery('#share-collection-link').hide();
    });
});



CollaborativeBookmarkingAPI.storeCollection = function () {

    var on_success = function (data) {

        jQuery('#share-collection-link span').html(window.parent.location.href + "?collection=" + data.id);
        jQuery('#share-collection-link').show();
    };

    var data = JSON.stringify(visTemplate.getData());

    var guid = this.createGuid();
    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "storebms",
                guid: guid,
                collection: data
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });

};


CollaborativeBookmarkingAPI.loadCollection = function (guid) {

    var on_success = function (data) {
        console.log(data);
        var coll = data.collection;
    };

    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "getcollection",
                guid: guid
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });
    ;
};





CollaborativeBookmarkingAPI.createGuid = function () {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var guid = '';
    for (var i = 0; i < 15; i++) {
        var r = Math.floor(Math.random() * charSet.length);
        guid += charSet.substring(r, r + 1);
    }
    return guid;
};