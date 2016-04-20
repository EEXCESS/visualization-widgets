

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
        url: "http://localhost:8000/examples/index-dashboard.html",
        content: this.collectDom(),
        width: window.innerWidth,
        height: window.innerHeight
    };

    var url = this.server + "server.php";

    jQuery.ajax({
        type: "POST",
        url: url,
        data: data,
        success: this.on_data.bind(this),
        error: this.on_data.bind(this)
    });

};

SS.Screenshot.prototype.collectDom = function () {

    var dom_copy = jQuery("html").clone();
    this.manipulateDom(dom_copy);
    var dom_str = dom_copy.html();
    dom_copy = undefined;

    return dom_str;
};

SS.Screenshot.prototype.manipulateDom = function (dom) {
    dom.find("script").remove();

    var head = dom.find("head");

    /*
     * Append those css files due to false relative path in iframe
     */
    var missing_css = [
        "http://localhost:8000/Dashboard/libs/jquery-ui/jquery-ui.css",
        "http://localhost:8000/Dashboard/libs/jquery-dropdown/jquery.dropdown.min.css",
        "http://localhost:8000/Dashboard/libs/leaflet/leaflet.css",
        "http://localhost:8000/Dashboard/libs/leaflet/markercluster/MarkerCluster.Default.css",
        "http://localhost:8000/Dashboard/libs/leaflet/markercluster/MarkerCluster.css",
        "http://localhost:8000/Dashboard/libs/leaflet/leaflet.draw/leaflet.draw.css",
        "http://localhost:8000/Dashboard/Geochart/geochart.css",
        "http://localhost:8000/Dashboard/media/css/vis-template-style-.css",
        "http://localhost:8000/Dashboard/uRankAdaption/uRankAdaption.css",
        "http://localhost:8000/Dashboard/uRank/modules/tagcloud/landscape/css/landscape.css",
        "http://localhost:8000/Dashboard/Plugins/pictures_slider/style.css",
        "http://localhost:8000/Dashboard/Plugins/popup_slider/popup_slider.css",
        "http://localhost:8000/Dashboard/media/css/eexcess.css",
        "http://localhost:8000/Dashboard/media/css/vis-template-chart-style-cecilia.css",
        "http://localhost:8000/Dashboard/libs/introjs.min.css"
    ];
    for (var css_key in missing_css) {
        head.append("<link rel='stylesheet' href='" + missing_css[css_key] + "' type='text/css' />");
    }

    /*
     * Update relative image src path due to iframe
     */
    dom.find("img").each(function (key, img) {
        var img_element = jQuery(img);
        if (img_element.attr("src").indexOf("media/") === 0) {
            img_element.attr("src", img_element.attr("src").replace("media/", "../Dashboard/media/"));
            //console.log("updated " + img_element.attr("src"));
        }
    });

    /*
     * Change CSS position style of leaflet objects
     */
    dom.find('.leaflet-marker-icon').each(function (key, leaflobj) {
        var transform_value = jQuery(leaflobj).css("transform");
        if (!transform_value)
            return;

        var expr = /(\d*)px,\s(\d*)px/;
        expr.exec(transform_value);
        jQuery(leaflobj).css("left", RegExp.$1 + "px");
        jQuery(leaflobj).css("top", RegExp.$2 + "px");
        jQuery(leaflobj).css("position", "absolute");
        jQuery(leaflobj).css("transform", "");
    });

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