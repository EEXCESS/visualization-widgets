"use strict";


var FOLDER = "rendered";
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


var filename = FOLDER + "/" + parseInt(Math.random() * 10000000000) + "." + this.FORMAT;

var page = require('webpage').create();

var pageSettings = {
    localToRemoteUrlAccessEnabled: true,
    webSecurityEnabled: false,
    loadImages: true,
    javascriptEnabled: false
};

page.viewportSize = {
    width: 1000,
    height: 600
};


//page.content = parsed_data.content;

//console.log("Waiting before open...");


//console.log("Calling page.open");




page.setContent(parsed_data.content, parsed_data.url);
page.evaluate(function () {
    document.body.bgColor = 'white';
});



page.onLoadFinished = function () {


    window.setTimeout(function () {
        console.log("READY SETTING CONTENT!");
        console.log("TIME TO LAOD MISSING STUFF");
        for (var key in failed_urls)
            console.log("MISSING FILE: " + failed_urls[key]);



        var render_success = page.render(filename, {format: this.FORMAT, quality: 100});

        if (!render_success) {
            returnWithError("Render did not success");
            return;
        }

        output.status = STATUS_OK;
        output.out_file = filename;
        console.log(JSON.stringify(output));
        phantom.exit();
    }, 10000);


};


page.onResourceError = function (resourceError) {

    failed_urls.push(resourceError.url);
};


/*
 window.setTimeout(function () {
 page.open(parsed_data.url, pageSettings, function () {
 
 
 page.content = parsed_data.content;
 
 
 console.log("Waiting after open...");
 window.setTimeout(function () {
 var render_success = page.render(filename, {format: parsed_data.renderType.replace("jpg", "jpeg").toUpperCase()});
 
 if (!render_success) {
 returnWithError("Render did not success");
 return;
 }
 
 output.status = STATUS_OK;
 output.out_file = filename;
 console.log(JSON.stringify(output));
 phantom.exit();
 }, 20000);
 
 });
 }, 2000);
 */



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