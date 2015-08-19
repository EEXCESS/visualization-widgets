(function () {

    var FilterVizGeo = {};
    //var d3 = d3 || {};
    var path, zoom, afterInitCallback;
    var initializationFinished = false;

    FilterVizGeo.initialize = function (EEXCESSObj) {
        path = 'libs/topojson.min.js';
        Modernizr.load({
            test: path,
            load: [path, 'Plugins/FilterVizGeo-Data.js'],
            complete: function () {
                console.log("FilterVizGeo load completed");
                initializationFinished = true;
                if (afterInitCallback)
                    afterInitCallback();
            }
        });
    };

    //FilterVizGeo.draw = function (allData, selectedData, inputData, $container, category, categoryValues, northEast, southWest) {
    FilterVizGeo.draw = function (allData, inputData, $container, filters) {
        
        var $vis = $container.find('.FilterVizGeo');       
        if ($vis.length == 0) {
            $vis = $('<div class="FilterVizGeo"></div>');
            $container.append($vis);
        }
        var width = $vis.width();
        var height = width * 0.6;
        $vis.height(height); // its important to set the height before the callback delay, because otherwise 
        
        if (!initializationFinished) {
            afterInitCallback = function () { FilterVizGeo.draw(allData, inputData, $container, filters); };
            return;
        }
        
        // todo: show filters
        // filters[i].from = northEast
        // filters[i].to = southWest
        
        var $svg = $vis.find('svg');
        var centered, svg, svgContinentContriesGroup, svgContinentGroup;

        if ($svg.length == 0) {
            var projection = d3.geo.mercator()
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

            var countries = topojson.feature(FilterVizGeoWorldShape, FilterVizGeoWorldShape.objects.countries);
            var asia = { type: "FeatureCollection", name: "Asia", color: "#ffbb78", id: 1, features: countries.features.filter(function (d) { return d.properties.continent == "Asia"; }) };
            var africa = { type: "FeatureCollection", name: "Africa", color: "#2ca02c", id: 2, features: countries.features.filter(function (d) { return d.properties.continent == "Africa"; }) };
            var europe = { type: "FeatureCollection", name: "Europe", color: "#d62728", id: 3, features: countries.features.filter(function (d) { return d.properties.continent == "Europe"; }) };
            var na = { type: "FeatureCollection", name: "North America", color: "#1f77b4", id: 4, features: countries.features.filter(function (d) { return d.properties.continent == "North America"; }) };
            var sa = { type: "FeatureCollection", name: "South America", color: "#ff7f0e", id: 5, features: countries.features.filter(function (d) { return d.properties.continent == "South America"; }) };
            var antarctica = { type: "FeatureCollection", name: "Antarctica", color: "#98df8a", id: 6, features: countries.features.filter(function (d) { return d.properties.continent == "Antarctica"; }) };
            var oceania = { type: "FeatureCollection", name: "Oceania", color: "#aec7e8", id: 7, features: countries.features.filter(function (d) { return d.properties.continent == "Oceania"; }) };
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
        }
    
        function zoomed() {
            svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }
    }

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



    FilterVizGeo.finalize = function ($container) {
        if ($container.find('svg')){
            var svg = d3.select($container.find('svg')[0]);
            svg.remove();                
        }
    };

    PluginHandler.registerFilterVisualisation(FilterVizGeo, {
        'displayName': 'Geo',
        'type': 'geo',
    });


})();
