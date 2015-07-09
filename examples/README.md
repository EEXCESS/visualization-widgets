# Examples

This folder provides examples of all available visualization widgets in action and shows how to include them (have a look in the code in `index.html`). 
For a live version, see this **[demo](http://rawgit.com/EEXCESS/visualization-widgets/master/examples/index.html)** page.

Several libraries/components are used in this example, in particular:
* jquery
* requirejs
* [EEXCESS c4](https://github.com/EEXCESS/c4)
* All visualizations currently available in this repository

These libraries are only added to the example and not modified in any way. The only file which contains custom code is `index.html`. See the comments in this file for instructions on how to use visualization widgets.

**NOTE:** At the moment, the EEXCESS server does not support cross-origin requests. In order for the example to work, you may need to adapt the security settings of your browser.
For example in Google Chrome this can be done by starting the browser with the option `--disable-web-security` (make sure to terminate all running Chrome processes before).

## Recommendation Dashboard Example

The file `index-dashboard.html` gives you an example, how to use the Recommendation Dashboard Visualisations. 
**NOTE:** One of the Dashboard Visualisations, uRank, is referenced as a GIT submodule. If you would like to view the Dasboard, you also have to clone/update the submodule in Dashboard/uRank
 