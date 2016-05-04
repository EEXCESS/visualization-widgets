var CollaborativeBookmarkingAPI = {
    active: true,
    server: "http://ext250.know-center.tugraz.at/dashboard/visualization-widgets/collaborativebookmarking/bookmarks.php",
    get_key: "collection"



};

jQuery(document).ready(function () {
    jQuery('#share-collection-button').click(function () {
        CollaborativeBookmarkingAPI.storeCollection();
    });

    jQuery('#share-collection-close-button').click(function () {
        jQuery('#share-collection-link').hide();
    });
});



CollaborativeBookmarkingAPI.storeCollection = function () {

    var on_success = function (data) {

        jQuery('#share-collection-link span').html(window.parent.location.href + "?" + this.get_key + "=" + data.id);
        jQuery('#share-collection-link').show();
    }.bind(this);


    var data = {
        collection: visTemplate.getData(),
        filters: FilterHandler.filters
    };

    for (var f_count = 0; f_count < data.filters.length; f_count++) {
        var curr_f = data.filters[f_count];
        
        for (var f_data in curr_f.dataWithinFilter) {
            if (typeof curr_f.dataWithinFilter[f_data].geoMarker !== "undefined")
                curr_f.dataWithinFilter[f_data].geoMarker = null;
        }
    }


    console.log(data.filters);

    var id = this.createId();
    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "storecollection",
                id: id,
                data: JSON.stringify(data)
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });

};


CollaborativeBookmarkingAPI.loadCollection = function (id) {

    var on_success = function (response_data) {
        console.log(response_data);
        var data = response_data.data;
    };

    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "getcollection",
                id: id
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });
    ;
};


CollaborativeBookmarkingAPI.getGetId = function () {

    var key = this.get_key;
    console.log(window.parent.location.search);

};


CollaborativeBookmarkingAPI.createId = function () {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var id = '';
    for (var i = 0; i < 15; i++) {
        var r = Math.floor(Math.random() * charSet.length);
        id += charSet.substring(r, r + 1);
    }
    return id;
};