

var SS = SS || {};
SS.Screenshot = function () {

};
SS.Screenshot.prototype.createDemoButton = function () {
    jQuery(document).ready(function () {
        var parent_elm = jQuery('#eexcess_controls');
        parent_elm.append(jQuery("<div class='screenshot_demobutton'><a href='#'>Take Screenshot</a>"));
        //jQuery('body').append(jQuery("<canvas id='my-canvas'></canvas>"));
        jQuery('.screenshot_demobutton').click(function () {
            this.screenshot();
        }.bind(this));
    }.bind(this));
};
SS.Screenshot.prototype.screenshot = function () {


    var data = {
        url: "about:blank",
        content: "<h1>Huhu</h1>",
        renderType: "jpg"
    };
    var phjscloud = false;

    /*
     * 
     * USAGE OF OWN PHANTOM.JS SERVER
     */
    if (!phjscloud) {

        var url = "http://localhost/phantomjs/server.php";


        jQuery.ajax({
            type: "POST",
            url: url,
            data: data,
            success: on_success
        });
    } else {

        /*
         * 
         * MAKE USE OF PHANTOM-JS-CLOUD API-SERVICE
         */

        var my_api_key = "ak-pwvyt-m1xnd-9bwby-xq4gv-b5gjs";
        var api_url = "https://phantomjscloud.com/api/browser/v2/" + my_api_key + "/";
        jQuery.ajax({
            type: "GET",
            url: api_url + encodeURI(data),
            data: data,
            // dataType: "application/json",
            success: on_success
        });
    }

    function on_success(data) {
        console.log("RESPONSE FROM PHANTOM.JS SERVER!", data);
    }
};





var screenshot = new SS.Screenshot();
screenshot.createDemoButton();