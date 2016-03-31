(function(){

	var TextVizTime = {};

	TextVizTime.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TextVizTime.draw = function (allData, inputData, $container, filters, settings) {
		var $vis = $container.find('.TextVizTime');
		if ($vis.length == 0){
			$vis = $('<div class="TextVizTime" style="text-align:center;"></div>').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append($vis);
		}

		$vis.html('' + filters[0].from + " - " + filters[0].to);
	};

	TextVizTime.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TextVizTime, {
		'displayName' : 'TestMini', 
		'type' : 'time', 
        'isTextual': true
	});
})();
