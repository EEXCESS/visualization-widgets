
/**
 * Global constant that determines if data is sent to VizRec first
 * @type Boolean
 */
if (localStorageCustom.getItem("usevizrec") === null)
    localStorageCustom.setItem("usevizrec", false);
var USE_VIZREC = localStorageCustom.getItem("usevizrec") === "true" ? true : false;
//console.log("USE VIZREC? " + USE_VIZREC);


jQuery(document).ready(function () {
    //VizRecConnector.createToggleButton();

});


VizRecConnector.is_blocked_by_feature = false;

VizRecConnector.block = function(){
    USE_VIZREC = false;
    VizRecConnector.is_blocked_by_feature = true;    
};

/**
 * Sends recommendations to the VizRec Server to determine the most accurate Visualization
 * @returns {VizRecConnector}
 * @author Peter Hasitschka
 * @constructor
 */
function VizRecConnector(blocked) {
    this.server = {
        host: "http://eexcesstest.know-center.tugraz.at/",
        recmapping: {
            folder: "viz",
            cmd: "getmappingsfordashboard"
        },
        tagging: {
            folder: "viz",
            cmd: "saveMappingdash"
        }
    };
    console.log("VizRecConnector created");
    this.DUMMY_COUNTRY_CODE = "AT";
    this.best_mappings_ = null;
    this.current_mappings = null;
    this.query_ = null;
}


VizRecConnector.createSettingsEntry = function () {

    var settings_container = jQuery("#eexcess_settings_experimental_container");

    var title = jQuery('<div/>', {
        id: "eexcess-options-vizrec"
    }).append(jQuery('<p/>', {
        text: "VizRec" + VizRecConnector.is_blocked_by_feature ? " (Deactivated on shared collections)" : ""
    }));

    settings_container.append(title);

    var options = jQuery('<fieldset/>');
    var container = jQuery('<div/>', {
        id: "eexcess-options-vizrec-container",
        class : VizRecConnector.is_blocked_by_feature ? "optiondisabled" : null
    });
    options.append(container);
    
    
    var curr_val = localStorageCustom.getItem("usevizrec");
    
    container.append(
        jQuery('<p/>').append(
        jQuery('<input/>', {
            type: "radio",
            name: "option_vizrec_toggle",
            id: "option_vizrec_toggle_off",
            value: "false",
            checked: curr_val === "false" ? "checked" : null,
            disabled: VizRecConnector.is_blocked_by_feature ? "true" : null
        }),
        jQuery('<label for="option_vizrec_toggle_off"/>', {
        }).html("OFF")
        ),
        jQuery('<p/>').append(
        jQuery('<input/>', {
            type: "radio",
            name: "option_vizrec_toggle",
            id: "option_vizrec_toggle_on",
            value: "true",
            checked: curr_val === "true" ? "checked" : null,
            disabled: VizRecConnector.is_blocked_by_feature ? "true" : null
        }),
        jQuery('<label for="option_vizrec_toggle_on"/>', {
        }).html("ON")
        )
        );

    settings_container.append(options);


    jQuery('input[name="option_vizrec_toggle"]').change(function () {
        
            var button_val = jQuery(this).attr("value");
            
            var current_setting = localStorageCustom.getItem("usevizrec");
            
            if (button_val === current_setting)
                return;

        if (button_val === "true")
            localStorageCustom.setItem("usevizrec", true);
        else
            localStorageCustom.setItem("usevizrec", false);
        parent.location.reload();
    });

};

VizRecConnector.createToggleButton = function () {
    var toggle_button = jQuery("<div/>", {
        id: "vizrec_toggle_button"
    }).append(jQuery('<a/>', {
        id: "togglelink",
        href: "#",
        text: "VizRec-Toggle"
    }),
        jQuery("<div/>", {
            id: "vizrec_toggle_indicator",
            class: "vizrec_toggle_indicator-" + (USE_VIZREC ? "yes" : "no")
        }));



    jQuery('#eexcess_fixed_controls').append(toggle_button);

    var that = this;
    toggle_button.click(function () {
        if (localStorageCustom.getItem("usevizrec") === "true")
            localStorageCustom.setItem("usevizrec", false);
        else
            localStorageCustom.setItem("usevizrec", true);

        parent.location.reload();
    });
};

/**
 * Return mapping if avaliable
 * @param {string} chartname
 * @returns {Boolean|object}
 */
