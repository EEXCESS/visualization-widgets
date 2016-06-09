(function () {

    var FilterVisGeo = {};
    //var d3 = d3 || {};
    var path, zoom, afterInitCallback, width, height, svg, projection, selectedArea;
    var initializationFinished = false;
    
    FilterVisGeo.geoNamesUrl = 'http://api.geonames.org/citiesJSON?&username=eexcess&lang=en'; // &north=44.1&south=-9.9&east=-22.4&west=55.2

    FilterVisGeo.initialize = function (EEXCESSObj) {
        path = 'libs/topojson.min.js';
        Modernizr.load({
            test: path,
            load: [path, 'Plugins/FilterVisGeo-Data.js'],
            complete: function () {
                
                /*
                * Workaround to prevent error in intialization (FilterVisTimeCategoryPoints is undefined) even if loaded
                */
                console.log("FilterVisGeo load completed");
                
                var use_async = true;
                
                if (use_async) {
                    var max_tries_async_init_filter_vis_geo_points = 10000;
                    var curr_tries_async_init_filter_vis_geo_points = 0;

                    var async_init_filter_vis_geodata = function(){
                        window.setTimeout(function(){

                            curr_tries_async_init_filter_vis_geo_points++;
                            if (curr_tries_async_init_filter_vis_geo_points > max_tries_async_init_filter_vis_geo_points) {
                                console.error("Too much tries to load FilterVisGeo-Data. Apport");
                                return;
                            }
                            try {
                                initializationFinished = true;
                                //console.log("Calling callback...");
                                if (afterInitCallback)
                                    afterInitCallback();
                            } catch (e) {
                                console.warn("Catched error:",e);
                                async_init_filter_vis_geodata();
                                return;
                            }
                        }, 0);
                    };
                    async_init_filter_vis_geodata();
                } else {
                    initializationFinished = true;
                    //console.log("Calling callback...");
                    if (afterInitCallback)
                        afterInitCallback();
                }
                
                
                
                
            }
        });
    };

    FilterVisGeo.draw = function (allData, inputData, $container, filters, settings) {
        
        var $vis = $container.find('.FilterVisGeo');       
        if ($vis.length == 0) {
            $vis = $('<div class="FilterVisGeo"></div>');
            $container.append($vis);
        }
        
        width = $vis.width();
        height = width * 0.6;
        $vis.height(height); // its important to set the height before the callback delay, because otherwise 
        
        if (!initializationFinished) {
            afterInitCallback = function () { FilterVisGeo.draw(allData, inputData, $container, filters, settings); };
            return;
        }
        
        if (settings.textualFilterMode == 'textOnly'){
            FilterVisGeo.drawText($container, filters);
            $vis.height(0);
            return;
        }
        
        if (settings.textualFilterMode == 'textAndViz'){
            FilterVisGeo.drawText($container, filters);
        }
        
        // todo: show filters
        // filters[i].from = northEast
        // filters[i].to = southWest
        
        var $svg = $vis.find('svg');
        var centered, svg, svgContinentContriesGroup, svgContinentGroup;

        if ($svg.length == 0) {
            projection = d3.geo.mercator()
                .scale((width + 1) / 2 / Math.PI)
                .translate([width / 2, height / 2])
                .precision(.1);

            zoom = d3.behavior.zoom()
                .translate([0, 0])
                .scale(1)
                .scaleExtent([1, 8])
                .on("zoom", zoomed);

            path = d3.geo.path()
                .projection(projection);
    
            svg = d3.select($vis[0]).append("svg");

            svgContinentGroup = svg.append("g")
                .attr("id", "continent")
            
            svgContinentContriesGroup = svg.append("g")
                .attr("id", "continent-countries")
            
            selectedAreas = svg.append("g")
                .attr("id", "selectedAreas")
             
            svgSelectedArea1 =  selectedAreas.append("rect")
						.attr("x", 0)
						.attr("y", 0)
						.attr("width", 0)
						.attr("height", 0)

						.style("stroke-width", "2px")
						.style("stroke-opacity", "0.7")
						.style("stroke", "#1e28ec")
						.style("fill", "#1e28ec")
						.style("fill-opacity", 0.1)
						.style("visibility", "hidden")
			  
			 svgSelectedArea2 =  selectedAreas.append("rect")
						.attr("x", 0)
						.attr("y", 0)
						.attr("width", 0)
						.attr("height", 0)

						.style("stroke-width", "2px")
						.style("stroke-opacity", "0.7")
						.style("stroke", "#1e28ec")
						.style("fill", "#1e28ec")
						.style("fill-opacity", 0.1)
						.style("visibility", "hidden")


		    var i = 0; 
	      	updateSelectedArea(filters[i].from, filters[i].to); 
			var grayColorPlate = ["#000000", "#D8D8D8 ", "#B8B8B8  ", "#686868  ", "#A8A8A8 ", "#413839","#303030","#463E3F","#4C4646","#504A4B","#565051","#5C5858","#625D5D","#666362","#6D6968","#726E6D","#736F6E","#837E7C","#848482","#B6B6B4"]
            var countries = topojson.feature(FilterVisGeoWorldShape, FilterVisGeoWorldShape.objects.countries);
            var asia = { type: "FeatureCollection", name: "Asia", color: grayColorPlate[0], id: 1, features: countries.features.filter(function (d) { return d.properties.continent == "Asia"; }) };
            var africa = { type: "FeatureCollection", name: "Africa", color: grayColorPlate[1], id: 2, features: countries.features.filter(function (d) { return d.properties.continent == "Africa"; }) };
            var europe = { type: "FeatureCollection", name: "Europe", color: grayColorPlate[2], id: 3, features: countries.features.filter(function (d) { return d.properties.continent == "Europe"; }) };
            var na = { type: "FeatureCollection", name: "North America", color: grayColorPlate[3], id: 4, features: countries.features.filter(function (d) { return d.properties.continent == "North America"; }) };
            var sa = { type: "FeatureCollection", name: "South America", color: grayColorPlate[4], id: 5, features: countries.features.filter(function (d) { return d.properties.continent == "South America"; }) };
            var antarctica = { type: "FeatureCollection", name: "Antarctica", color: grayColorPlate[5], id: 6, features: countries.features.filter(function (d) { return d.properties.continent == "Antarctica"; }) };
            var oceania = { type: "FeatureCollection", name: "Oceania", color: grayColorPlate[6], id: 7, features: countries.features.filter(function (d) { return d.properties.continent == "Oceania"; }) };
            var continents = [asia, africa, europe, na, sa, antarctica, oceania];
            drawContinents(continents);
            drawContinentCountries(asia);
            drawContinentCountries(africa);
            drawContinentCountries(europe);
            drawContinentCountries(na);
            drawContinentCountries(sa);
            drawContinentCountries(antarctica);
            drawContinentCountries(oceania);

            // selectedBrush = svg.append("rect")
            //     .attr("id", "selectedArea")
            //     .style("stroke", "black")
            //     .style("fill", "#B0B0B0")
            //     .style("fill-opacity", ".5")
            //     .attr("x", 0)
            //     .attr("y", 0)
            //     .attr("width", 0)
            //     .attr("height", 0);
        } else {
        	var i = 0; 
	 		updateSelectedArea(filters[i].from, filters[i].to); 
            svg = d3.select($svg[0]);
            svgContinentGroup = svg.selectAll('#continent');
            svgContinentContriesGroup = svg.selectAll('#continent-countries');
        }

        svg.attr("width", width)
            .attr("height", height);
            
        // selectedBrush.attr("x", 1);
        // selectedBrush.attr("y", 1);
        // selectedBrush.attr("width", 100);
        // selectedBrush.attr("height", 100);
    
        // define functions inside the draw functions, to avoid problems, when having two geo visualisations on one page
        function drawContinents(continents) {
            var continentElements = svgContinentGroup.selectAll(".continent").data(continents);
            continentElements.enter().insert("path")
                .attr("class", "continent")
                .attr("d", path)
                .attr("id", function (d, i) { return "continent-" + d.name; })
                .attr("name", function (d, i) { return "continent-" + d.name; })
                .attr("title", function (d, i) { return d.name; })
                .style("fill", function (d, i) { return d.color; })
                .on("mousemove", function (d, i) {
                    continentMouseMove(this, d.name, d);
                })
                .on("mouseout", function (d, i) {
                    continetMouseOut(this, d);
                })
                .on("click", function (d, i) {
                    continentClicked(d);
                    svgContinentContriesGroup.selectAll(".continent-countries").style("visibility", "hidden")
                    var conitnetId = d.name.replace(/ /g, '') + "-" + "countries"
                    d3.select("#" + conitnetId).style("visibility", "visible")
                })
        }
    
        function drawContinentCountries(continent) {
            var conitnetId = continent.name.replace(/ /g, '') + "-" + "countries"
            var countinentGroup = svgContinentContriesGroup
                .append("g")
                .attr("id", conitnetId)
                .attr("class", "continent-countries")
                .style("visibility", "hidden");
    
            var continentCountries = countinentGroup.selectAll(".country").data(continent.features);
            continentCountries.enter().insert("path")
                .attr("class", "country boundary")
                .attr("d", path)
                .attr("id", "country-" + continent.id)
                .style("fill", continent.color)
                .attr("name", function (d, i) { return "continent-" + d.properties.name; })
                .attr("title", function (d, i) { return d.properties.name; })
                .on("mousemove", function (d, i) {
                    continentMouseMove(this, d.properties.name, d);
                })
                .on("mouseout", function (d, i) {
                    continetMouseOut(this, d);
                })
                .on("click", function (d, i) {
                    continentClicked(d);
                    d3.select("#" + d.name + "countries").style("visibility", "visible")
                })
        }
        
        function continentClicked(d) {
            var x, y, k;
            if (d && centered !== d) {
                var centroid = path.centroid(d);
                x = centroid[0];
                y = centroid[1];
                k = 4;
                centered = d;
            } else {
                x = width / 2;
                y = height / 2;
                k = 1;
                centered = null;
            }
    
            svgContinentGroup.selectAll("path")
                .classed("active", centered && function (d) { return d === centered; });
            svgContinentContriesGroup.selectAll("path")
            svgContinentGroup.transition()
                .duration(750)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                .style("stroke-width", 1.5 / k + "px");
            svgContinentContriesGroup.transition()
                .duration(750)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                .style("stroke-width", 1.5 / k + "px");
			 selectedAreas.transition()
                .duration(750)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                .style("stroke-width", 1.5 / k + "px");
        }
    
        function zoomed() {
            svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }
    }

    FilterVisGeo.drawText = function ($container, filters) {
        var $vis = $container.find('.FilterVisGeoText');
        if ($vis.length == 0){
            $vis = $('<div class="FilterVisGeoText" style="text-align: center;"></div>').css('padding-top', '10px').css('padding-bottom', '10px');		
            $container.append($vis);
        }
        
        var geoNamesAreaUrl = FilterVisGeo.geoNamesUrl + '&north='+filters[0].to.lat+'&west='+filters[0].to.lng+'&south='+filters[0].from.lat+'&east='+filters[0].from.lng;
        console.log('call geonames:', geoNamesAreaUrl);
        $.ajax({
            url: geoNamesAreaUrl,
            dataType : 'jsonp',
            success: function(data){
                console.log('data received from geonames', data);
                var output = underscore(data.geonames).map('name').join(', ');
                $vis.html(output);
            }
        });

        if (filters[0].from != null && filters[0].to != null)
            $vis.html('NE: ' + filters[0].from.lat.toFixed(4) + ", " + filters[0].from.lng.toFixed(4) + " <br />SW: " + filters[0].to.lat.toFixed(4) + ", " + filters[0].to.lng.toFixed(4));
        else 
            $vis.html('');
    };

    function addOnCtrlPressedEvent() {
        d3.select(window)
            .on('keydown', function () {
                if (d3.event.keyCode == 17) {
                    d3.select("#brush").style("display", "none");
                }
            })
            .on('keyup', function () {
                if (d3.event.keyCode == 17) {
                    d3.select("#brush").style("display", "block");
                }
            });
    }

    function continentMouseMove(element, elementName, d) {
        d3.select(element).style("opacity", "0.5")
    }

    function continetMouseOut(element, d) {
        d3.select(element).style("opacity", "1")
    }
    
    function updateSelectedArea(from, to) {
    	var northEastX = 0; 
    	var southEastX = 0; 
    	var drawSecondArea = 0; 
    	svgSelectedArea2.style("visibility", "hidden")
    	var northEast =[to.lng, to.lat]
		var northEastCoord =  projection(northEast);
		var southWest =  [from.lng, from.lat]
		var southWestCoord =  projection(southWest);
		northEastX = northEastCoord[0];
		southEastX = southWestCoord[0]; 

		northEastCoord[0] = northEastCoord[0] % width; 
		southWestCoord[0] = southWestCoord[0] % width; 
			
		var yPos = southWestCoord[1];
		var firstAreaXPos = northEastCoord[0]; 
		var firstAreaWidth = Math.abs(southWestCoord[0] - northEastCoord[0]);
		var rectHeight = northEastCoord[1] - southWestCoord[1]; 
		secondAreaXPos = firstAreaXPos; 
		var secondAreaWidth = firstAreaWidth; 

		
		if( (northEastX >= width  || southEastX >= width)  && northEastX >= 0  && southEastX >= 0 ) {
			
			rectWidth = Math.abs(width - northEastCoord[0]);
			secondAreaXPos = 0; 
			secondAreaWidth = Math.abs(southWestCoord[0]); 
			if(northEastCoord[0] > southWestCoord[0]) {
				drawSecondArea = 1; 
			}
	
		}
		else if( northEastX < 0  || southEastX < 0) {
			
			var margin =  Math.abs(width - Math.abs(southWestCoord[0])); 
			
			firstAreaXPos = -2;
			firstAreaWidth =Math.abs(northEastCoord[0]) + 2; 
			secondAreaXPos = Math.abs(southWestCoord[0])
			if(southWestCoord[0] >=0) {
				secondAreaXPos = width- Math.abs(southWestCoord[0])
			}
			
			secondAreaWidth = width + 2;  
			drawSecondArea = 1; 
			if(Math.abs(northEastCoord[0]) > Math.abs(southWestCoord[0])) {
				firstAreaXPos =  Math.abs(width - Math.abs(northEastCoord[0]));  
				firstAreaWidth = Math.abs(southWestCoord[0] - northEastCoord[0]);  
				drawSecondArea = 0; 
			} 	
		}




		// load and display the cities
        if (!isNaN(firstAreaWidth))
            svgSelectedArea1.attr("x", firstAreaXPos)
                .attr("y", yPos)
                .attr("width", firstAreaWidth)
                .attr("height", rectHeight)
                .style("visibility", "visible");
		
        if(!isNaN(secondAreaWidth) && !isNaN(secondAreaXPos) && drawSecondArea === 1) {
            svgSelectedArea2.attr("x", secondAreaXPos)
            .attr("y", yPos)
            .attr("width", secondAreaWidth)
            .attr("height", rectHeight)
            .style("visibility", "visible");
        }

    }



    FilterVisGeo.finalize = function ($container) {
        if ($container.find('svg')){
            var svg = d3.select($container.find('svg')[0]);
            svg.remove();                
        }
    };

    PluginHandler.registerFilterVisualisation(FilterVisGeo, {
        'displayName': 'Geo',
        'type': 'geo',
    });


})();
