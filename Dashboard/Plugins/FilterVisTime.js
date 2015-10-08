(function(){
    var FilterVisTime = {};
    var DIVIDERHEIGHT = 6;
    var HEIGHT = 135;
    var scaleGlobal = [];
    var startGlobal = 0;
    var endGlobal = 0;
    var points = null;
    var afterInitCallback;
    var initializationFinished = false;
    var nonlinear = [false, false];
    var pseudolinear = [true, true];
    var onlylinear = [true, false];
    var width = 0;
    var height = 135;
    var mainframe = null;
    
	FilterVisTime.initialize = function(EEXCESSObj){
        var path = 'Plugins/FilterVisTimeCategoryPoints.js';
        
        if(initializationFinished)
           return;
           
        Modernizr.load({ test: path,
                         load : path,
                         complete: function(){ 
                             console.log("FilterVisTimeCategoryPoints load completed");
                             points = new FilterVisTimeCategoryPoints();
                             width = parseInt(d3.select("#eexcess-filtercontainer").style("width"));
                             initializationFinished = true;
                                   
                             if (afterInitCallback ){
                                 afterInitCallback();
                             }
                         }
         });
        
	};

    //FilterVisTime.draw = function (allData, selectedData, inputData, $container, category, categoryValues, fromYear, toYear, value) {
    FilterVisTime.draw = function (allData, inputData, $container, filters, settings) {
        if (!initializationFinished) {
            afterInitCallback = function () { FilterVisTime.draw(allData, inputData, $container, filters, settings); };
            return;
        }

        var fromYear = settings.minYear;
        var toYear = settings.maxYear;
        var selectedData = _(filters).map('dataWithinFilter');
        var currentMinYear = _.min(_(filters).map('from'));
        var currentMaxYear = _.max(_(filters).map('to'));
        var noTick = true;
        if ((currentMaxYear === currentMinYear) && fromYear ||
            (currentMaxYear - 1 === currentMinYear - 1) && toYear) {
            selectedData = getAllData(allData);
            fromYear = currentMinYear;
            toYear = currentMaxYear;
            noTick = false;
        }
        
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

            //  nonlinear or pseudolinear onlylinear
            var linear =  onlylinear

            var dataSet = points.getPointsTimeline([selectedData, allData], value, antagonist,
                HEIGHT - (HEIGHT / DIVIDERHEIGHT), width / 10,       // keep in mind start of line + ticks
                linear, width, HEIGHT, [fromYear, toYear]);
            if (dataSet === null)
                return;

            if ($vis.length === 0) {
                var base = d3.select($container.get(0));
                mainframe = base.append("div")
                    .attr("class", "FilterVisTime")
                    .attr('width', width)
                    .attr('height', dataSet.newSize + 6)
                    .style('padding', "3px 4px");
                svg = mainframe.append("svg")  //element to visualize timeline, maybe i need a second for extended x_Axis
                    .attr("class", "FilterVisTime_svg")
                    .attr("width", "100%")
                    .attr("height", dataSet.newSize + 6)
                    .attr("viewBox", "0 0 " + width + " " + dataSet.newSize + 3 + " ")
                    .attr("preserveAspectRatio", "xMinYMin meet");
                focus = svg.append("g")
                    .attr("class", "FilterVisTime_focus")
                    .attr("width", "100%")
                    .attr("height", dataSet.newSize + 6);
                generateTimeline(allData, dataSet, value, fromYear, toYear);
                interactTimelineTranslate(fromYear, toYear, mainframe, dataSet, noTick);
            } else {
                generateTimeline(allData, dataSet, value, fromYear, toYear);
                interactTimelineTranslate(fromYear, toYear, mainframe, dataSet, noTick);
            }
        }
    };

    /*
     * generates all basic container and svg elements, which are needed
     */
    function generateTimeline(allData, data, category, fromYear, toYear, noTick) {
        var dataSet = data;
        scaleGlobal = dataSet.scaleX;
        d3.select("FilterVisTime").attr('height', dataSet.newSize);
        var focus = d3.select(".FilterVisTime_focus");
        deleteElements();
        var svg = d3.select(".FilterVisTime_svg").attr('height', dataSet.newSize).attr("viewBox", "0 0 " + width + " " + dataSet.newSize + " ");
        svg.append("text")
            .attr("class", "text_x_axis_from")
            .attr("x", width / 25)
            .attr("y", dataSet.lines[dataSet.lines.length - 1][1] - ((dataSet.lines[0][1] - dataSet.lines[1][1]) / 2) + 3)
            .text(fromYear)
            .style("font-size", "0.9em");

        svg.append("text")
            .attr("class", "text_x_axis_to")
            .attr("x", width - width / 5)
            .attr("y", dataSet.lines[dataSet.lines.length - 1][1] - ((dataSet.lines[0][1] - dataSet.lines[1][1]) / 2) + 3)
            .text(toYear)
            .style("font-size", "0.9em");

        dataSet.lines.forEach(function (d, i) {
            focus.append("line")
                .attr("x1", d[0])
                .attr("y1", d[1])
                .attr("x2", d[2])
                .attr("y2", d[3])
                .attr("stroke-width", 1)
                .attr("stroke", "black");

            svg.append("text")
                .attr("class", "text_y_axis")
                .attr("x", d[0] - 15)
                .attr("y", d[1] - height * 0.075)
                .text(dataSet.scaleY[i])//[i])
                .style("font-size", "0.9em");
        });
        
        focus.append("g")
            .selectAll(".strokepoints")
            .data(dataSet.strokepoints)
            .enter().append("path")
            .attr("class", "strokepoints")
            .attr("d", function (d, i) { return d[0]; })
            .attr("id", function (d, i) { return "y" + d[1]; })
            .style({ 'stroke': 'black', 'fill': 'none', 'stroke-width': '1px' });

        var color = crawlColorArray();
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
    }
    
    function getAllData(allData) {
        var data = [];
        allData.forEach(function (d) {
            var obj = {
                id: d.id,
                title: d.title,
                uri: d.uri,
                language: d.facets.language,
                year: parseDate(d.facets.year),
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
     *  lookup table for specific rgb
     */
    function crawlColorArray() {
        var color = {};
        var legend = d3.select("#div-wrap-legends").selectAll("*");
        for (var i = 0; i < legend[0].length; i++) {
            var colo = legend[0][i].style.backgroundColor;
            if (colo) {
                color[legend[0][i - 1].textContent] = colo;
            }
        }
        
        return color;
    }

    /*
     * basic function that handles the different or same input years calls the function that calcs the differnet translation
     */
    function interactTimelineTranslate(fromYear, toYear, mainframe, dataSet, noTick) {
        var focu = mainframe.select(".FilterVisTime_focus");
        var translate = [];
        var scale = scaleGlobal;
        var start = 0, end = 0;
        if (focu === (null || undefined)) {
            console.log("Sorry, element not found");
        } else {// scale it first and then make a translation depending on move
            var scalehelp = 0;
            scale.forEach(function (d, i) {
                if (parseInt(d) >= fromYear || parseInt(d) <= toYear) {
                    if (scalehelp === 0) { start = i; }
                    translate.push(0);
                    scalehelp++;
                    end = i;
                }
            });
            startGlobal = start; endGlobal = end;
        }
        
        if (noTick)
            xAxisDenseFunction(mainframe, startGlobal, endGlobal, fromYear, toYear, dataSet);

        var text = d3.select(".FilterVisTime_svg");
        var fromtext = text.select(".text_x_axis_from");
        fromtext.text(fromYear);
        var totext = text.select(".text_x_axis_to");
        totext.text(toYear);
    }

	/*
     * generates a dictionary  year / coordinate
     */
    function generateDict(centre) {
        var dict = {};
        centre[0].forEach(function (d, a) {
            dict[d[4]] = d[0];
        });
        return dict;
    }

    /*
     * calculates the new translation points depending on the dense ticks
     */
    function calcTransitionPoints(coordinates, translate, fromYear, toYear, size, sizeStart, start, end, centre) {
        if (Object.keys(coordinates).length === 1) {
            var elementSize = size / (toYear - fromYear);
            var newPosition = elementSize * Math.abs(fromYear - scaleGlobal[start]);
            if (isNaN(newPosition) || newPosition === Infinity) {
                translate.forEach(function (d, i) {
                    translate[i] = 0;
                });
            } else {
                newPosition += sizeStart;
                translate[start] = newPosition - centre[scaleGlobal[start]];
            }
        } else {
            for (var i = start; i <= end; i++) {
                var diff = coordinates[scaleGlobal[i]] - centre[scaleGlobal[i]];
                isNaN(diff) ? translate[i] = 0 : translate[i] = diff;
            }
        }
    }

    /*
     * calculates and creates time dense function
     */
    function xAxisDenseFunction(mainframe, start, end, fromYear, toYear, data) {
        var focus = mainframe.select(".FilterVisTime_svg").select(".FilterVisTime_focus");
        var todelete = focus.selectAll('line#time-ticks');
        if (todelete !== null || todelete[0].length !== 0) { $(todelete[0]).remove(); }
        var coordinate = {};
        var array = calcTicks(start, end, fromYear, toYear);
        var line = data.lines[data.lines.length - 1];
        var divider = array[0].length;
        var length = (line[2] - line[0]) / (divider);
        array[0].forEach(function (d, i) {
            var end = false;
            var segmentStart = (length * i) + line[0];
            var segmentEnd = (length * (i + 1)) + line[0];
            if (i === (array[0].length - 1)) { end = true; }
            var xAxis = generateTicks(d, segmentStart, segmentEnd, line[1], focus, end);
            if (xAxis.length < 2) { coordinate[array[1][i]] = xAxis[0]; }
            else {
                coordinate[array[1][i]] = xAxis[0];
            }
        });
        if (start === end) {
            var xAxis = generateTicks((toYear - fromYear), line[0], line[2], line[1], focus, true, true);
            coordinate[array[1][0]] = xAxis[0];
        }
        coordinate[array[1][array[1].length - 1]] = line[2];
        return coordinate;
    }

    /*
     * appends the line/ticks on the bottom horicontal line
     *
     */
    function generateTicks(elements, segmentStartX, segmentEndX, lineY, focus, end, one) {
        var xAxis = [];
        var elementSize = (segmentEndX - segmentStartX) / elements;
        var x = 0, lengthTick = 0;
        for (var j = 0; j < elements; j++) {
            j === 0 ? lengthTick = 5 : lengthTick = 5;
            x = (elementSize * j) + segmentStartX;
            focus.append("line")
                .attr("x1", x)
                .attr("id", "time-ticks")
                .attr("y1", lineY + lengthTick)
                .attr("x2", x)
                .attr("y2", lineY - lengthTick)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

            if (lengthTick === 5) 
                xAxis.push(x); 
        }
        if (end === true) {
            focus.append("line")
                .attr("x1", segmentEndX)
                .attr("id", "time-ticks")
                .attr("y1", lineY + 5)
                .attr("x2", segmentEndX)
                .attr("y2", lineY - 5)
                .attr("stroke-width", 1)
                .attr("stroke", "black");
            xAxis.push(segmentEndX);
        }
        return xAxis;
    }

    /*
     * calculates the different years/ ticks between the array-elements from the global Y-SCALE
     */
     function calcTicks(start, end, fromYear, toYear) {
         var scale = scaleGlobal;
         var array = [];
         var year = [];
         for (var i = start; i < end; i++) {
             var difference = 0;
             if (i === start && i > 0) {
                 if (scale[i] > fromYear) {
                     difference = scale[i] - fromYear;
                     if (difference !== 0) { array.push(difference); }
                     year.push(fromYear.toString());
                 }
             }
             if (scale[i] >= fromYear && scale[i] <= toYear) {
                 difference = scale[i + 1] - scale[i];
                 array.push(difference);
                 year.push(scale[i]);
             }
             if ((i === (end - 1))) {
                 if (scale[i] < toYear) {
                     difference = toYear - scale[i + 1];
                     if (difference !== 0) { array.push(difference); year.push(scale[i + 1]); }
                     year.push(toYear.toString());
                 }
             }
         }
         return [array, year];
     }

    /*
     * deletes all element if vid.length is not null and there was selected a new category
     */
    function deleteElements(){
        var focus = d3.select(".FilterVisTime_focus");
        var svg = d3.select(".FilterVisTime_svg");
        var line = focus.selectAll('line');
        if (line !== null || line[0].length !== 0) { $(line[0]).remove(); }
        var text = svg.selectAll('text');
        if (text !== null || text[0].length !== 0) { $(text[0]).remove(); }
        var g = svg.selectAll('g').selectAll("path");
        if (g !== null || g[0].length !== 0) { $(g[0]).remove(); }
    }

	FilterVisTime.finalize = function(){
	};

	PluginHandler.registerFilterVisualisation(FilterVisTime, {
		'displayName' : 'FilterVisTime',
		'type' : 'time',
	});
})();
