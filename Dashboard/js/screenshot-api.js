

var SS = SS || {};

SS.Screenshot = function () {

};

SS.Screenshot.prototype.createDemoButton = function () {
    jQuery(document).ready(function () {
        var parent_elm = jQuery('#eexcess_controls');
        parent_elm.append(jQuery("<div class='screenshot_demobutton'><a href='#'>Take Screenshot</a>"));
    });

};







var screenshot = new SS.Screenshot();
screenshot.createDemoButton();