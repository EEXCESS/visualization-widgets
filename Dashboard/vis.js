function Visualization( EEXCESSobj ) {
    
	var self = this;
	var EEXCESS = EEXCESSobj || {};
	
    var width;		// Screen width
    var height;	    // Screen height
	
    var inputData;

    
    // DOM Selectors
    var root = "div#eexcess_canvas";											                   // String to select the area where the visualization should be displayed
    var filterContainer = "#eexcess-filtercontainer"; 
	var searchField = "#eexcess_search_field";									                   // String to select search field in the header
	var btnSearch = "#eexcess_search_button";									                   // Selector for search button on left side of the header
	var headerText = "#eexcess_header_text";									                   // String to select the text container in the middle of the header
	var btnReset = "#eexcess_btnreset";											                   // Selector for reset button in vis control panel
	var chartSelect = "#eexcess_select_chart";									                   // select for chart
	var divMapping = "#eexcess_controls_mappings";								                   // div that contains selects for mapping combinations
	var divMappingInd = "#eexcess_mapping_container_";							                   // id for the above div
	var mappingSelect = ".eexcess_select";										                   // To select all visual channels' <select> elements by class
	var contentPanel = BOOKMARKDIALOG.Config.contentPanel;										   // Selector for content div on the right side
	var contentList = "#eexcess_content .eexcess_result_list";					                   // ul element within div content
	var allListItems = "#eexcess_content .eexcess_result_list .eexcess_list";	                   // String to select all li items by class
	var listItem = "#eexcess_content .eexcess_result_list #data-pos-";			                   // String to select individual li items by id
	var colorIcon = ".color_icon";												                   // Class selector for div icon colored according to legend categories
	var favIconClass = ".eexcess_fav_icon";                                                        // img element fpr favicon (either on or off)
    var bookmarkDetailsIconClass = ".eexcess_details_icon";                                        // img element with 3-dot icon in each list item used to display bookmarked item's details on click
	
    // SEE BELOW
    
    /*
     * Loading identifiers from new Bookmarking-Config to also provide it
     * outside the RD
     */
    var bookmarkDialogClass = BOOKMARKDIALOG.Config.bookmarkDialogClass;                           // Class selector for both types of dialog: save bookmark and see-and-edit-bookmark
    var editBookmarkButton = BOOKMARKDIALOG.Config.editBookmarkButton;                             // Id for a button that shows the other bookmark-related edit-buttons
    var editBookmarkContainer = BOOKMARKDIALOG.Config.editBookmarkContainer;                        // Container holding the bookmark-edit-buttons.
    var saveBookmarkDialogId = BOOKMARKDIALOG.Config.saveBookmarkDialogId;                         // Id for dialog poping up upon clicking on a "star" icon
    var bookmarkDropdownList = BOOKMARKDIALOG.Config.bookmarkDropdownList;                         // Div wrapping drop down list in bookmark dialog
    var newBookmarkOptionsId = BOOKMARKDIALOG.Config.newBookmarkOptionsId;                         // Div wrapping color picker and input element in bookmark dialog
    var bookmarkDialogInputWrapper = BOOKMARKDIALOG.Config.bookmarkDialogInputWrapper;             // Wrapper for input containing new bookmark name
    var detailsBookmarkDialogId = BOOKMARKDIALOG.Config.detailsBookmarkDialogId;                   // Dialog displaying bookmark detials (when click on 3-dotted icon)
    var bookmarkedInId = BOOKMARKDIALOG.Config.bookmarkedInId;                                     // Divs in bookamark details dialog showing bookmarks in which the current item is recorded
	var filterBookmarkDialogId =BOOKMARKDIALOG.Config.filterBookmarkDialogId;					   // Id for dialog filter bookmark
	var filterBookmarkDropdownList = BOOKMARKDIALOG.Config.filterBookmarkDropdownList;             // Div wrapping drop down list in filter bookmark dialog
	var deleteBookmark = BOOKMARKDIALOG.Config.deleteBookmark;									   // Button for boookmark deleted.
	var addBookmarkItems = BOOKMARKDIALOG.Config.addBookmarkItems;								   // Button for add boookmarkitems.
	var saveFilterButton = BOOKMARKDIALOG.Config.saveFilterButton;                                 // Button for saving filters and its items
    var exportBookmark = BOOKMARKDIALOG.Config.exportBookmark;									   // Export bookmark data.
	var importBookmark = BOOKMARKDIALOG.Config.importBookmark;									   // Import bookmark data.
	var importBookmarkStyle = BOOKMARKDIALOG.Config.importBookmarkStyle;						   // Styles import bookmark button control.
    var colorPickerId = BOOKMARKDIALOG.Config.colorPickerId;                                       // Div tranformed into a colorpicekr in bookmark dialog
    	
    // Icon & Image Constants
	var LOADING_IMG = "media/loading.gif";
	var NO_IMG = "media/no-img.png";
    var FAV_ICON_OFF = "media/icons/favicon_off.png";
    var FAV_ICON_ON = "media/icons/favicon_on.png";
    var REMOVE_SMALL_ICON = BOOKMARKDIALOG.Config;
    var BOOKMARK_DETAILS_ICON = "media/batchmaster/ellipsis.png";
    var IMG_COLOR_WHEEL_LARGE = "media/color-spectrum.jpg";
    var IMG_COLOR_WHEEL_MEDIUM = "media/color-wheel.jpg";
    var ICON_EUROPEANA =  "media/icons/Europeana-favicon.ico";
    var ICON_MENDELEY = "media/icons/mendeley-favicon.ico";
    var ICON_ZBW = "media/icons/ZBW-favicon.ico";
    var ICON_WISSENMEDIA = "media/icons/wissenmedia-favicon.ico";
    var ICON_KIM_COLLECT = "media/icons/KIM.Collect-favicon.ico";
	var ICON_UNKNOWN = "media/icons/help.png";

    // String Constants
    var STR_LOADING = "Loading...";
    var STR_NO_DATA_RECEIVED = "No Data Received";
    var STR_NEW = BOOKMARKDIALOG.Config.STR_NEW;
	var STR_BOOKMARK_NAME_MISSING = BOOKMARKDIALOG.Config.STR_BOOKMARK_NAME_MISSING;
	var STR_SHOWALLRESULTS = BOOKMARKDIALOG.Config.STR_SHOWALLRESULTS;

	
	// Main variables
	var data, originalData;				// contains the data to be visualized
	var mappings;						// contains all the possible mapping combiantions for each type of visualization
	var query;							// string representing the query that triggered the current recommendations
	var charts = [];
	var groupBy;
	
	
	// Ancillary variables
	var visChannelKeys;					// array containing the keys (names) of the visual atributes corresponding to the current chart
	var mappingSelectors;			    // Selector array for visual channel <select>. Necessary for event handlers
	var indicesToHighlight = [];	    // array containing the indices of <li> elements to be highlighted in content list
	var highlightedData = [];	    	// array containing the data elements to be highlighted in content list
	var  selectedChartName;
    //var idsArray;

	var dashboardSettings = {
			selectedChart: 'geochart', 
			hideControlPanel: false, 
			hideCollections: false,
			showLinkImageButton: false,
			showLinkItemButton: false,
			showScreenshotButton: false
		};

	// Chart objects
	var timeVis, barVis, geoVis, urankVis, landscapeVis;
	
	// Feedback window
	var dashboardFeedback; 
    

    define.amd = false; // needed for intro.js, because otherwise, it executes some requreJs stuff, instead of initializing...
    Modernizr.load([{test: 'libs/intro.min.js', load: 'libs/intro.min.js', complete: function(){
    }}]);



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     *  START object is returned to starter so it can call init or redresh upon new results received
     *
     */

    var START = {};
    START.plugins = [];
    START.inputData = [];
    
    
    START.sendMsgAll = function(msg) {
        var iframes = document.getElementsByTagName('iframe');
        for (var i = 0; i < iframes.length; i++) {
            iframes[i].contentWindow.postMessage(msg, '*');
        }
        window.parent.postMessage(msg, '*');
    };

	/**
	 * 	Initizialization function called from starter.js
	 * 	Sets up the visualization-independent components and instantiates the visualization objects (e.g. timeVis)
	 *
	 * */
	START.updateSettings = function(settings){		
		
		$.extend(dashboardSettings, settings);
		
		if (settings.selectedChart != undefined){
			$(chartSelect).val(settings.selectedChart).change();
		}		
		
		if (settings.hideControlPanel != undefined){
			if (settings.hideControlPanel)
				$('#eexcess_main_panel').addClass('hideControlPanel');
			else 
				$('#eexcess_main_panel').removeClass('hideControlPanel');
		}
		
		if (settings.hideCollections != undefined){
			$('#eexcess_bookmarkselected_container').toggle(!settings.hideCollections);
			if (settings.hideCollections)
				$('#eexcess_collections').css('visibility', 'hidden');
			else 
				$('#eexcess_collections').css('visibility', '');
		}
		
		if (settings.showLinkItemButton != undefined || settings.showLinkImageButton != undefined || settings.hideCollections != undefined){
			LIST.buildContentList();
		}
		
		if (settings.showScreenshotButton != undefined){
			if (settings.showScreenshotButton){
				// switched from requireJS to Modernizr because of the following error in Moodle Plugin: Uncaught Error: Mismatched anonymous define() module: function
				Modernizr.load([{test: 'libs/html2canvas.js', load: 'libs/html2canvas.js', complete: function(){
					Modernizr.load([{test: 'libs/html2canvas.js', load: 'libs/html2canvas.js', complete: function(){
						$('#screenshot').addClass('enabled');
					}}]);
				}}]);
			} else 
				$('#screenshot').removeClass('enabled');
		}
		
		if (settings.origin != undefined){
            if (settings.origin.userID == null || settings.origin.userID == '' || settings.origin.userID == '0')
                settings.origin.userID = undefined;

            $.extend(LoggingHandler.origin, settings.origin);
		}
		
		if (settings.textualFilterMode != undefined){
            FilterHandler.textualFilterMode = settings.textualFilterMode;
		}
		
		if (settings.showIntroduction != undefined){
            VISPANEL.initIntro();
		}
	};
	
	START.init = function(){
        
        BOOKMARKDIALOG.populate(jQuery('#eexcess_content'), true);
        
        //VISPANEL.initHighlightFeedbackButton();
		VISPANEL.evaluateMinimumSize();
		PREPROCESSING.bindEventHandlers();
		timeVis = new Timeline(root, EXT);
		barVis = new Barchart(root, EXT);
        geoVis = new Geochart(root, EXT);
       
		try{
        	urankVis = new UrankVis(root, EXT, EEXCESS);
		} catch(ex){
			console.log('uRank couldnt be loaded.');
		}
		try{
        	landscapeVis = new LandscapeVis(root, EXT, EEXCESS);
		} catch(ex){
			console.log('LandscapeVis couldnt be loaded.');
		}

        LoggingHandler.init(EXT);
        LoggingHandler.log({ action: "Dashboard opened" });
        BookmarkingAPI = new Bookmarking();
        BookmarkingAPI.init();        
        PluginHandler.initialize(START, root, filterContainer);
        FilterHandler.initialize(START, EXT, filterContainer);
        START.plugins = PluginHandler.getPlugins();
        VISPANEL.clearCanvasAndShowMessage( STR_LOADING );
        
        START.sendMsgAll({event: 'eexcess.currentResults'});
                        
        $(document).ready(function(){
            
	        $(window).on('resize', underscore.debounce(function(){
				VISPANEL.evaluateMinimumSize();
	        	VISPANEL.drawChart();
                LoggingHandler.log({ action: 'Window Resized' });
                if(dashboardFeedback) {
                    dashboardFeedback.dialog("option", "position", "center");
                }
            }, 1000));
			
			$('#screenshot').on('click', function(){
                LoggingHandler.log({ action: "Screenshot created" });
				html2canvas($('#eexcess_vis_panel')[0], {
					onrendered: function(canvas){
						window.parent.postMessage({event:'eexcess.screenshot', data: canvas.toDataURL("image/png")}, '*');
				}});
			});
			
			$('#eexcess-chartselection .chartbutton').on('click', function(){
                /**
                 * WebGlVis gets triggered via separate button. Just opens dialog
                 * @see{WebGlVisPlugin}
                 */ 
                if ($(this).data('targetchart') === "WebGlVis")
                    return true;
                
				$("#eexcess_select_chart").val($(this).data('targetchart')).change();
			});
            
            $(document)
            .on('mouseenter', "#eexcess_content_list", function(e){ LoggingHandler.componentMouseEnter('list'); })
            .on('mouseleave', "#eexcess_content_list", function(e){ LoggingHandler.componentMouseLeave('list'); })
            
            .on('mouseenter', "#eexcess_vis_panel", function(e){ LoggingHandler.componentMouseEnter('main'); })
            .on('mouseleave', "#eexcess_vis_panel", function(e){ LoggingHandler.componentMouseLeave('main'); })
            
            .on('mouseenter', "#eexcess_fixed_controls", function(e){ LoggingHandler.componentMouseEnter('config'); })
            .on('mouseleave', "#eexcess_fixed_controls", function(e){ LoggingHandler.componentMouseLeave('config'); })
            
            .on('mouseenter', "#eexcess-chartselection", function(e){ LoggingHandler.componentMouseEnter('views'); })
            .on('mouseleave', "#eexcess-chartselection", function(e){ LoggingHandler.componentMouseLeave('views'); })
            
            .on('mouseenter', "#eexcess-filtercontainer", function(e){ LoggingHandler.componentMouseEnter('filters'); })
            .on('mouseleave', "#eexcess-filtercontainer", function(e){ LoggingHandler.componentMouseLeave('filters'); })
            ;
	    });
	};



    /**
     * 	Initizialization function called from starter.js
     * 	Sets up the visualization-independent components and instantiates the visualization objects (e.g. timeVis)
     *
     * */
    START.refresh = function(input){

        if(typeof input == 'undefined' || input == 'undefined'){
            VISPANEL.clearCanvasAndShowMessage( STR_NO_DATA_RECEIVED );
            return;
        }

        width  = $(window).width();
        height = $(window).height();

        var mapping = VISPANEL.internal.getSelectedMapping();
        FilterHandler.initializeData(input.data, mapping);
        data = input.data; //receivedData;													// contains the data to be visualized
        originalData = input.data;
        charts = input.charts; //receivedCharts;
        mappings = input.mappingcombination; //PREPROCESSING.getFormattedMappings( receivedMappings );		// contains all the possible mapping combiantions for each type of visualization
        query = input.query;													// string representing the query that triggered the current recommendations

        // Initialize template's elements
        PREPROCESSING.setAncillaryVariables();
        BOOKMARKS.updateBookmarkedItems();
        PREPROCESSING.extendDataWithAncillaryDetails();
        QUERY.updateHeaderText( "Query Results : " + data.length );
        QUERY.updateSearchField( query );
        $(chartSelect).unbind('change');
        CONTROLS.buildChartSelect();
        LIST.buildContentList();
		FILTER.buildFilterBookmark();
		BOOKMARKS.exportBookmarks();
		BOOKMARKS.importBookmarks();
		BOOKMARKS.handleBookmarkEditButton();
        
        // Call method to create a new visualization (empty parameters indicate that a new chart has to be drawn)
        VISPANEL.drawChart();


        //BookmarkingAPI.testBookmarking();
    };

    START.refreshChartSelect = function(){       
    	START.plugins = PluginHandler.getPlugins();
    	globals.mappingcombination = getMappings();
    	globals.charts = getCharts(globals.mappingcombination); 	
    	mappings = globals.mappingcombination;
    	charts = globals.charts;
        CONTROLS.reloadChartSelect();
    }

    START.getData = function(){
    	return data;
    };

    START.getHighlightedData = function(){
    	return highlightedData;
    };

    START.clearCanvasAndShowLoading = function(){
    	VISPANEL.clearCanvasAndShowMessage( STR_LOADING );
    };

    START.clearCanvasAndHideLoading = function(){
    	VISPANEL.clearCanvasAndShowMessage();
    };
    

    /**
     * Functions below needed for WebGL-Plugin to communicate with Visualization-Object
     */
    START.getBookmarkObj = function () {
        return BOOKMARKS;
    };
    START.getEventHandlerObj = function () {
        return EVTHANDLER;
    };
    START.getBookmarkedItems = function(){
      return BOOKMARKDIALOG.BOOKMARKS.bookmarkedItems;  
    };
    START.getPluginVis = function(type){
        console.log("Getting the filter-vis-obj of type " + type);
        switch (type) {
            case "time": return timeVis;
            case "category": return barVis;
            case "geo": return geoVis;
            case "keyword": return urankVis;
            case "landscape": return landscapeVis;
        }
        return null;
    };
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var PREPROCESSING = {};
	
	
	/**
	 *	Bind event handlers to buttons
	 *$
	 * */
    PREPROCESSING.bindEventHandlers = function () {
        $(btnSearch).click(function () { EVTHANDLER.btnSearchClicked(); });
        $(searchField).on('keypress', function (e) { if (e.keyCode == 13) EVTHANDLER.btnSearchClicked(); });
        $(btnReset).click(function () { EVTHANDLER.btnResetClicked(); });
        $('html').click(function () { if (BOOKMARKDIALOG.BOOKMARKS.isBookmarkDialogOpen) BOOKMARKS.destroyBookmarkDialog(); });
        // $('#demo-button-university').click(function (e) { $(this).addClass('checked'); $('#demo-button-historicalbuildings').removeClass('checked'); onDataReceived(getDemoResultsUniversity()); });
        // $('#demo-button-historicalbuildings').click(function (e) { $(this).addClass('checked'); $('#demo-button-university').removeClass('checked'); onDataReceived(getDemoResultsHistoricBuildings()); });
        $('#globalsettings').on('click', function (e) { e.preventDefault(); EVTHANDLER.globalSettingsButtonClicked(e) });
        $('#vis_dashboard_info').on('click', function (e) { e.preventDefault(); EVTHANDLER.dashboardInfoButtonClicked(e) });
        $('#vis_dashboard_feedback').on('click', function (e) { e.preventDefault(); EVTHANDLER.dashboardFeedbackButtonClicked(e) });
        $('#sendDashboardFeedbackBtn').on('click', function (e) { e.preventDefault(); EVTHANDLER.sendFeedbackButtonClicked(e) });
        $('#vis_dashboard_info').on('click', function (e) { e.preventDefault(); EVTHANDLER.visDashboardInfoButtonClicked(e) });
        
        $(document).keyup(function (e) {
            if (e.keyCode == 27) { // ESC
                FilterHandler.clearCurrent();
                FilterHandler.clearList();
                LIST.highlightListItems();
                var visObject = VISPANEL.getMainChartObject();
                if (visObject != null && typeof visObject.resetFilter == 'function'){
                    visObject.resetFilter();
                    LoggingHandler.log({action: "Brush removed", widget: "esc", component: VISPANEL.chartName});
                }
            }
            else if (e.keyCode==83){ //s 
                FilterHandler.textualFilterMode = FilterHandler.textualFilterMode == 'vizOnly' ? 'textOnly' : FilterHandler.textualFilterMode == 'textOnly' ? 'textAndViz' : 'vizOnly';
                console.log('Micro Vis Display mode switched to: ' + FilterHandler.textualFilterMode); 
            }
        });
    };


	
	/**
	 * Format the received mapping combinations so they can be more easily manipulated
	 * 
	 **/
	PREPROCESSING.getFormattedMappings = function( originalMappings ){
		
		formattedMappings = [];
			
		charts.forEach(function(chart, chartIndex){
			
			// formattedMappings[].combinations is a 2D array containing all the possible combinations for each chart
			// outer array => 1 mapping combination per element. Inner array => 1 visual channel/attribute per element
			formattedMappings.push({ 'chart': chart, 'combinations': new Array() });		
			var keys = [];
			
			// Find in the mappings received the first mapping combination for the current chart
			var firstIndex = 0;
			while(firstIndex < originalMappings.length && originalMappings[firstIndex].chartname != chart)
				firstIndex++;
			
			// Find the visual channels' keys for the current chart
			originalMappings[firstIndex].visualchannels.forEach(function(vc){
				keys.push(vc.label);
			});
			
			// Find all the mapping combinations for the current chart, starting from firstIndex
			//(it's already known that the previous mappings are not for current chart)
			for(var i = firstIndex; i < originalMappings.length; i++){
				
				if(originalMappings[i].chartname == chart){
					
					//	Mapping combination found. Add new array element to formattedMappings[].combinations[] array   
					var combIndex = formattedMappings[chartIndex].combinations.length;		
					formattedMappings[chartIndex].combinations[combIndex] = new Array();
					
					originalMappings[i].visualchannels.forEach(function(vc){
					
						var visChannel = {'facet': vc.component.facet, 'visualattribute': vc.label};
						var vcIndex = keys.indexOf(vc.label);
						
						formattedMappings[chartIndex].combinations[combIndex][vcIndex] = visChannel;
					});
				}
			}
		});

		formattedMappings = PREPROCESSING.dirtyFixForMappings(formattedMappings);	// once fixed in server delete this line and the method
		return formattedMappings;
	};
	
	
	PREPROCESSING.dirtyFixForMappings = function(formattedMappings){

		var i = formattedMappings.getIndexOf("barchart", "chart");
		if (i != -1)
            formattedMappings.splice(i, 1);
		
		i = formattedMappings.push( {'chart': 'barchart', 'combinations': new Array()} );
        i--;
		charts.push('barchart');
		
		var facets = ['language', 'provider'];
		facets.forEach(function(facet){
			var combIndex = formattedMappings[i].combinations.length;
			formattedMappings[i].combinations[combIndex] = new Array();
			formattedMappings[i].combinations[combIndex].push( {'facet': facet, 'visualattribute': 'x-axis'} );
			formattedMappings[i].combinations[combIndex].push( {'facet': 'count', 'visualattribute': 'y-axis'} );
			formattedMappings[i].combinations[combIndex].push( {'facet': facet, 'visualattribute': 'color'} );
		});
		
        i = formattedMappings.getIndexOf("geochart", "chart");
        if (i != -1)
            formattedMappings.splice(i, 1);

        i = formattedMappings.push( {'chart': 'geochart', 'combinations': new Array()} );
        i--;
        charts.push('geochart');
        facets.forEach(function(facet){
            var combIndex = formattedMappings[i].combinations.length;
            formattedMappings[i].combinations[combIndex] = new Array();
            formattedMappings[i].combinations[combIndex].push( {'facet': facet, 'visualattribute': 'color'} );
        });

		return formattedMappings;
	};

	

    PREPROCESSING.setAncillaryVariables = function() {
	    //indicesToHighlight = [];
        BOOKMARKDIALOG.BOOKMARKS.isBookmarkDialogOpen = false;
        //idsArray = data.map(function(d){ return d.id; });//not used
    };





    PREPROCESSING.extendDataWithAncillaryDetails = function(){

        data.forEach(function(d){

            // Set 'bookmarked' property to true or false
            if(typeof BOOKMARKDIALOG.BOOKMARKS.bookmarkedItems[d.id] !== 'undefined' && 
                BOOKMARKDIALOG.BOOKMARKS.bookmarkedItems[d.id] !== 'undefined')
                d['bookmarked'] = true;
            else
                d['bookmarked'] = false;


            // Assign 'provider-icon' with the provider's icon
            switch(d.facets.provider){
                case "europeana":
                case "Europeana":   d['provider-icon'] = ICON_EUROPEANA; break;
			    case "mendeley":    d['provider-icon'] = ICON_MENDELEY; break;
                case "econbiz":
                case "ZBW":         d['provider-icon'] = ICON_ZBW; break;
                case "wissenmedia": d['provider-icon'] = ICON_WISSENMEDIA; break;
                case "KIM.Collect": d["provider-icon"] = ICON_KIM_COLLECT; break;
                default:            d['provider-icon'] = ICON_UNKNOWN; break;
            }
        });

    };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var QUERY = {};
	
	/**
	 *	Updates the text in the center of the header according to the received paramter 
	 *
	 * */
	QUERY.updateHeaderText = function( text ){
		
		if( text == STR_LOADING){
			$( headerText ).find( "span" ).text( "" );
            
            VISPANEL.clearCanvasAndShowMessage( STR_LOADING );
		}
		else{
			$( headerText ).find( "span" ).text( text );
		}
	};
	
	/**
	 * Updates search field on the header (on left side for the moment)
	 * 
	 **/
	QUERY.updateSearchField = function( text, action ){
		$( searchField ).attr( "value", text );
	};
	
	
	QUERY.refreshResults = function(){
		var terms = $( searchField ).val();
		
		// Search for new results if the query is different from the current one
		if(terms != query){
			this.updateHeaderText( STR_LOADING );
            //EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {terms:[{weight:1,text:terms}],reason:{reason:'manual'}}});
		}
	};

	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var EVTHANDLER = {};


	/**
	 * Click on search button triggers a new search
	 * 
	 * */
	EVTHANDLER.btnSearchClicked = function(){
		QUERY.refreshResults();
	};
    
	
	/**
	 * 	Chart <select> changed
	 * 
	 * */
	EVTHANDLER.chartSelectChanged = function(){		
		VISPANEL.drawChart();
	};
	
	
	/**
	 *	Function that wraps the change event handlers. These events are triggered by the <select> elements (chart and visual channels)
	 *
	 * */
	EVTHANDLER.setSelectChangeHandlers = function(){
		// Change event handler for visual channels' <select> elements
		$(mappingSelectors).each(function(i, item){	

            if($(item).attr('isDynamic').toBool())
                $(item).change(function(){
                    var mapping = VISPANEL.internal.getSelectedMapping(this);
                    FilterHandler.initializeData(EXT.getOriginalData(), mapping);
				    VISPANEL.drawChart( this );
                    FilterHandler.refreshAll();
					if ($(this).attr('name') == "color"){
						LoggingHandler.log({ action: "ColorMapping changed", source:"Config", new: $(this).val() });
					}
			 });
		});
	};
	
	
	////////	content list item click	////////
	
	EVTHANDLER.listItemClicked = function(d, i, isSelectedFromOutside, x, y, z){
		if (d3.event.ctrlKey){
        	LIST.selectListItem( d, i, false, true);
		} else {
        	LIST.selectListItem( d, i, false, false);
    	}
	};
	

	
	
	////////	Reset Button Click	////////
	
	EVTHANDLER.btnResetClicked = function(){			
		LIST.highlightListItems();
		LIST.scrollToFirst();
		//$(filterBookmarkDialogId+">div>span").text(STR_SHOWALLRESULTS);
		//$(filterBookmarkDialogId+">div>div").css("background","inherit");
		//$(deleteBookmark).prop("disabled",true);		
		//FILTER.showStars();	
		//FILTER.updateData();			
		VISPANEL.updateCurrentChart( "reset_chart" );
        FilterHandler.reset();
        LoggingHandler.log({action: "Reset", source: "Main" });
	};


    /**** Bookmark section in content list items ****/

	////////	Star Icon clicked on list item    ////////

    EVTHANDLER.faviconClicked = function(d, i, event){

        d3.event ? d3.event.stopPropagation() : event.stopPropagation();
        //BOOKMARKS.buildSaveBookmarkDialog(d, i, this);//ask cecillia ????????
		BOOKMARKS.buildSaveBookmarkDialog(
            d,
			function(thisValue){
				BOOKMARKDIALOG.BOOKMARKS.setCurrentItem(d, i, query);
			},
			function(bookmarkDetails){
				bookmarkDetails.append('p').text(d.title);
			},EVTHANDLER.bookmarkSaveButtonClicked,
			this);
    };

    EVTHANDLER.linkImageClicked = function(d, i){
        d3.event ? d3.event.stopPropagation() : event.stopPropagation();
		window.parent.postMessage({event:'eexcess.linkImageClicked', data: d}, '*');
        
		LoggingHandler.log({action: "Link item image clicked", itemId: d.id, itemTitle: d.title });
    };

    EVTHANDLER.linkItemClicked = function(d, i){
        d3.event ? d3.event.stopPropagation() : event.stopPropagation();
		window.parent.postMessage({event:'eexcess.linkItemClicked', data: d}, '*');
        
		LoggingHandler.log({action: "Link item clicked", itemId: d.id, itemTitle: d.title });
    };



    EVTHANDLER.bookmarkDetailsIconClicked = function(d, i){

        d3.event.stopPropagation();
        BOOKMARKS.buildSeeAndEditBookmarkDialog(d, i);
    };





    ////////	'Save' button clicked in save bookmark dialog 	////////
    EVTHANDLER.bookmarkSaveButtonClicked = function(){
        BOOKMARKS.saveBookmark();
		FILTER.changeDropDownList();
    };





    
     EVTHANDLER.dashboardInfoButtonClicked = function(e) {    
    };
    
    EVTHANDLER.dashboardFeedbackButtonClicked = function(e) {
        dashboardFeedback = $("#vis_feeadback_dialog").dialog({
            maxWidth:600,
            maxHeight: 500,
            width: 405,
            height: 310,
           	resizable: false,
            closeOnEscape: true
        });
    };
    
    EVTHANDLER.sendFeedbackButtonClicked = function(e) {
        var feedback = $("#visDashboardFeedbackContent").val();
        LoggingHandler.log({ action: "Feedback sent", value: feedback});
        alert("Thank you for your feedback")
        $("#vis_feeadback_dialog").dialog("close");
        
    }
    
    EVTHANDLER.visDashboardInfoButtonClicked = function(e) {
        var url = "media/visDashboardInfo.pdf"; 
        window.open(url, 'pdf');  
        
    }
    
    EVTHANDLER.globalSettingsButtonClicked = function(e) {
        LoggingHandler.log({ action: "Settings clicked"})
    	var xPos =  e.clientX - 250;
	    var yPos = e.clientY - 50;
		if ($("#global-setttings-dialog").length){
			$("#global-setttings-dialog").css('visibility', 'visible');
			return; 
		}
        var topOffset = $(contentPanel).offset().top;
        var dialogGlobalSettings = d3.select("body").append("div")
            .attr("id", "global-setttings-dialog")
            .attr("class", "eexcess-bookmark-dialog")
            .style("top", yPos + "px" )
            .style("left", xPos + "px" )
            
        dialogGlobalSettings.on('click', function(){ d3.event.stopPropagation(); });

        dialogGlobalSettings.append("div")
            .attr("class", "eexcess-bookmark-dialog-title")
            .text("Global Settings");
		
        // Append details section
   		var tagCloudChooserContainer = dialogGlobalSettings.append('div')
   		    .attr("id", "excess-tag-cloud-chooser")

        tagCloudChooserContainer.append("p").text("select a tag-cloud for urank:");
        
		var tagCloudOptions =  '<fieldset>'
							  	+ '<div id ="excess-tag-cloud-chooser">'
								+ '    <p><input type="radio" name="urank-tagcloud" id="word-tagcloud" value="word-tagcloud" checked/>'
								+ '    <label for="word-tagcloud">word-tagcloud</label></p>'
								+ '    <p><input type="radio" name="urank-tagcloud" id="landscape-tagcloud" value="landscape-tagcloud" />'
								+ '    <label for="landscape-tagcloud">landscape-tagcloud</label></p>'
								+ '  </div>'
								+ '</fieldset>'
								

		var wordTagCloudOption = '<div><input type="radio" name="tagcloud" value="word-tagcloud" checked>word-tagcloud</Input></div>';
		var landscapeTagCloudOption = '<div><input type="radio" name="tagcloud" value="landscape-tagcloud">landscape-tagcloud</input></div>';

       $("#global-setttings-dialog").append(tagCloudOptions); 
	   
	   var geoChooserContainer = dialogGlobalSettings.append('div')
			.attr("id", "geochart_style_chooser")

		geoChooserContainer.append("p").text("select style for geochart");

		var tagGeoOptions =  '<fieldset>'
			+ '<div id ="excess-tag-geo-chooser">'
			+ '    <p><input type="radio" name="tag_geochart" id="pie_geo" value="pie_geo" checked/>'
			+ '    <label for="pie_geo">Pie_GeoCharts</label></p>'
			+ '    <p><input type="radio" name="tag_geochart" id="img_geo" value="img_geo" />'
			+ '    <label for="img_geo">Imgs_GeoCharts</label></p>'
			+ '  </div>'
			+ '</fieldset>'

		var pieGeoChartOption = '<div><input type="radio" name="taggeo" value="pie_geo" checked>Pie_GeoCharts</Input></div>';
		var imgGeoChartOption = '<div><input type="radio" name="taggeo" value="img_geo">Imgs_GeoCharts</input></div>';

        $("#global-setttings-dialog").append(tagGeoOptions);
       
       dialogGlobalSettings.append("div").style("text-align", "center" )       
       		.append("input")
            .attr("type", "button")
            .attr("class", "eexcess-bookmark-button")
            .attr("value", "Close")
            .on('click', function() {
            		$("#global-setttings-dialog").css('visibility', 'hidden');
             });

 		$('input[name=urank-tagcloud]:radio').change(function() {
      		if($( "#eexcess_select_chart" ).val() == "urank") {
       			VISPANEL.drawChart();
       		}
		});

		$('input[name=tag_geochart]:radio').change(function() {
            if($("#eexcess_select_chart").val() == "geochart"){
                VISPANEL.drawChart();
            }
        });
    };



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var CONTROLS = {}
	
	/**
	 * Creates the <select> element to chose the type of visualization (chart)
	 * 
	 * */
	CONTROLS.buildChartSelect = function(){
		CONTROLS.reloadChartSelect();
		$(chartSelect).change( EVTHANDLER.chartSelectChanged );
	};

	CONTROLS.reloadChartSelect = function(){
		var previouslySelected = $(chartSelect).val();
		var chartOptions = "";		
		charts.forEach(function(chart){ 
			chartOptions += "<option class=\"ui-selected\" value=\"" + chart + "\">" + chart + "</option>"; 
		});
		$(chartSelect).empty().html(chartOptions);
		if (previouslySelected)
			$(chartSelect).val(previouslySelected);
		//$(chartSelect+":eq("+ 0 +")").prop("selected", true);
	};
		
	
	
	/**
	 *	Created one <select> element per visual channel
	 *	It is executed every time the chart selection changes
	 *
	 * */	
	CONTROLS.buildVisualChannelSelects = function(){

		// Steps to create <select> elements for visual channels
		//
		var combinations = [];
        var initialMapping = [];
		var chartIndex = charts.indexOf( VISPANEL.chartName );		// VISPANEL.chartName value assigned in 'getSelectedMapping()' (the caller)
		mappingSelectors = [];
		
		visChannelKeys = [];
		var selColorMappingval = "language"; 
		if (window.localStorageCustom !== undefined) {
			if(localStorageCustom.getItem('selected-color-mapping') != null) {
				selColorMappingval = localStorageCustom.getItem('selected-color-mapping'); 
			};
		}
		var combIndex = 0; 
        if(chartIndex > -1 && mappings[chartIndex].combinations.length > 0){
			
			for(var i=0; i<  mappings[chartIndex].combinations.length; i++) {
				for(var j=0; j < mappings[chartIndex].combinations[i].length; j++  ) {
					if(mappings[chartIndex].combinations[i][j].visualattribute == "color" && 
					 mappings[chartIndex].combinations[i][j].facet == selColorMappingval ) {
						combIndex = i; 
						break; 
					}
				}
				if(combIndex > 0) {
					break; 
				}
			}
            initialMapping = mappings[chartIndex].combinations[combIndex];

            // Each item of the array "combinations" consists in an object that stores the name of the visual channel ('channel'),
            // and an empty array that will contain all its possible values ('values')
            initialMapping.forEach(function(m){
                combinations.push({'channel': m.visualattribute, 'values': []});
                visChannelKeys.push(m.visualattribute);
            });
				
            // Goes over all the combinations. Every time chartname equals the current chart, it retrieves all the possible values for each visual channel
            // The values are stored like -> combinations[0] = { channel: x-axis, values: [year, ...]}
          
			mappings[chartIndex].combinations.forEach(function(comb) {
				comb.forEach(function(vc) {
					var visAttrIndex = visChannelKeys.indexOf(vc.visualattribute);
					if (combinations[visAttrIndex]['values'].indexOf(vc.facet) == -1) {
						combinations[visAttrIndex]['values'].push(vc.facet);
					}
				});

			}); 

		
            // For each visual channel stored in the array combinations, creates a <select> element and populates its <option> subitems with the
            // values retrieved in the previous step
            combinations.forEach(function(c, i){
			
			    
			    var display = c.channel == "color" ? "" : "none";
                var divChannel = d3.select(divMapping)
				    .append("div")
					.attr("class", "eexcess_mapping_container")
					.attr("id", "eexcess_mapping_container_"+i);
			
               /* divChannel
                    .append("input")
                    .attr("type", "button")
                    .attr("class", "controllbutton")
                    .attr("id", "colorSettings"); */
			
                var selector;
                if(c.values.length > 1 && display == ""){

                    var channelSelect = divChannel
			       		 .append("ul")
                            .attr("class", "eexcess_select jq-dropdown-menu")
					        .attr("name", c.channel)
					        .style("display", display)
                            .attr('isDynamic', true);
			
                    var mappingOptions = "";
					var checked = ""; 
                    c.values.forEach(function(v){
                   		if(selColorMappingval == v) {
                    		/*if (window.localStorageCustom !== undefined) {
								localStorageCustom.setItem('selected-color-mapping', v);
							}*/
                            checked = "checked";
                            mappingOptions += "<li><label><input type=\"radio\" name=\"color_mapping\" checked=\""+checked+"\" value=\""+v+"\" />"+ v + "</label></li>";
                        }
                        else {
                            mappingOptions += "<li><label><input type=\"radio\" name=\"color_mapping\" value=\""+v+"\" />"+ v + "</label></li>";
                    	}
                    })
                    channelSelect.html( mappingOptions );

                    selector = mappingSelect; // string for selecting a visual channel <select> element
                    mappingSelectors.push(divMappingInd + "" + i + " "+ selector);
                }
                else{
                    divChannel.append('div')
                        .attr('class', 'eexcess_controls_facet_static')
                        .attr('name', c.channel)
                        .attr('isDynamic', false)
                        .style("display", display)
                        .text(c.values[0]);
                    selector = ".eexcess_controls_facet_static";
                }

                // the "mappingSelectors" array stores the selectors that allow to set change events for each visual channel <select> element in
                // the function "setSelectChangeHandlers"
                // E.g. mappingSelectors[0] = "#eexcess_mapping_container_0 .eexcess_select"
                // mappingSelectors.push(divMappingInd + "" + i + " "+ selector);
            });


            // Create event handlers
            EVTHANDLER.setSelectChangeHandlers();
		
        }
		return initialMapping;
	};
	
	
	
	/**
	 *	Update visual channels' <select> elements according to mapping combination received as parameter
	 *
	 * */
	CONTROLS.updateChannelsSelections = function( validMapping ){

		/*$(mappingSelectors).each(function(i, item){
			var channelName= $(item).attr("name");
			var channelIndex = visChannelKeys.indexOf(channelName);
			$(item + " option[value="+validMapping[channelIndex].facet+"]").prop("selected", true);
		});*/
		$(mappingSelectors).each(function(i, item){
            $("input[name=color_mapping][value="+validMapping.facet+"]").attr("checked", "checked");
        });
        if(window.localStorageCustom!==undefined) {
        	localStorageCustom.setItem('selected-color-mapping', validMapping.facet);
        }
	}
	



	
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var LIST = {};

	LIST.indicesSelected = [];
	
	LIST.internal = {
			
		/**
		 *	Calculates the index to scroll to, which depends on the existence or abscence of a ranking
		 *	There exists a ranking if dataRanking.length > 0
		 * */
		getIndexToScroll: function( indices ) {	
			if( typeof dataRanking === 'undefined' || dataRanking === 'undefined' || dataRanking.length > 0){
				for(var i = 0; i < dataRanking.length; i++){
					if( indices.indexOf( dataRanking[i].originalIndex ) !== -1 )
						return dataRanking[i].originalIndex;
				}
			}
			else
				return indices[0];
		},

		getDataItemsFromIndices: function(data, indices){
			var dataItems = [];
			for (var i = 0; i < indices.length; i++) {
				dataItems.push(data[indices[i]]);
			};
			return dataItems;
		}
	};
			
	
	/**
	 *	Function that populates the list on the right side of the screen.
	 *	Each item represents one recommendation contained in the variable "data"
	 *
	 * */	
	LIST.buildContentList = function(){

		if (data == undefined)
			return;

		/*
		var listContentWidth = $("#eexcess_collections").width();
		var rankingContainer = 0 + "px";
		var prevImgWidth = listContentWidth/100 * 12 + "px";;
		var contentWidth = listContentWidth/100 * 50 + "px";;
		var iconsContainerWidth = 30 + "px";;
		var favContainerWidth = listContentWidth/100 * 10 + "px";;
		var eexcessVisPanelWidth = "eexcess_vis_panel_width"; */
		
		var listElemAsRowElem = "eexcess_list_row_elem";
		var listHeaderAsTableElem = "eexcess_list_table_elem";
		var eexcessResultList = "eexcess_result_list"; 
		var eexcessList = "eexcess_list"; 
		var eexcessListHovered = "eexcess_list.hovered";
		var eexcessUrankLiRankingContainer = "eexcess-urank-li-ranking-container";
		var eexcessUrankLiTitleContainer = "eexcess-urank-li-title-container";
		var eexcessUrankLiTitle = "eexcess-urank-li-title";
		var eexcessUrankLiLightBg = "eexcess-urank-li-light-background";
		var eexcessUrankLiDarkBg = "eexcess-urank-li-dark-background";
		var eexcessUrankLiButtonsContainer = "eexcess-urank-list-buttons-container"; 
		var eexcessUrankLiFavIcon = "eexcess-urank-favicon"; 
		var rankingContainer = "0%";
		var prevImgWidth = "12%";
		var contentWidth ="50%";
		var iconsContainerWidth = "8%";
		var favContainerWidth ="10%";
		
		//d3.selectAll(".eexcess_ritem").remove();
		d3.selectAll( allListItems ).remove();

		var listData = d3.select(contentList).selectAll("li").data(data);

		var aListItem = listData.enter()
			.append("li")
			.attr("class", eexcessList)
			.attr("id", function(d, i){ return "data-pos-"+i; })
			.on("click", EVTHANDLER.listItemClicked);

		rankingContainer = aListItem.append("div")
			.attr("class", listElemAsRowElem + " " + eexcessUrankLiRankingContainer)
			.attr("name", "rankingCongainer")
			.style("width",rankingContainer)

		// div 1 groups the preview image, partner icon and link icon
		var imageContainer = aListItem.append("div")
			.attr("class", listElemAsRowElem)
			.style("width",prevImgWidth)

		imageContainer
			.append("img")
			.attr("class", "eexcess_preview")
			.attr("src", function(d){ return d.previewImage || NO_IMG ; })
			.style("width","40px")
			.style("height","40px");

		// div 2 wraps the recommendation title (as a link), a short description and a large description (not used yet)
		var contentDiv = aListItem.append("div")
			.attr("class", listElemAsRowElem + " " + eexcessUrankLiTitleContainer)
			.style("width",contentWidth)

		contentDiv.append("h1")
			.append("a")
			.attr("class", eexcessUrankLiTitle)
			.attr("href", function(d){return d.uri;})
			.attr('target','_blank')
			.on("click", function(d){
                LoggingHandler.documentWindowOpened();
                LoggingHandler.log({ action: "Item opened", source:"List", itemId: d.id, itemTitle : d.title });
				d3.event.preventDefault();
				d3.event.stopPropagation();
				window.open(d.uri, '_blank');
				//EEXCESS.messaging.callBG({method:{parent:'model',func:'resultOpened'},data:d.uri}); 
            })
			.text(function(d){ 
				if (d.title.length > 60) {
				    var words =  d.title.substr(0,45);
				    if (/^\S/.test(d.title.substr(45))) {
			            return words.replace(/\s+\S*$/, "") + "...";
			        }
			        return words + "...";
				}
				return d.title; 
			})
		    .attr("title", function(d){ return d.title; }); 

		/*contentDiv.append("p")
		 .attr("class", "eexcess_ritem_short")
		 .html(function(d){
		 var facetKeys = Object.keys(d.facets);
		 var string = "";

		 facetKeys.forEach(function(facetKey){
		 if( !Array.isArray(d.facets[facetKey]) )
		 string += d.facets[facetKey] + ", ";
		 });
		 return string.substring(0, string.length - 2);
		 }); */
		// bookmark section contains fav icon and details icon

		var facetPartnerIconsDiv = aListItem.append("div")
			.attr("class", listElemAsRowElem + " eexcess_ritem_icons_container")
			.style("width",iconsContainerWidth)

		facetPartnerIconsDiv.append("img")
			.attr("class", "eexcess_partner_icon")
			.attr("title", function(d){ return d.facets.provider; })
			.attr("src", function(d){ return d['provider-icon']; });

		var bookmarkDiv = aListItem.append('div')
			.attr('class', listElemAsRowElem + " " + eexcessUrankLiButtonsContainer)
			.style("width",iconsContainerWidth)

		if (!dashboardSettings.hideCollections){
			bookmarkDiv.append("img")
				.attr("class", "eexcess_fav_icon")
				.attr('title', 'Bookmark this item')
				.attr("src", function(d){ if(d.bookmarked) return FAV_ICON_ON; return FAV_ICON_OFF; })
				.style("width", "20px")
				.style("height", "20px")
				.on("click", function(d,i) {
					EVTHANDLER.faviconClicked(d,i); 
				});
		}

		if (dashboardSettings.showLinkImageButton){
			imageContainer.append("a")
				.attr("class", "link-image")
				.attr("title", "Embed image")
				.style("display", 'none')
				.on("click", function(d,i) {
					EVTHANDLER.linkImageClicked(d,i); 
				});
				
			imageContainer.on("mouseenter", function(d,i) {
					if (d.previewImage != undefined){
						$(this).find('a.link-image').fadeIn(350);
						$(this).find('img').css('opacity', '0.5');						
					}
				}).on("mouseleave", function(d,i) {
					$(this).find('a.link-image').css('display', 'none');
					$(this).find('img').css('opacity', '');
				});
		}
			
		if (dashboardSettings.showLinkItemButton){
			bookmarkDiv.append("a")
				.attr("class", "link-item")
				.attr("title", "Embed citation")
				.on("click", function(d,i) {
					EVTHANDLER.linkItemClicked(d,i); 
				});
		}

		//bookmarkDiv.append("img")
		//    .attr("class", "eexcess_details_icon")
		//    .attr('title', 'View and delete item\'s bookmarks')
		//    .attr("src", BOOKMARK_DETAILS_ICON)
		//    .style("display", function(d){ if(d.bookmarked) return 'inline-block'; return 'none'; })
		//    .on("click", EVTHANDLER.bookmarkDetailsIconClicked);

		var parentId = $(contentList).parent().parent().attr('id')
		if(!(parentId=="eexcess_content_list")) {
			$(contentList).wrap("<div id='eexcess_content_list'></div>"); 			
		} 

		$( contentList ).scrollTo( "top" );
	};
	
	
	
	/**
	 * Draws legend color icons in each content list item
	 * */
	LIST.setColorIcon = function(){
		
		$( colorIcon ).remove();
		
		var iconColorScale = 'undefined'; 
			
		if(VISPANEL.chartName == 'timeline') {
			iconColorScale =  timeVis.colorScale; 
		}
		else if(VISPANEL.chartName == 'barchart') {
			iconColorScale = barVis.colorScale; 
		}
		else if(VISPANEL.chartName == 'geochart') {
			 iconColorScale =  geoVis.colorScale; 
		}
		else if(VISPANEL.chartName == 'landscape') {
			iconColorScale = landscapeVis.colorScale; 
		}
		else if(VISPANEL.chartName == 'urank') {
			 //landscapeVis.colorScale; 
		}
		
		
		if( iconColorScale != 'undefined' ){
			
			var facet;
			for(var i = 0; i < mappingSelectors.length; i++){
				if($(mappingSelectors[i]).attr("name") == "color")
					facet = $(mappingSelectors[i]).find("input:radio:checked").first().val();
			}
            
            if (!data)
                return;
			
			for(var i = 0; i < data.length; i++){	
				// var item = $(listItem +""+ i + " .eexcess_item_ctl");
				var item = $(listItem +""+ i + " .eexcess_ritem_icons_container");
				var title = data[i].facets[facet] || 'en';
				item.append( "<div class=\"color_icon\" title=\""+ title +"\" ></div>" );	
				item.find( colorIcon ).css( 'background', iconColorScale(data[i].facets[facet] || 'en') );
			}
		}
	};
	
	/**
	 * Draws legend color icons in each content list item
	 * */
	LIST.selectListItem = function( d, i, flagSelectedOutside, addItemToCurrentSelection){

		var addItemToCurrentSelection = addItemToCurrentSelection || false;
		var isSelectedFromOutside = flagSelectedOutside || false;
		var index = i;
		var indicesToHighlight = [];

		var indexWasAlreadySelected = LIST.indicesSelected.indexOf(index) > -1;

		if (addItemToCurrentSelection)
			indicesToHighlight = LIST.indicesSelected;

		if (indexWasAlreadySelected)
			indicesToHighlight.splice(indicesToHighlight.indexOf(index), 1);
		else
			indicesToHighlight.push(index);

		LIST.indicesSelected = indicesToHighlight;
		if (indicesToHighlight.length == 0)
			indicesToHighlight = VISPANEL.getAllSelectListItems();

		if( !flagSelectedOutside )
			VISPANEL.updateCurrentChart( 'highlight_item_selected', indicesToHighlight ); // todo: remove

		var dataItemSelected = LIST.internal.getDataItemsFromIndices(data, [index]);
		var selectedWithAddingKey = addItemToCurrentSelection;
		FilterHandler.singleItemSelected(dataItemSelected[0], selectedWithAddingKey);	
		LoggingHandler.log({ action: "Item selected", source:"List", itemId: dataItemSelected[0].id, itemTitle : dataItemSelected[0].title });
	};
	

	
	/**
	 *	Function that highlights items on the content list, according to events happening on the visualization.
	 *	E.g. when one or more keywords are selected, the matching list items remain highlighted, while the others become translucid
	 *	If no parameters are received, all the list items are restored to the default opacity 
	 *
	 * */
	LIST.highlightListItems = function(){ // todo: rename: highlightItems

		var dataToHighlightIds = FilterHandler.mergeFilteredDataIds();
		d3.selectAll(allListItems).classed("highlighted", false);
		if (dataToHighlightIds == null){
			d3.selectAll( allListItems ).style("opacity", "1");
			return;
		}
		
		if(dataToHighlightIds.length > 0){
			
			for(var i = 0; i < data.length; i++){			
				var item = d3.select(listItem +""+ i);
				
				if(underscore.contains(dataToHighlightIds, data[i].id)){
					item.style("opacity", "1");
					item.classed("highlighted", true);
				} else {
					item.style("opacity", "0.2");
				}
			}
		} else {
			d3.selectAll( allListItems ).style("opacity", "1");
		}
		
		//VISPANEL.updateCurrentChart( 'highlight_item_selected', null,  dataToHighlightIds); // todo: remove
	};
	
	LIST.scrollToFirst = function(){
		var $highlighted = $(contentList).find('.highlighted');
		if ($highlighted.length > 0){
			$( contentList ).scrollTo("#" + $highlighted.attr('id'), {offsetTop: 90});	
		} else {
			$( contentList ).scrollTo( "top" ); // is this needed???
		}
	};
	
	

    LIST.turnFaviconOnAndShowDetailsIcon = function( index ){
        
        /**
         * When using the WebGL-Vis that handles not only the current query / collection
         * but a list of those, it may happen that a element to bookmark is NOT in the current list.
         * Then the index is set to null.
         * (Peter Hasitschka, 6.11.2015)
         */
        if (index === null || data[index] === undefined)
            return;
        
        // Replace favicon_off with favicon_on
        d3.select(listItem + '' +index).select(favIconClass).transition().attr("src", FAV_ICON_ON).duration(2000);
        // show bookmark details icon
        $(listItem + '' +index + ' ' + bookmarkDetailsIconClass).fadeIn('slow');
		
		data[index].bookmarked = true;
		
    };


    LIST.turnFaviconOffAndHideDetailsIcon = function( index ){
        // Replace favicon_on with favicon_off
        d3.select(listItem + '' +index).select(favIconClass).transition().attr("src", FAV_ICON_OFF).duration(2000);
        // Hide bookmark details icon
        $(listItem + '' +index + ' ' + bookmarkDetailsIconClass).fadeOut('slow');
        // Update item's property 'bookmarked'
		
		data[index].bookmarked = false;
    }

	
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var VISPANEL = {};
	
	VISPANEL.internal = {
			
        /**
         * Sets the chart and the mapping combination to be used, acording to the <select> elements' selected values
         * */
        getSelectedMapping: function( item ) {

            // if "item" is undefined -> change triggered by chart <select>, otherwise triggered by one  of the visual channels' <select>
            var changedItem = item || "undefined";

            // if the chart changes, reset array with indices to be  highlighted
            if(VISPANEL.chartName != $(chartSelect).val()){//??????????
                //indicesToHighlight = [];
			}
				
            VISPANEL.chartName = $(chartSelect).val();

            var selectedMapping = [];

            if(changedItem == "undefined"){
                // VISPANEL SELECTION CHANGED
                // Empty current visual channels controls (<select> elements)
                $(divMapping).empty();

                // Re-build visual channels' controls
                // Assign "selectedMapping" with the first possible mapping combination for the new chart, which is returned by the function below
                var selectedMapping = CONTROLS.buildVisualChannelSelects();
            }
            else{
                // VISUAL CHANNEL SELECTION CHANGED
                // Update modified visual channel with new value
                mappingSelectors.forEach(function(item){
                    var channelName = $(item).attr("name");
                    var channelValue = $(item).attr('isDynamic').toBool() ? $(item).val() : $(item).text();
                    selectedMapping.push({'facet': channelValue, 'visualattribute': channelName});
                });

                var changedChannelName = $(changedItem).attr("name");
                var changedChannelValue = $(changedItem).find("input:radio:checked").first().val(); 
                if(!changedChannelValue) {
                    changedChannelValue = $("input[name=color_mapping]:checked").val(); 
                     $(changedItem).find("input:radio:checked").first().attr("checked", true);
                   // changedChannelValue = $("input[name=color_mapping]:checked").val() == "provider" ? "language" : "provider"; 
                }
                //var changedChannelValue = $(changedItem).val();

                // selectedMapping remains unchanged if it contains a valid mapping combination, otherwise it's updated with the first valid one in the list
                selectedMapping = this.getValidatedMappings(selectedMapping, changedChannelName, changedChannelValue);
            }

            return selectedMapping;
        },


        /**
         * Checks if the mapping combination is valid. If not, it returns a valid one and calls
         * the method to change the visual attributes' selected values in the corresponding <select> elements
         *
         * */
        getValidatedMappings: function( selectedMapping, changedChannelName, changedChannelValue ) {

            var validMapping = [];
            var chartIndex = charts.indexOf( VISPANEL.chartName );
            var validUpdateMapping = {"facet": "language"}
            var validMappingFound = false;
            // Go over each mapping combination and and then over each visual channel for the current mapping combination
            for(var combIndex = 0; combIndex < mappings[chartIndex].combinations.length; combIndex++) {

                var flagIsValid = true;
                var j = 0;

                // 	Check each visual channel
                while( j < visChannelKeys.length && flagIsValid ){
                    var vcIndex = visChannelKeys.indexOf(mappings[chartIndex].combinations[combIndex][j]['visualattribute']);
                    if(mappings[chartIndex].combinations[combIndex][vcIndex]['facet'] != selectedMapping[vcIndex]['facet'])
                        flagIsValid = false;
                    j++;
                }
                // As soon as the selected combination is validated, return it
                if(flagIsValid)
                    return selectedMapping;

              
                var changedIndex = visChannelKeys.indexOf(changedChannelName);
                
                if( mappings[chartIndex].combinations[combIndex][changedIndex]['visualattribute'] == "color" &&
                    mappings[chartIndex].combinations[combIndex][changedIndex]['facet'] == changedChannelValue && !validMappingFound){
                    validMapping = mappings[chartIndex].combinations[combIndex];
                    validUpdateMapping =  mappings[chartIndex].combinations[combIndex][changedIndex];
                    if(validMapping.length ) {
                        
                    }
                    validMappingFound = true;
                }
            }
            // if loop finishes it means the selectedMapping isn't valid
            // Change <select> values according to the first valid mapping combination encountered (stored in validMapping)
            CONTROLS.updateChannelsSelections(validUpdateMapping);

            // Return valid combination
            return validMapping;
        }
					
	};

	
	/** 
	 * 	chartName = name of the chart currently displayed
	 * 
	 * */
	VISPANEL.chartName = "";
	
	
    VISPANEL.getMainChartObject = function () {
        var plugin = PluginHandler.getByDisplayName(VISPANEL.chartName);
        if (plugin != null) {
            return plugin.Object;
        } else {
            switch (VISPANEL.chartName) { 
                case "timeline": return timeVis;
                case "barchart": return barVis;
                case "geochart": return geoVis;
                case "urank": return urankVis;
                case "landscape": return landscapeVis;
            }
        }

        return null;
    };
	
	/**
	 * Clears the visualization and specific controls areas.
	 * Retrieves the selected chart and the appropriate mapping combination
	 * Calls the "draw" function corresponding to the selected chart
	 * 
	 * */
	var chartChangedCounter = 0;
	VISPANEL.drawChart = function( item ){
        
		if ($(root).width() == 0) // workaround: problem, at the beginning, all visualisations get initialized too soon and too often.
			return; 
		
		$(root).empty();		
        // cleanup added controls:
        $('#eexcess_vis_panel').children().not('#eexcess_canvas').remove()
        $('#eexcess_main_panel').removeClass('urank'); // removing urank class
		$('.urank-hidden-scrollbar-inner ul').unwrap();
		$('.urank-hidden-scrollbar').removeClass('urank-hidden-scrollbar');
		LIST.buildContentList();

		var oldChartName = VISPANEL.chartName;
		var hasChartChanged = false;
		var selectedMapping = this.internal.getSelectedMapping( item );
		if (oldChartName != VISPANEL.chartName){
            LoggingHandler.log({action: "Chart changed", old: oldChartName, new: VISPANEL.chartName});
			VISPANEL.chartChanged(oldChartName, VISPANEL.chartName);
			hasChartChanged = true;
		}
        selectedChartName = VISPANEL.chartName;
			
		$('#screenshot').removeClass('notAvailable');
		if (VISPANEL.chartName == 'geochart' || VISPANEL.chartName == 'uRank' || VISPANEL.chartName == 'landscape')
			$('#screenshot').addClass('notAvailable');

		var plugin = PluginHandler.getByDisplayName(VISPANEL.chartName);
		if (plugin != null){
			if (plugin.Object.draw != undefined)
				plugin.Object.draw(data, selectedMapping, width, height);		
		} else {
			switch(VISPANEL.chartName){		// chartName is assigned in internal.getSelectedMapping() 
				case "timeline" : timeVis.draw(data, selectedMapping, width, height); break;
				case "barchart":  barVis.draw(data, selectedMapping, width, height); break;
	            case "geochart":  geoVis.draw(data, selectedMapping, width, height); break;
                case "urank":  urankVis.draw(data, selectedMapping, width, height); break;
                case "landscape":  landscapeVis.draw(data, selectedMapping, width, height); break;
				default : d3.select(root).text("No Visualization");	
			}
		}

		LIST.setColorIcon();
		LIST.highlightListItems();
		if (hasChartChanged || chartChangedCounter === 0){
			chartChangedCounter++;
			setTimeout(function(){ screenshot.screenshot('chartchanged'+chartChangedCounter, 'body', 0);  }, 300);
			//setTimeout(function(){ alert(selectedChartName + '-' + chartChangedCounter);  }, 300);
		}
	};
	
	
	VISPANEL.chartChanged = function(oldChartName, newChartName){
        FilterHandler.chartNameChanged(newChartName);
		
		$('#eexcess-chartselection .chartbutton').removeClass('active').filter('[data-targetchart=' + newChartName + ']').addClass('active');
				
		if (oldChartName === "")
			return

        FilterHandler.collapseCurrent();
        FilterHandler.clearCurrent();
        FilterHandler.clearList();
		var plugin = PluginHandler.getByDisplayName(oldChartName);
		if (plugin != null && plugin.Object.finalize != undefined)
			plugin.Object.finalize();
	};
	
	VISPANEL.getAllSelectListItems = function(){
		var array =[];
		data.forEach(function(element,index){
			array.push(index);
		});
		return array;
	};
	
	VISPANEL.updateCurrentChart = function( action, arg, arg2 ){
		
		var plugin = PluginHandler.getByDisplayName(VISPANEL.chartName);
		switch( action ){
			
			case "reset_chart":		
				if (plugin != null){
					if (plugin.Object.reset != undefined)
						plugin.Object.reset();
				} else {
					switch(VISPANEL.chartName){
						case "timeline": timeVis.reset(); break;
						case "barchart": barVis.reset(); break;
	                    case "geochart": geoVis.reset(); break;
                    	case "urank": urankVis.reset(); break;
                    	case "landscape": landscapeVis.reset(); break;
					}
				}
				break;

			case "highlight_item_selected":
				var arrayIndices = arg;
				var dataToHighlightIds = arg2;
				if (plugin != null){
					if (plugin.Object.highlightItems != undefined)
						plugin.Object.highlightItems(arrayIndices);
				} else if (dataToHighlightIds != null) {
					switch(VISPANEL.chartName){
	                    case "geochart": geoVis.highlightItems(arrayIndices, dataToHighlightIds); break;
					}
				} else {
					switch(VISPANEL.chartName){
						case "timeline": timeVis.selectNodes(arrayIndices, self); break;
	                    case "barchart": barVis.clearSelection(); break;
	                    //case "geochart": geoVis.highlightItems(arrayIndices); break;
                    	case "urank": urankVis.highlightItems(arrayIndices); break;
                    	case "landscape": landscapeVis.highlightItems(arrayIndices); break;
					}
				}
				break;
		}
	
	};
    
    
    VISPANEL.clearCanvasAndShowMessage = function( message ){
        
        $( root ).empty();
			
		var messageOnCanvasDiv = d3.select( root ).append("div")
            .attr("id", "eexcess_message_on_canvas");
			
		messageOnCanvasDiv.append("span")
            .text( message );	
			
        if( message == STR_LOADING ){
            messageOnCanvasDiv.append("img")
                .attr("src", LOADING_IMG);
        }
    };
	
	VISPANEL.evaluateMinimumSize = function(){
        width = $(window).width();
        height =  $(window).height();
		if (width < 750 || height < 200){
			if(!dashboardFeedback) {
                $('#vis_feeadback_dialog').hide();
            }
			$('#eexcess_main_panel').hide();
			$('#minimumsize-message').show();
            
            var optimalMinimumDimensions = { width:980, height:400 };
            START.sendMsgAll({event: 'eexcess.tooSmall', data: optimalMinimumDimensions });
		} else {
			$('#eexcess_main_panel').show();
			$('#minimumsize-message').hide();
		}
	};
    
    VISPANEL.initHighlightFeedbackButton = function(){
        setTimeout(function(){
            var intro = introJs();
            intro.setOptions({
                    'showStepNumbers': false,
                    'showBullets': false,
                    'steps':[{
                            element:'#vis_dashboard_feedback',
                            intro: 'This is a research Project. It would be a great Help, if you could give us a feedback! Thanks!',
                            position: 'left'
                        }
                    ]
            });
            intro.start(); 
        }, 5*60*1000); // 5min
    };
    
    
    /*
     * Needed for processing data loaded from storage when FilterHandler.loadFilters was called
     * to show microvis without drawing a specific visualization first
     * @author Peter Hasitschka
     */
    VISPANEL.getMicroVisMapping = function(){
        return this.internal.getSelectedMapping();
    };
	
	
	
	
	/*
	
list: “This shows a list of all recommendation resuls”
main chart: “This is the area, where the main visualisation is shown.”
config buttons: “Configuring the application. Not important for your task.”
bookmark dataset: “Bookmarks all items within selection, as well as the applied filters into a named collection”
change charts buttons: “Switch between the available main - visualisations”
filters: “When you brush something in the main visualisation, the brush gets shown immediadly as micro visualisation. You can then apply ”
make filter permanent: “A brush in the main visualisation is only temporary. if you want to filter your results, you need click on this button.”
remove filter: “Any filter that is shown here (if it is a temporary brush or a permanent filter) can be removed, by clicking on this icon”	
	
	 */
    
    VISPANEL.initIntro = function(){
		setTimeout(function(){
			var intro = introJs();
			var $firstOpenedFilter = $('.chart-container.expanded').first();
			intro.setOptions({
					//'tooltipPosition': 'right',
					'showStepNumbers': false,
					'steps':[
						{
							//element:'#eexcess-filtercontainer',
							intro: '<h2>Short Introduction</h2>',
							position: 'left'
						},
						{
							//element: '#eexcess_content_list',
							intro: '<strong>List:</strong><br>This shows a list of all recommendation resuls',
							position: 'left'
						},
						{
							element: '#eexcess_vis_panel',
							intro: '<strong>Main chart:</strong><br>This is the area, where the main visualisation is shown',
							position: 'left'
						},
						{
							element: '#configuration_buttons',
							intro: '<strong>Config buttons:</strong><br>Configuring the application. Not important for your task.',
							position: 'left'
						},
						{
							element: '#eexcess_saveFilter_button',
							intro: '<strong>Bookmark dataset:</strong><br>Bookmarks all items within selection, as well as the applied filters into a named collection',
							position: 'left'
						},
						{
							element: '#eexcess-chartselection',
							intro: '<strong>Change charts buttons:</strong><br>Switch between the available main - visualisations',
							position: 'left'
						},
						{
							element: '#eexcess-filtercontainer',
							intro: '<strong>Filters:</strong><br>When you brush something in the main visualisation, the brush gets shown immediadly as micro visualisation. You can then apply',
							position: 'left'
						},
						{
							element: $firstOpenedFilter.parent().find('.filter-keep')[0],
							intro: '<strong>Make filter permanent:</strong><br>A brush in the main visualisation is only temporary. if you want to filter your results, you need click on this button.',
							position: 'left'
						},
						{
							element: $firstOpenedFilter.parent().find('.filter-remove')[0],
							intro: '<strong>Remove filter:</strong><br>Any filter that is shown here (if it is a temporary brush or a permanent filter) can be removed, by clicking on this icon.<br><br><em>Thank you, for your attention.</em>',
							position: 'left'
						},
					]
			});
			intro.start(); 
		}, 500);
    };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var BOOKMARKS = {};


    BOOKMARKS.internal = {

    
    
        // TODO: REMOVE/REFER AFTER TRANSFERED TO C4
        /*
        currentBookmark :{
                        'bookmark-name': '',
                        'color': '',
                        'type': ''
                        },
        currentItem : {},
        */
        
        
        getCurrentBookmark : function(){
            return BOOKMARKDIALOG.BOOKMARKS.getCurrentBookmark();
        },
        
        setCurrentItem : function(item, index){
            BOOKMARKDIALOG.BOOKMARKS.setCurrentItem(item,index,query);
        },

        getCurrentItem : function(){
            return BOOKMARKDIALOG.BOOKMARKS.currentItem['item'];
        },

        getCurrentItemIndex : function(){
            return BOOKMARKDIALOG.BOOKMARKS.currentItem['index'];
        },
        
        validateBookmarkToSave : function(){
            return BOOKMARKDIALOG.BOOKMARKS.validateBookmarkToSave();
        }
        
    };

    BOOKMARKS.handleBookmarkEditButton = function(){
      return BOOKMARKDIALOG.BOOKMARKS.handleBookmarkEditButton();
    };

    BOOKMARKS.updateBookmarkedItems = function(){
        return BOOKMARKDIALOG.BOOKMARKS.updateBookmarkedItems();
    };

    //BOOKMARKS.buildSaveBookmarkDialog = function(d, i, sender) {
	BOOKMARKS.buildSaveBookmarkDialog = function(datum, firstFunc,titleOutput,savebutton, sender) {
        return BOOKMARKDIALOG.BOOKMARKS.buildSaveBookmarkDialog(
            datum, 
            firstFunc,
            titleOutput,
            savebutton,
            sender
        );	
    };

    BOOKMARKS.destroyBookmarkDialog = function(){
        return BOOKMARKDIALOG.BOOKMARKS.destroyBookmarkDialog();
    };



    BOOKMARKS.saveBookmark = function(){
        return BOOKMARKDIALOG.BOOKMARKS.saveBookmark(LIST);
    };

	


    BOOKMARKS.buildSeeAndEditBookmarkDialog = function( datum, index ){
        return BOOKMARKDIALOG.BOOKMARKS.buildSeeAndEditBookmarkDialog(datum, index);
    };
	


    BOOKMARKS.deleteBookmarkAndRefreshDetailsDialog = function(sender, bookmark, bookmarkIndex){
        return BOOKMARKDIALOG.BOOKMARKS.deleteBookmarkAndRefreshDetailsDialog(sender, bookmark, bookmarkIndex);
    };
	
	
	BOOKMARKS.exportBookmarks = function(){
        return BOOKMARKDIALOG.BOOKMARKS.exportBookmarks();
	};

	BOOKMARKS.importBookmarks = function(){
		return BOOKMARKDIALOG.BOOKMARKS.exportBookmarks();
	};

    BOOKMARKDIALOG.BOOKMARKS.setListObjGetter(function(){
        return LIST;
    }.bind(BOOKMARKS));

	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	///////////// External calls to allow overloaded visualization communicate with the template


    var EXT = {};
	
		
	EXT.ListItemSelected = function(datum, index){
		LIST.selectListItem( datum, index, true, false);
	};
	
	EXT.scrollToFirst = function(){
		LIST.scrollToFirst();
	};
	
	EXT.selectItems = function(){
		LIST.highlightListItems();
	};

	EXT.getAllSelectListItems = function(){
		return VISPANEL.getAllSelectListItems();
	};
	
    EXT.faviconClicked = function(d, i, event){
    	EVTHANDLER.faviconClicked(d, i, event);
    };
    
    EXT.redrawChart = function(d, i){
    	VISPANEL.drawChart();
    };
    
    EXT.filterData = function(filteredDataIds){
        if (!originalData)
            originalData = data;
            
        if (filteredDataIds == null){
            if (originalData){
                data = originalData;
                FILTER.updateData();
                //FilterHandler.refreshAll();
            }
            return;
        }
            
        data = underscore(originalData).filter(function(item){ return underscore(filteredDataIds).includes(item.id); });
        FILTER.updateData();
        //FilterHandler.refreshAll();        
    };
    
    EXT.getOriginalData = function(){
        return originalData || data;
    };
    EXT.getSelectedChartName = function(){
        return selectedChartName;
    };
    EXT.getScreenSize = function(){
        return width + "/" + height;
    };
    EXT.sendMsgAll = function(msg){
        START.sendMsgAll(msg);
    };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var FILTER = {};

    // Moved variables to BOOKMARKDIALOG.BOOKMARKS
	//var currentSelectIndex = 0;
	//var currentSelectIndexPerFilter = 0;

	//change new Bookmarks
	FILTER.changeDropDownList = function(){
		return BOOKMARKDIALOG.FILTER.changeDropDownList(indicesToHighlight, data, originalData);
	};
	
	/*
	FILTER.filterBookmark = function(inputDataParam,currentBookmark,func){
		inputDataParam.forEach(function(elementData,indexData){
			currentBookmark.forEach(function(elementBookmark,indexBookmark){
				if(elementData.id == elementBookmark.id){
					func(inputDataParam,indexData);
				}
			});
		});
	}
	*/
	
	// build filter bookmark and delete bookmark control.
	FILTER.buildFilterBookmark = function(){
        inputData = data;
        START.inputData = data;
        return BOOKMARKDIALOG.FILTER.buildFilterBookmark(data, originalData, inputData, LIST);
	};
	
	FILTER.showStars = function(){
		return BOOKMARKDIALOG.FILTER.showStars(inputData);
	};
	
	FILTER.updateData = function(){
        return BOOKMARKDIALOG.FILTER.updateData();
	};
    
    FILTER.updateDataCb = function(){
        QUERY.updateHeaderText("Query Results : " + data.length);
        QUERY.updateSearchField(query);
        LIST.buildContentList();
        VISPANEL.drawChart();
    };
	
    // To perform vis update on updateData call
    BOOKMARKDIALOG.FILTER.setUpdateDataCb(FILTER.updateDataCb.bind(FILTER));
    
    // To allow setting filtered data after loading a bookmark
    BOOKMARKDIALOG.FILTER.datasetter_fct = function(data_, origData){
        if (typeof data !== 'undefined' && data.length) {
            data = data_;
        }
        if (typeof originalData !== 'undefined' && originalData.length)
            originalData = origData;
    }.bind(FILTER);
    
    // To allow getting the data obj. inside the bookmark-dialog
    BOOKMARKDIALOG.FILTER.datagetter_fct = function(){
        return data;
    }.bind(FILTER);    
	
    //Set a getter for retrieving the VISPANEL object from outside
    BOOKMARKDIALOG.FILTER.setVisPanelGetter(function(){
        return VISPANEL;
    }.bind(FILTER));
	
    //Necessary to access inputData in the 'showStars' fct. of the api
    BOOKMARKDIALOG.FILTER.setInputDataGetter(function(){
       return inputData; 
    }.bind(FILTER));

	FILTER.buildAddBookmarkItems = function(d, i){
        return BOOKMARKDIALOG.FILTER.buildAddBookmarkItems(d,i, data, originalData, LIST);
	};
    
	FILTER.addBookmarkItems = function(save_filters){
        return BOOKMARKDIALOG.FILTER.addBookmarkItems(save_filters, data, originalData, query, LIST);
	};

    return START;
}


	
	

