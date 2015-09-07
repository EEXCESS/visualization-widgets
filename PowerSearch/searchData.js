 (function() {
 	var searchData = new Object();

 	window.searchOperator = {
 		init: function(){
 			searchData.timeRange = new Object();
 			searchData.contextKeywords = new Array();
 			searchData.contextNamedEntities = new Object();
 			searchData.contextNamedEntities.persons = new Array();
 			searchData.contextNamedEntities.locations = new Array(); 	
                        // inform the recommender, that the query was created manually
                        searchData.context = {
                            reason:'PowerSearch'
                        };
 			
 		},
 		setWhatData: function(data) {
 			searchData.contextKeywords.push(data);
 		},
 		setWhoData: function(data) {
 			searchData.contextNamedEntities.persons.push(data);
 		},
 		setWhereData: function(data) {
 			searchData.contextNamedEntities.locations.push(data);	
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