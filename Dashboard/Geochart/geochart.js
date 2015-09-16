
function Geochart(root, visTemplate) {

    var GEO = {};
    GEO.Settings = new Settings('geochart');

    var Vis = visTemplate;
    var data;
    var colorScale;
    var width, height;
    var colorChannel;
    var currentlyHighlightedIds = [];
    GEO.$root = $(root);
    GEO.ClusterSettings = {
        minSize: 32,
        maxSize: 64,
        minAmount: 2,
        maxAmount: 8
    };
	
    var geoChartOption = "pie_geo";
    var recivedData_ = null;
    
    
   var getLegendDomain = function(colorDomain){
		
		var legendDomain = [];
		
		colorDomain.forEach(function(c, i){
			legendDomain[i] = { 'item': c, 'selected': false };
		});
		return legendDomain;
	};
	
	


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /* Event handlers  */

    GEO.Evt = {    	

		legendClicked : function( legend, legendIndex ) {
			var selectedIndices = [];
			var selectedData = [];
			var inputData = GEO.Input.data;
			for (var i = 0; i < inputData.length; i++) {
				if (inputData[i].facets.language == legend.item) {
					selectedIndices.push(i);
					selectedData.push(inputData[i]);
				}
			}
			
			FilterHandler.clearList();
			for (var i = 0; i < selectedData.length; i++) {
				FilterHandler.singleItemSelected(selectedData[i], true);
			}
					
			if( legend.selected === false ){						
				legendDomain.forEach(function(l, i){
					l.selected = (i == legendIndex);
				});
			}
			else{
				legend.selected = false;
			}			
			d3.selectAll('.legend').select("div").style("border", function(l, i){ if(i == legendIndex && legend.selected) return "0.1em lime solid"; return "none"; });

		}, 

		
		legendMouseOvered : function(d){
			
			d3.select(this).select("div")
				.style("border", "0.1em yellow solid")
				.style("width", "1.4em")
				.style("height", "1.4em");
			
			d3.select(this).select("text")
				.style("font-size", "0.9em");
		}, 
		
		legendMouseOuted : function(d){
			
			d3.select(this).select("div")
				.style("border", function(){ if(d.selected) return "0.1em lime solid"; return "none"; })
				.style("width",  function(){ if(d.selected) return "1.4em"; return "1.5em"; })
				.style("height", function(){ if(d.selected) return "1.4em"; return "1.5em"; });
			
			d3.select(this).select("text")
				.style("font-size", "0.85em");
			
		}
    };






    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*  Additional methods, if necessary*/

    GEO.Internal = {

        getRandomInRange: function (from, to, fixed) {
            return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
            // .toFixed() returns string, so ' * 1' is a trick to convert to number
        },
        getRandomLatLon: function (i) {
            return [GEO.Internal.getRandomInRange(-20, 60, 3), GEO.Internal.getRandomInRange(-120, 120, 3)];
            //return [(20 + i).toFixed(3) * 1, (0).toFixed(3) * 1];
        },
        spatializeData: function (data) {
            for (var i = 0; i < data.length; i++) {
                if (!data[i].coordinate)
                    data[i].coordinate = GEO.Internal.getRandomLatLon(i);
            }
        },
        getDataIndex: function (id) {
            for (var i = 0; i < GEO.Input.data.length; i++) {
                if (GEO.Input.data[i].id == id)
                    return i;
            }
            return null;
        },
        getSelectedData: function (layer) {
            var selectedIndices = [];
            var selectedData = [];
            var rectBounds = layer.getBounds();
            var inputData = GEO.Input.data;
            for (var i = 0; i < inputData.length; i++) {
                if (
                    inputData[i].coordinate && inputData[i].coordinate.length == 2 &&
                    rectBounds.getWest() <= inputData[i].coordinate[1] &&
                    inputData[i].coordinate[1] <= rectBounds.getEast() &&
                    rectBounds.getSouth() <= inputData[i].coordinate[0] &&
                    inputData[i].coordinate[0] <= rectBounds.getNorth()
                    ) {
                    selectedIndices.push(i);
                    selectedData.push(inputData[i]);
                }
            }
            return { selectedData: selectedData, selectedIndices: selectedIndices };
        }
    };






    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    GEO.Render = {};



	/******************************************************************************************************************
	*
	*	Draw GEO vis
	*
	* ***************************************************************************************************************/
    GEO.Render.draw = function (receivedData, mappingCombination, iWidth, iHeight) {

	
		var geochart_options_style = document.getElementsByName("tag_geochart");
        for (var count = 0; count < geochart_options_style.length; count++) {
            if (geochart_options_style[count].checked == true) {
                geoChartOption = geochart_options_style[count].value;
            }
        }
		
		recivedData_ = receivedData;
        // See settings.js

		/******************************************************
		*	Define canvas dimensions
		******************************************************/
        GEO.Dimensions = GEO.Settings.getDimensions(root, iWidth, iHeight);
        width = GEO.Dimensions.width;
        height = GEO.Dimensions.height;
        colorScale = d3.scale.category10();
        colorChannel = 'language';
		GEO.Ext.colorScale = colorScale;       
        for (var i = 0; i < mappingCombination.length; i++)
            if (mappingCombination[i].visualattribute == 'color')
                colorChannel = mappingCombination[i].facet;

		var legendLanguageColors = []
		for(var i=0; i < receivedData.length; i++) {
			var lang = receivedData[i].facets[colorChannel]; 
			if(legendLanguageColors.indexOf(lang) == -1) {
				legendLanguageColors.push(lang); 
			} 
		}

		/******************************************************
		*	Define input variables
		******************************************************/
        GEO.Input = GEO.Settings.getInitData(receivedData);
        //GEO.Internal.spatializeData(GEO.Input.data);
        GEO.$root.append('<div id="mapInner" style="height:100%"></div>');

        GEO.map = L.map('mapInner');
        GEO.Render.centerMap();
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(GEO.map);
		
		if(geoChartOption == "pie_geo")
            GEO.Render.drawMarkers();
        else if(geoChartOption == "img_geo")
            GEO.Render.drawImgMarkers();
        //GEO.Render.drawMarkers();

        // Leaflet Draw
        var drawnItems = new L.FeatureGroup();
        GEO.map.addLayer(drawnItems);

        L.drawLocal.draw.toolbar.buttons.rectangle = "selection tool";

        var drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems,
                edit: false,
                remove: false
            },
            draw: {
                rectangle: {
                    shapeOptions: {
                        stroke: true,
                        color: '#1E28EC',
                        weight: 2,
                        opacity: 0.7,
                        fill: true,
                        fillColor: null, //same as color by default
                        fillOpacity: 0.1
                    }
                },
                polygon: false,
                marker: false,
                polyline: false,
                circle: false
            }
        });

        GEO.map.addControl(drawControl);

        GEO.map.on('draw:created', function (e) {
            var type = e.layerType,
                layer = e.layer;

            if (type === 'rectangle') {
                // Do marker specific actions
                GEO.Render.deleteCurrentSelect();
                GEO.map.addLayer(layer);
                currentOneLayer = layer;
                //make selection list
                var selectionResult = GEO.Internal.getSelectedData(layer);

                var bounds = layer.getBounds();
                FilterHandler.setCurrentFilterRange('geo', selectionResult.selectedData, bounds._northEast, bounds._southWest);
            }

            // Do whatever else you need to. (save to db, add to map etc)
            //GEO.map.addLayer(layer);
        });
        
        
       	 /******************************************************
		 *	Legends
		 *****************************************************/	
		
		colorScale =  d3.scale.category10().domain(legendLanguageColors);	
		legendDomain = getLegendDomain(colorScale.domain());
		
		
		var legendWrapper = d3.select("#mapInner")
						.append("div")
						.attr("id", "div-wrap-legends")
						.style("position", "absolute")
						.style("z-index", "1")
						.style("right", "15px")
		1
		legend = legendWrapper.selectAll(".legend")
			.data(legendDomain)
			.enter()
			.append("div")
				.attr("class", "legend")
				.attr("selected", "0")
				.attr("transform", function(d, i) { return "translate(40," + (i+1)*20 + ")"; })
				.on( "click", GEO.Evt.legendClicked )
				.on( "mouseover", GEO.Evt.legendMouseOvered )
				.on( "mouseout", GEO.Evt.legendMouseOuted );
		
		legend.append("div")
			.attr("x", width + 126)
			.style("background", function(d){ return colorScale(d.item); });
		
		legend.append("text")
			.attr("x", width +120)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) { return d.item; });

		$('#eexcess_canvas').css("overflow", "hidden") 
        
    };
    GEO.Render.deleteCurrentSelect = function () {
        if (currentOneLayer != null && GEO.map.hasLayer(currentOneLayer)) {
            GEO.map.removeLayer(currentOneLayer);
            currentOneLayer = null;
        }
    };

    var currentOneLayer = null;

    GEO.Render.centerMap = function () {
        GEO.map.setView([51.505, -0.09], 2);
    };

    GEO.Render.drawMarkers = function () {

        GEO.markersGroup = new L.MarkerClusterGroup({
            iconCreateFunction: function (cluster) {
                //return new L.DivIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
                //return new L.DivIcon({ html: '<div><span>' + cluster.getChildCount() + '</span></div>', className: 'marker-cluster', iconSize: new L.point(40, 40) });
                //return new L.DivIcon({ className:'marker-cluster-pie', iconSize: L.point(44, 44), html: '<svg width="44" height="44" viewbox="0 0 400 400"><path d="M200,200 L200,20 A180,180 0 0,1 377,231 z" style="fill:#ff0000;fill-opacity: 0.5;"/><path d="M200,200 L377,231 A180,180 0 0,1 138,369 z" style="fill:#00ff00;fill-opacity: 0.5;"/><path d="M200,200 L138,369 A180,180 0 0,1 20,194 z" style="fill:#0000ff;fill-opacity: 0.5;"/><path d="M200,200 L20,194 A180,180 0 0,1 75,71 z" style="fill:#ff00ff;fill-opacity: 0.5;"/><path d="M200,200 L75,71 A180,180 0 0,1 200,20 z" style="fill:#ffff00;fill-opacity: 0.5;"/></svg><div class="child-count">' + cluster.getChildCount() + '</div>'});

                var markers = cluster.getAllChildMarkers();
                var pieParts = {};
                for (var i = 0; i < markers.length; i++) {
                    var dataObject = markers[i].options.dataObject;
                    if (!pieParts[dataObject.facets[colorChannel]]) {
                        pieParts[dataObject.facets[colorChannel]] = 0;
                    }
                    pieParts[dataObject.facets[colorChannel]]++;
                }
                var piePartsCountColor = [];
                for (var key in pieParts) {
                    if (pieParts.hasOwnProperty(key)) {
                        piePartsCountColor.push({
                            count: pieParts[key],
                            color: colorScale(key)
                        });
                    }
                }
                var size = GEO.Render.getClusterSize(GEO.ClusterSettings, markers.length);
                var innerSize = size / 2;
                var childCountStyle = 'font-size:' + (innerSize / 2 + 2) + 'px; border-radius: ' + (innerSize / 2) + 'px; height: ' + innerSize + 'px; width: ' + innerSize + 'px; line-height: ' + innerSize + 'px; left: ' + (innerSize / 2) + 'px; top: ' + (innerSize / 2) + 'px;';

                var svg = document.createElement("svg");
                GEO.Render.drawArcs(svg, piePartsCountColor);
                return new L.DivIcon({ className: 'marker-cluster-pie', iconSize: L.point(size, size), html: '<svg width="' + size + '" height="' + size + '" viewbox="0 0 400 400">' + svg.innerHTML + '</svg><div class="child-count" style="' + childCountStyle + '">' + cluster.getChildCount() + '</div>' });
            }
        });

        for (var i = 0; i < GEO.Input.data.length; i++) {
            //var marker = L.marker(GEO.Input.data[i].coordinate);
            //var marker = L.marker([51.505, -0.09]);
            if (!GEO.Input.data[i].coordinate || GEO.Input.data[i].coordinate.length < 2)
                continue;

            var currentDataObject = GEO.Input.data[i];
            currentDataObject.color = colorScale(currentDataObject.facets[colorChannel]);
            var marker = new GEO.Render.Marker(GEO.Input.data[i].coordinate, { icon: GEO.Render.icon(currentDataObject.color) });
            marker.options.dataObject = currentDataObject;
            marker.bindPopup(GEO.Input.data[i].title);
            marker.on('click', function (e) {
                if (e && e.target && e.target.options && e.target.options.dataObject) {
                    currentlyHighlightedIds = [];
                    GEO.Render.deleteCurrentSelect();
                    FilterHandler.singleItemSelected(e.target.options.dataObject);
                    if (FilterHandler.listFilter != null) { // is it the popup-open click, or popup-close click?
                        Vis.scrollToFirst();
                        currentlyHighlightedIds = [e.target.options.dataObject.id];
                    }
                }
            }).on('popupclose', function (e) {
            });
            GEO.markersGroup.addLayer(marker);
            GEO.Input.data[i].geoMarker = marker;
        }

        GEO.map.addLayer(GEO.markersGroup);
    };

    GEO.Render.Marker = L.Marker.extend({
        options: {
            dataObject: null
        }
    });

    // credits to: https://github.com/jseppi/Leaflet.MakiMarkers
    GEO.Render.icon = function (color) {
        return new L.Icon({
            //iconSize: [36,90], //l
            //popupAnchor: [0,-40], //l
            iconSize: [30, 70], //m
            popupAnchor: [0, -30], //m
            iconUrl: 'https://api.tiles.mapbox.com/v3/marker/pin-m+' + color.substr(1) + '.png',
            iconRetinaUrl: 'https://api.tiles.mapbox.com/v3/marker/pin-m+' + color.substr(1) + '@2x.png'
        });
    };

    // credits to: http://stackoverflow.com/questions/7261318/svg-chart-generation-in-javascript
    GEO.Render.makeSVG = function (tag, attrs) {
        var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
        return el;
    };

    GEO.Render.getClusterSize = function (clusterSettings, markersCount) {
        var divider = clusterSettings.maxAmount - clusterSettings.minAmount;
        var sizeGrowthPerMarker = (clusterSettings.maxSize - clusterSettings.minSize) / divider;
        var sizeMultiplier = markersCount - clusterSettings.minAmount;
        if (sizeMultiplier < 0)
            sizeMultiplier = 0;
        if (sizeMultiplier > divider)
            sizeMultiplier = divider;
        var size = clusterSettings.minSize + (sizeMultiplier * sizeGrowthPerMarker);
        size = Math.round(size / 4) * 4; // pixel should be able to divide without remainder
        return size;
    };

    GEO.Render.drawArcs = function (paper, piePartsCountColor) {
        var total = piePartsCountColor.reduce(function (previous, current) { return previous + current.count; }, 0);
        var sectorAngleArr = piePartsCountColor.map(function (v) { return 360 * v.count / total; });
        var startAngle = 0;
        var endAngle = 0;
        for (var i = 0; i < sectorAngleArr.length; i++) {
            startAngle = endAngle;
            endAngle = startAngle + sectorAngleArr[i];
            var x1, x2, y1, y2;
            x1 = parseInt(Math.round(200 + 195 * Math.cos(Math.PI * startAngle / 180)));
            y1 = parseInt(Math.round(200 + 195 * Math.sin(Math.PI * startAngle / 180)));
            x2 = parseInt(Math.round(200 + 195 * Math.cos(Math.PI * endAngle / 180)));
            y2 = parseInt(Math.round(200 + 195 * Math.sin(Math.PI * endAngle / 180)));
            var d = "M200,200  L" + x1 + "," + y1 + "  A195,195 0 " + ((endAngle - startAngle > 180) ? 1 : 0) + ",1 " + x2 + "," + (y2 == 200 ? 199 : y2) + " z";
            //alert(d); // enable to see coords as they are displayed
            // original:
            //var c = parseInt(i / sectorAngleArr.length * 360);
            //var arc = GEO.Render.makeSVG("path", {d: d, fill: "hsl(" + c + ", 66%, 50%)"});
            var arc = GEO.Render.makeSVG("path", { d: d, fill: piePartsCountColor[i].color, transform: "rotate(-90 200 200)" });
            paper.appendChild(arc);
            //arc.onclick = clickHandler; // This is optional, of course
        }
        return paper;
    };



	/******************************************************************************************************************
	*
	*	Reset GEO  vis
	*
	* ***************************************************************************************************************/
    GEO.Render.reset = function () {
        GEO.map.removeLayer(GEO.markersGroup);
        GEO.Render.drawMarkers();
        GEO.Render.centerMap();
        GEO.Render.deleteCurrentSelect();
    };



    /******************************************************************************************************************
	*
	*	Highlight items
    *   @param indexArray: array with items' indices to highlight. They match items in receivedData (parameter in Render.draw)
	*
	* ***************************************************************************************************************/
    GEO.Render.highlightItems = function (indexArray, dataToHighlightIds) {
        if (indexArray == null) {
            if (GEO.map)
                GEO.map.closePopup();
            if (dataToHighlightIds)
                dataToHighlightIds.forEach(function (id) {
                    var item = _.find(GEO.Input.data, function (d) { return d.id == id; });
                    GEO.markersGroup.zoomToShowLayer(item.geoMarker, function () {
                        item.geoMarker.openPopup();
                    });
                });
            GEO.Render.deleteCurrentSelect();
            return;
        }
        // obsolete?
        GEO.map.closePopup();
        indexArray.forEach(function (i) {
            GEO.markersGroup.zoomToShowLayer(GEO.Input.data[i].geoMarker, function () {
                GEO.Input.data[i].geoMarker.openPopup();
            });
            //GEO.Input.data[i].geoMarker.openPopup();
        });
        GEO.Render.deleteCurrentSelect();
    };
	
	GEO.Render.drawImgMarkers = function(){

        GEO.Markers = new L.MarkerClusterGroup({
            iconCreateFunction: function(cluster) {
                var markers = cluster.getAllChildMarkers();

                var html_markers = "";
                for (var i = 0; i < markers.length; i++) {
                    html_markers += "<img src=\"" + markers[i].options.dataObject.previewImage + "\" id=\"item-" + i +"\"" + "\>";
                }

                return new L.divIcon({

                    html: html_markers,
                    className: 'wheelSlider',
                    iconAnchor:   [42, 80],
                    popupAnchor: [0, -80],
                    iconSize: L.point(42, 80)
                });

            },

            spiderfyOnMaxZoom: false, showCoverageOnHover: true, zoomToBoundsOnClick: false
        });

        for(var i = 0; i < GEO.Input.data.length; i++){
            // this check if selected data has a coordinate
            if (GEO.Input.data[i].coordinate == null ||GEO.Input.data[i].coordinate.length < 2)
                continue;

            var currentDataObject = GEO.Input.data[i];

            // add an default image if there is not icon image
            if (recivedData_[i].previewImage == undefined){
                currentDataObject.previewImage = "http://www.mydaymyplan.com//images/no-image-large.png";
                currentDataObject.index = i;
            }else{
                // added images in currentData
                currentDataObject.previewImage = recivedData_[i].previewImage;
                currentDataObject.index = i;
            }

            currentDataObject.color = colorScale(currentDataObject.facets[colorChannel]);

            ////to add image as icon: , currentDataObject.previewImage
            var marker = new GEO.Render.Marker(GEO.Input.data[i].coordinate, { icon: GEO.Render.iconImg(currentDataObject.color, currentDataObject.previewImage, currentDataObject.index)});

            marker.options.dataObject = currentDataObject;

            marker.bindPopup(GEO.Input.data[i].title);

            GEO.Markers.addLayer(marker);

            marker.on('click', function(e){
                if (e && e.target && e.target.options && e.target.options.dataObject){
                    GEO.Render.deleteCurrentSelect();
                    Vis.selectItems([GEO.Internal.getDataIndex(e.target.options.dataObject.id)], true);
                }
            }).on('popupclose', function(){
                Vis.selectItems([]);
            });
        }

        GEO.map.on('layeradd', function(e){createWheelSlider() });
        //TestPlugin.map.on('moveend', function(e){/*console.log("MOVE:", e);*/ createSlider(); });
        GEO.map.addLayer(GEO.Markers);

        GEO.map.on('click', function(e){
            console.log(e.latlng);
        });


        GEO.Markers.on('clustermouseover', function(e){

            showPopupPanel(e);
        });
    }

    GEO.Render.iconImg = function(color,image, index){
        return new L.divIcon({

            //iconAnchor: [0,0], //m
            className:  'leaflet-div-icon',

            html:'<div><a class="image-marker" href="#" data-index="' + index + '"><img style="border:3px solid '+ color +'" src="'+image+'" width="34" height="36" /></a></div>'
        });
    };

    var showPopupPanel = function(event){
        var languages = [];
        var grouped_markers = event.layer.getAllChildMarkers();

        for(var count = 0; count < grouped_markers.length; count++){
            if(!(languages.indexOf(grouped_markers[count].options.dataObject.facets.language) > -1))
                languages.push(grouped_markers[count].options.dataObject.facets.language)
        }

        var popup = L.popup({
            closeButton: false,
            closePopupOnClick: false,
            className: 'popup_slider'
        })
            .setLatLng(event.latlng)
            .setContent(popupCheckboxMenu(languages))
            .openOn(GEO.map);

        var div_checker = document.getElementsByClassName('popup_slider_checker')[0];
        div_checker.addEventListener('click', function(e){
            var checked_lang = [];
            var lang_choose = document.getElementsByName("popupcheckbox");
            for(var i = 0; i < lang_choose.length; i++){
                if(lang_choose[i].checked == true)
                    checked_lang.push(lang_choose[i].value);
            }

            if(checked_lang.length > 0){
                updateSlider(checked_lang, event);
            }
        });
    };

    var popupCheckboxMenu = function(languages){

        var html_code = '<div class="popup_slider_checker" >';

        for(var count = 0; count < languages.length; count++)
            html_code += '<input type="checkbox"  name="popupcheckbox" value="' + languages[count] + '" checked>' + languages[count] + '<br>';

        html_code += '</div>';
        return html_code;
    };

    var updateSlider = function(selected_lang, event){
        
        for (mcg in event.layer._group._featureGroup._layers){
            if(event.layer._group._featureGroup._layers[mcg]._childCount)
                if( (event.layer._cLatLng.lat == event.layer._group._featureGroup._layers[mcg]._cLatLng.lat) &&
                    (event.layer._cLatLng.lng == event.layer._group._featureGroup._layers[mcg]._cLatLng.lng)) {

                    //markerclustergroupArray[index]._featureGroup._layers[mcg]._group.options.iconCreateFunction = setClusterIcon;
                    //markerclustergroupArray[index]._featureGroup._layers[mcg]._updateIcon();
                    event.layer._group.options.iconCreateFunction = function(cluster){
                        return setNewClusterIcon(selected_lang, cluster );
                    };
                    event.layer._updateIcon();
                    createWheelSlider();
                }
        };
    };

    var setNewClusterIcon = function(selected_languages, cluster){

        var html_markers = "";
        var temp_markers = cluster.getAllChildMarkers();
        for(var count_x = 0; count_x < selected_languages.length; count_x++) {
            for(var count_y = 0; count_y < temp_markers.length; count_y++){
                if (temp_markers[count_y].options.dataObject.facets.language == selected_languages[count_x]){
                    html_markers += "<img src=\"" + temp_markers[count_y].options.dataObject.previewImage + "\" id=\"item-" + count_y +"\"" + "\>";
                }
            }
        }

        return new L.divIcon({

            html: html_markers,
            className: 'wheelSlider',
            iconAnchor:   [42, 80],
            popupAnchor: [0, -80],
            iconSize: L.point(42, 80)
        });

    }

    function createWheelSlider(){
        $('.wheelSlider').waterwheelCarousel({
            flankingItems: 1,
            orientation: "vertically",
            separation: 20,
            edgeFadeEnabled: true,
            keyboardNav: true
            /*movingToCenter: function ($item) {
             $('#callback-output').prepend('movingToCenter: ' + $item.attr('id') + '<br/>');
             },
             movedToCenter: function ($item) {
             $('#callback-output').prepend('movedToCenter: ' + $item.attr('id') + '<br/>');
             },
             movingFromCenter: function ($item) {
             $('#callback-output').prepend('movingFromCenter: ' + $item.attr('id') + '<br/>');
             },
             movedFromCenter: function ($item) {
             $('#callback-output').prepend('movedFromCenter: ' + $item.attr('id') + '<br/>');
             },
             clickedCenter: function ($item) {
             $('#callback-output').prepend('clickedCenter: ' + $item.attr('id') + '<br/>');
             }*/
        })
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    GEO.Ext = {
        draw: function (receivedData, mappingCombination, iWidth, iHeight) { GEO.Render.draw(receivedData, mappingCombination, iWidth, iHeight); },
        reset: function () { GEO.Render.reset(); },
        resetFilter: function () { GEO.Render.deleteCurrentSelect(); },
        highlightItems: function (indexArray) { GEO.Render.highlightItems(indexArray); }
    };


    return GEO.Ext;

}
