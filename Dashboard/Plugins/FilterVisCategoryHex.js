/*
 *
 * This file creates and interacts with MiniBarChat visualization
 * important note: and TODO: d3 has an transform/translation functionality
 * use this if hole Visualization is resized --> solution viewbox cause svg
 *
 */
(function(){

    var MiniBarchart = {};
    var $root = null;
    var margin = {top: 10, right: 5, bottom: 10, left: 5};
    var base = null;
    var chart = null;
    var currentCategory = null;
    this.width = 0;
    this.heigth = 0;
    
    MiniBarchart.initialize = function(vis, rootSelector){
        $root = rootSelector;
        MiniBarchart.vis = vis;
    };
    /*
     * basic draw function
     */
    MiniBarchart.draw = function(allData, selectedData, inputData, $container, category, categoryValues, from, to){

        var data = getInitData(allData, category);
        require(['Plugins/pointspolygon.js'], function(){
            if(categoryValues === null){interactMiniBar(selectedData, category, categoryValues, data, $vis);}
            else if($container[0].baseURI === "" || undefined || null){console.log("NO REDRAW !", $container.baseURI);}
            else{
            var $vis = $container.find('.mini-bar-chart')
            var points = null;
            var svg = null;
            var focus = null;
            this.width = parseInt(d3.select("#eexcess-filtercontainer").style("width"));
            this.height = parseInt(d3.select("#eexcess_controls").style("height"))/ 6;
            points = new Pointspolygon(this.width - (margin.left + margin.right), this.height - 2, 'minibarchart');
            // if none minibarchart exits
            var dataSet = points.getPoints(data);
            if($vis.length === 0){
                base = d3.select($container.get(0));
                chart = base.append("div")
                            .attr("class","mini-bar-chart")
                            .attr('width',this.width)
                            .attr('height', dataSet.height)
                            .attr("viewBox", "0 0 "+this.width +" "+dataSet.height+" ")
                            .style('padding',"3px 4px");

                svg = chart.append("svg")
                           .attr("class", "minibarchart_svg")
                           .attr("width", "100%" )
                           .attr("height", dataSet.height)
                           .attr("viewBox", "0 0 "+this.width +" "+dataSet.height+" ");
            
                focus = svg.append("g")
                            .attr("class", "FilterVis_focus")
			    .attr("width", "100%" )
			    .attr("height", dataSet.newSize)
                            .attr("viewBox", "0 0 "+this.width +" "+ dataSet.newSize+" ");

                generateMiniBarElements(data, dataSet, category);
                interactMiniBar(selectedData, category, categoryValues, data, $vis);
                currentCategory = category;
            } else if($vis.length !== 0 && currentCategory === category){ // every interaction
                //svg.setAttribute("viewBox", "0 0 "+this.width +" "+dataSet.height+" ");
                interactMiniBar(selectedData, category, categoryValues, data, $vis);
            } else if($vis.length !== 0 && currentCategory !== category){ // build new svg groups/path if switch by y-axis/color
                generateMiniBarElements(data, dataSet, category);
                interactMiniBar(selectedData, category, categoryValues, data, $vis);
                currentCategory = category;
            } else {
              console.log("There is something wrong, maybe you want to read an undefined value");
            }
          }
        });
    };

    MiniBarchart.finalize = function(){

    };
    /*
     * generates the svg specific svg elements
     */
    generateMiniBarElements = function(inputData, data ,category){
        deleteElements();
        var dataSet = data;
        var base = d3.select("#eexcess-filtercontainer");
        var svg = base.select("svg.minibarchart_svg");
        var focus = svg.select(".FilterVis_focus");
        var color = d3.scale.category10();
        focus.append("g")
            .selectAll(".points_fill")
            .data(dataSet.points_fill)
            .enter().append("path")
            .attr("class", "points_fill")
            .attr("id", function(d,i){ return inputData[i][category].replace(/[ .]/g,"_");})
            .attr("d", function (d) { return d;})
            .style("fill", function (d,i) {
               return  color(i);
            });
        focus.append("g")
            .selectAll(".points_stroke")
            .data(dataSet.points_stroke)
            .enter().append("path")
            .attr("class", "points_stroke")
            .attr("id", function(d,i){ return inputData[i][category].replace(/[ .]/g,"_");})
            .attr("d", function (d,i) { return d;})
            .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '2px'});
            var delta =  getLetterSize(inputData, category, parseInt(d3.select("#eexcess_controls").style("font-size")));
        focus.append("g")
            .selectAll(".hexagon_text")
            .data(dataSet.points_m)
            .enter().append("text")
            .attr("class", "hexagon_text")
            .attr("id", function(d,i){ return inputData[i][category].replace(/[ .]/g,"_");})
            .attr("x", function(d,i) { return d.x - delta[i]; })//- (size[0]/2.5) ; })
            .attr("y", function(d,i) { return d.y ; })//+ delta[1];})
            .text( function (d,i) { return inputData[i][category];})
            .attr("font-family", "sans-serif")
            .style("font-size", "0.9em")
            .attr("fill", "black");
    };
    /*
     * calcs the diff from centerpoint startpoint of text, depending on length of word
     */
    getLetterSize = function (data, category, length){
        var array = [];
        data.forEach(function (d,i){
           var size = d[category].length;
           array.push((size * length * 0.9)/4);
        });
        return array;
    };

    /*
     * arranges the interaction 
     */
    interactMiniBar = function(selectedData, category, categoryValues, data,test){

        var base = d3.select("#eexcess-filtercontainer");
        var svg = base.select('svg.minibarchart_svg');
        var focus = svg.select(".FilterVis_focus");
        var fill = focus.selectAll(".points_fill");
        var stroke = focus.selectAll(".points_stroke");
        var text = focus.selectAll(".hexagon_text");
        var selected = selectedData;
        //only one bar or binding doesn't worked errorhandling
        if(selected === null || selected.length === data.length || selected[0]=== undefined ){
            console.log("Sorry facets is undefined");
            fill.transition()
            .style("opacity",1);
            stroke.transition()
            .style("opacity",1);
            text.transition()
            .style("opacity",1);
        }
        else if (categoryValues === null) {

        }
       else { //first click or different element
            stroke.transition().style("opacity",0.2);
            fill.transition().style("opacity",0.2);
            text.transition().style("opacity",0.2);
            categoryValues.forEach(function(d,i){
                var path = "path#"+d;
                var selectedfill = svg.selectAll(path);
                selectedfill[0][1].style.stroke =  selectedfill[0][0].style.fill;
                selectedfill.transition().style("opacity",1);
                var get = "text#"+d;
                var selectedtext = svg.selectAll(get);
                selectedtext.transition().style("opacity",1);
            });
        }
    };
    /*
     * counts element selected by category similar to setting.getInitData
     */
    getInitData = function(allData, category){
        var dataSet = {};
        allData.forEach(function(d,i){
            var check = dataSet[d.facets[category]];
            if(check === undefined ){
                dataSet[d.facets[category]] = 1;
            } else{
                dataSet[d.facets[category]]++;
            }
        });
        var array = [];
        var keys = Object.keys(dataSet);
        for(i = 0; i < keys.length; i++){
            var obj = {};
		        obj[category] = keys[i];
		        obj.count = dataSet[keys[i]];
		        obj.selected = false;
		        array.push( obj );
        }
        return array;

    };

    function deleteElements(){
        //delete elements if they exists
        var base = d3.select("#eexcess-filtercontainer");
        var svg = base.select('svg.minibarchart_svg');
        var focus = svg.select(".FilterVis_focus");
        var elements = focus.selectAll(".points_fill");
        var element = focus.selectAll(".points_stroke");
        var elementText = focus.selectAll(".hexagon_text");
        if(elements !== (undefined || null)){
            elements.remove();
        }
        if(element !== (undefined || null)){
            element.remove();
        }
        if(elementText !== (undefined || null)){
            elementText.remove();
        }
    }

    PluginHandler.registerFilterVisualisation(MiniBarchart, {
      'displayName' : 'MiniBarchart',
      'type' : 'category',
    });

})();
