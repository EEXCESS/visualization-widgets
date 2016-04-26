
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
    