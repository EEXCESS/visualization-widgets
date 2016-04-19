"use strict";


var FOLDER = "rendered";
var STATUS_ERR = "ERROR";
var STATUS_OK = "OK";

var output = {
    status: null,
    msgs: [],
    out_file: null
};

var fs = require('fs');
var input = fs.read('/dev/stdin');
//output.msgs.push("INPUT: " + input);

try {
    var parsed_data = JSON.parse(input);
} catch (e) {
    output.status = STATUS_ERR;
    output.msgs.push(e);
    phantom.exit();
}


var filename = FOLDER + "/" + parseInt(Math.random() * 1000000) + "." + parsed_data.renderType;

var page = require('webpage').create();
page.open(parsed_data.url, function () {
    page.settings.localToRemoteUrlAccessEnabled = true;
    page.content = parsed_data.content;

    window.setTimeout(function () {
        var render_success = page.render(filename, {format: parsed_data.renderType.replace("jpg", "jpeg").toUpperCase()});

        if (!render_success) {
            returnWithError();
            return;
        }

        output.status = STATUS_OK;
        output.out_file = filename;
        console.log(JSON.stringify(output));
        phantom.exit();
    }, 6000);



});

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
    output.msgs.push("URL: " + parsed_data.url);
    output.msgs.push("RENDERTYPE: " + parsed_data.renderType);
    output.msgs.push("CONTENT: " + parsed_data.content);
    phantom.exit();
}