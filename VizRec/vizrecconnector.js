
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

    this.DUMMY_COUNTRY_CODE = "AT";
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
VizRecConnector.prototype.loadMappingsAndChangeVis = function (inputdata) {

    console.log(inputdata);


    var INPUT_DEMO_DATA = false;

    var data;
    if (INPUT_DEMO_DATA) {
        this.send(this.getDemoData());
    } else {
        this.createRequestData(inputdata, function (data) {
            this.send(data);
        }.bind(this));
    }

};


VizRecConnector.prototype.send = function (data) {
    //Call the the visTemplate.init() etc. delayed after our results arrived
    var init_vis_template_fct = function () {
        window.postMessage({event: 'eexcess.initVisTemplate'}, "*");

        jQuery('#vizrec_loading_overlay').fadeTo(2000, 0.0, function () {
            jQuery('#vizrec_loading_overlay').remove();
        });
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
        //this.log(JSON.stringify(data));


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



    jQuery('body').prepend(jQuery("<div/>", {
        id: "vizrec_loading_overlay"
    }).append(jQuery("<img/>", {
        src: "media/loading.gif",
        id: "vizrec_loadinggif"
    }),
        jQuery("<p/>", {
            text: "Loading VizRec Results..."
        })));


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

VizRecConnector.prototype.createRequestData = function (data, created_cb) {

    var query = data.queryID;

    var request_obj = {
        query: query,
        results: {results: []}
    };

    var facets_async_ready = 0;
    console.log("going through data", data);
    for (var i = 0; i < data.result.length; i++) {
        var curr_rec = data.result[i];

        var facets = null;
        if (typeof curr_rec.facets === "undefined")
            curr_rec = BOOKMARKDIALOG.Tools.mapItemFromV2toV1(curr_rec);

        facets = {};
        for (var f_key in curr_rec.facets) {
            if (curr_rec.facets[f_key] !== "unknown" && curr_rec.facets[f_key] !== "unkown")
                facets[f_key] = curr_rec.facets[f_key];
        }

        //console.log("getting country");
        this.getCountry(curr_rec.coordinate, facets, function (country, facets) {
            //console.log(country);
            if (country) {
                if (VizRecConnector.countrylist[country.toUpperCase()] !== undefined)
                    country = VizRecConnector.countrylist[country.toUpperCase()];
                this.log(country);
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


VizRecConnector.prototype.getCountry = function (coordinate, facets, cb) {

    if (!coordinate || coordinate.length !== 2) {
        cb(false, facets);
        return;
    }

    var lat = coordinate[0];
    var long = coordinate[1];

    var service = 'http://api.geonames.org/citiesJSON?&username=eexcess&lang=en';

    var url = service + '&north=' + lat + '&west=' + long + '&south=' + (lat + 0.1) + '&east=' + (long + 0.1);

    jQuery.ajax({
        url: url,
        dataType: 'json',
        success: function (data) {
            //console.log("success");
            //console.log('data received from geonames', data);
            var country = null;

            if (typeof data.status !== "undefined" && data.status.value === 19)
                country = this.DUMMY_COUNTRY_CODE;
            else {
                // console.log(data.geonames);
                if (typeof data.geonames === "undefined" || !data.geonames.length) {
                    cb(false, facets);
                    return;
                }
                //console.log(data.geonames);
                var country = data.geonames[0].countrycode;
            }
            //this.log("Got country: '" + country + "'");
            cb(country, facets);
        }.bind(this),
        error: function (data) {
            this.log("Error getting country via API");
            cb(false, facets);
        }.bind(this),
        timeout: 500
    });
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
    