
function Timeline( root, visTemplate ){
		
	/**
	 * Steps executed when the timeline is intialized
	 * 
	 * */
	var TIMEVIS = {};
	TIMEVIS.Settings = new Settings('timeline');

	var Vis = visTemplate;										// Allows calling template's public functions
	Geometry = new Geometry();									// Ancillary functions for drawing purposes
	
	var width, focusHeight, focusMargin, contextHeight, contextMargin, centerOffset, verticalOffset;
	var xAxisChannel, yAxisChannel, colorChannel, data, keywords;	// data retrieved from Input() function
	var x, x2, y, y2, color;										// scales
	var xAxis, yAxis, xAxis2, yAxis2;								// axis functions
	var chart, focus, context;										// main graphic components
	var circles, flagLines,textInCircles;											// circles selector and flag
	var zoom, brush;												// behaviors
	var leftHandle, rightHandle;									// brush handles
	var leftHandleImg  = "media/left-handle.png";
	var rightHandleImg = "media/right-handle.png";
	var legendDomain;												// legend domain = color domain + selected attribute
	var fullExtent, currentExtent;									// extents used mainly for zooming and brushing
	var keywordNodes, keywordNodeData, kwNodes = [];				// input dataset for keyword nodes
	var selectedId;
	var delay = 400;
    var keyForData, initData_, displayType;
	
	/**
	 *  Define line function to connect nodes in focus area
	 */						
	var lineFunction = d3.svg.line()
			        	.x(function(d) { return (x(d.xValue) + d.xOffset); })
			        	.y(function(d) { return (y(d.yValue) + d.yOffset); })
			        	.interpolate("monotone");
	
	
	var getLegendDomain = function(colorDomain){
		
		var legendDomain = [];
		
		colorDomain.forEach(function(c, i){
			legendDomain[i] = { 'item': c, 'selected': false };
		});
		return legendDomain;
	};
	
	
	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	TIMEVIS.Evt = {};


	/**
	 * Brush brushed and brushended
	 * */
	TIMEVIS.Evt.brushed = function() {
		var brushExtent = brush.extent();
		leftHandle.attr("x", x2(brushExtent[0]) - 12);
		rightHandle.attr("x", x2(brushExtent[1]) - 8);
		
		x.domain(brush.empty() ? x2.domain() : brushExtent);
		TIMEVIS.Render.redraw();

	};
	
	//experimental function
	TIMEVIS.Evt.filterListPerTime = function(minDateInYears, maxDateInYears){
		var indicesToHighlight = [];
		var dataToHighlight = [];
		var currentYear = 0;
		data.forEach(function(d, i){
			if(d.hasOwnProperty("year")){	
				currentYear = d.year.getFullYear();
				if(minDateInYears <= currentYear && currentYear <= maxDateInYears){
					indicesToHighlight.push(i);
					dataToHighlight.push(d);
				}
			}
		});
		FilterHandler.setCurrentFilterRange('time', dataToHighlight, minDateInYears, maxDateInYears, yAxisChannel);
        LoggingHandler.log({action: "Brush created", source: "Timeline", component: "Timeline", itemCountOld: data.length, itemCountNew: dataToHighlight.length, value: xAxisChannel + "=" + minDateInYears + "-" + maxDateInYears, nowCount: dataToHighlight.length });
	}
	
	TIMEVIS.Evt.brushended = function(){
	
		// update zoom after brushing
		var currentExtent = Math.abs(new Date(x.invert(width)) - new Date(x.invert(0)));	
		var scale = fullExtent / currentExtent;
		var tx = -1 * (x2(brush.extent()[0]) * scale);
		var ty = zoom.translate()[1];
		
		zoom.scale(scale);
		zoom.translate([tx, ty]);
		
		var correctedYear = brush.extent()[1];
		correctedYear === undefined ? correctedYear = x.invert(0).getFullYear() : correctedYear.getFullYear();		
		TIMEVIS.Evt.filterListPerTime(x.invert(0).getFullYear(), correctedYear.getFullYear());
	};
	

	
	
	/**
	 * Zoom zoomed
	 * */
	TIMEVIS.Evt.zooming = function(){
		
		// Define zoom settings
		var trans = zoom.translate();
		var scale = zoom.scale();
		
		tx = Math.min(0, Math.max(width * (1 - scale), trans[0]));
		ty = trans[1];
		
		zoom.translate([tx, ty]);
		
		// update brush extent
		var brushExtent = [x.invert(0), x.invert(width)];
		context.select(".brush").call(brush.extent(brushExtent));
		
		// update handles' position
		leftHandle.attr("x", x2(brushExtent[0]) - 12);
		rightHandle.attr("x", x2(brushExtent[1]) - 8);
	
		TIMEVIS.Render.redraw();
		
        zoomingDebounce();
	};
	TIMEVIS.Evt.zoomingEndDelay = function(){
		var brushExtent = [x.invert(0), x.invert(width)];
		TIMEVIS.Evt.filterListPerTime(brushExtent[0].getFullYear(),brushExtent[1].getFullYear());
	};
    var zoomingDebounce = underscore.debounce(TIMEVIS.Evt.zoomingEndDelay, 500);
	
	
	
	
	
	/**
	 * Node click handler
	 **/
	TIMEVIS.Evt.nodeClicked = function( d, index, sender ) {
        TIMEVIS.openDocument(d, index, sender);
        //TIMEVIS.highlightDocuments(d, index, sender);
    };
    
    TIMEVIS.openDocument = function( d, index, sender ) {
        LoggingHandler.documentWindowOpened();
        LoggingHandler.log({ action: "Item opened", source:"Timeline", itemId: d.id, itemTitle : d.title });
        var win = window.open(d.uri, '_blank');
        win.focus();
    };
    
    TIMEVIS.highlightDocuments = function( d, index, sender ) {        
	
		kwNodes = [];
		var links = [];
	
		// Remove existing lines, , kwNodes and text, and restore nodes
		TIMEVIS.Render.remove();
		
		// if the same node is selected twice and the lines were drawn in the previous run, then no lines are drawn in this run
		if(d.id == selectedId){
			selectedId = "undefined";
			flagLines = false;
			
			if( sender != Vis )
				Vis.ListItemSelected(d, index, true);	// if the method is invoked by Vis template
			
			return;
		}
		selectedId = d.id;

		// Set opacity and stroke to highlight selected node
		TIMEVIS.Render.highlightNodes( [index] );

		// highlight current datum on content list
		if( sender != Vis )
			Vis.ListItemSelected(d, index, true);
		
		/**
		 *  Draw lines linking nodes in focus area
		 */
		if(d.keywords.length == 0)
			return;
	
		flagLines = true;				// when set to true, it allows redrawing lines when brushing or zooming
	 	
		d.keywords.forEach(function(k, i){
		
			var source = { 'xValue': d[xAxisChannel], 'yValue': d[yAxisChannel], 'xOffset': 0, 'yOffset': 0 };
			var points = TIMEVIS.Internal.getKeywordNode(d, k, i);		
		
			kwNodes.push(points.target);
			links.push([source, points.midpoint, points.target]);
		});
		
		TIMEVIS.Render.DrawKeywordNodeAndLinks( links );
		
	};		// end nodeclick


	/** 
	 * Node mouseover handler
	 * */	
    var mouseOverTimestamp = null;
	TIMEVIS.Evt.nodeMouseOvered = function(d){
        
	   mouseOverTimestamp = new Date();
		//if(d.isHighlighted){
			currentExtent = Math.abs(new Date(x.invert(width)) - new Date(x.invert(0)));
		
			// node colored in red
            var circle = d3.select(this);
            if (circle.node().tagName != 'circle')
                circle = d3.select(this.parentNode).selectAll('circle'); // if mouse overed on the inner text
                
			circle
				.attr("r", function(d){ 
					var radius = Geometry.calculateRadius(fullExtent, currentExtent);
					if(d.isHighlighted)
						return parseFloat(radius) + 2;
					return parseFloat(radius) + 1;
				})
				.style("fill", "red")
				.style("stroke-width", "2.5px");					

			// Get current x/y values, then augment for the tooltip
			var xPosition = parseFloat(circle.attr("cx")) + 250;//45;
			var yPosition = parseFloat(circle.attr("cy")) + 120;//35;
	
			d3.select("#tooltip").remove();
		
			tooltip = d3.select( root ).append( "div" )
						.attr("id", "tooltip");
	
			tooltip.append("p")
			.attr("id", "value");
	
			// Show the toolxtip
			tooltip
				.style("left", xPosition + "px")
				.style("top", yPosition + "px")
				.style("opacity", 0.4)
				.transition()	// With this line the circles have black borders
				.style("opacity", 0.9)
				.duration(1000);				
	
			// Add text and link to the tooltip
			tooltip
				.select("#value")
				.html('<a target=\"_blank\" href=\"' + d.uri + '\">' + d.title + '</a><br/> <p>Year: ' + toYear(d.year) + "</p>");
		//}
	};


	/**
	 * 	Node mouseout handler
	 * */	
	TIMEVIS.Evt.nodeMouseOuted = function(d){
        
        var timeDourationMouseOver = (new Date().getTime() - mouseOverTimestamp.getTime()) / 1000;
	    mouseOverTimestamp = null;
        if (timeDourationMouseOver >= 0.5){
            LoggingHandler.log({action: 'Item inspected', duration: timeDourationMouseOver, source: "timeline", itemId: d.Id, itemTitle: d.title });
        }
       
		//if(d.isHighlighted){
			currentExtent = Math.abs(new Date(x.invert(width)) - new Date(x.invert(0)));
		
			// Restore node's fill to original color and radius
            var circle = d3.select(this);
            if (circle.node().tagName != 'circle')
                circle = d3.select(this.parentNode).selectAll('circle'); // if mouse overed on the inner text
                
			circle
				.attr("r", function(d){ 
					var radius = Geometry.calculateRadius(fullExtent, currentExtent);
					if(d.isHighlighted)
						return parseFloat(radius) + 1;
					return parseFloat(radius);
				})
				.style("fill", function(d){ return color(d[colorChannel]); })
				.style("stroke-width", "2px");
			
			//Hide tooltip
			tooltip.transition().duration(1500).style("opacity", 0);
	
			tooltip
				.transition()
				.remove()
				.duration(0).delay(1500);
		//}
	};
	
	
	/**
	 *	Keyword nodes' handlers
	 * */	
	TIMEVIS.Evt.kwnodeClicked = function(d){
		Vis.keywordSelected(d.title);
	};
	
	
	TIMEVIS.Evt.kwnodeMouseOvered = function(){
		//d3.select(this).select(".keywordDot").style("stroke", "red");
		d3.select(this).select(".keywordDot").style("fill", "red");
		d3.select(this).select(".shadow").style("stroke", "yellow");
		d3.select(this).select(".shadow").style("opacity", "0.3");
	};
	
	
	TIMEVIS.Evt.kwnodeMouseOuted = function(){
		//d3.select(this).select(".keywordDot").style("stroke", "none");
		d3.select(this).select(".keywordDot").style("fill", "blue");
		d3.select(this).select(".shadow").style("stroke", "#ddd");
		d3.select(this).select(".shadow").style("opacity", "0.7");
	};
	
	
	/**
	 *	Legend events' handlers
	 * */
	TIMEVIS.Evt.legendClicked = function( legendDatum, legendIndex ){
		
		/*var indicesToHighlight = [];
		var dataToHighlight = [];
		
		if( legendDatum.selected === false ){				
			data.forEach(function(d, i){
				if(d[colorChannel] === legendDatum.item){
					indicesToHighlight.push(i);
					dataToHighlight.push(d);
				}
			});
			
			legendDomain.forEach(function(l, i){
				l.selected = (i == legendIndex);
			});
		}
		else{
			legendDatum.selected = false;
		}
		
		TIMEVIS.Render.highlightNodes( indicesToHighlight, $(this).attr('class') );
		FilterHandler.setCurrentFilterCategories('category', dataToHighlight, colorChannel, [legendDatum.item]);
        LoggingHandler.log({action: "Legend clicked", source: "Timeline", component: "Timeline", itemCountOld: data.length, itemCountNew: dataToHighlight.length });
		
		if(legendDatum.selected === true){
			$(this).find('text').css('font-weight', 'bold');
		} else {
			FilterHandler.setCurrentFilterCategories('category', null, colorChannel, null);
		}
		
		d3.selectAll('.legend').select("div")
			.style("border", function(l, i){ if(i == legendIndex && legendDatum.selected) return "0.1em lime solid"; return "none"; }); */
		
	};
	
	
	TIMEVIS.Evt.legendMouseOvered = function(d){

		/* d3.select(this).select("div")
			.style("border", "0.1em yellow solid")
			.style("width", "1.4em")
			.style("height", "1.4em");
		
		d3.select(this).select("text")
			.style("font-size", "0.9em"); */
	};
	
	
	TIMEVIS.Evt.legendMouseOuted = function(d){
		
		/*d3.select(this).select("div")
			.style("border", function(){ if(d.selected) return "0.1em lime solid"; return "none"; })
			.style("width",  function(){ if(d.selected) return "1.4em"; return "1.5em"; })
			.style("height", function(){ if(d.selected) return "1.4em"; return "1.5em"; });
		
		d3.select(this).select("text")
			.style("font-size", "0.85em"); */
		
	};
	

	
	
	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	TIMEVIS.Internal = {};	
	
	
	
	TIMEVIS.Internal.getKeywordNode = function(d, k, i){
		
		var tGmtry = Geometry.getXandYOffset(x(d[xAxisChannel]), width, d, i);
	
		var t = { 
					'xValue'  : d[xAxisChannel], 
					'yValue'  : d[yAxisChannel],
					'xOffset' : tGmtry.xOffset, 
					'yOffset' : tGmtry.yOffset, 
					'factor'  : tGmtry.factor, 
					'title'   : k.term 
				};
		
		var mGmtry = Geometry.getMidPoint(tGmtry);
		
		var m = {
					'xValue'  : d[xAxisChannel], 
					'yValue'  : d[yAxisChannel],
					'xOffset' : mGmtry.xOffset, 
					'yOffset' : mGmtry.yOffset, 
					'factor'  : mGmtry.factor
				};
		
		return {'target': t, 'midpoint': m};
	};
	
	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	TIMEVIS.Render = {};
	
	
	
	/******************************************************************************************************************************
	* 
	* 	Draw function called from Vis-Template every time the visual channels or the data change
	*  
	*****************************************************************************************************************************/	
	
	TIMEVIS.Render.draw = function(initData, mapping, iWidth, iHeight){

		/******************************************************
		 * Define canvas dimensions
		 ******************************************************/
		
		TIMEVIS.Dimensions = TIMEVIS.Settings.getDimensions(root, iWidth, iHeight);
		width          = TIMEVIS.Dimensions.width;
		focusHeight    = TIMEVIS.Dimensions.focusHeight;
		focusMargin    = TIMEVIS.Dimensions.focusMargin;
		contextHeight  = TIMEVIS.Dimensions.contextHeight;
		contextMargin  = TIMEVIS.Dimensions.contextMargin;
		centerOffset   = TIMEVIS.Dimensions.centerOffset;
		verticalOffset = TIMEVIS.Dimensions.verticalOffset;
		
		
		/******************************************************
		 * Assign visual channels and processed data
		 ******************************************************/

        TIMEVIS.Input = TIMEVIS.Settings.getInitData(initData, mapping);
		xAxisChannel = TIMEVIS.Input.xAxisChannel;
		yAxisChannel = TIMEVIS.Input.yAxisChannel;
		colorChannel = TIMEVIS.Input.colorChannel;
		data 		 = TIMEVIS.Input.data;
		keywords	 = TIMEVIS.Input.keywords;
		initData_ = initData;

		//displayType = "piechart";

		selectedId = "undefined"; 
		flagLines = false;

		/******************************************************
		 *	Define scales
		 *****************************************************/ 
	
		// main X Axis
		x  = d3.time.scale()									
					.range([0, width])
					.domain(d3.extent(data, function(d){ return d[xAxisChannel]; })).nice(d3.time.year);
	
	
		// brush X Axis
		x2 = d3.time.scale()
					.range([0, width])
					.domain(x.domain());
	
		// main Y Axis
		y  = d3.scale.ordinal()
					.rangePoints([0, focusHeight], 1.8)
					.domain(data.map(function(d){ return d[yAxisChannel]; })); // maps to nominal values contained in d.topic
	
		
		// brush Y Axis
		y2 = d3.scale.ordinal()
					.rangePoints([0, contextHeight], 0.5)
					.domain(y.domain()); 			
		
		color = d3.scale.category10();		// selects a set of colors for the dots and legends
		
		TIMEVIS.Ext.colorScale = color;
		
		// Calculate full extent
		fullExtent = Math.abs(new Date(x2.invert(width)) - new Date(x2.invert(0)));


		/******************************************************
		 *	Define axis
		 *****************************************************/
		
		// main X Axis
		xAxis = d3.svg.axis().scale(x)
						.orient("bottom")
						.ticks(6)
						.tickFormat(d3.time.format("%Y"));
	
		// main Y Axis
		yAxis = d3.svg.axis().scale(y).orient("left");//.tickSize(-width, 0, 0);
	
		// brush X Axis
		xAxis2 = d3.svg.axis().scale(x2)
						.orient("bottom")
						.tickFormat(d3.time.format("%Y"));
	
		// brush Y Axis
		yAxis2 = d3.svg.axis().scale(y2).orient("left");
	
	
		/******************************************************
		 *	Define behaviors
		 *****************************************************/ 
	
		////	Brush
		 		
		brush = d3.svg.brush()
				.x(x2)
				.on("brush", TIMEVIS.Evt.brushed)
				.on("brushend", TIMEVIS.Evt.brushended);	
	
		////	Zoom
		zoom = d3.behavior.zoom()
				.x(x)
				.scaleExtent([1, 10])
				.on("zoom", TIMEVIS.Evt.zooming);
		
		// Call zoom
		zoom.x(x);
		
		/******************************************************
		*	Draw chart main components
		******************************************************/
	
		// Add svg main component
		var divchart = d3.select( root ).append( "div" )
			.attr("id", "div-chart");
	
		var svg = divchart.append("svg")
			.attr("class", "svg timeline")
			.attr("width", width + focusMargin.left + focusMargin.right)
			.attr("height", focusHeight + focusMargin.top + focusMargin.bottom);
            
	
		// Add focus and context g components
		focus = svg.append("g")
			.attr("class", "focus")
			.attr("transform", "translate(" + focusMargin.left + "," + focusMargin.top + ")")
			.call(zoom);
	
		context = svg.append("g")
			.attr("class", "context")
			.attr("transform", "translate(" + contextMargin.left + "," + contextMargin.top + ")");
	
	
		// Add clip-path (area where the chart is drawn)
		var clip = focus.append("defs").append("svg:clipPath")
			.attr("id", "clip")
			.attr("pointer-events", "all")
			.append("rect")
				.attr("x", -22)
				.attr("width", width + 44)
				.attr("y", -10)
				.attr("height", focusHeight + 10)
				.attr("pointer-events", "all");
	
		// "g" that contains zoomable/brushable elements
		chart = focus.append("g")
			.attr("id", "chart")
			.attr("clip-path", "url(#clip)")
			.attr("pointer-events", "all");
	
		// Add rectangle delimiting zooming area		
		chart.append("rect")
			.attr("class", "pane")
			.attr("x", -22)
			.attr("width", width + 44)
			.attr("height", focusHeight);
	
		/**
		 *	Draw axis in focus area
		 */

		// Add X Axis
		focus.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + focusHeight + ")")
		.call(xAxis)
		.append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text("Time");

		// Add Y Axis
		var y_axis = focus.append("g")					
						.attr("class", "y axis")
						.call(yAxis);
		
		//y_axis.selectAll(".tick").style("stroke-dasharray", ("3, 3"));
		
		y_axis
			.selectAll(".tick > text")
				.attr("transform", "rotate(-45)")
				//.attr("y", "4")
				.attr("dx", "-1.0em")
				.attr("dy", "-2.4em")
				.style("text-anchor", "middle");
		 
	
		/******************************************************
		 *	Draw in focus area
		 *****************************************************/
//----------------------------------------------------------------------------------------------------------------------

		var displayOptionsType = document.getElementsByName("displaytype");
		for (var count = 0; count < displayOptionsType.length; count++) {
			if (displayOptionsType[count].checked == true) {
				displayType = displayOptionsType[count].value;
			}
		}

        keyForData = mapping[1].facet;

        var dataDictWithTime = {};

        var tempData = data;
		if(displayType == "write image to activate"){ //****** in this if condition we create Image SLIDER and display must have value "image" to activate image SLIDER

			// added cx and cy to data element
			tempData.forEach(function(current){
				current.cx = x(current.year);
				current.cy = y(current[keyForData]);
				current.previewImage = findImage(initData_, current.id);
				if(current.previewImage == undefined)
					current.previewImage = "http://www.mydaymyplan.com//images/no-image-large.png";
			});

			currentExtent = Math.abs(new Date( x.invert(width)) - new Date(x.invert(0)) );

			tempData = TIMEVIS.Render.clusteringTimeline(currentExtent, tempData);

			var yearInString, currentKeyValue, currentOtherKeyValue;

			tempData.forEach(function(currentData){
				yearInString = currentData.cx.toString();
				currentKeyValue = currentData[keyForData];
				currentOtherKeyValue = currentData[colorChannel];

				if(dataDictWithTime.hasOwnProperty(currentKeyValue)){
					workInXAxis(dataDictWithTime, yearInString, currentKeyValue, currentOtherKeyValue);
				}
				else{
					dataDictWithTime[currentKeyValue] = {};
					workInXAxis(dataDictWithTime, yearInString, currentKeyValue, currentOtherKeyValue);
				}
			});

			var imgData = [];
			var allColorChannel = [];

			createImgData(imgData, allColorChannel, dataDictWithTime, tempData);

			var divElements = d3.select("#div-chart")
				.append("div")
				.attr("id", "div-elms");

			var divs = divElements.selectAll(".elements")
				.data(imgData)
				.enter()
				.append("div")
				.attr("class", "testing_imgs")
				.style("left", function(d, i){
					var xPos = parseFloat(x(d.cx)) + 330;
					return xPos + "px";
				})
				.style("top", function(d, i){
					var yPos = parseFloat(d.cy);
					return yPos + "px";
				})
				.html(function(d,j){
					var html_markers = "";
					var idGroup;
					if(d.numberOfElems > 1) {
						for (var i = 0; i < d.previewImgs.length; i++){
							html_markers += "<img src=\"" + d.previewImgs[i] + "\" id=\"" + d.ids[i] +"\"" + "\>";
							if(i == 0)
								idGroup = d.ids[i].substr(0, d.ids[i].length - (d.ids[i].length / 2));
						}

						return '<div class="wheelSlider" id="'+ j + '" style ="height: 80; width:42;">' + html_markers + '</div>';
						//return '<span class = "ay">GROUP</span>';
					}
					else
						return '<div class="oneImage"><img src="' + d.previewImgs[0] + '" id="' + d.ids[0] + '" height="28" width="28"></div>';
				})
                .on('click', function(d){
                    //console.log(d);
                });

			var namesclass = document.getElementsByClassName('wheelSlider');
			for(var i = 0; i < namesclass.length; i++){
				createWheelSlider(namesclass[i].id);
			}

		}
		else {

			// added cx and cy to data element
			tempData.forEach(function (current) {
				current.cx = x(current.year);
				current.cy = y(current[keyForData]);
			});


			//currentExtent = Math.abs(new Date(x.invert(width)) - new Date(x.invert(0))); // change the size of piechart on zoom
			currentExtent = 6361717553810; // variable to set the size of piechart

			tempData = TIMEVIS.Render.clusteringTimeline(currentExtent, tempData);

			var yearInString, currentKeyValue, currentOtherKeyValue;

			tempData.forEach(function (currentData) {
				yearInString = currentData.cx.toString();
				currentKeyValue = currentData[keyForData];
				currentOtherKeyValue = currentData[colorChannel];

				if (dataDictWithTime.hasOwnProperty(currentKeyValue)) {
					workInXAxis(dataDictWithTime, yearInString, currentKeyValue, currentOtherKeyValue);
				}
				else {
					dataDictWithTime[currentKeyValue] = {};
					workInXAxis(dataDictWithTime, yearInString, currentKeyValue, currentOtherKeyValue);
				}
			});

            var pieData = [];
            var allColorChannel = [];
            var nodeElems = [];
            var pieElems = [];

            createPieData(pieData, allColorChannel, dataDictWithTime);
			
            for(var i = 0; i < pieData.length; i++) {
                if((pieData[i].language.length == 1 && pieData[i].language[0].value == 1)
					|| (pieData[i].provider.length == 1 && pieData[i].provider[0].value == 1))
                    nodeElems.push(pieData[i]);
                else
                    pieElems.push(pieData[i]);
            }

            var piesData = chart.selectAll(".elements").data(pieElems);
            var nodesData = chart.selectAll(".elements").data(nodeElems);


            var pies = piesData.enter()
                .append("g")
                .attr("class", "pie");

            var nodes = nodesData.enter()
                .append("g")
                .attr("class", "node");

            var radius = Geometry.calculateRadius(fullExtent, currentExtent);

            var pie = d3.layout.pie().sort(null);

            var arc = d3.svg.arc()
                .innerRadius(1.25 * radius)
                .outerRadius(2.25 * radius);

            var svg = pies.append("svg")
                .attr("class", "svg_pie")
                .append("g")
                .attr("transform", function (d, i) {
                    return "translate(" + ((x(d.cx)) ) + "," + ((d.cy) ) + ")";
                });

            nodes.append("circle")
                .attr("class", "svg_dot")
                .attr("r", Geometry.calculateRadius(fullExtent, currentExtent))
                .attr("cx", function(d) { return x(d.cx); })
                .attr("cy", function(d) { return d.cy; })
                .attr("fill", function(d, i) { 
					if (typeof(d.language) == 'string') 
						return color(d.provider[0].label);
					else
						return color(d.language[0].label); 
					})
				.on('click', function(d){
					for(var i = 0; i < tempData.length; i++){

						if(x(d.cx).toFixed(3) == x(tempData[i].cx).toFixed(3) && (tempData[i].provider == d.provider || tempData[i].language == d.language))
						{
							TIMEVIS.Evt.nodeClicked(tempData[i]);
                            break;
						}

					}
				});

            var piePath = svg.selectAll("path")
                .data(function (d) {
                    var eachPieData = [];
                    d[colorChannel].forEach(function (langs) {
                        for (var j = 0; j < allColorChannel.length; j++) {
                            if (typeof eachPieData[j] == "undefined" || eachPieData[j] == 0) {
                                if (langs.label == allColorChannel[j]) {
                                    eachPieData[j] = (langs.value);
                                } else {
                                    eachPieData[j] = 0;
                                }
                            }
                        }
                    })
                    return pie(eachPieData);
                })
                .enter().append("path")
                .attr("fill", function (d, i) {
                    return color(allColorChannel[i]);
                })
                .attr("d", arc);

            pies.append("text")
                .attr("class", "number_of_elem")
                .attr("x", function (d, i) {
                    cx = d.cx;
                    return (x(cx) - 5);
                })
                .attr("y", function (d, i) {
                    return (d.cy + 3);
                })
                //.style("opacity", 0.3)
                .text(function (d) {
                    var numberWithSameTime = dataDictWithTime[d[keyForData]][d.cx.toString()]["total"];
                    if (numberWithSameTime > 1) {
                        return numberWithSameTime;
                    }
                    //count same node with same y-axis and time
                });

            //svgPie = chart.selectAll(".svg_pie");

            /*svgPie
                .on("click", TIMEVIS.Evt.nodeClicked)
                .on("mouseover", TIMEVIS.Evt.nodeMouseOvered)
                .on("mouseout", TIMEVIS.Evt.nodeMouseOuted);
            */
        }





// ----------------------------------------------------------------------------------------------------------------------
		 
	
		// Add keyword nodes
	
		keywordNodes = chart.selectAll(".keywordNode");
		keywordNodeData = keywordNodes.data(kwNodes);
	
		
		/******************************************************
		 *	Legends
		 *****************************************************/	
		
		legendDomain = getLegendDomain(color.domain());
		
		
		var legendWrapper = d3.select("#div-chart")
						.append("div")
						.attr("id", "div-wrap-legends");
		
		legend = legendWrapper.selectAll(".legend")
			.data(legendDomain)
			.enter()
			.append("div")
				.attr("class", "legend")
				.attr("transform", function(d, i) { return "translate(40," + (i+1)*20 + ")"; })
				.on( "click", TIMEVIS.Evt.legendClicked )
				.on( "mouseover", TIMEVIS.Evt.legendMouseOvered )
				.on( "mouseout", TIMEVIS.Evt.legendMouseOuted );
		
		legend.append("div")
			.attr("x", width + 126)
			.attr("title", function(d){ return d.item; })
			.style("background", function(d){ return color(d.item); });
		
		legend.append("text")
			.attr("x", width +120)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) {  
				var threshold = 10; 
				var item = d.item; 
				if(item.length > threshold) {
					return item.substr(0, threshold-3) + "..."; 
				}
				return item; 
			}).attr("title", function(d){ return d.item; });

	
		/******************************************************
		 *	Draw in context area (brush)
		 *****************************************************/		

		// Draw X Axis in context area
		context.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + contextHeight + ")")
			.call(xAxis2);

		
		// Draw small nodes
		var smallNodes = context.append("g");

		smallNodes.selectAll(".mindot")
			.data(data)
			.enter()
			.append("circle")
				.attr("class", "mindot")	// With this line the circles have black borders
				.attr("r", 3)
				.attr("cx", function(d) { return x2(d[xAxisChannel]); })
				.attr("cy", function(d) { return y2(d[yAxisChannel]); })
				.attr("fill", function(d) { return color(d[colorChannel]); })
				.style("stroke-width", "1px");
		
		
		// Draw left and right handles for brush
		leftHandle = context.append("image")
			.attr("width", 20)
			.attr("height",contextHeight + 10)
			.attr("x", x2(x2.domain()[0]) - 12)
			.attr("y", -7)
			.attr("xlink:href", leftHandleImg);

		rightHandle = context.append("image")
			.attr("width", 20)
			.attr("height", contextHeight + 10)
			.attr("x", x2(x2.domain()[1]) - 8)
			.attr("y", -7)
			.attr("xlink:href", rightHandleImg);
		
		// Draw brush	
		context.append("g")
			.attr("class", "x brush")
			.call(brush)
				.selectAll("rect")
				.attr("y", -2)
				.attr("height", contextHeight + 0);

		// Set brush's initial extension	
		var brushExtent = [x.invert(0), x.invert(width)];
		context.select(".brush").call(brush.extent(brushExtent));
		
	};	// end Render.draw

    // function for editing Data with Time
    var workInXAxis = function(dataValue, dateString, key, otherKey){

        if(dataValue[key].hasOwnProperty(dateString)){

            if(dataValue[key][dateString].hasOwnProperty("total")){
                dataValue[key][dateString]["total"] += 1;
            }
            else{
                dataValue[key][dateString]["total"] = 1;
            }

            if(dataValue[key][dateString].hasOwnProperty(otherKey)){
                dataValue[key][dateString][otherKey] += 1;
            }
            else{
                dataValue[key][dateString][otherKey] = 1;
            }
        }
        else{
            dataValue[key][dateString] = {};
            dataValue[key][dateString]["total"] = 1;
            dataValue[key][dateString][otherKey] = 1;
        }
    }

    // function to create PieData
    var createPieData = function(pieData, allColorChannel, dataDictWithTime){

        var n = 0;
        for(var i in dataDictWithTime){

            for (var j in dataDictWithTime[i]){

                pieData[n] = {};
                pieData[n].cx = new Date(j);
                pieData[n].cy = y(i);
                pieData[n][keyForData] = i;
                pieData[n][colorChannel] =[];
                function obj(lab, val){
                    this.label = lab;
                    this.value = val;
                }
                for(var m in dataDictWithTime[i][j]){

                    if(m != "total"){
                        var a = new obj;
                        a["label"] = m;
                        a["value"] = dataDictWithTime[i][j][m];
                        pieData[n][colorChannel].push(a);
                        if(allColorChannel.indexOf(m) == -1){
                            allColorChannel.push(m);
                        }
                    }
                }
                n++;
            }
        }
    }

	// function to create Data for Images
	var createImgData = function(imgData, allColorChannel, dataDictWithTime, tempData){

		var n = 0;
		for(var i in dataDictWithTime){
			for (var j in dataDictWithTime[i]){
				var yearInString = j.toString();
				imgData[n] = {};
				imgData[n].cx = new Date(j);
				imgData[n].cy = y(i);
				imgData[n].previewImgs = [];
				imgData[n].ids = [];
				imgData[n].numberOfElems = 0;
				imgData[n][keyForData] = i;
				if(imgData[n].hasOwnProperty(yearInString)){
					for(var count = 0; count < tempData.length; count++){
						if ((tempData[count].cx.toString() == j.toString()) && (tempData[count].provider.toString() == i.toString())){
							imgData[n].previewImgs.push(tempData[count].previewImage);
							imgData[n].ids.push(tempData[count].id);
							imgData[n].numberOfElems += 1;
						}
					}
				}
				else{
					imgData[n][yearInString] = {};
					for(var count = 0; count < tempData.length; count++){
						if ((tempData[count].cx.toString() == j.toString()) && (tempData[count].provider.toString() == i.toString())){
							imgData[n].previewImgs.push(tempData[count].previewImage);
							imgData[n].ids.push(tempData[count].id);
							imgData[n].numberOfElems += 1;
						}
					}
				}
				n++;
			}
		}
	}

	// function to find Image by ID
	var findImage = function(data, id){

		for(var i = 0;  i < data.length; i++){

			if (data[i].id == id && data[i].previewImage != undefined) {
				return data[i].previewImage;
			}
		}

	};

    /******************************************************************************************************************
     *
     *	Clustering
     *  -- function which cluster overlapped circles and displays 'em all in average Value of these coupled circles
     * ***************************************************************************************************************/

    TIMEVIS.Render.clusteringTimeline = function(current_extent, currentData){

        var radius = Geometry.calculateRadius(fullExtent, current_extent);

        //used great firstBy mini library
        firstBy = (function() {
            /* mixin for the `thenBy` property */
            function extend(f) {
                f.thenBy = tb;
                return f;
            }
            /* adds a secondary compare function to the target function (`this` context)
             which is applied in case the first one returns 0 (equal)
             returns a new compare function, which has a `thenBy` method as well */
            function tb(y) {
                var x = this;
                return extend(function(a, b) {
                    return x(a,b) || y(a,b);
                });
            }
            return extend;
        })();

        currentData.sort(
            firstBy(function (v1, v2) { return v1.cy - v2.cy; })
                .thenBy(function (v1, v2) { return v1.cx - v2.cx; })
        );


        for(var countOne = 0; countOne < currentData.length; countOne++){
            var posOverlapping = [];
            if(countOne == (currentData.length-1)){
                posOverlapping.push(countOne);
                var midValue = currentData[(currentData.length-1)].cx;
            }else{
                var helpCount = countOne;
                var sumValue = currentData[countOne].cx;
                var n = 1;
                var midValue = 0;
                posOverlapping.push(countOne);
                for( var countTwo = countOne + 1; countTwo < currentData.length; countTwo++){
                    if(((((currentData[helpCount].cx) + 3.5 * (radius + 1)) >= currentData[countTwo].cx) && (((currentData[helpCount].cx) - 3.5 * (radius + 1)) <= currentData[countTwo].cx)) //3*r because of pieChart, and +1 because of hoover
                        && (currentData[helpCount].cy == currentData[countTwo].cy)){
                        helpCount = countTwo;
                        sumValue += currentData[countTwo].cx;
                        posOverlapping.push(countTwo);
                        n++;
                    }
                }
                midValue = sumValue/n;
                countOne = helpCount;
            }

            for(var countPos = 0; countPos < (posOverlapping.length); countPos++){
                currentData[posOverlapping[countPos]].cx = x.invert(midValue);//midValue
            }
        }

        return currentData;
    };

	/*****************************************************************************************************************
	* 
	*	Method called when a node is clicked. Displays a small green node for each keyword related to the node item,
	*	the links connecting them and te corresponding text
	*
	* ****************************************************************************************************************/
	TIMEVIS.Render.DrawKeywordNodeAndLinks = function( links ){
	
		links.forEach(function(points) { 
	
			chart.append("g")
				.attr("class", "keywordLink")
				.append("path")
					.datum(points)
					.attr("class", "link")					
					.attr("d", lineFunction(points))
					.attr("transform", "translate("+(kwNodes[0].factor * -10)+")")	// animation for keyword lines
					.transition()
					.ease("linear")
					.duration(delay)
					.attr("transform", "translate(0)");
		});

		// 	Add keyword nodes	
		keywordNodeData = keywordNodes.data(kwNodes);

		var gKeyword = keywordNodeData
			.enter()
			.append("g")
				.attr("class", "keywordNode")
				.attr("id", function(d,i){ return "keywordNode_"+i; })
				.attr("dx", function(d) { return x(d.xValue) + d.xOffset; })
				.attr("dy", function(d) { return y(d.yValue) + d.yOffset; })
				.on("click", TIMEVIS.Evt.kwnodeClicked)
				.on("mouseover", TIMEVIS.Evt.kwnodeMouseOvered)
				.on("mouseout", TIMEVIS.Evt.kwnodeMouseOuted);

		// Append circles to keywordNodes
		gKeyword
			.append("circle")
				.attr("class", "keywordDot")
				.transition()
				.attr("r", "4")		
				.attr("cx", function(d) { return x(d.xValue) + d.xOffset; })
				.attr("cy", function(d) { return y(d.yValue) + d.yOffset; })
				.duration(0).delay(delay + 50);

	
		setTimeout(function(){
			// Append text to keywordNodes
			gKeyword
			.append("text")
				.text(function(d) { return d.title; })
				.attr("class", "shadow")
				.attr("x", function(d, i) { return x(d.xValue) + d.xOffset + Geometry.getTextXoffset(d, i); })	// function getTextXoffset() in geometry.js 
				.attr("y", function(d, i) { return y(d.yValue) + d.yOffset + Geometry.getTextYoffset(d, i, kwNodes.length); });	// function getTextYoffset() in geometry.js
		
			gKeyword
				.append("text")
					.text(function(d) { return d.title; })
					.attr("class", "node_text")
					.attr("x", function(d, i) { return x(d.xValue) + d.xOffset + Geometry.getTextXoffset(d, i); })	// function getTextXoffset() in geometry.js 
					.attr("y", function(d, i) { return y(d.yValue) + d.yOffset + Geometry.getTextYoffset(d, i, kwNodes.length); });	// function getTextYoffset() in geometry.js
		
		}, delay + 100);
	};
	
	
	
	
	/******************************************************************************************************************
	* 
	*	Redraw nodes, lines and main x axis
	* 
	* ***************************************************************************************************************/
	TIMEVIS.Render.redraw = function(){

        chart.selectAll(".pie").remove();
        chart.selectAll(".node").remove();
        var dataDictWithTime = {};
        var tempData = data;


		if(displayType == "write image to activate"){ //****** in this if condition we create Image SLIDER and display must have value "image" to activate image SLIDER

			d3.selectAll("#div-elms").remove();

			// added cx and cy to data element
			tempData.forEach(function(current){
				current.cx = x(current.year);
				current.cy = y(current[keyForData]);
				current.previewImage = findImage(initData_, current.id);
				if(current.previewImage == undefined)
					current.previewImage = "http://www.mydaymyplan.com//images/no-image-large.png";
			});

			tempData = TIMEVIS.Render.clusteringTimeline(currentExtent, tempData);

			var yearInString, currentKeyValue, currentOtherKeyValue;

			tempData.forEach(function(currentData){
				yearInString = currentData.cx.toString();
				currentKeyValue = currentData[keyForData];
				currentOtherKeyValue = currentData[colorChannel];

				if(dataDictWithTime.hasOwnProperty(currentKeyValue)){
					workInXAxis(dataDictWithTime, yearInString, currentKeyValue, currentOtherKeyValue);
				}
				else{
					dataDictWithTime[currentKeyValue] = {};
					workInXAxis(dataDictWithTime, yearInString, currentKeyValue, currentOtherKeyValue);
				}
			});

            var imgData = [];
            var allColorChannel = [];

            createImgData(imgData, allColorChannel, dataDictWithTime, tempData);

            var divElements = d3.select("#div-chart")
                .append("div")
                .attr("id", "div-elms");

            var divs = divElements.selectAll(".elements")
                .data(imgData)
                .enter()
                .append("div")
                .attr("class", "testing_imgs")
                .style("left", function(d, i){
                    var xPos = parseFloat(x(d.cx)) + 330;
                    return xPos + "px";
                })
                .style("top", function(d, i){
                    var yPos = parseFloat(d.cy);
                    return yPos + "px";
                })
                .html(function(d,j){
                    var html_markers = "";
                    var idGroup;
                    if(d.numberOfElems > 1) {
                        for (var i = 0; i < d.previewImgs.length; i++){
                            html_markers += "<img src=\"" + d.previewImgs[i] + "\" id=\"" + d.ids[i] +"\"" + "\>";
                            if(i == 0)
                                idGroup = d.ids[i].substr(0, d.ids[i].length - (d.ids[i].length / 2));
                        }

                        return '<div class="wheelSlider" id="'+ j + '" style ="height: 80; width:42;">' + html_markers + '</div>';
                        //return '<span class = "ay">GROUP</span>';
                    }
                    else
                        return '<div class="oneImage"><img src="' + d.previewImgs[0] + '" id="' + d.ids[0] + '" height="28" width="28"></div>';
                })
                .on('click', function(d){
                    console.log(d);
                });


            var namesclass = document.getElementsByClassName('wheelSlider');
            console.log(namesclass);

            for(var i = 0; i < namesclass.length; i++){
                createWheelSlider(namesclass[i].id);
            }
		}
		else {

            tempData.forEach(function (current) {
                current.cx = x(current.year);
                current.cy = y(current[keyForData]);
            });

            //currentExtent = Math.abs(new Date(x.invert(width)) - new Date(x.invert(0))); // change the size of piechart on zoom
			currentExtent = 6361717553810; // variable to set the size of piechart

            tempData = TIMEVIS.Render.clusteringTimeline(currentExtent, tempData);

            var yearInString, currentKeyValue, currentOtherKeyValue;

            tempData.forEach(function (currentData) {
                yearInString = currentData.cx.toString();
                currentKeyValue = currentData[keyForData];
                currentOtherKeyValue = currentData[colorChannel];

                if (dataDictWithTime.hasOwnProperty(currentKeyValue)) {
                    workInXAxis(dataDictWithTime, yearInString, currentKeyValue, currentOtherKeyValue);
                }
                else {
                    dataDictWithTime[currentKeyValue] = {};
                    workInXAxis(dataDictWithTime, yearInString, currentKeyValue, currentOtherKeyValue);
                }
            });

            var pieData = [];
            var allColorChannel = [];
            var nodeElems = [];
            var pieElems = [];

            createPieData(pieData, allColorChannel, dataDictWithTime);
			
			for(var i = 0; i < pieData.length; i++) {
                if((pieData[i].language.length == 1 && pieData[i].language[0].value == 1)
					|| (pieData[i].provider.length == 1 && pieData[i].provider[0].value == 1))
                    nodeElems.push(pieData[i]);
                else
                    pieElems.push(pieData[i]);
            }

            var piesData = chart.selectAll(".elements").data(pieElems);
            var nodesData = chart.selectAll(".elements").data(nodeElems);


            var pies = piesData.enter()
                .append("g")
                .attr("class", "pie");

            var nodes = nodesData.enter()
                .append("g")
                .attr("class", "node");

            var radius = Geometry.calculateRadius(fullExtent, currentExtent);

            var pie = d3.layout.pie().sort(null);

            var arc = d3.svg.arc()
                .innerRadius(1.25 * radius)
                .outerRadius(2.25 * radius);

            var svg = pies.append("svg")
                .attr("class", "svg_pie")
                .append("g")
                .attr("transform", function (d, i) {
                    return "translate(" + ((x(d.cx)) ) + "," + ((d.cy) ) + ")";
                });

			nodes.append("circle")
                .attr("class", "svg_dot")
                .attr("r", Geometry.calculateRadius(fullExtent, currentExtent))
                .attr("cx", function(d) { return x(d.cx); })
                .attr("cy", function(d) { return d.cy; })
                .attr("fill", function(d, i) { 
					if (typeof(d.language) == 'string') 
						return color(d.provider[0].label);
					else
						return color(d.language[0].label); 
					})
                .on("click", function(d){
                    for(var i = 0; i < tempData.length; i++){

                        if(x(d.cx).toFixed(3) == x(tempData[i].cx).toFixed(3) && (tempData[i].provider == d.provider || tempData[i].language == d.language))
                        {
                            TIMEVIS.Evt.nodeClicked(tempData[i]);
                            break;
                        }

                    }
                });

            var piePath = svg.selectAll("path")
                .data(function (d) {
                    var eachPieData = [];
                    d[colorChannel].forEach(function (langs) {
                        for (var j = 0; j < allColorChannel.length; j++) {
                            if (typeof eachPieData[j] == "undefined" || eachPieData[j] == 0) {
                                if (langs.label == allColorChannel[j]) {
                                    eachPieData[j] = (langs.value);
                                } else {
                                    eachPieData[j] = 0;
                                }
                            }
                        }
                    })
                    return pie(eachPieData);
                })
                .enter().append("path")
                .attr("fill", function (d, i) {
                    return color(allColorChannel[i]);
                })
                .attr("d", arc);

            pies.append("text")
                .attr("class", "number_of_elem")
                .attr("x", function (d, i) {
                    cx = d.cx;
                    return (x(cx) - 5);
                })
                .attr("y", function (d, i) {
                    return (d.cy + 3);
                })
                //.style("opacity", 0.3)
                .text(function (d) {
                    var numberWithSameTime = dataDictWithTime[d[keyForData]][d.cx.toString()]["total"];
                    if (numberWithSameTime > 1) {
                        return numberWithSameTime;
                    }
                    //count same node with same y-axis and time
                });
		}


		
		// update x axis
		focus.select(".x.axis").call(xAxis);

		// if lines are already drawn, redraw them
		if(flagLines){
  		
			chart.selectAll(".link").attr("d", lineFunction);
  				
			// redraw keyword nodes
			chart.selectAll(".keywordDot")
				.attr("r", "4")		
				.attr("cx", function(d) { return x(d.xValue) + d.xOffset; })
				.attr("cy", function(d) { return y(d.yValue) + d.yOffset; })
				.attr("fill", "blue");
		
			// redraw text and shadow for keyword nodes
			chart.selectAll(".shadow")	
				.attr("x", function(d, i) { return x(d.xValue) + d.xOffset + Geometry.getTextXoffset(d, i); })
				.attr("y", function(d, i) { return y(d.yValue) + d.yOffset + Geometry.getTextYoffset(d, i, kwNodes.length); });			
			
			chart.selectAll(".node_text")	
			.attr("x", function(d, i) { return x(d.xValue) + d.xOffset + Geometry.getTextXoffset(d, i); })
			.attr("y", function(d, i) { return y(d.yValue) + d.yOffset + Geometry.getTextYoffset(d, i, kwNodes.length); });
		}  
	};

	
	
	/******************************************************************************************************************
	* 
	*	Reset chart's elements
	* 
	* ***************************************************************************************************************/  
	TIMEVIS.Render.reset = function(){
	
		// reset zoom
		zoom.scale(1);
		zoom.translate([0, 0]);
	
		// remove lines, refdots and text, and restore dots appearance
		TIMEVIS.Render.remove();
	
		// restore x scale domain
		x.domain(x2.domain());
	
		//reset brush
		var brushExtent = [x.invert(0), x.invert(width)];
		context.select(".brush").call(brush.extent(brushExtent));
		
		// reset brush handles' position
		leftHandle.attr("x", x2(x2.domain()[0]) - 12);
		rightHandle.attr("x", x2(x2.domain()[1]) - 8);

		flagLines = false;

	};
	

	
	
	/*****************************************************************************************************************
	* 
	*	Remove links, keyword nodes and restore main nodes' style
	*
	* **************************************************************************************************************/
		
	TIMEVIS.Render.remove = function(){
			
		chart.selectAll(".keywordLink").remove();
		chart.selectAll(".link").remove();
		chart.selectAll(".keywordNode").empty();
		chart.selectAll(".keywordNode").remove();
		//chart.selectAll(".keywordDot").remove();
		chart.selectAll(".text").remove();
		
		keywordNodeData.exit().remove();
		
		currentExtent = Math.abs(new Date(x.invert(width)) - new Date(x.invert(0)));
			
		/*circles
			.attr("r", Geometry.calculateRadius(fullExtent, currentExtent))
			.style("stroke", "darkgrey")
			.style("opacity", "1");
	
		textInCircles
			.style("opacity", "1");
			
		data.forEach(function(d){ d.isHighlighted = false; });
			
		$('.legend').find('text').css('font-weight', 'normal');
		d3.select('.legend').select("div").style("border", "none")*/
	};
		
		
		
	/******************************************************************************************************************
	* 
	*	Nodes can be highlighted from the Vis-Template though the following function
	* 
	* ***************************************************************************************************************/
		
	TIMEVIS.Render.highlightNodes = function( nodesToHighlight, sender ){

        TIMEVIS.Render.remove();

        var radius = Geometry.calculateRadius(fullExtent, currentExtent);

		// if length > 0 there are nodes to highlight, otherwise tag box is empty and no node should be highlighted
		if(nodesToHighlight.length > 0) {

	
			circles
				.attr("r", function(d, i){
					if(nodesToHighlight.indexOf(i) != -1){
						d.isHighlighted = true;
						return parseFloat(radius) + 1;
					}
					d.isHighlighted = false;
					return radius;
				})
				.style("stroke", function(d, i){
					if(nodesToHighlight.indexOf(i) != -1)
						return "black";
					return "darkgrey";
				})
				.style("opacity", function(d, i){
					if(nodesToHighlight.indexOf(i) != -1)
						return 1;
					return 0.1;
				});
				
			textInCircles
				.style("opacity", function(d, i){
					if(nodesToHighlight.indexOf(i) != -1)
						return 1;
					return 0.1;
				});
				
		}
        else{

            circles
                .attr("r", radius)
                .style("stroke", "darkgrey")
                .style("opacity", 1);
				
			textInCircles	
				.style("opacity", 1);
        }

		if(sender !== 'legend')
			this.clearLegends();
	};
		
		
		
	TIMEVIS.Render.clearLegends = function(){
			
		legendDomain.forEach(function(l){
			l.selected = false;
		});
		
		$('.legend').find('text').css('font-weight', 'normal');
		d3.selectAll('.legend').select("div").style("border", "none");
	};
	
	
	
	
	/******************************************************************************************************************
	* 
	*	Nodes can be selected from the Vis-Template by indicating a single index or an array of indices
	* 
	* *****************************************************************************************************************/

	TIMEVIS.Render.selectNodes = function( nodesIndices, sender ){
		
		if( Array.isArray(nodesIndices) ){
			TIMEVIS.Render.highlightNodes( nodesIndices );
		}
		else if( typeof nodesIndices != 'undefined' && nodesIndices != 'undefined' ){
			var index = nodesIndices;
			var datum = TIMEVIS.Input.data[index];
		
			TIMEVIS.Evt.nodeClicked(datum, index, sender);
		}	
	};
		
		

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    TIMEVIS.Ext = {

        draw: function (initData, mapping, iWidth, iHeight) {
            TIMEVIS.Render.draw(initData, mapping, iWidth, iHeight);
        },

        reset: function () {
            TIMEVIS.Render.reset();
            TIMEVIS.Render.redraw();
        },
        
        resetFilter: function () {
            TIMEVIS.Ext.reset();
        },
        
        selectNodes: function (indicesToHighlight, sender) {
            TIMEVIS.Render.selectNodes(indicesToHighlight, sender);
        }
    };

	
	return TIMEVIS.Ext;
	
}

var createWheelSlider = function(id){
	var id_ = "#" + id;
	checkWheel = $(id_).waterwheelCarousel({
		flankingItems: 1,
		horizon: 15,
		//imageNav: false,
		orientation: "vertically",
		separation: 25,
		opacityMultiplier: 1,
		speed: 1,
		movedToCenter: function(e){
			findImgId(e.context.id);
		}
	});

	$(id_).bind('mousewheel', function (e) {
		e.stopPropagation();
		if(e.originalEvent.wheelDelta > 0) {
			checkWheel.next();
		}
		else{
			checkWheel.prev();
		}
	});
	$(id_).on('click', function (e){
		e.stopPropagation();
		var link = findLinkById(e.target.id);
		if( link != false)
			window.open(link);
	});
}
