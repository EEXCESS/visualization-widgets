(function(){

    var FilterVisSelectedItems = {};

    FilterVisSelectedItems.initialize = function(EEXCESSObj){		
    };

    // allData, inputData, $container, filters, settings, e
    FilterVisSelectedItems.draw = function($container, itemsClicked, dataWithinFilter, settings){
        var $vis = $container.find('.FilterVisSelectedItemsList');
        if ($vis.length == 0){
            $vis = $('<div class="FilterVisSelectedItemsList"></div>');
            $container.append($vis);
        }
        
        if (settings.textualFilterMode == 'textOnly'){
            FilterVisSelectedItems.drawText($vis, itemsClicked);
            return;
        }

        var items = "";
        var previews = "";
        underscore.forEach(itemsClicked, function(item, i){ 
            var src = 'media/no-img.png';
            if (item.data.previewImage)
                src = item.data.previewImage;
            previews += '<img title="' + item.data.title + '" src="' + src + '" class="" style="width:24px; height:24px; margin:1px;" />'; 
            items += '<span title="' + item.data.id + '">' + i + ' '+ item.selectionMode +' </span><br />';
        });
        $vis.html('<div class="listFilterImages" style="align:center; padding:5px;">' + previews + '</div><div class="debug">Selected Items: ' + itemsClicked.length + '<br />' + items + '</div>');
        
        
        if (settings.textualFilterMode == 'textAndViz'){
            FilterVisSelectedItems.drawText($vis, itemsClicked);
        }
    };

    FilterVisSelectedItems.drawText = function($vis, itemsClicked){
        var textOutput = "";
        underscore.forEach(itemsClicked, function(item, i){ 
            textOutput += '<div class="itemTitle" title="' + item.data.title + '">' + item.data.title + '</div>';
        });
        $vis.append(textOutput);
    };

    FilterVisSelectedItems.finalize = function(){
    };
    
    PluginHandler.registerFilterVisualisation(FilterVisSelectedItems, {
        'displayName' : 'TestMini List', 
        'type' : 'list', 
    });
})();
