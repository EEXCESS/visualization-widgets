 (function() {
 	var searchData = new Object();

 	window.searchOperator = {
 		init: function(){
 			searchData.timeRange = new Object();
 			searchData.contextKeywords = new Array();
            // inform the recommender, that the query was created manually
            searchData.context = {
                reason:'PowerSearch'
            };
 			
 		},
 		setWhatData: function(data) {
 			searchData.contextKeywords.push(data);
 		},
 		setWhoData: function(data) {
 			searchData.contextKeywords.push(data);
 		},
 		setWhereData: function(data) {
 			searchData.contextKeywords.push(data);	
 		},
 		getSearchData: function(){
 			return searchData;
 		},
 		setTimeRangeData: function(data) {
 			searchData.timeRange = data;
 		}		

 	}

 	searchOperator.init();

 })(window);