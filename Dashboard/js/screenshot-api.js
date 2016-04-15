

var SS = SS || {};

SS.Screenshot = function () {

};

SS.Screenshot.prototype.createDemoButton = function () {
    jQuery(document).ready(function () {
        var parent_elm = jQuery('#eexcess_controls');
        parent_elm.append(jQuery("<div class='screenshot_demobutton'><a href='#'>Take Screenshot</a>"));

        jQuery('body').append(jQuery("<canvas id='my-canvas'></canvas>"));
        jQuery('.screenshot_demobutton').click(function () {
            this.screenshot();
        }.bind(this));
    }.bind(this));

};



SS.Screenshot.prototype.screenshot = function () {



    var canvas = document.getElementById('my-canvas');
    var ctx = canvas.getContext("2d");
// Draw the window at the top left of canvas, width=100, height=200, white background

    ctx.drawWindow(window, 0, 0, 100, 200, "rgb(255,255,255)");
// Open another window with the thumbnail as an image
    open(canvas.toDataURL("image/png"));
};



var screenshot = new SS.Screenshot();
screenshot.createDemoButton();