VizRecConnector.prototype.getMapping = function (chartname) {
    //console.log("Searching for VizRec-Mapping for " + chartname);
    if (this.best_mappings_ === null)
        return false;
    if (typeof this.best_mappings_[chartname] === "undefined")
        return false;
    //console.log("Delivering best mapping for " + chartname, this.best_mappings_[chartname].mappings);
    return this.best_mappings_[chartname].mappings;
};
/**
 * Send RD-Data and change vis after success.
 * Best mapping is getting saved and on further vis-changes the corresponding mapping is chosen
 * @param {object} data current RD-Data (Holding results and queryID)
 */
VizRecConnector.prototype.loadMappingsAndChangeVis = function (inputdata) {
    //console.log("Input-Data from RD", inputdata);
    this.createRequestData_(inputdata, function (data) {
        this.send_(data, this.processVizRecMappings_.bind(this));
    }.bind(this));
};
/**
 * Process received Mapping-Data from VizRec
 * Sort and filter - results in a list of best matching and available charts
 * @param {object} received_data Raw-Mapping-Data
 * @private
 */
VizRecConnector.prototype.processVizRecMappings_ = function (received_data) {

    this.removeLoadingGif_();
    var receivedMappings = received_data.mappingInformation;
    // Sort
    receivedMappings.sort(function (a, b) {
        return a.rating <= b.rating ? 1 : -1;
    });
    // Only take first occurences
    var found_charts = [];
    receivedMappings = receivedMappings.filter(function (a) {
        //if (a.chartname === "xxxxxxxxxxxxxx")
        //    return false;
        if (found_charts.indexOf(a.chartname) >= 0)
            return false;
        found_charts.push(a.chartname);
        return true;
    });
    var bestMappings = {
    };
    for (var key = 0; key < receivedMappings.length; key++) {
        var mapping = receivedMappings[key];
        var chartname = mapping.chartname;
        if (chartname === "geo")
            chartname = "geochart";
        bestMappings[chartname] = {rating: mapping.rating, mappings: []};
        for (var v_key = 0; v_key < mapping.visualchannels.length; v_key++) {
            var label = mapping.visualchannels[v_key].label;
            var facet = null;
            if (typeof mapping.visualchannels[v_key].component !== "undefined")
                facet = mapping.visualchannels[v_key].component.facet;
            bestMappings[chartname].mappings.push({facet: facet, visualattribute: label.toLowerCase()});
        }
    }

    //console.log("Final best mappings:", bestMappings);
    this.best_mappings_ = bestMappings;
    this.initVis_();
    this.switchToBestMappingChart_();
};
VizRecConnector.prototype.initVis_ = function () {
    //console.log("After receiving VizRec-Data: calling Event for triggering vistTemplate.init()");
    window.postMessage({event: 'eexcess.initVisTemplate'}, "*");
};
/**
 * Take the very first mapping-chart in the list and switch to it
 */
VizRecConnector.prototype.switchToBestMappingChart_ = function () {



    if (this.best_mappings_ === null) {
        console.error("Could not find best mapping. No data processed!", this.best_mappings_);
        return false;
    }

    var chart_ratings = [];
    for (var key in this.best_mappings_)
        chart_ratings.push({chart: key, rating: this.best_mappings_[key].rating});
    chart_ratings.sort(function (a, b) {
        return a.rating <= b.rating ? 1 : -1;
    });
    var bestChart = chart_ratings[0].chart;
    // Change visualization and mappings   
    //console.log("Event for changing chart to overall-best-matching chart '" + bestChart + "' triggered");
    window.postMessage({event: 'eexcess.newDashboardSettings', settings: {
            selectedChart: bestChart
        }}, "*");
};
/**
 * Performing an AJAX-Call to the VizRec-Server.
 * calls defined function after data received
 * @param {object} data Prepared Input-Data for VizRec
 * @param {function} on_mappings_received callback that gets called after received data or error
 * @private
 */
VizRecConnector.prototype.send_ = function (data, on_mappings_received) {

    var success_fct = function (data) {
        if (!data) {
            console.log("NO DATA RECEIVED");
            on_mappings_received(null);
        } else if (typeof data.error !== "undefined" && data.error.length) {
            console.log("GOT ERROR FROM VIZREC SERVER", data.error);
            on_mappings_received(null);
        } else {
            console.log("Successfully got data from VizRec-Server", data);
            on_mappings_received(data);
        }
    }.bind(this);
    var error_fct = function (data) {
        console.log("Error in communication with VizRec-Server");
        init_vis_template_fct();
    }.bind(this);
    this.addLoadingGif_();
    console.log("Sending " + this.server.recmapping_cmd + " command to server");
    jQuery.ajax(
        {
            method: "POST",
            url: this.server.host + this.server.recmapping.folder,
            data: {
                cmd: this.server.recmapping.cmd,
                dataset: JSON.stringify(data)
            },
            dataType: "json",
            success: success_fct,
            error: error_fct
        }
    );
};
/**
 * Add loading-gif and overlay
 * @private
 */
