var TagBasedVisRec = (function() {
    
    if (!USE_VIZREC)
        return false;
    
	var _this = {};

	var s = {};

	var defaultOptions = {

	};

	var tagContentConatainerId = "userProvidedTagsContent";
	var mergedTags = "";

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  Events Listeners
	var Events = { };
	Events.recTagToolTipMouseOuted = function(d) {
		$(this).css("opacity", 0.3);
	};

	Events.recTagToolTipMouseOver = function(d) {
		$(this).css("opacity", 0.9);
	};

	Events.recTagToolTipMouseClick = function(d) {
		mergedTags = ""; 
		if ($("#" + tagContentConatainerId).length > 0) {
			mergedTags = $("#" + tagContentConatainerId).val().trim().replace(/ /g,'').split(',').join();
		}
		$("#visRecBasedOnTagContainer").remove(); 

		$('<div id="visRecBasedOnTagContainer"></div>').dialog({
			modal : true,
			title : "Please provide tag separated by comma",
			width : 350,
			height : 175,
			open : function() {
				var markup = '';	
				$("#" + tagContentConatainerId).remove();
				var textArea = '<textarea id="' + tagContentConatainerId + '" required cols="5" rows="3"style="width:315px; height:80px; font-size:12px;">' + mergedTags + '</textarea>';
				markup = markup + textArea;
				$(this).html(markup);
			},
			buttons : {
				send : function() {
					var userInput = $("#" + tagContentConatainerId).val().trim().replace(/ /g,'');
					tags = userInput.split(',');
					// TODO send request

					$(this).dialog("close");
				},
				cancel : function() {
					$("#" + tagContentConatainerId).val(mergedTags);
					$(this).dialog("close");
				}
			}
		});
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//  TagBasedVisRec

	function TagBasedVisRec(arguments) {
		_this = {};
		s = $.extend(defaultOptions, arguments);
		scaledMultipleYAxisRenderer = new MultipleYAxisRenderer();
	}

	var attach = function(container) {
		var recTagToolTip = $("<div class='eexcess-vis-tag-tooltip'/>").appendTo(container);
		$(recTagToolTip).html("provide tags").css("opacity", 0.3)
		.on("click", Events.recTagToolTipMouseClick)
		.on("mouseover", Events.recTagToolTipMouseOver)
		.on("mouseout", Events.recTagToolTipMouseOuted)
		.animate({
			top : '100px',
			opacity : 0.9
		}, {
			duration : 1000
		}).delay(1000)
		.animate({
			top : '0px',
			opacity : 0.3
		}, {
			duration : 1000
		});
	};

	return {
		attach : attach
	};

}); 