(function(){
    var FilterVisCategoryHex = {};
    var $root = null;
    var chart = null;
    var width = 0;
    var points = null;
    var afterInitCallback;
    var initializationFinished = false;
    
    FilterVisCategoryHex.initialize = function(vis, rootSelector){
        $root = rootSelector;
        FilterVisCategoryHex.vis = vis;
        var path = 'Plugins/FilterVisTimeCategoryPoints.js'; 
        
        if(initializationFinished)
           return;

        Modernizr.load({ test: path,
                         load : path,
                         complete: function(){ 
                             console.log("FilterVisTimeCategoryPoints load completed");
                             points = new FilterVisTimeCategoryPoints('minibarchart');
                             width = parseInt(d3.select("#eexcess-filtercontainer").style("width"));
                             initializationFinished = true;        
                             if (afterInitCallback ){
                                 afterInitCallback();
                             }
                         }
                       });
       
    };
    
    /*
     * basic draw function
     */
    FilterVisCategoryHex.draw = function (allData, inputData, $container, filters, settings, e) {
        // todo: use settings.dimensionValues
        if (!initializationFinished) {
            afterInitCallback = function () { FilterVisCategoryHex.draw(allData, inputData, $container, filters, settings); };
            return;
        }
        var base, svg, focus = null;
        var categoryValues = _(filters).map('categoryValues');
        var selectedData = _(filters).map('dataWithinFilter');
        var category = "";
        if (filters.length > 0)
            category = filters[0].category;

        var $vis = $container.find('.mini-bar-chart');
        category = settings.dimension;
        var data = getInitData(allData, category, settings.dimensionValues, categoryValues);
        if (points === null)
            return;
        var dataSet = points.getPointsBarChart(data, width, 135);
        if (dataSet === null)
            return;
        if ($vis.length === 0) {
            appendContainer(base, svg, focus, dataSet, $container.get(0))
        } else {
            appendContainer(base, svg, focus, dataSet, $container.get(1))
        }
        generateMiniBarElements(data, dataSet, category, selectedData, categoryValues);
        interactMiniBar(selectedData, category, categoryValues, data);
    };

    FilterVisCategoryHex.finalize = function(){
    };

    /*
     * generates the svg specific svg elements
     */
    function generateMiniBarElements(inputData, data, category, selectedData, categoryValues) {
        deleteElements();
        var dataSet = data;
        var base = d3.select("#eexcess-filtercontainer");
        var svg = base.select("svg.minibarchart_svg").attr('height', dataSet.height).attr("viewBox", "0 0 " + width + " " + dataSet.height + " ");
        var focus = svg.select(".FilterVis_focus");
        var color = getColorOfMainVisualization();

        focus.append("g")
            .selectAll(".points_fill")
            .data(dataSet.points_fill)
            .enter().append("path")
            .attr("class", "points_fill")
            .attr("id", function (d, i) { return color[i].name.replace(/[ .]/g, "_"); })
            .attr("d", function (d) { return d; })
            .style("fill", function (d, i) {
                return color[i].color;
            });

        focus.append("g")
            .selectAll(".points_stroke")
            .data(dataSet.points_stroke)
            .enter().append("path")
            .attr("class", "points_stroke")
            .attr("id", function (d, i) { return inputData[i][category].replace(/[ .]/g, "_"); })
            .attr("d", function (d, i) { return d; })
            .attr('stroke-width', '2px')
            .attr('stroke', 'black')
            .attr("fill", "none");

        var fontSize = d3.selectAll("#eexcess_canvas").style("font-size");
        fontSize = parseFloat(fontSize);
        var delta = getLetterSize(inputData, category, fontSize);
        focus.append("g")
            .selectAll(".hexagon_text")
            .data(dataSet.points_m)
            .enter().append("text")
            .attr("class", "hexagon_text")
            .attr("id", function (d, i) { return inputData[i][category].replace(/[ .]/g, "_"); })
            .attr("x", function (d, i) { return d.x - delta[i]; })
            .attr("y", function (d, i) { return d.y + fontSize / 4; })
            .text(function (d, i) { return inputData[i][category]; })
            .attr("font-family", "sans-serif")
            .style("font-size", fontSize)
            .attr("fill", "black");

    }

    /*
    * get colors from main visualization
    *
    */
    function getColorOfMainVisualization() {
        var colorCode = d3.selectAll(".bar");
        var base = d3.selectAll("#eexcess_canvas").selectAll(".focus");
        var name = base;
        name = name.selectAll(".tick");
        var array = [];
        colorCode[0].forEach(function (d, i) {
            var obj = {};
            obj.name = name[0][i].__data__;
            obj.color = d.style.fill;
            array.push(obj);
        });
        return array;
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
                .style("opacity", 1);
            text.transition()
                .style("opacity", 1);
        } else if (categoryValues === null) {
            console.log("Sorry no categoryValues");
        } else { //first click or different element
            stroke.transition().style("opacity", 0.2)
            fill.transition().style("opacity", 0.2);
            text.transition().style("opacity", 0.2);
            categoryValues.forEach(function (d, i) {
                var path = "path#" + d;
                var selectedfill = svg.selectAll(path);
                selectedfill.transition().style("opacity", 1);
                var get = "text#" + d;
                var selectedtext = svg.selectAll(get);
                selectedtext.transition().style("opacity", 1);
                if (selectedfill[0][1] !== undefined)
                    selectedfill[0][1].attributes.stroke.nodeValue = selectedfill[0][0].style.fill;
            });
        }
    }

    /*
     * counts element selected by category similar to setting.getInitData
     */
    function getInitData(allData, category, settings, categoryValues) {
        var array = [];
        settings.forEach(function (d) {
            var obj = {};
            obj[category] = d.replace(/[ .]/g, "_");;
            obj.count = 0;
            obj.selected = false;
            array.push(obj);
        });
        allData.forEach(function (d, i) {
            var compare = d.facets[category]
            array.forEach(function (e, i) {
                if (e[category] === compare) {
                    e.count++;
                }
            });
        });
        return array;
    }
    
    function appendContainer(base, svg, focus, dataSet, container) {
        base = d3.select(container);
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
    }
    
    function deleteElements() {
        //deletes elements if they exists
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