VizRecConnector.prototype.addLoadingGif_ = function () {
    jQuery('body').prepend(jQuery("<div/>", {
        id: "vizrec_loading_overlay"
    }).append(jQuery("<img/>", {
        src: "media/loading.gif",
        id: "vizrec_loadinggif"
    }),
        jQuery("<p/>", {
            text: "Loading VizRec Results..."
        })));
};
/**
 * Remove loading-gif and overlay
 * @private
 */
VizRecConnector.prototype.removeLoadingGif_ = function () {
    jQuery('#vizrec_loading_overlay').fadeTo(2000, 0.0, function () {
        jQuery('#vizrec_loading_overlay').remove();
    });
};
/**
 * Processing raw-data from RD before sending their facets to the VizRec-Server
 * Facets are getting collected and sanitized. 
 * Coordinates are changed to country-strings (@see{VizRecConnector.prototype.getCountry})
 * 
 * @param {object} data Raw data form RD - Holding results and query-data
 * @param {function} created_cb Called after data is processed and
 * asynchronous service-data (countries) are received.
 * @private
 */
VizRecConnector.prototype.createRequestData_ = function (data, created_cb) {

    var query = this.getQuery();
    var request_obj = {
        query: query,
        results: {results: []}
    };
    var facets_async_ready = 0;
    for (var i = 0; i < data.result.length; i++) {
        var curr_rec = data.result[i];
        var facets = null;
        if (typeof curr_rec.facets === "undefined")
            curr_rec = BOOKMARKDIALOG.Tools.mapItemFromV2toV1(curr_rec);
        facets = {};
        for (var f_key in curr_rec.facets) {
            if (f_key === "license")    // License not working in received mappings in timeline
                continue;
            if (curr_rec.facets[f_key] !== "unknown" && curr_rec.facets[f_key] !== "unkown")
                facets[f_key] = curr_rec.facets[f_key];
        }

        //console.log("getting country");
        this.getCountry_(curr_rec.coordinate, facets, function (country, facets) {
            //console.log(country);
            if (country) {
                if (VizRecConnector.countrylist[country.toUpperCase()] !== undefined)
                    country = VizRecConnector.countrylist[country.toUpperCase()];
                //console.log(country);
                facets.country = country;
            }
            request_obj.results.results.push({facets: facets});
            facets_async_ready++;
            // console.log("Facet for objects created so far... ", facets_async_ready, data.result.length);
            //Waiting for all callbacks!
            if (facets_async_ready === data.result.length) {
                console.log("READY FOR SENDING:", request_obj);
                //console.log("READY FOR SENDING:", JSON.stringify(request_obj));
                created_cb(request_obj);
            }
        }.bind(this));
    }
};
/**
 * Getting a country string from a coordinate pair.
 * Making use of an external service (geonames.org)
 * Due to a limited number of calls per hour, errors could occur.
 * Thus a dummy-country (defined in constructor) is taken as fallback
 * Since only two-character country-codes are received, a static list is taken
 * for final mapping.
 * 
 * @param {array} coordinate Holding latitude and longitude
 * @param {object} facets object holding the current facets. Just to pass it to the callback
 * @param {function} cb Callback-Function after results are received
 */
VizRecConnector.prototype.getCountry_ = function (coordinate, facets, cb) {

    if (!coordinate || coordinate.length !== 2) {
        cb(false, facets);
        return;
    }

    var lat = coordinate[0];
    var long = coordinate[1];
    var service = 'http://api.geonames.org/citiesJSON?&username=eexcess&lang=en';
    var url = service + '&north=' + lat + '&west=' + long + '&south=' +
        (lat + 0.1) + '&east=' + (long + 0.1);
    jQuery.ajax({
        url: url,
        dataType: 'json',
        success: function (data) {
            var country = null;
            if (typeof data.status !== "undefined" && data.status.value === 19)
                country = this.DUMMY_COUNTRY_CODE;
            else {
                if (typeof data.geonames === "undefined" || !data.geonames.length) {
                    cb(false, facets);
                    return;
                }
                var country = data.geonames[0].countrycode;
            }
            cb(country, facets);
        }.bind(this),
        error: function (data) {
            console.log("Error getting country via API");
            cb(false, facets);
        }.bind(this),
        timeout: 500
    });
};

