

var SS = SS || {};
SS.Screenshot = function () {

    this.server = "http://localhost/phantomjs/";
    this.status_indicator = null;

};
SS.Screenshot.prototype.createDemoButton = function () {
    jQuery(document).ready(function () {
        var parent_elm = jQuery('#eexcess_controls');
        parent_elm.append(jQuery("<div class='screenshot_button'><a href='javascript:void(0)'>Take Screenshot</a><div id='scrsh_status'>*</div></div>"));
        parent_elm.append(jQuery("<div id='screenshot_output' style='background: green;'></div>"));
        this.status_indicator = jQuery('#scrsh_status');
        this.status_indicator.css("font-size", "20px");
        this.status_indicator.css("font-weight", "bold");



        //jQuery('body').append(jQuery("<canvas id='my-canvas'></canvas>"));
        jQuery('.screenshot_button').click(function () {
            this.screenshot();
        }.bind(this));
    }.bind(this));
};
SS.Screenshot.prototype.screenshot = function () {

    this.status_indicator.css("background", "orange");

    var data = {
        url: "http://localhost:8000/examples/index-dashboard.html", //"about:blank",
        content: this.collectDom()
    };
    var phjscloud = false;

    /*
     * 
     * USAGE OF OWN PHANTOM.JS SERVER
     */
    if (!phjscloud) {

        var url = this.server + "server.php";


        jQuery.ajax({
            type: "POST",
            url: url,
            data: data,
            success: this.on_data.bind(this),
            error: this.on_data.bind(this)
        });
    }

    /*
     else {
     
     /*
     * 
     * MAKE USE OF PHANTOM-JS-CLOUD API-SERVICE
     
     
     var my_api_key = "ak-pwvyt-m1xnd-9bwby-xq4gv-b5gjs";
     var api_url = "https://phantomjscloud.com/api/browser/v2/" + my_api_key + "/";
     jQuery.ajax({
     type: "GET",
     url: api_url + encodeURI(data),
     data: data,
     // dataType: "application/json",
     success: on_data,
     error: on_data
     });
     
     }
     */
};

SS.Screenshot.prototype.collectDom = function () {

    var dom_copy = jQuery("html").clone();
    //var dom_copy = jQuery(window.parent.document).find("html").clone();

   // dom_copy.remove("#dashboard");
    //dom_copy.find("body").append("<div id='#dashboard'>" + jQuery("html").html() + "</div>");
    dom_copy.find("script").remove();
    alert("TODO: Deal with relative CSS stuff ");

    var dom_str = dom_copy.html();
    console.log(dom_str);

    dom_copy = undefined;
    return dom_str;
};


SS.Screenshot.prototype.on_data = function (data) {
    if (typeof data === "string") {
        if (!data.length)
            data = {status: "ERROR"};
        else
            data = JSON.parse(data);
    } else
        data = data.responseText;

    console.log("RESPONSE FROM PHANTOM.JS SERVER!", data);


    if (data.status === "OK") {
        this.status_indicator.stop(true, true).css("background", "green");

        var rendering_on_server = data.out_file;

        var output_container = jQuery('#screenshot_output');
        var full_img_path = this.server + rendering_on_server;
        output_container.html("<a href='" + full_img_path + "' target='_blank'>" +
            "<img style='width:100%; border: 1px solid red;' src='" + full_img_path + "' /></a>");

    } else
        this.status_indicator.stop(true, true).css("background", "red");
    this.fade_black();
};


SS.Screenshot.prototype.fade_black = function () {
    this.status_indicator.animate({
        background: "white"
    }, 2000, function () {
    });
};

var screenshot = new SS.Screenshot();
screenshot.createDemoButton();