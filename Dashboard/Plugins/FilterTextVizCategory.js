(function(){

	var TextVizCategory = {};


	TextVizCategory.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TextVizCategory.draw = function (allData, inputData, $container, filters, settings, e){
		var $vis = $container.find('.TextVizCategory');
		if ($vis.length == 0){
			$vis = $('<div class="TextVizCategory" style="text-align: center;"></div>').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append($vis);
		}

		$vis.html(filters[0].category + ': ' + underscore(filters[0].categoryValues).join(', '));
	};

	TextVizCategory.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TextVizCategory, {
		'displayName' : 'TestMini Category', 
		'type' : 'category', 
        'isTextual': true 
	});
})();
