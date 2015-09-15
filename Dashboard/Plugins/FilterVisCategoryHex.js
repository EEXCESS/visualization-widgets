(function(){

    var FilterVisCategoryHex = {};
    var $root = null;
    var base = null;
    var chart = null;
    var currentCategory = null;
    var width = 0;
    var points = null;
    var checkData = null;
    var afterInitCallback;
    var initializationFinished = false;
    
    FilterVisCategoryHex.initialize = function(vis, rootSelector){
        $root = rootSelector;
        FilterVisCategoryHex.vis = vis;
        var path = 'Plugins/FilterVisTimeCategoryPoints.js'; 
        Modernizr.load({ test: path,
                         load : path,
                         complete: function(){ 
                             console.log("FilterVisTimeCategoryPoints load completed");
                             points = new FilterVisTimeCategoryPoints('minibarchart');
                             width = parseInt(d3.select("#eexcess-filtercontainer").style("width"));
                             initializationFinished = true;
                             if (afterInitCallback){
                                  afterInitCallback(); 
                             }
                         }
                       });
    };
    
    /*
     * basic draw function
     */
    //FilterVisCategoryHex.draw = function (allData, selectedData, inputData, $container, category, categoryValues, from, to) {
    FilterVisCategoryHex.draw = function (allData, inputData, $container, filters) {
        if (!initializationFinished) {
            afterInitCallback = function () { FilterVisCategoryHex.draw(allData, inputData, $container, filters); };
            return;
        }

        var categoryValues = _(filters).map('categoryValues');
        var selectedData = _(filters).map('dataWithinFilter');
        var category = "";
        if (filters.length > 0 )
            category = filters[0].category;

        var $vis = $container.find('.mini-bar-chart');
        var data = getInitData(allData, category);
        if (categoryValues === null) { 
            interactMiniBar(selectedData, category, categoryValues, data, $vis); 
        } else if ($container[0].baseURI === "" || undefined || null) { 
            console.log("NO REDRAW !", $container.baseURI); 
        } else {
            var svg = null;
            var focus = null;
            // if none minibarchart exits
            if (points === null) 
                return;
                
            var dataSet = points.getPoints(data, width, 135);
            if (dataSet === null)
                return;

            if ($vis.length === 0) {
                base = d3.select($container.get(0));
                chart = base.append("div")
                    .attr("class", "mini-bar-chart")
                    .attr('width', width)
                    .attr('height', dataSet.height)
                    .style('padding', "3px 4px");

                svg = chart.append("svg")
                    .attr("class", "minibarchart_svg")
                    .attr("width", "100%")
                    .attr("height", dataSet.height)
                    .attr("viewBox", "0 0 " + width + " " + dataSet.height + " ");

                focus = svg.append("g")
                    .attr("class", "FilterVis_focus")
                    .attr("width", "100%")
                    .attr("height", "100%");

                generateMiniBarElements(data, dataSet, category);
                currentCategory = category;
                checkData = allData;
            }
            if (allData === checkData && currentCategory === category) {
                interactMiniBar(selectedData, category, categoryValues, data);

            } else if (allData === checkData && currentCategory !== category) {
                generateMiniBarElements(data, dataSet, category);
                interactMiniBar(selectedData, category, categoryValues, data);
                currentCategory = category;
            } else if (allData !== checkData) {
                generateMiniBarElements(data, dataSet, category);
                interactMiniBar(selectedData, category, categoryValues, data);
                checkData = allData;
                currentCategory = null;

            } else {
                console.log("There is something wrong, maybe you want to read an undefined value");
            }
        }
    };

    FilterVisCategoryHex.finalize = function(){
    };

    /*
     * generates the svg specific svg elements
     */
    function generateMiniBarElements(inputData, data, category) {
        deleteElements();
        var dataSet = data;
        var base = d3.select("#eexcess-filtercontainer");
        //d3.select(".mini-bar-chart").attr('height', dataSet.height);
        var svg = base.select("svg.minibarchart_svg").attr('height', dataSet.height).attr("viewBox", "0 0 " + width + " " + dataSet.height + " ");
        var focus = svg.select(".FilterVis_focus");
        var color = d3.scale.category10();
        focus.append("g")
            .selectAll(".points_fill")
            .data(dataSet.points_fill)
            .enter().append("path")
            .attr("class", "points_fill")
            .attr("id", function (d, i) { return inputData[i][category].replace(/[ .]/g, "_"); })
            .attr("d", function (d) { return d; })
            .style("fill", function (d, i) {
                return color(i);
            });
        focus.append("g")
            .selectAll(".points_stroke")
            .data(dataSet.points_stroke)
            .enter().append("path")
            .attr("class", "points_stroke")
            .attr("id", function (d, i) { return inputData[i][category].replace(/[ .]/g, "_"); })
            .attr("d", function (d, i) { return d; })
            .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '2px' });
        var delta = getLetterSize(inputData, category, parseInt(d3.select("#eexcess_controls").style("font-size")));
        focus.append("g")
            .selectAll(".hexagon_text")
            .data(dataSet.points_m)
            .enter().append("text")
            .attr("class", "hexagon_text")
            .attr("id", function (d, i) { return inputData[i][category].replace(/[ .]/g, "_"); })
            .attr("x", function (d, i) { return d.x - delta[i]; })
            .attr("y", function (d, i) { return d.y; })
            .text(function (d, i) { return inputData[i][category]; })
            .attr("font-family", "sans-serif")
            .style("font-size", "0.9em")
            .attr("fill", "black");
    }

    /*
     * calcs the diff from centerpoint startpoint of text, depending on length of word
     */
    function getLetterSize(data, category, length) {
        var array = [];
        data.forEach(function (d, i) {
            var size = d[category].length;
            array.push((size * length * 0.9) / 4);
        });
        return array;
    }

    /*
     * arranges the interaction
     */
    function interactMiniBar(selectedData, category, categoryValues, data) {
        var base = d3.select("#eexcess-filtercontainer");
        var svg = base.select('svg.minibarchart_svg');
        var focus = svg.select(".FilterVis_focus");
        var fill = focus.selectAll(".points_fill");
        var stroke = focus.selectAll(".points_stroke");
        var text = focus.selectAll(".hexagon_text");
        var selected = selectedData;
        //only one bar or binding doesn't worked errorhandling
        if (selected === null || selected.length === data.length || selected[0] === undefined) {
            console.log("Sorry facets is undefined");
            fill.transition()
                .style("opacity", 1);
            stroke.transition()
                .style("opacity", 1).style("stroke", "black");
            text.transition()
                .style("opacity", 1);
        } else if (categoryValues === null) {
            console.log("Sorry no categoryValues");
        } else { //first click or different element
            stroke.transition().style("stroke","black").style("opacity", 0.2)
            fill.transition().style("opacity", 0.2);
            text.transition().style("opacity", 0.2);
            categoryValues.forEach(function (d, i) {
                var path = "path#" + d;
                var selectedfill = svg.selectAll(path);
                selectedfill[0][1].style.stroke = selectedfill[0][0].style.fill;
                selectedfill.transition().style("opacity", 1);
                var get = "text#" + d;
                var selectedtext = svg.selectAll(get);
                selectedtext.transition().style("opacity", 1);
            });
            stroke.selectAll()
        }
    }

    /*
     * counts element selected by category similar to setting.getInitData
     */
    function getInitData(allData, category) {
        var dataSet = {};
        allData.forEach(function (d, i) {
            var check = dataSet[d.facets[category]];
            if (check === undefined) {
                dataSet[d.facets[category]] = 1;
            } else {
                dataSet[d.facets[category]]++;
            }
        });
        var array = [];
        var keys = Object.keys(dataSet);
        for (var i = 0; i < keys.length; i++) {
            var obj = {};
            obj[category] = keys[i];
            obj.count = dataSet[keys[i]];
            obj.selected = false;
            array.push(obj);
        }
        return array;
    }

    function deleteElements() {
        //delete elements if they exists
        var base = d3.select("#eexcess-filtercontainer");
        var svg = base.select('svg.minibarchart_svg');
        var focus = svg.select(".FilterVis_focus");
        var elements = focus.selectAll(".points_fill");
        var element = focus.selectAll(".points_stroke");
        var elementText = focus.selectAll(".hexagon_text");
        if (elements !== (undefined || null)) {
            elements.remove();
        }
        if (element !== (undefined || null)) {
            element.remove();
        }
        if (elementText !== (undefined || null)) {
            elementText.remove();
        }
    }

    PluginHandler.registerFilterVisualisation(FilterVisCategoryHex, {
      'displayName' : 'FilterVisCategoryHex',
      'type' : 'category',
    });

})();