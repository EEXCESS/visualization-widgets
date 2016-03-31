(function(){

	var TextVizGeo = {};
    TextVizGeo.geoNamesUrl = 'http://api.geonames.org/citiesJSON?&username=eexcess&lang=en'; // &north=44.1&south=-9.9&east=-22.4&west=55.2

	TextVizGeo.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TextVizGeo.draw = function (allData, inputData, $container, filters) {
		var $vis = $container.find('.TextVizGeo');
		if ($vis.length == 0){
			$vis = $('<div class="TextVizGeo" style="text-align: center;"></div>').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append($vis);
		}
        
        var geoNamesAreaUrl = TextVizGeo.geoNamesUrl + '&north='+filters[0].to.lat+'&west='+filters[0].to.lng+'&south='+filters[0].from.lat+'&east='+filters[0].from.lng;
        console.log(geoNamesAreaUrl);
        $.ajax({
            url: geoNamesAreaUrl,
            dataType : 'jsonp',
            success: function(data){
                console.log(data);
                var output = underscore(data.geonames).map('name').join(', ');
                $vis.html(output);
            }
        });

		if (filters[0].from != null && filters[0].to != null)
			$vis.html('NE: ' + filters[0].from.lat.toFixed(4) + ", " + filters[0].from.lng.toFixed(4) + " <br />SW: " + filters[0].to.lat.toFixed(4) + ", " + filters[0].to.lng.toFixed(4));
		else 
			$vis.html('');
	};

	TextVizGeo.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TextVizGeo, {
		'displayName' : 'TestMini Geo', 
		'type' : 'geo', 
        'isTextual': true
	});
})();
