(function(){

    var FilterVisKeywords = {};

    FilterVisKeywords.initialize = function(EEXCESSObj){
    };

    FilterVisKeywords.draw = function (allData, inputData, $container, filters, settings) {

        //var categoryValues = filters[0]['categoryValues'];
        var categoryValues = underscore.chain(filters).map('categoryValues').flatten().uniq().value();
        var selectedData = underscore(filters).map('dataWithinFilter');

        var $vis = $container.find('.FilterVisKeywords');
        if ($vis.length == 0){
            $vis = $('<div class="FilterVisKeywords"></div>');
            $container.append($vis);
        }
        
        var keywordsItmes = []
        for(var i=0; i < categoryValues.length; i++) {
            var keyword = categoryValues[i]; 
            var keywordFormated = '<span>' + keyword + '</span>';
            if (settings.textualFilterMode != 'textOnly'){
                var color = "#000000"; 
                if(inputData.colors.length > i) {
                    color = inputData.colors[i]; 
                }                
                keywordFormated = '<span style="color:' + color + '; font-weight:bold;">' + keyword + '</span>';
            }
            keywordsItmes.push(keywordFormated); 
        }
        var items = keywordsItmes.join(', ');
                
        $vis.html('<div class="" style="align:center; padding:5px;">' + items + '</div>');
    };


    FilterVisKeywords.finalize = function(){
    };
    
    PluginHandler.registerFilterVisualisation(FilterVisKeywords, {
        'displayName' : 'Keywords', 
        'type' : 'keyword', 
    });
})();
