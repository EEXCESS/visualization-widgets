
/**
 * Global constant that determines if data is sent to VizRec first
 * @type Boolean
 */
var USE_VIZREC = true;



// Call server
//var post = $.post(host + "/viz", {cmd: cmd, dataset: JSON.stringify(dataToSend)});


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

VizRecConnector.prototype.log = function (msg) {


    console.log("%cVIZREC:", "color: green; font-weight:bold", msg);


};

/**
 * Send data to server to get mappings
 * @param {} data @see VizRecConnector.prototype.getDemoData 
 * @param {function} success Callback after success
 * @param {function} fail Callback on fail
 */
VizRecConnector.prototype.getMappings = function (data, success, fail) {

    var response_fct = function (data) {
        if (!data)
            return fail("No data received");

        if (typeof data.error !== "undefined" && data.error.length)
            return fail(data.error);

        return success(data);
    };
    jQuery.ajax(
        {
            method: "POST",
            url: this.server.host + this.server.recmapping_cmd_folder,
            data: {
                cmd: this.server.recmapping_cmd,
                dataset: JSON.stringify(data)
            },
            dataType: "json",
            success: response_fct
        }
    );



};


VizRecConnector.prototype.getDemoData = function () {
    return {
        query: " The top 10 successfully movies filmed at 1960, 1970, 1980 and 1990",
        results: {
            results: [{
                    facets: {
                        movie: "Apartment",
                        genre: "Comedy",
                        year: "1960",
                        country: "United States of America",
                        budget: "3000000",
                        gross: "24600000",
                        population: "179323175"

                    }
                }, {
                    facets: {
                        movie: "Swiss Family Robinson",
                        genre: "Adventure",
                        year: "1960",
                        country: "United States of America",
                        budget: "300000",
                        gross: "40350000",
                        population: "179323175"
                    }
                }]
        }
    };

};
    