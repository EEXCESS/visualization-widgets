(function(){
    var FilterVisTime = {};
    var HEIGHT = 135;
    var scaleGlobal = [];
    var points = null;
    var afterInitCallback;
    var initializationFinished = false;
    var OVERLAPPINGWIDTH = 6;
    var width = 0;
    var height = 135;
    var mainframe = null;
    var iconSize = 13;
    var drawRectangle = true;
    var ICON_EUROPEANA = "media/icons/Europeana-favicon.ico";
    var ICON_MENDELEY = "media/icons/mendeley-favicon.ico";
    var ICON_ZBW = "media/icons/ZBW-favicon.ico";
    var ICON_WISSENMEDIA = "media/icons/wissenmedia-favicon.ico";
    var ICON_KIM_COLLECT = "media/icons/KIM.Portal-favicon.ico";
    var ICON_UNKNOWN = "media/icons/help.png";
    var GREY_LINE_COLOR = "rgb(192,192,192)";
    var RECTANGLE_COLOR = "rgb(0,153,255)";
    
    FilterVisTime.initialize = function(EEXCESSObj){
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
                                        points = new FilterVisTimeCategoryPoints();
                                    }
                                    catch (e) {
                                        async_init_filter_vis_category_points();
                                        return;
                                    }
                                    width = parseInt(d3.select("#eexcess-filtercontainer").style("width")) + 4;
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

    FilterVisTime.draw = function (allData, inputData, $container, filters, settings) {
        if (!initializationFinished) {
            afterInitCallback = function () { FilterVisTime.draw(allData, inputData, $container, filters, settings); };
            return;
        }
        
        if (settings.textualFilterMode == 'textOnly'){
            FilterVisTime.drawText($container, filters);
            return;
        }
        
        var fromYear = settings.minYear;
        var toYear = settings.maxYear;
        var selectedData = underscore(filters).map('dataWithinFilter');
        selectedData.reverse();
        var currentMinYear = underscore.min(underscore([filters[filters.length -1]]).map('from'));
        var currentMaxYear = underscore.max(underscore([filters[filters.length -1]]).map('to'));
        var noTick = false;
        if ((currentMaxYear === currentMinYear) && fromYear ||
            (currentMaxYear === currentMinYear) && toYear) {
            selectedData = getAllData(allData, selectedData);
            fromYear = currentMinYear.toString();
            toYear = currentMaxYear.toString();
            noTick = true;
        }
        drawRectangle = true;
        if (currentMaxYear === parseInt(toYear) && currentMinYear === parseInt(fromYear))
            drawRectangle = false;
        var value = "";
        if (filters.length > 0)
            value = filters[0].timeCategory;

        var $vis = $container.find('.FilterVisTime');
        var svg = null;
        var focus = null;
        if (allData === (null || undefined)) {
            console.log("NO datas to draw");
        } else {
            var antagonist = "";
            value.localeCompare("provider") ? antagonist = "provider" : antagonist = "language";
            if (points === null)
                return;

            var paramYears = { 'fromYear': fromYear, 'toYear': toYear, 'currentMaxYear': currentMaxYear, 'currentMinYear': currentMinYear, }
            try {
                var dataSet = points.getPointsTimeline([selectedData, allData], value, antagonist,
                    HEIGHT * 0.834, width / 12, width, HEIGHT, paramYears);
            }
            catch(exception) {
                console.warn("Error on 'getPointsTimeline'. Apport drawing FilterVisTime");
                return;
            }
            if (dataSet === null)
                return;

            if ($vis.length === 0) {
                appendContainer($container.get(0), svg, focus, dataSet)
                generateTimeline(allData, dataSet, value, fromYear, toYear);
                appendTickNewYear(fromYear, toYear, mainframe, dataSet, noTick);
            } else {
                generateTimeline(allData, dataSet, value, fromYear, toYear);
                appendTickNewYear(fromYear, toYear, mainframe, dataSet, noTick);
            }
        }
        
        if (settings.textualFilterMode == 'textAndViz'){
            FilterVisTime.drawText($container, filters);
        }
    };

    FilterVisTime.drawText = function ($container, filters) {
        var $vis = $container.find('.TextVizTimeText');
        if ($vis.length == 0){
            $vis = $('<div class="TextVizTimeText" style="text-align:center;"></div>').css('padding-top', '10px').css('padding-bottom', '10px');		
            $container.append($vis);
        }

        $vis.html(filters[0].from + " - " + filters[0].to);
    };
    
    
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
    

    function appendContainer(container, svg, focus, dataSet) {
        var base = d3.select(container);
        mainframe = base.append("div")
            .attr("class", "FilterVisTime")
            .attr('width', width)
            .attr('height', dataSet.newSize + OVERLAPPINGWIDTH)
            .style('padding', "1px 1px");
        svg = mainframe.append("svg")  
            .attr("class", "FilterVisTime_svg")
            .attr("width", "100%")
            .attr("height", dataSet.newSize + OVERLAPPINGWIDTH)
            .attr("viewBox", "0 0 " + width + " " + dataSet.newSize + 3 + " ")
            .attr("preserveAspectRatio", "xMinYMin meet");
        focus = svg.append("g")
            .attr("class", "FilterVisTime_focus")
            .attr("width", "100%")
            .attr("height", dataSet.newSize + OVERLAPPINGWIDTH);
    }

    /*
     * generates all basic container and svg elements, which are needed
     */
    function generateTimeline(allData, data, category, fromYear, toYear) {
        var dataSet = data;
        scaleGlobal = dataSet.scaleX;
        deleteElements();
        d3.select("FilterVisTime").attr('height', dataSet.newSize);
        var focus = d3.select(".FilterVisTime_focus");
        var svg = d3.select(".FilterVisTime_svg").attr('height', dataSet.newSize + OVERLAPPINGWIDTH)
            .attr("viewBox", "0 0 " + width + " " + dataSet.newSize + OVERLAPPINGWIDTH + " ");
        svg.append("text")
            .attr("class", "text_x_axis_from")
            .attr("x", width / 25)
            .attr("y", dataSet.lines[dataSet.lines.length - 1][1] - ((dataSet.lines[0][1] - dataSet.lines[1][1]) / 2) + 3)
            .text(fromYear)
            .style("font-size", "0.9em");
        svg.append("text")
            .attr("class", "text_x_axis_to")
            .attr("x", width * 0.857)
            .attr("y", dataSet.lines[dataSet.lines.length - 1][1] - ((dataSet.lines[0][1] - dataSet.lines[1][1]) / 2) + 3)
            .text(toYear)
            .style("font-size", "0.9em");
        appendLines(svg, focus, category, dataSet);
        var color = crawlColorArray(allData, category);
        focus.append("g")
            .selectAll(".fillpoints")
            .data(dataSet.fillpoints)
            .enter().append("path")
            .attr("class", "fillpoints")
            .attr("d", function (d) { return d[0]; })
            .attr("id", function (d) { return "y" + d[3]; })
            .style({ 'stroke': 'none' })
            .style("fill", function (d) {
                var colour = d[2];
                return color[colour];
            });
        if (drawRectangle) {
            focus.append("rect")
                .attr("x", dataSet.rectangle.x)
                .attr("y", dataSet.rectangle.y)
                .attr("width", dataSet.rectangle.width)
                .attr("height", dataSet.rectangle.height)
                .style("fill", 'none')
                .style("stroke", RECTANGLE_COLOR);
        }
    }
    
    function appendLines(svg, focus, category, dataSet) {
        dataSet.lines.forEach(function (d, i) {
            focus.append("line")
                .attr("x1", d[0])
                .attr("y1", d[1])
                .attr("x2", d[2])
                .attr("y2", d[3])
                .attr("stroke-width", 1)
                .attr("stroke", function () { if (i !== dataSet.lines.length - 1) { return GREY_LINE_COLOR } else { return "black" } });
            if (category === "language" && (dataSet.lines.length - 1) > i) {
                svg.append("text")
                    .attr("class", "text_y_axis")
                    .attr("x", d[0] - 15)
                    .attr("y", d[1])
                    .text(function () { return dataSet.scaleY[i] === "unkown" ? "?" : dataSet.scaleY[i].slice(0, 2); })
                    .style("font-size", "0.8em");
            } else if (category === "provider" && (dataSet.lines.length - 1) > i) {
                svg.append("svg:image")
                    .attr('x', d[0] - 16)
                    .attr('y', d[1] - iconSize / 2)
                    .attr('width', iconSize)
                    .attr('height', iconSize)
                    .attr("xlink:href", getIcon(dataSet.scaleY[i]));
            }

        });
    }  

    /*
    * getter function for directory of icons
    */
    function getIcon(iconName) {
        var directory = "";
        switch (iconName) {
            case "Europeana":
                directory = ICON_EUROPEANA;
                break;
            case "mendeley":
            case "Mendeley":
                directory = ICON_MENDELEY;
                break;
            case "ZBW":
                directory = ICON_ZBW;
                break;
            case "wissenmedia":
            case "Wissenmedia":
                directory = ICON_WISSENMEDIA;
                break;
            case "KIM.Collect":
            case "KIMPortal":
                directory = ICON_KIM_COLLECT;
                break;
            default:
                directory = ICON_UNKNOWN;
        }
        return directory;
    }
    
    
    function getAllData(allData, selectedData) {
        var data = [];
        allData.forEach(function (d) {
            var year = new Date(getCorrectedYear(d.facets.year));
            var obj = {
                id: d.id,
                title: d.title,
                uri: d.uri,
                language: d.facets.language,
                year: year,
                provider: d.facets.provider,
                country: d.facets.country,
                keywords: d.facets.keywords,
                isHighlighted: d.isHighlighted
            };
            data.push(obj);
        });
        return [data];
    }

    /*
     *  crawler for colorcode of main-visualization to get specific rgb
     */
    function crawlColorArray(inputData, colorChannel) {
        var color = {};
       /* var legend = d3.select("#div-wrap-legends").selectAll("*");
        for (var i = 0; i < legend[0].length; i++) {
            var colo = legend[0][i].style.backgroundColor;
            if (colo) {
                color[legend[0][i - 1].textContent] = colo;
            }
        }*/
       //  var channel = "language";       
        colorChannel = colorChannel == "provider" ? "language" : "provider"; 
        var channelElements = [];
		for(var i=0; i < inputData.length; i++) {
			var element = inputData[i].facets[colorChannel]; 
			if(channelElements.indexOf(element) == -1) {
				channelElements.push(element); 
			} 
		}

       if (window.localStorageCustom !== undefined) {
			var tmpColors = JSON.parse(localStorageCustom.getItem(colorChannel+'-colors'));
			if(tmpColors == null) {
				return color;  
			}
			var color =  d3.scale.category10().domain(tmpColors);
			for(var i=0; i < channelElements.length; i++) {
				var index = tmpColors.indexOf(channelElements[i]); 
				if(index > -1) {
            		var name =  channelElements[i]; 
            		var c = color(channelElements[i]);
            		color[name] = c; 
				}
			}
		}
        return color;
    }

    /*
     * basic function that handles the different or same input years calls the function that calcs the differnet translation
     */
    function appendTickNewYear(fromYear, toYear, mainframe, dataSet, noTick) {
        var focu = mainframe.select(".FilterVisTime_focus");
        var line = dataSet.lines[dataSet.lines.length - 1];
        generateTicks(11, line[0], line[2], line[1], focu, true, true);
        var text = d3.select(".FilterVisTime_svg");
        var fromtext = text.select(".text_x_axis_from");
        fromtext.text(fromYear);
        var totext = text.select(".text_x_axis_to");
        totext.text(toYear);
    }

    /*
     * appends the line/ticks on the bottom horicontal line
     *
     */
    function generateTicks(elements, segmentStartX, segmentEndX, lineY, focus, end, one) {
        var elementSize = (segmentEndX - segmentStartX) / elements;
        var x = 0, lengthTick = 2.5;
        for (var j = 0; j < elements; j++) {
            x = (elementSize * j) + segmentStartX;
            focus.append("line")
                .attr("x1", x)
                .attr("id", "time-ticks")
                .attr("y1", lineY + lengthTick)
                .attr("x2", x)
                .attr("y2", lineY - lengthTick)
                .attr("stroke-width", 1)
                .attr("stroke", "black");
        }
        if (end === true) {
            focus.append("line")
                .attr("x1", segmentEndX)
                .attr("id", "time-ticks")
                .attr("y1", lineY + lengthTick)
                .attr("x2", segmentEndX)
                .attr("y2", lineY - lengthTick)
                .attr("stroke-width", 1)
                .attr("stroke", "black");
        }
    }
  

    /*
     * deletes all element if vid.length is not null and there was selected a new category
     */
    function deleteElements() {
        var focus = d3.select(".FilterVisTime_focus");
        var svg = d3.select(".FilterVisTime_svg");
        var line = focus.selectAll('line');
        if (line !== null || line[0].length !== 0) { $(line[0]).remove(); }
        var text = svg.selectAll('text');
        if (text !== null || text[0].length !== 0) { $(text[0]).remove(); }
        var g = svg.selectAll('g').selectAll("path");
        if (g !== null || g[0].length !== 0) { $(g[0]).remove(); }
        var image = svg.selectAll('image');
        if (image !== null || image[0].length !== 0) { $(image[0]).remove(); }
        var rect = focus.selectAll('rect')
        if (rect !== null || rect[0].length !== 0) { $(rect[0]).remove(); }

    }

	FilterVisTime.finalize = function(){
	};

	PluginHandler.registerFilterVisualisation(FilterVisTime, {
		'displayName' : 'FilterVisTime',
		'type' : 'time',
	});
})();
