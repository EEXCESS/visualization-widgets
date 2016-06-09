
var CollaborativeBookmarkingAPI = {
    active: true,
    server: "https://ext250.know-center.tugraz.at/dashboard/coll_bookmarking/collaborativebookmarking/bookmarks.php",
    loaded_collections: {},
    init_loaded: false
};

if (localStorageCustom.getItem("usecollaborativebookmarking") === null)
    localStorageCustom.setItem("usecollaborativebookmarking", true);
CollaborativeBookmarkingAPI.active = localStorageCustom.getItem("usecollaborativebookmarking") === "true" ? true : false;


CollaborativeBookmarkingAPI.loadCollection = function (guid, callback) {
    var on_success_load_coll = function (data) {
        //console.log(JSON.parse(data.responseText));
        CollaborativeBookmarkingAPI.loaded_collections[guid] = (JSON.parse(data.responseText).data);
        //console.log(data.responseText, JSON.parse(data.responseText).data);
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
CollaborativeBookmarkingAPI.storeCollection = function (collection, query_id_overwrite, callback) {
    console.log("Storing collection", collection);
    var on_success = function (data) {
        console.log("Storing Collection: Recevied message from cb-server", data);
        if (callback)
            callback();
    }.bind(this);

    var data = null;

    if (collection)
        data = collection;
    else
        data = {
            //items: visTemplate.getData(),    //Nope! We have the filters and may want to remove them later
            items: globals.data, // All items!
            filters: FilterHandler.filters,
            query: globals["query"],
            profile: globals["profile"]
        };

    for (var i = 0; i < data.items.length; i++) {
        if (typeof data.items[i].facets === "undefined") {
            //data.items[i] = BOOKMARKDIALOG.Tools.mapItemFromV2toV1(data.items[i]);
        }
    }

    data.query_id = query_id_overwrite ? query_id_overwrite : globals["queryID"];

    //console.log("COLLECTION TO STORE: ", data);

    // Prevent error on stringifying a recursive loop...
    if (data.filters) {
        for (var f_count = 0; f_count < data.filters.length; f_count++) {
            var curr_f = data.filters[f_count];
            for (var f_data in curr_f.dataWithinFilter) {
                if (typeof curr_f.dataWithinFilter[f_data].geoMarker !== "undefined")
                    curr_f.dataWithinFilter[f_data].geoMarker = null;
            }
        }
    }


    jQuery.ajax(
        this.server,
        {
            method: "POST",
            data: {
                method: "storecollection",
                data: JSON.stringify(data),
                guid: data.guid ? data.guid : null
            },
            dataType: 'json'
        }
    ).done(on_success)
        .error(function (data) {
            console.log("ERROR:", data);
        });

};



CollaborativeBookmarkingAPI.createSettingsEntry = function () {

    var settings_container = jQuery("#eexcess_settings_experimental_container");

    var title = jQuery('<div/>', {
        id: "eexcess-options-collbookmarking"
    }).append(jQuery('<p/>', {
        text: "Collaborative Bookmarking"
    }));

    settings_container.append(title);

    var options = jQuery('<fieldset/>');
    var container = jQuery('<div/>', {
        id: "eexcess-options-cb-container"
    });
    options.append(container);


    var curr_val = localStorageCustom.getItem("usecollaborativebookmarking");

    container.append(
        jQuery('<p/>').append(
        jQuery('<input/>', {
            type: "radio",
            name: "option_collbookmarking_toggle",
            id: "option_collbookmarking_toggle_off",
            value: "false",
            checked: curr_val === "false" ? "checked" : null
        }),
        jQuery('<label for="option_collbookmarking_toggle_off"/>', {
        }).html("OFF")
        ),
        jQuery('<p/>').append(
        jQuery('<input/>', {
            type: "radio",
            name: "option_collbookmarking_toggle",
            id: "option_collbookmarking_toggle_on",
            value: "true",
            checked: curr_val === "true" ? "checked" : null
        }),
        jQuery('<label for="option_collbookmarking_toggle_on"/>', {
        }).html("ON")
        )
        );

    settings_container.append(options);


    jQuery('input[name="option_collbookmarking_toggle"]').change(function () {

        var button_val = jQuery(this).attr("value");

        var current_setting = localStorageCustom.getItem("usecollaborativebookmarking");

        if (button_val === current_setting)
            return;

        if (button_val === "true")
            localStorageCustom.setItem("usecollaborativebookmarking", true);
        else
            localStorageCustom.setItem("usecollaborativebookmarking", false);
        window.location.reload();
    });

};