VizRecConnector.prototype.getQuery = function () {
    return this.query_;
};

VizRecConnector.prototype.setQuery = function (query) {
    this.query_ = query;
};


/**
 * Retrieving some demo data for testing the API
 */
VizRecConnector.prototype.getDemoData_ = function () {
    return {
        "query": " The top 10 successfully movies filmed at 1960, 1970, 1980 and 1990",
        "results": {
            "results": [{
                    "facets": {
                        "movie": "Apartment",
                        "genre": "Comedy",
                        "year": "1960",
                        "country": "United States of America",
                        "budget": "3000000",
                        "gross": "24600000",
                        "population": "179323175"
                    }
                }, {
                    "facets": {
                        "movie": "La dolce vita",
                        "genre": "Comedy",
                        "year": "1960",
                        "country": "Italy",
                        "budget": "8000000",
                        "gross": "51453000",
                        "population": "179323175"
                    }
                }, {
                    "facets": {
                        "movie": "Swiss Family Robinson",
                        "genre": "Adventure",
                        "year": "1960",
                        "country": "United States of America",
                        "budget": "300000",
                        "gross": "40350000",
                        "population": "179323175"
                    }
                }, {
                    "facets": {
                        "movie": "Psycho",
                        "genre": "Horror",
                        "year": "1960",
                        "country": "United States of America",
                        "budget": "806947",
                        "gross": "32000000",
                        "population": "179323175"
                    }
                }, {
                    "facets": {
                        "movie": "Spartacus",
                        "genre": "Adventure",
                        "year": "1960",
                        "country": "United States of America",
                        "budget": "12000000",
                        "gross": "60000000",
                        "population": "179323175"
                    }
                }, {
                    "facets": {
                        "movie": "G. I. Blues",
                        "genre": "Musical",
                        "year": "1960",
                        "country": "United States of America",
                        "budget": "2000000",
                        "gross": "4300000",
                        "population": "179323175"
                    }
                }, {
                    "facets": {
                        "movie": "Inherit the Wind",
                        "genre": "Drama",
                        "year": "1960",
                        "country": "United States of America",
                        "budget": "2000000",
                        "gross": "2000000",
                        "population": "179323175"
                    }
                }, {
                    "facets": {
                        "movie": "Purple Noon",
                        "genre": "Crime",
                        "year": "1960",
                        "country": "France",
                        "budget": "5000000",
                        "gross": "618090",
                        "population": "66616416"
                    }
                }, {
                    "facets": {
                        "movie": "Peeping Tom",
                        "genre": "Crime",
                        "year": "1960",
                        "country": "United Kingdom",
                        "budget": "135000",
                        "gross": "125000",
                        "population": "52164000"
                    }
                }, {
                    "facets": {
                        "movie": "La Maschera Del Demonio",
                        "genre": "Horror",
                        "year": "1960",
                        "country": "Italy",
                        "budget": "100000",
                        "gross": "1000000",
                        "population": "51453000"
                    }
                },
                {
                    "facets": {
                        "movie": "Aristocats",
                        "genre": "Animation",
                        "year": "1970",
                        "country": "United States of America",
                        "budget": "4000000",
                        "gross": "26462000",
                        "population": "203302031"
                    }
                }, {
                    "facets": {
                        "movie": "M*A*S*H",
                        "genre": "War",
                        "year": "1970",
                        "country": "United States of America",
                        "budget": "3500000 ",
                        "gross": "81600000",
                        "population": "203302031"
                    }
                }, {
                    "facets": {
                        "movie": "Dream Warriors",
                        "genre": "Horror",
                        "year": "1970",
                        "country": "United States of America",
                        "budget": "4500000",
                        "gross": "44793200",
                        "population": "203302031"
                    }
                }, {
                    "facets": {
                        "movie": "Airport",
                        "genre": "Drama",
                        "year": "1970",
                        "country": "United States of America",
                        "budget": "10000000",
                        "gross": "100489150",
                        "population": "203302031"
                    }
                }, {
                    "facets": {
                        "movie": "Little Big Man",
                        "genre": "Comedy",
                        "year": "1970",
                        "country": "United States of America",
                        "budget": "15000000",
                        "gross": "31559552",
                        "population": "203302031"
                    }
                }, {
                    "facets": {
                        "movie": "Five Easy Pieces",
                        "genre": "Drama",
                        "year": "1970",
                        "country": "United States of America",
                        "budget": "1600000",
                        "gross": "18099091",
                        "population": "203302031"
                    }
                }, {
                    "facets": {
                        "movie": "Tora! Tora! Tora!",
                        "genre": "War",
                        "year": "1970",
                        "country": "Japan",
                        "budget": "25000000",
                        "gross": "29548291",
                        "population": "103720060"
                    }
                },
                {
                    "facets": {
                        "movie": "Las Vampiras",
                        "genre": "Horror",
                        "year": "1970",
                        "country": "Spain",
                        "budget": "2000000",
                        "gross": "5509632",
                        "population": "35739000"
                    }
                }, {
                    "facets": {
                        "movie": "Love Story",
                        "genre": "Drama",
                        "year": "1970",
                        "country": "United States of America",
                        "budget": "2260000",
                        "gross": "80000000",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "The French Connection",
                        "genre": "Drama",
                        "year": "1970",
                        "country": "United States of America",
                        "budget": "10000000",
                        "gross": "75000000",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "Private Benjamin",
                        "genre": "Comedy",
                        "year": "1980",
                        "country": "United States of America",
                        "budget": "10000000",
                        "gross": "69800000",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "Gods Must Be Crazy",
                        "genre": "Comedy",
                        "year": "1980",
                        "country": "South Africa",
                        "budget": "5000000",
                        "gross": "60000000",
                        "population": "29077000"
                    }
                }, {
                    "facets": {
                        "movie": "Superman II",
                        "genre": "Action",
                        "year": "1980",
                        "country": "United Kingdom",
                        "budget": "54000000",
                        "gross": "108185706",
                        "population": "56284000"
                    }
                }, {
                    "facets": {
                        "movie": "Airplane",
                        "genre": "Comedy",
                        "year": "1980",
                        "country": "United States of America",
                        "budget": "3500000",
                        "gross": "83400000",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "Star Wars: Episode V",
                        "genre": "Sci-Fi",
                        "year": "1980",
                        "country": "United States of America",
                        "budget": "18000000",
                        "gross": "290158751",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "Ordinary People",
                        "genre": "Drama",
                        "year": "1980",
                        "country": "United States of America",
                        "budget": "6000000",
                        "gross": "54766923",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "Ragign Bull",
                        "genre": "Drama",
                        "year": "1980",
                        "country": "United States of America",
                        "budget": "1800000",
                        "gross": "23380203",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "The Blues Brothers",
                        "genre": "Comedy",
                        "year": "1980",
                        "country": "United States of America",
                        "budget": "27000000",
                        "gross": "54200000",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "The Shining",
                        "genre": "Horror",
                        "year": "1980",
                        "country": "United States of America",
                        "budget": "1900000",
                        "gross": "44360123",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "Caddyshack",
                        "genre": "Comedy",
                        "year": "1980",
                        "country": "United States of America",
                        "budget": "6000000",
                        "gross": "39800000",
                        "population": "226542199"
                    }
                }, {
                    "facets": {
                        "movie": "Home Alone",
                        "genre": "Comedy",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "15000000",
                        "gross": "285761243",
                        "population": "248709873"
                    }
                }, {
                    "facets": {
                        "movie": "Ghost",
                        "genre": "Drama",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "22000000",
                        "gross": "217631306",
                        "population": "248709873"
                    }
                }, {
                    "facets": {
                        "movie": "Die Hard 2",
                        "genre": "Action",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "70000000",
                        "gross": "240031094",
                        "population": "248709873"
                    }
                }, {
                    "facets": {
                        "movie": "Hunt for Red October",
                        "genre": "Action",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "30000000",
                        "gross": "200512643",
                        "population": "248709873"
                    }
                }, {
                    "facets": {
                        "movie": "Dances with Wolves",
                        "genre": "Adventure",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "19000000",
                        "gross": "184208848",
                        "population": "248709873"
                    }
                }, {
                    "facets": {
                        "movie": "Pretty Woman",
                        "genre": "Adventure",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "14000000",
                        "gross": "178406268",
                        "population": "248709873"
                    }
                }, {
                    "facets": {
                        "movie": "Dick Tracy",
                        "genre": "Action",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "46000000",
                        "gross": "162738726 ",
                        "population": "248709873"
                    }
                }, {
                    "facets": {
                        "movie": "Days of Thunder",
                        "genre": "Action",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "60000000",
                        "gross": "157920733",
                        "population": "248709873"
                    }
                },
                {
                    "facets": {
                        "movie": "The Godfather: Part III",
                        "genre": "Crime",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "54000000",
                        "gross": "136766062",
                        "population": "248709873"
                    }
                },
                {
                    "facets": {
                        "movie": "Total Recall",
                        "genre": "Sci-Fi",
                        "year": "1990",
                        "country": "United States of America",
                        "budget": "50000000",
                        "gross": "261317921",
                        "population": "248709873"
                    }
                }]
        }
    };
};

