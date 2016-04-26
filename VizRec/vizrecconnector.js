
/**
 * Global constant that determines if data is sent to VizRec first
 * @type Boolean
 */
var USE_VIZREC = typeof window.parent.USE_VIZREC === "undefined" ? false : window.parent.USE_VIZREC;

/**
 * Sends recommendations to the VizRec Server to determine the most accurate Visualization
 * @returns {VizRecConnector}
 */
function VizRecConnector() {

    this.server = {
        host: "http://eexcesstest.know-center.tugraz.at/",
        recmapping_cmd_folder: "viz",
        recmapping_cmd: "getmappingsfordashboard"
    };
    this.log("VizRecConnector created");
}

/**
 * Internal logging function
 * @param {string|object} msg
 * @returns {undefined}
 */
VizRecConnector.prototype.log = function (msg) {
    console.log("%cVIZREC:", "color: green; font-weight:bold", msg);
};


/**
 * Send data to server to get mappings
 * @param {} data @see VizRecConnector.prototype.getDemoData 
 * @param {function} success Callback after success
 * @param {function} fail Callback on fail
 */
VizRecConnector.prototype.loadMappingsAndChangeVis = function (data) {

    var init_vis_template_fct = function () {
        window.postMessage({event: 'eexcess.initVisTemplate'}, "*");
    };


    var success_fct = function (data) {
        if (!data) {
            this.log("NO DATA RECEIVED");
            init_vis_template_fct();
            return false;
        }

        if (typeof data.error !== "undefined" && data.error.length) {
            this.log("GOT ERROR FROM VIZREC SERVER");
            this.log(data.error);
            init_vis_template_fct();
            return false;
        }

        this.log("Successfully got data from VizRec-Server");
        this.log(data);


        var bestMappings = {
            // Define best mappings of facets for each chart-type here
        };

        // Define best matching chart here


        init_vis_template_fct();
        var bestChart = "barchart";

        window.postMessage({event: 'eexcess.newDashboardSettings', settings: {
                selectedChart: bestChart,
                bestMappings: bestMappings
            }}, "*");
        this.log("Event for changing chart triggered");

        return true;
    }.bind(this);


    var error_fct = function (data) {
        this.log("Error in communication with VizRec-Server");
        init_vis_template_fct();
    }.bind(this);



    this.log("Sending " + this.server.recmapping_cmd + " command to server");
    jQuery.ajax(
        {
            method: "POST",
            url: this.server.host + this.server.recmapping_cmd_folder,
            data: {
                cmd: this.server.recmapping_cmd,
                dataset: JSON.stringify(data)
            },
            dataType: "json",
            success: success_fct,
            error: error_fct
        }
    );
};

/**
 * Retrieving some demo data for testing the API
 */
VizRecConnector.prototype.getDemoData = function () {
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
                        "movie": "Swiss Family Robinson",
                        "genre": "Adventure",
                        "year": "1960",
                        "country": "United States of America",
                        "budget": "300000",
                        "gross": "40350000",
                        "population": "179323175"
                    }
                }]
        }
    };
};
    