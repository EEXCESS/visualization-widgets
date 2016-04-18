"use strict";
var system = require('system');

console.log(system.args);
if (system.args.length === 1) {
    console.log('Try to pass some args when invoking this script!');
    phantom.exit();

}

var parsed_args = null;

system.args.forEach(function (arg, i) {
    console.log(i + ': ', arg);
    try {
        arg = window.atob(arg);
        console.log("decoded: ", arg);
        parsed_args = JSON.parse(arg);

    } catch (e) {
    }


});

var phantom_data = {
  url : parsed_args.url,
  content : parsed_args.content,
  renderType : parsed_args.renderType
};




phantom.exit();