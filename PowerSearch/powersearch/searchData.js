 (function() {
 	var SearchData = new Object();

 	var SearchOperator = {
 		init: function(){
 			SearchData.whatData = new Array();
 			SearchData.whoData = new Array();
 			SearchData.whereData = new Array();
 			SearchData.timeRangeData = new Array();
 		},
 		setWhatData: function(data) {
 			SearchData.whatData.push(data);
 		},
 		setWhoData: function(data) {
 			SearchData.whoData.push(data);
 		},
 		setWhereData: function(data) {
 			SearchData.whereData.push(data);	
 		},
 		setTimeRangeData: function(data) {
 			SearchData.timeRangeData.push(data);
 		}

 	}
 	SearchOperator.init();

 })();