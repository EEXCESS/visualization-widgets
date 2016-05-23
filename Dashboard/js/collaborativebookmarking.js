var CollaborativeBookmarkingAPI = {
    active: true,
    server: "https://ext250.know-center.tugraz.at/dashboard/coll_bookmarking/collaborativebookmarking/bookmarks.php",
    loaded_collections: {},
    init_loaded: false
};


CollaborativeBookmarkingAPI.loadCollection = function (guid, callback) {
    var on_success_load_coll = function (data) {
        console.log(JSON.parse(data.responseText));
        CollaborativeBookmarkingAPI.loaded_collections[guid] = (JSON.parse(data.responseText).data);
        callback();
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
    )
        .complete(on_success_load_coll)
        .error(function (data) {
            console.log("ERROR:", data);
        });
};


CollaborativeBookmarkingAPI.loadAllCollections = function (callback) {

    var on_success_load_ids = function (data) {


        var collection_ids = JSON.parse(data.responseText).collections;

        var num_colls_to_load = collection_ids.length;
        var num_colls_loaded = 0;

        if (num_colls_to_load === 0)
            callback();

        for (var i = 0; i < collection_ids.length; i++) {
            var guid = collection_ids[i];
            CollaborativeBookmarkingAPI.loadCollection(guid, function () {

                num_colls_loaded++;
                if (num_colls_loaded === num_colls_to_load)
                    callback();
            });
        }

        CollaborativeBookmarkingAPI.init_loaded = true;
    }.bind(this);



    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "getAllCollectionIds"
            },
            dataType: 'json'
        }
    )
        .complete(on_success_load_ids)
        .error(function (data) {
            console.log("ERROR:", data);
        });

};


/**
 * 
 * @param {type} query_id_overwrite E.g. Name of the collection
 * @param {string} guid If Set the collection with that guid is overwritten on the server
 * 
 */
CollaborativeBookmarkingAPI.storeCurrentCollection = function (query_id_overwrite, guid) {
    console.log("Storing collection");
    var on_success = function (data) {
        console.log("Storing Collection: Recevied message from cb-server", data);
    }.bind(this);


    var data = {
        //collection: visTemplate.getData(),    //Nope! We have the filters and may want to remove them later
        items: globals.data, // All items!
        filters: FilterHandler.filters,
        query: globals["query"],
        profile: globals["profile"],
        query_id: query_id_overwrite ? query_id_overwrite : globals["queryID"]
    };

    // Prevent error on stringifying a recursive loop...
    for (var f_count = 0; f_count < data.filters.length; f_count++) {
        var curr_f = data.filters[f_count];
        for (var f_data in curr_f.dataWithinFilter) {
            if (typeof curr_f.dataWithinFilter[f_data].geoMarker !== "undefined")
                curr_f.dataWithinFilter[f_data].geoMarker = null;
        }
    }


    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "storecollection",
                data: JSON.stringify(data),
                guid: guid ? guid : null
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });

};