VizRecConnector.prototype.createTaggingData_ = function (tags, rating) {

    var curr_chart = visTemplate.getCurrentVisName();
    var mappings = this.current_mappings;
    console.log(curr_chart, mappings);

    var vis_channels = [];

    var chart_uri_prefix = "http://eexcess.eu/visualisation-ontology";

    var chart_defs = {
        barchart: "Barchart",
        geochart: "GeoChart",
        timeline: "Timeline"
    };

    var label_defs = [
        {
            label: "x-Axis",
            uri_component: "XAxis"
        },
        {
            label: "y-Axis",
            uri_component: "YAxis"
        },
        {
            label: "color",
            uri_component: "Color"
        }
    ];


    var facet_datatype_defs = {
        provider: "string",
        year: "date",
        license: "string",
        country: "location",
        language: "string"
    };
    for (var m_key = 0; m_key < mappings.length; m_key++) {



        console.log(mappings[m_key]);
        var curr_m = mappings[m_key];
        curr_m.visualattribute = curr_m.visualattribute.replace("x-axis", "x-Axis");
        curr_m.visualattribute = curr_m.visualattribute.replace("y-axis", "y-Axis");


        var chartlabelname = null;
        for (var label_key = 0; label_key < label_defs.length; label_key++) {
            if (label_defs[label_key].label === curr_m.visualattribute) {
                chartlabelname = chart_uri_prefix + chart_defs[curr_chart] + label_defs[label_key].uri_component;
                console.log(chartlabelname);
                break;
            }
        }

        var v_obj = {
            'chartname': curr_chart,
            'component': {
                'facet': curr_m.facet,
                'datatype': chart_uri_prefix + "#" + facet_datatype_defs[curr_m.facet]
            },
            'name': chartlabelname,
            'charturi': chart_uri_prefix + chart_defs[curr_chart],
            'label': curr_m.visualattribute
        };
        vis_channels.push(v_obj);
    }

    var mapping_data = {
        chartname: curr_chart,
        rating: rating,
        visualchannels: vis_channels,
        //number: 99999,
        charturi: chart_defs[curr_chart].charturi
    };
    var data = {
        tags: JSON.stringify(tags),
        query: this.getQuery(),
        rating: rating,
        userID: 1,
        mapping: JSON.stringify(mapping_data)
    };
    return data;
};

