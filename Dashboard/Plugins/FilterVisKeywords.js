(function(){

	var FilterVisKeywords = {};

	FilterVisKeywords.initialize = function(EEXCESSObj){
	};

	//FilterVisKeywords.draw = function(allData, selectedData, inputData, $container, category, categoryValues, from, to) {
    FilterVisKeywords.draw = function (allData, inputData, $container, filters) {

        var categoryValues = filters[0]['categoryValues'];
        var selectedData = _(filters).map('dataWithinFilter');

		var $vis = $container.find('.FilterVisKeywords');
		
		if ($vis.length == 0){
			$vis = $('<div class="FilterVisKeywords"></div>');
			$container.append($vis);
		}
		
		var keywordsItmes = []
		for(var i=0; i < categoryValues.length; i++) {
			var color = "#000000"; 
			var keyword = categoryValues[i]; 
			if(inputData.colors.length > i) {
				color = inputData.colors[i]; 
			}
			var keywordSpanItem = '<span><font color="'+color+'">' + keyword + '</font></span>'
			keywordsItmes.push(keywordSpanItem); 
		}
		var items = keywordsItmes.join(' ');
				
		$vis.html('<div class="" style="align:center; padding:5px;">' + items + '</div>');
	};

	FilterVisKeywords.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(FilterVisKeywords, {
		'displayName' : 'Keywords', 
		'type' : 'keyword', 
	});
})();
