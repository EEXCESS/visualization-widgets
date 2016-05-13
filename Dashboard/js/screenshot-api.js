var SS = SS || {};
SS.Screenshot = function () {

    if (typeof window.parent.EVAL_SERVER === "undefined") {
        console.warn("No EVAL_SERVER variable found. Consider deactivating Screenshot tool!");
        this.server = "NO_SERVER_SET";
    } else
        this.server = window.parent.EVAL_SERVER;

    this.status_indicator = null;

    this.createIndicator();
    this.createBindings();

    this.eval_session = this.getEvalSession();

    this.counter = 0;

};

SS.Screenshot.prototype.getEvalSession = function () {
    var params = window.parent.location.search;

    if (!params.length) {
        alert("Session-Number not set (Get-param 'session'). Assuming 1");
        return 1;
    }
    var expr = /session=(\d*)/;
    expr.exec(params);

    var session = RegExp.$1;

    if (session === "") {
        alert("Could not get session from GET variable 'session'. Assuming 1");
        return 1;
    }
    return parseInt(session);
};


SS.Screenshot.prototype.createIndicator = function () {
    jQuery(document).ready(function () {
        jQuery('body').prepend("<div id='scrsh_status'></div>");
        this.status_indicator = jQuery('#scrsh_status');
        this.status_indicator.css("position", "absolute");
        this.status_indicator.css("top", "2px");
        this.status_indicator.css("right", "22px");
        this.status_indicator.css("width", "5px");
        this.status_indicator.css("height", "5px");
        this.status_indicator.css("background", "#D8D8D8");
    }.bind(this));

};

SS.Screenshot.prototype.createBindings = function () {

    var that = this;
    jQuery(document).ready(function () {
        jQuery('.filter-keep').click(function (e) {
            var filterelement = jQuery(this).parent().parent().parent();
            var title = filterelement.find("h4").html()+'-filter';
            window.setTimeout(function () {
                console.log(filterelement.attr("id"));
                that.screenshot(title, "#" + filterelement.attr("id"), 4);
            }, 0);
        });

        /**
         * Further bindings here
         */
    });
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

SS.Screenshot.prototype.screenshot = function (title, selector, margin) {

    console.log('starting with screenshot: ' + title + '; selector: ' + selector);
    this.status_indicator.css("background", "orange");
    var user_id = localStorageCustom.getItem("userID");

    if (!title) {
        this.counter++;
        title = this.counter;
        if (this.counter < 10)
            title = "00" + title;
        else if (this.counter < 100)
            title = "0" + title;
    }

    var clipping = {
        l: 0,
        t: 0,
        w: window.innerWidth,
        h: window.innerHeight
    };

    if (selector)
        var clipping_data = this.getClipping(selector, margin);
        
    if (clipping_data)
        clipping = clipping_data;

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
        eval_session: this.eval_session,
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

SS.Screenshot.prototype.getClipping = function (selector, margin) {

    if (!margin)
        margin = 0;

    var element = jQuery(selector);
    if (element.length > 1) {
        console.warn("Could not get exact one element through selector for clipping screenshot! Taking first!");
        element = element[0];
    } else if (element.length === 0) {
        console.error("Could not find selector for clipping! Taking full screenshot!");
        return false;
    }

    var clipping = {
        l: parseInt(element.offset().left) - margin,
        t: parseInt(element.offset().top) - margin,
        w: parseInt(element.width()) + margin,
        h: parseInt(element.height()) + margin
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

    var my_server = window.location.href;
    var expr = /(https?:\/\/.*\/Dashboard\/)index.html/;
    expr.exec(my_server);
    var dashboard_url = RegExp.$1;

    var missing_css = [
        dashboard_url + "libs/jquery-ui/jquery-ui.css",
        dashboard_url + "libs/jquery-dropdown/jquery.dropdown.min.css",
        dashboard_url + "libs/leaflet/leaflet.css",
        dashboard_url + "libs/leaflet/markercluster/MarkerCluster.Default.css",
        dashboard_url + "libs/leaflet/markercluster/MarkerCluster.css",
        dashboard_url + "libs/leaflet/leaflet.draw/leaflet.draw.css",
        dashboard_url + "Geochart/geochart.css",
        dashboard_url + "media/css/vis-template-style-.css",
        dashboard_url + "uRankAdaption/uRankAdaption.css",
        dashboard_url + "uRank/modules/tagcloud/landscape/css/landscape.css",
        dashboard_url + "Plugins/pictures_slider/style.css",
        dashboard_url + "Plugins/popup_slider/popup_slider.css",
        dashboard_url + "media/css/eexcess.css",
        dashboard_url + "media/css/vis-template-chart-style-cecilia.css",
        dashboard_url + "libs/introjs.min.css"
    ];
    //console.log(missing_css);
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

    if (dom.find('#webgl_canvas_container canvas').length)
        this.replaceWebGLCanvasWithPng(dom.find('#webgl_canvas_container canvas'));
    
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
//screenshot.createDemoButton();