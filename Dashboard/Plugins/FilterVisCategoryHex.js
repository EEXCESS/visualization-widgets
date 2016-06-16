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
                             
                            /*
                             * Workaround to prevent error in intialization (FilterVisTimeCategoryPoints is undefined) even if loaded
                             */
                            var max_tries_async_init_filter_vis_category_points = 10000;
                            var curr_tries_async_init_filter_vis_category_points = 0;
                            var async_init_filter_vis_category_points = function(){
                                window.setTimeout(function(){
                                    
                                    curr_tries_async_init_filter_vis_category_points++;
                                    if (curr_tries_async_init_filter_vis_category_points > max_tries_async_init_filter_vis_category_points) {
                                        console.error("Too much tries to load FilterVisTimeCategoryPoints. Apport");
                                        return;
                                    }
                                    
                                    console.log("FilterVisTimeCategoryPoints load completed");
                                    
                                    try {
                                        points = new FilterVisTimeCategoryPoints('minibarchart');
                                    }
                                    catch (e) {
                                        async_init_filter_vis_category_points();
                                        return;
                                    }
                                    width = parseInt(d3.select("#eexcess-filtercontainer").style("width"));
                                    initializationFinished = true;        
                                    if (afterInitCallback ){
                                        afterInitCallback();
                                    }
                                },0);
                            };

                            async_init_filter_vis_category_points();
                         }
                       });
    };
	
	FilterVisCategoryHex.getSelectedValuesFromData = function (inputData) {
		var categoryValues = [];
        categoryValues[0] = [];
        //adds selected category to be highlighted
        inputData.data.forEach(function(d){
            if (d.selected) {
                categoryValues[0].push(d.language);
            }
        });
		return categoryValues;
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
        
        if (settings.textualFilterMode == 'textOnly'){
            FilterVisCategoryHex.drawText($container, filters, inputData);
            return;
        }
        
        var base, svg, focus = null;
        //var categoryValues = underscore(filters).map('categoryValues');
        var categoryValues = FilterVisCategoryHex.getSelectedValuesFromData(inputData);
        var selectedData = underscore(filters).map('dataWithinFilter');
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
        
        if (settings.textualFilterMode == 'textAndViz'){
            FilterVisCategoryHex.drawText($container, filters, inputData);
        }
    };

    FilterVisCategoryHex.finalize = function(){
    };
    
    FilterVisCategoryHex.drawText = function ($container, filters, inputData){
        var $vis = $container.find('.FilterVisCategoryHexText');
        if ($vis.length == 0){
            $vis = $('<div class="FilterVisCategoryHexText" style="text-align: center;"></div>').css('padding-top', '10px').css('padding-bottom', '10px');		
            $container.append($vis);
        }

        var categoryValues = FilterVisCategoryHex.getSelectedValuesFromData(inputData);
        $vis.html(filters[0].category + ': ' + underscore(categoryValues).join(', '));
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
        var color = getColorOfMainVisualization(inputData);
        
        
        // If no colors appear, try to get it from WebGLVis, which may be active
        if (!color.length) {
            

            if (typeof(IQHN) !== "undefined") {

                /** @type {IQHN.RingRepresentation} **/
                var ringrep = IQHN.RingRepresentation.activeRepresentations[0];
                color = ringrep.getColorsOfRing(category);
            }
        }
        
        
        focus.append("g")
            .selectAll(".points_fill")
            .data(dataSet.points_fill)
            .enter().append("path")
            .attr("class", "points_fill")
            .attr("id", function (d, i) { if (d !== null) { return inputData[i][category].replace(/[ .]/g, "_") }; })
            .attr("d", function (d) { return d; })
            .style("fill", function (d, i) {
                var rgb = '';
                if (d !== null) {
                    color.forEach(function (f) {
                        if (f.name === inputData[i][category]) {
                            rgb = f.color;
                            return;
                        }
                    });
                }
                return rgb;
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
            .attr("x", function (d, i) { return (!isNaN(d.x) ? d.x : 0.0) - delta[i]; })
            .attr("y", function (d, i) { return (!isNaN(d.y) ? d.y : 0.0) + fontSize / 4; })
            .text(function (d, i) {
                var name = inputData[i][category];
                if (name.length >= 10) {
                    name = (name.substring(0, 10)) + "..";
                }
                return name;
            })
            .attr("font-family", "sans-serif")
            .style("font-size", fontSize)
            .attr("fill", "black");
    }

    /*
    * get colors from main visualization
    *
    */
    function getColorOfMainVisualization(inputData) {
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
            if (size >= 10) { size = 12 }
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
            categoryValues[0].forEach(function (d, i) {
                var name = d;
                name = name.replace(/[ .]/g, "_");
                var path = "path#" + name;
                var selectedfill = svg.selectAll(path);
                selectedfill.transition().style("opacity", 1);
                var get = "text#" + name;
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
            obj[category] = d;
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