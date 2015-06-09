# Search result list and search interface example

This example shows the usage of the SearchResultList widget together with a simple search interface. 
For the example in action see this **[demo](http://rawgit.com/EEXCESS/visualization-widgets/master/examples/searchinterface-resultlist/index.html)** page.

Several libraries/components are used in this example, in particular:
* jquery
* requirejs
* [EEXCESS c4](https://github.com/EEXCESS/c4)
* SearchResultList from [visualization-widgets](https://github.com/EEXCESS/visualization-widgets) repository

These libraries are only added to the example and not modified in any way. The only file which contains custom code is `index.html`. See the comments in this file for instructions on how to create a search interface and how to use visualization widgets. This example shows the use of SearchResultList, but the approach is the same for all visualization widgets.

**NOTE:** At the moment, the EEXCESS server does not support cross-origin requests. In order for the example to work, you may need to adapt the security settings of your browser.
For example in Google Chrome this can be done by starting the browser with the option `--disable-web-security` (make sure to terminate all running Chrome processes before).