"use strict";


var STATUS_ERR = "ERROR";
var STATUS_OK = "OK";

var FORMAT = "JPEG";

var output = {
    status: null,
    msgs: [],
    out_file: null
};

var fs = require('fs');
var input = fs.read('/dev/stdin');
//output.msgs.push("INPUT: " + input);

var failed_urls = [];

try {
    var parsed_data = JSON.parse(input);
} catch (e) {
    output.status = STATUS_ERR;
    output.msgs.push(e);
    returnWithError();
}

var folder = parsed_data.folder;

output.msgs.push("Executed command: '" + parsed_data.executed_cmd * "'");
var file_identifier = parsed_data.title ? parsed_data.title : "out_" + parseInt(Math.random() * 10000000000);
var filename = folder + "/" + file_identifier + "." + this.FORMAT;




var page = require('webpage').create();

var pageSettings = {
    localToRemoteUrlAccessEnabled: true,
    webSecurityEnabled: false,
    loadImages: true,
    javascriptEnabled: false
};

page.viewportSize = {
    width: parseInt(parsed_data.p_width),
    height: parseInt(parsed_data.p_height)
};

page.clipRect = {
    left: parseInt(parsed_data.left),
    top: parseInt(parsed_data.top),
    width: parseInt(parsed_data.width),
    height: parseInt(parsed_data.height)
};
output.msgs.push("Clipping: " + page.clipRect.left + " " + page.clipRect.top + " " + page.clipRect.width + " " + page.clipRect.height);


page.setContent(parsed_data.content, parsed_data.url);
page.evaluate(function () {
    document.body.bgColor = 'white';
});



page.onLoadFinished = function () {

    // Give it time to load everything
    var wait_before_render_seconds = 0;

    window.setTimeout(function () {

        if (failed_urls.length)
            output.failed_loading_ressources = [];
        for (var key in failed_urls) {
            output.failed_loading_ressources.push(failed_urls[key]);
        }


        var render_success = page.render(filename, {format: this.FORMAT, quality: 100});

        if (!render_success) {
            returnWithError("Render did not success");
            return;
        }

        output.status = STATUS_OK;
        output.out_file = filename;
        console.log(JSON.stringify(output));
        phantom.exit();
    }, wait_before_render_seconds * 1000);
};


page.onResourceError = function (resourceError) {
    failed_urls.push(resourceError.url);
};


page.onError = function (msg, trace) {
    returnWithError(msg);
};

page.onResourceRequested = function (requestData, request) {
    //console.log('::loading', requestData['url']);  // this does get logged now
};


function returnWithError(msg) {
    output.status = STATUS_ERR;

    if (!msg)
        msg = "";

    output.msgs.push("AN PHANTOM.JS ERROR OCCURED: " + msg);
    console.log(JSON.stringify(output));
    phantom.exit();
}
