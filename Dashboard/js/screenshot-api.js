

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
            this.screenshot("mapleg", "#div-wrap-legends");
        }.bind(this));
    }.bind(this));
};
SS.Screenshot.prototype.screenshot = function (title, selector) {

    this.status_indicator.css("background", "orange");

    var user_id = localStorageCustom.getItem("userID");


    var clipping = {
        l: 0,
        t: 0,
        w: window.innerWidth,
        h: window.innerHeight
    };

    if (selector)
        var clipping_data = this.getClipping(selector);
    if (clipping_data)
        clipping = clipping_data;


    console.log(clipping);

    var data = {
        url: window.parent.parent.location.href, // To get the uppermost parent
        content: this.collectDom(),
        left: clipping.l,
        top: clipping.t,
        width: clipping.w,
        height: clipping.h,
        p_width: window.innerWidth,
        p_height: window.innerHeight,
        user_id: user_id,
        title: title
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

SS.Screenshot.prototype.getClipping = function (selector) {

    var element = jQuery(selector);
    if (element.length > 1) {
        console.warn("Could not get exact one element through selector for clipping screenshot! Taking first!");
        element = element[0];
    } else if (element.length === 0) {
        console.error("Could not find selector for clipping! Taking full screenshot!");
        return false;
    }

    var clipping = {
        l: parseInt(element.offset().left),
        t: parseInt(element.offset().top),
        w: parseInt(element.width()),
        h: parseInt(element.height())
    };


    return clipping;
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

    var my_server = window.location.origin;
    var missing_css = [
        my_server + "/Dashboard/libs/jquery-ui/jquery-ui.css",
        my_server + "/Dashboard/libs/jquery-dropdown/jquery.dropdown.min.css",
        my_server + "/Dashboard/libs/leaflet/leaflet.css",
        my_server + "/Dashboard/libs/leaflet/markercluster/MarkerCluster.Default.css",
        my_server + "/Dashboard/libs/leaflet/markercluster/MarkerCluster.css",
        my_server + "/Dashboard/libs/leaflet/leaflet.draw/leaflet.draw.css",
        my_server + "/Dashboard/Geochart/geochart.css",
        my_server + "/Dashboard/media/css/vis-template-style-.css",
        my_server + "/Dashboard/uRankAdaption/uRankAdaption.css",
        my_server + "/Dashboard/uRank/modules/tagcloud/landscape/css/landscape.css",
        my_server + "/Dashboard/Plugins/pictures_slider/style.css",
        my_server + "/Dashboard/Plugins/popup_slider/popup_slider.css",
        my_server + "/Dashboard/media/css/eexcess.css",
        my_server + "/Dashboard/media/css/vis-template-chart-style-cecilia.css",
        my_server + "/Dashboard/libs/introjs.min.css"
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
    var elements_to_replace_transform = [
        '.leaflet-marker-icon',
        '.leaflet-zoom-animated'
    ];

    for (var idkey = 0; idkey < elements_to_replace_transform.length; idkey++) {
        dom.find(elements_to_replace_transform[idkey]).each(function (key, obj) {
            var transform_value = jQuery(obj).css("transform");
            if (!transform_value)
                return;

            var expr = /(-?\d*)px,\s(-?\d*)px/;
            expr.exec(transform_value);
            jQuery(obj).css("left", RegExp.$1 + "px");
            jQuery(obj).css("top", RegExp.$2 + "px");
            jQuery(obj).css("position", "absolute");
            jQuery(obj).css("transform", "");
        });
    }


    /*
     * Replacec landscape SVG-Stuff with IMG
     */
    if (dom.find('#eexcess_landscape_vis_main svg').length)
        this.replaceSvgWithPng(dom.find('#eexcess_landscape_vis_main svg'));

    if (dom.find('#webgl_canvas_container canvas').length) {
        this.replaceWebGLCanvasWithPng(dom.find('#webgl_canvas_container canvas'));


    }
    /*
     * Other stuff
     */
    dom.find('#div-wrap-legends').css("z-index", "100");

    dom.find('#eexcess_vis_panel_controls').css("float", "left");
    dom.find('#eexcess_vis_panel_controls').css("width", "100%");
    dom.find('.urank #eexcess_keywords_box').css("width", "100%");


    var widths_to_make_static = [
        '#eexcess_vis_panel',
        '.urank-tagbox-container',
        '.urank-tagbox-container',
        '.urank #eexcess_canvas',
        '.urank-tagcloud-tag-container-outer',
        '.urank-tagcloud-tag-container'
    ];

    for (var key = 0; key < widths_to_make_static.length; key++) {
        var curr_identifer = widths_to_make_static[key];
        dom.find(curr_identifer).css("width", jQuery(curr_identifer).css("width"));
    }
};


SS.Screenshot.prototype.replaceSvgWithPng = function (svg_jqueryobj) {

    console.log("Replacing a SVG with an IMG", svg_jqueryobj[0]);

    var svg = svg_jqueryobj[0];
    var xml = new XMLSerializer().serializeToString(svg);

    var data = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    var img = new Image();

    img.setAttribute('src', data);
    svg_jqueryobj.replaceWith(jQuery(img));
};


SS.Screenshot.prototype.replaceWebGLCanvasWithPng = function (canvas_jqueryobj) {

    console.log("Replacing a canvas with an IMG", canvas_jqueryobj[0]);
    var img = new Image();
    //var context = canvas_jqueryobj[0].getContext("experimental-webgl", {preserveDrawingBuffer: true});

    IQHN.Scene.getCurrentScene().getWebGlHandler().screenshot_img = img;
    IQHN.Scene.getCurrentScene().getWebGlHandler().take_screenshot_now = true;
    IQHN.Scene.getCurrentScene().getWebGlHandler().render();

    //img.src = IQHN.Scene.getCurrentScene().getWebGlHandler().getThreeRenderer().domElement.toDataURL();
    //img.src = canvas_jqueryobj[0].toDataURL("image/png");
    canvas_jqueryobj.replaceWith(jQuery(img));

    //var context = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
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