VizRecConnector.prototype.tagCurrentMapping = function (tags, rating) {

    var data = this.createTaggingData_(tags, rating);

    var success_fct = function (data) {
        console.log("Successful Tagging:", data);
    };
    var error_fct = function (data) {

        console.log("Error Tagging:", data);
    };
    //console.log(this);
    data.cmd = this.server.tagging.cmd;
    jQuery.ajax(
        {
            method: "POST",
            url: this.server.host + this.server.tagging.folder,
            data: data,
            dataType: "json",
            success: success_fct,
            error: error_fct
        }
    );
};


VizRecConnector.prototype.demoTag = function () {

    var data = this.getDemoTagginData_();
    var success_fct = function (data) {
        console.log("Successful Tagging:", data);
    };
    var error_fct = function (data) {

        console.log("Error Tagging:", data);
    };


    data.cmd = this.server.tagging.cmd;
    jQuery.ajax(
        {
            method: "POST",
            url: this.server.host + this.server.tagging.folder,
            data: data,
            dataType: "json",
            success: success_fct,
            error: error_fct
        }
    );
};

VizRecConnector.prototype.getDemoTagginData_ = function () {
    return    {
        tags: JSON.stringify(['year', 'budget']),
        rating: 4,
        query: "The top 10 successfully movies filmed at 1960, 1970, 1980 and 1990",
        userID: "1",
        //data: JSON.stringify(this.getDemoData_()),
        mapping: JSON.stringify({
            'chartname': 'timeline',
            'rating': 7,
            'visualchannels': [{
                    'chartname': 'timeline',
                    'component': {
                        'facet': 'country',
                        'datatype': 'http://eexcess.eu/visualisation-ontology#location'
                    },
                    'name': 'http://eexcess.eu/visualisation-ontologyTimelineColor',
                    'charturi': 'http://eexcess.eu/visualisation-ontologyTimeline',
                    'label': 'color'
                }, {
                    'chartname': 'timeline',
                    'component': {
                        'facet': 'year',
                        'datatype': 'http://eexcess.eu/visualisation-ontology#date'
                    },
                    'name': 'http://eexcess.eu/visualisation-ontologyTimelineXAxis',
                    'charturi': 'http://eexcess.eu/visualisation-ontologyTimeline',
                    'label': 'x-Axis'
                }, {
                    'chartname': 'timeline',
                    'component': {
                        'facet': 'population',
                        'datatype': 'http://eexcess.eu/visualisation-ontology#number'
                    },
                    'name': 'http://eexcess.eu/visualisation-ontologyTimelineYAxis',
                    'charturi': 'http://eexcess.eu/visualisation-ontologyTimeline',
                    'label': 'y-Axis'
                }
            ],
            'number': '478',
            'charturi': 'http://eexcess.eu/visualisation-ontologyTimeline'
        }
        )
    };
};
VizRecConnector.countrylist = {
    AD: "Andorra",
    AE: "United Arab Emirates",
    AF: "Afghanistan",
    AG: "Antigua & Barbuda",
    AI: "Anguilla",
    AL: "Albania",
    AM: "Armenia",
    AN: "Netherlands Antilles",
    AO: "Angola",
    AQ: "Antarctica",
    AR: "Argentina",
    AS: "American Samoa",
    AT: "Austria",
    AU: "Australia",
    AW: "Aruba",
    AZ: "Azerbaijan",
    BA: "Bosnia and Herzegovina",
    BB: "Barbados",
    BD: "Bangladesh",
    BE: "Belgium",
    BF: "Burkina Faso",
    BG: "Bulgaria",
    BH: "Bahrain",
    BI: "Burundi",
    BJ: "Benin",
    BM: "Bermuda",
    BN: "Brunei Darussalam",
    BO: "Bolivia",
    BR: "Brazil",
    BS: "Bahama",
    BT: "Bhutan",
    BU: "Burma (no longer exists)",
    BV: "Bouvet Island",
    BW: "Botswana",
    BY: "Belarus",
    BZ: "Belize",
    CA: "Canada",
    CC: "Cocos (Keeling) Islands",
    CF: "Central African Republic",
    CG: "Congo",
    CH: "Switzerland",
    CI: "Côte D'ivoire (Ivory Coast)",
    CK: "Cook Iislands",
    CL: "Chile",
    CM: "Cameroon",
    CN: "China",
    CO: "Colombia",
    CR: "Costa Rica",
    CS: "Czechoslovakia (no longer exists)",
    CU: "Cuba",
    CV: "Cape Verde",
    CX: "Christmas Island",
    CY: "Cyprus",
    CZ: "Czech Republic",
    DD: "German Democratic Republic (no longer exists)",
    DE: "Germany",
    DJ: "Djibouti",
    DK: "Denmark",
    DM: "Dominica",
    DO: "Dominican Republic",
    DZ: "Algeria",
    EC: "Ecuador",
    EE: "Estonia",
    EG: "Egypt",
    EH: "Western Sahara",
    ER: "Eritrea",
    ES: "Spain",
    ET: "Ethiopia",
    FI: "Finland",
    FJ: "Fiji",
    FK: "Falkland Islands (Malvinas)",
    FM: "Micronesia",
    FO: "Faroe Islands",
    FR: "France",
    FX: "France, Metropolitan",
    GA: "Gabon",
    GB: "United Kingdom (Great Britain)",
    GD: "Grenada",
    GE: "Georgia",
    GF: "French Guiana",
    GH: "Ghana",
    GI: "Gibraltar",
    GL: "Greenland",
    GM: "Gambia",
    GN: "Guinea",
    GP: "Guadeloupe",
    GQ: "Equatorial Guinea",
    GR: "Greece",
    GS: "South Georgia and the South Sandwich Islands",
    GT: "Guatemala",
    GU: "Guam",
    GW: "Guinea-Bissau",
    GY: "Guyana",
    HK: "Hong Kong",
    HM: "Heard & McDonald Islands",
    HN: "Honduras",
    HR: "Croatia",
    HT: "Haiti",
    HU: "Hungary",
    ID: "Indonesia",
    IE: "Ireland",
    IL: "Israel",
    IN: "India",
    IO: "British Indian Ocean Territory",
    IQ: "Iraq",
    IR: "Islamic Republic of Iran",
    IS: "Iceland",
    IT: "Italy",
    JM: "Jamaica",
    JO: "Jordan",
    JP: "Japan",
    KE: "Kenya",
    KG: "Kyrgyzstan",
    KH: "Cambodia",
    KI: "Kiribati",
    KM: "Comoros",
    KN: "St. Kitts and Nevis",
    KP: "Korea, Democratic People's Republic of",
    KR: "Korea, Republic of",
    KW: "Kuwait",
    KY: "Cayman Islands",
    KZ: "Kazakhstan",
    LA: "Lao People's Democratic Republic",
    LB: "Lebanon",
    LC: "Saint Lucia",
    LI: "Liechtenstein",
    LK: "Sri Lanka",
    LR: "Liberia",
    LS: "Lesotho",
    LT: "Lithuania",
    LU: "Luxembourg",
    LV: "Latvia",
    LY: "Libyan Arab Jamahiriya",
    MA: "Morocco",
    MC: "Monaco",
    MD: "Moldova, Republic of ",
    MG: "Madagascar",
    MH: "Marshall Islands",
    ML: "Mali",
    MN: "Mongolia",
    MM: "Myanmar",
    MO: "Macau",
    MP: "Northern Mariana Islands",
    MQ: "Martinique",
    MR: "Mauritania",
    MS: "Monserrat",
    MT: "Malta",
    MU: "Mauritius",
    MV: "Maldives",
    MW: "Malawi",
    MX: "Mexico",
    MY: "Malaysia",
    MZ: "Mozambique",
    NA: "Namibia",
    NC: "New Caledonia",
    NE: "Niger",
    NF: "Norfolk Island",
    NG: "Nigeria",
    NI: "Nicaragua",
    NL: "Netherlands",
    NO: "Norway",
    NP: "Nepal",
    NR: "Nauru",
    NT: "Neutral Zone (no longer exists)",
    NU: "Niue",
    NZ: "New Zealand",
    OM: "Oman",
    PA: "Panama",
    PE: "Peru",
    PF: "French Polynesia",
    PG: "Papua New Guinea",
    PH: "Philippines",
    PK: "Pakistan",
    PL: "Poland",
    PM: "St. Pierre & Miquelon",
    PN: "Pitcairn",
    PR: "Puerto Rico",
    PT: "Portugal",
    PW: "Palau",
    PY: "Paraguay",
    QA: "Qatar",
    RE: "Réunion",
    RO: "Romania",
    RU: "Russian Federation",
    RW: "Rwanda",
    SA: "Saudi Arabia",
    SB: "Solomon Islands",
    SC: "Seychelles",
    SD: "Sudan",
    SE: "Sweden",
    SG: "Singapore",
    SH: "St. Helena",
    SI: "Slovenia",
    SJ: "Svalbard & Jan Mayen Islands",
    SK: "Slovakia",
    SL: "Sierra Leone",
    SM: "San Marino",
    SN: "Senegal",
    SO: "Somalia",
    SR: "Suriname",
    ST: "Sao Tome & Principe",
    SU: "Union of Soviet Socialist Republics (no longer exists)",
    SV: "El Salvador",
    SY: "Syrian Arab Republic",
    SZ: "Swaziland",
    TC: "Turks & Caicos Islands",
    TD: "Chad",
    TF: "French Southern Territories",
    TG: "Togo",
    TH: "Thailand",
    TJ: "Tajikistan",
    TK: "Tokelau",
    TM: "Turkmenistan",
    TN: "Tunisia",
    TO: "Tonga",
    TP: "East Timor",
    TR: "Turkey",
    TT: "Trinidad & Tobago",
    TV: "Tuvalu",
    TW: "Taiwan, Province of China",
    TZ: "Tanzania, United Republic of",
    UA: "Ukraine",
    UG: "Uganda",
    UM: "United States Minor Outlying Islands",
    US: "United States of America",
    UY: "Uruguay",
    UZ: "Uzbekistan",
    VA: "Vatican City State (Holy See)",
    VC: "St. Vincent & the Grenadines",
    VE: "Venezuela",
    VG: "British Virgin Islands",
    VI: "United States Virgin Islands",
    VN: "Viet Nam",
    VU: "Vanuatu",
    WF: "Wallis & Futuna Islands",
    WS: "Samoa",
    YD: "Democratic Yemen (no longer exists)",
    YE: "Yemen",
    YT: "Mayotte",
    YU: "Yugoslavia",
    ZA: "South Africa",
    ZM: "Zambia",
    ZR: "Zaire",
    ZW: "Zimbabwe",
    ZZ: "Unknown or unspecified country"
};



    