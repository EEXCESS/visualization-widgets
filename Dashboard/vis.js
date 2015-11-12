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
	var contentPanel = "#eexcess_content";										                   // Selector for content div on the right side
	var contentList = "#eexcess_content .eexcess_result_list";					                   // ul element within div content
	var allListItems = "#eexcess_content .eexcess_result_list .eexcess_list";	                   // String to select all li items by class
	var listItem = "#eexcess_content .eexcess_result_list #data-pos-";			                   // String to select individual li items by id
	var colorIcon = ".color_icon";												                   // Class selector for div icon colored according to legend categories
	var favIconClass = ".eexcess_fav_icon";                                                        // img element fpr favicon (either on or off)
    var bookmarkDetailsIconClass = ".eexcess_details_icon";                                        // img element with 3-dot icon in each list item used to display bookmarked item's details on click
	
    var bookmarkDialogClass = ".eexcess-bookmark-dialog";                                          // Class selector for both types of dialog: save bookmark and see-and-edit-bookmark
    var saveBookmarkDialogId = "#eexcess-save-bookmark-dialog";                                    // Id for dialog poping up upon clicking on a "star" icon
    var bookmarkDropdownList = "#eexcess-save-bookmark-dialog .eexcess-bookmark-dropdown-list";    // Div wrapping drop down list in bookmark dialog
    var newBookmarkOptionsId = "#eexcess-save-bookmark-dialog .eexcess-bookmark-dialog-optional";  // Div wrapping color picker and input element in bookmark dialog
    var colorPickerId = "#eexcess-bookmak-dialog-color-picker";                                    // Div tranformed into a colorpicekr in bookmark dialog
    var bookmarkDialogInputWrapper = "#eexcess-save-bookmark-dialog .eexcess-bookmark-dialog-input-wrapper"; // Wrapper for input containing new bookmark name
    var detailsBookmarkDialogId = "#eexcess-see-and-edit-bookmark-dialog";                         // Dialog displaying bookmark detials (when click on 3-dotted icon)
    var bookmarkedInId = 'eexcess-bookmark-bookmarked-in-';                                        // Divs in bookamark details dialog showing bookmarks in which the current item is recorded
	var filterBookmarkDialogId ="#eexcess-filter-bookmark-dialog";								   // Id for dialog filter bookmark
	var filterBookmarkDropdownList = "#eexcess-filter-bookmark-dialog .eexcess-bookmark-dropdown-list"; // Div wrapping drop down list in filter bookmark dialog
	var deleteBookmark = "#eexcess_deleteBookmark_button";										   // Button for boookmark deleted.
	var addBookmarkItems = "#eexcess_addBookmarkItems_button";									   // Button for add boookmarkitems.
	var exportBookmark = "#eexcess_export_bookmark";											   // Export bookmark data.
	var importBookmark = "#eexcess_import_bookmark";											   // Import bookmark data.
	var importBookmarkStyle = "#eexcess_import_bookmark_style";									   // Styles import bookmark button control.
	// Icon & Image Constants
	var LOADING_IMG = "media/loading.gif";
	var NO_IMG = "media/no-img.png";
    var FAV_ICON_OFF = "media/icons/favicon_off.png";
    var FAV_ICON_ON = "media/icons/favicon_on.png";
    var REMOVE_SMALL_ICON = "media/batchmaster/remove.png";
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
    var STR_NEW = "New Collecction...";
	var STR_BOOKMARK_NAME_MISSING = "Indicate new bookmark name";
	var STR_SHOWALLRESULTS = "Search results";

	
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
	var isBookmarkDialogOpen, selectedChartName, bookmarkingListOffset;
    //var idsArray;
    var bookmarkedItems;
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
	};
	
	START.init = function(){
        
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
            
	        $(window).on('resize', _.debounce(function(){
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
        $('html').click(function () { if (isBookmarkDialogOpen) BOOKMARKS.destroyBookmarkDialog(); });
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
        isBookmarkDialogOpen = false;
        //idsArray = data.map(function(d){ return d.id; });//not used
    };





    PREPROCESSING.extendDataWithAncillaryDetails = function(){

        data.forEach(function(d){

            // Set 'bookmarked' property to true or false
            if(typeof bookmarkedItems[d.id] != 'undefined' && bookmarkedItems[d.id] != 'undefined')
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
				thisValue.internal.setCurrentItem(d, i);
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



    /**** Bookmark Dialog ****/

    ////////	Value changed in bookmark dropdown list 	////////
    EVTHANDLER.bookmarkDropdownListChanged = function(value, index){
		
		currentSelectIndex = index;
		//console.log("##### >> " +currentSelectIndex);
	
        if(index == 0)
            $(newBookmarkOptionsId).slideDown("slow");
        else
            $(newBookmarkOptionsId).slideUp("slow");

        $(newBookmarkOptionsId).find('p').fadeOut('fast');      // error message hidden
    };


    ////////	'Cancel' button clicked in save bookmark dialog 	////////
    EVTHANDLER.bookmarkCancelButtonClicked = function(){
        LoggingHandler.log({ action: "Bookmarkwindow closed" });
        BOOKMARKS.destroyBookmarkDialog();
    };


    ////////	'Save' button clicked in save bookmark dialog 	////////
    EVTHANDLER.bookmarkSaveButtonClicked = function(){
        BOOKMARKS.saveBookmark();
		FILTER.changeDropDownList();
    };


    ////////	'Done' button clicked in bookmark details dialog 	////////
    EVTHANDLER.bookmarkDoneButtonClicked = function(){
        BOOKMARKS.destroyBookmarkDialog();
    };

    EVTHANDLER.removeBookmarkIconClicked = function(bookmark, bookmarkIndex) {
        BOOKMARKS.deleteBookmarkAndRefreshDetailsDialog(this, bookmark, bookmarkIndex);
    }
    
     EVTHANDLER.dashboardInfoButtonClicked = function(e) {    
    }
    
    EVTHANDLER.dashboardFeedbackButtonClicked = function(e) {
        dashboardFeedback = $("#vis_feeadback_dialog").dialog({
            maxWidth:600,
            maxHeight: 500,
            width: 405,
            height: 310,
           	resizable: false,
            closeOnEscape: true
        });
    }
    
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
    }


	
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
		if (window.localStorage !== undefined) {
			if(localStorage.getItem('selected-color-mapping') != null) {
				selColorMappingval = localStorage.getItem('selected-color-mapping'); 
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
                    		/*if (window.localStorage !== undefined) {
								localStorage.setItem('selected-color-mapping', v);
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
        if(window.localStorage!==undefined) {
        	localStorage.setItem('selected-color-mapping', validMapping.facet);
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
			$(contentList).wrap("<div id='eexcess_content_list''></div>"); 			
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
				
				if(_.contains(dataToHighlightIds, data[i].id)){
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
		var selectedMapping = this.internal.getSelectedMapping( item );
		if (oldChartName != VISPANEL.chartName){
            LoggingHandler.log({action: "Chart changed", old: oldChartName, new: VISPANEL.chartName});
			VISPANEL.chartChanged(oldChartName, VISPANEL.chartName);
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
            

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var BOOKMARKS = {};


    BOOKMARKS.internal = {

        currentBookmark :{
                        'bookmark-name': '',
                        'color': '',
                        'type': ''
                        },

        currentItem : {},


        getCurrentBookmark : function(){

            var bookmarkName = $(bookmarkDropdownList).find('span').text();
            var color = '', type = '';

            if( bookmarkName == STR_NEW ){
                bookmarkName = $(bookmarkDialogInputWrapper).find('input').val();
                color = $(colorPickerId).css('backgroundColor');
                type = 'new';
            }
            this.currentBookmark['bookmark-name'] = bookmarkName;
            this.currentBookmark['color'] = color;
            this.currentBookmark['type'] = type;

            return this.currentBookmark;
        },


        setCurrentItem : function(item, index){
            //this.currentItem['item'] = item;
            this.currentItem['item'] = {
                'id': item.id,
                'title': item.title,
                'facets': item.facets,
                'uri': item.uri,
                'coordinate': item.coordinate,
                'query': query
            };
            this.currentItem['index'] = index;
        },


        getCurrentItem : function(){ return this.currentItem['item']; },

        getCurrentItemIndex : function(){ return this.currentItem['index']; },

        validateBookmarkToSave : function(){
            var $message = $(newBookmarkOptionsId).find('p');

            // validation for new bookmark name
            if(
				(this.currentBookmark['type'] == 'new' && this.currentBookmark['bookmark-name'] == '') ||
				this.currentBookmark['bookmark-name'].length > 15) {
                $message.fadeIn('slow');
                return false;
            }

            $message.fadeOut('fast');
            return true;
        }

    };



    BOOKMARKS.updateBookmarkedItems = function(){
        
		//bookmarkedItems = BookmarkingAPI.getBookmarkedItemsById(idsArray);
		//console.log('bisher: ');
		//console.log(bookmarkedItems);
		 
		bookmarkedItems = {};
		var allBookmarks = BookmarkingAPI.getAllBookmarks();
		if (!allBookmarks)
			return;
		Object.keys(allBookmarks).forEach(function(bookmarkKey){
			allBookmarks[bookmarkKey].items.forEach(function(itemsElement){	
				
				var itemEntry = itemsElement['id'];
				if(typeof bookmarkedItems[itemEntry] == 'undefined' || bookmarkedItems[itemEntry] == 'undefined'){
					bookmarkedItems[itemEntry] = { 'bookmarked' : new Array() };
				}

				bookmarkedItems[itemEntry].bookmarked.push({
					'bookmark-name' : bookmarkKey,
					'bookmark-id' : allBookmarks[bookmarkKey].id,
					'color' : allBookmarks[bookmarkKey].color
				});
				
			});
		});
		
		//experimental code end to do ask cecillia ??
		//console.log('neu: ');
		//console.log(bookmarkedItems);
		
        //console.log('----- BOOKMARKED ITEMS -----');
        //console.log(bookmarkedItems);
    };

    //BOOKMARKS.buildSaveBookmarkDialog = function(d, i, sender) {
	BOOKMARKS.buildSaveBookmarkDialog = function(datum, firstFunc,titleOutput,savebutton, sender) {

		$(filterBookmarkDialogId+">div").removeClass("active").children("ul").slideUp('slow');

        BOOKMARKS.destroyBookmarkDialog();
        isBookmarkDialogOpen = true;

		firstFunc(this);
        //this.internal.setCurrentItem(d, i);

        var topOffset = $(contentPanel).offset().top;

        // Append bookmark form to content item
        var dialogBookmark = d3.select("body").append("div")
            .attr("id", "eexcess-save-bookmark-dialog")
            .attr("class", "eexcess-bookmark-dialog")
            .style('display', 'none')
            .style("top", topOffset + "px" );

        dialogBookmark.on('click', function(){ d3.event.stopPropagation(); });

        dialogBookmark.append("div")
            .attr("class", "eexcess-bookmark-dialog-title")
            .text("Bookmark Item");

        // Append details section
        var bookmarkDetails = dialogBookmark.append('div')
            .attr('class', 'eexcess-boookmark-dialog-details');

        bookmarkDetails.append('span').attr('class', 'label').text('Title:');
        //bookmarkDetails.append('p').text(d.title);
		titleOutput(bookmarkDetails);
        //bookmarkDetails.append('span').text('Query:');
        //bookmarkDetails.append('p').text(query);

        // Append settings section (for bookmark selection or definition of new bookmark)
        var bookmarkSettings = dialogBookmark.append("div")
            .attr("class", "eexcess-bookmark-dialog-settings");

        bookmarkSettings.append("span").attr('class', 'label').text("Add to:");

        // array to be sent to plugin building the dropdown list with the list items and the corresponding colors
        var optionsData = $.merge([{'bookmark-name': STR_NEW, 'color': ''}], BookmarkingAPI.getAllBookmarkNamesAndColors());

        var bookmarksListContainer = bookmarkSettings.append("div").attr("class", "eexcess-bookmark-dropdown-list")
            .append('ul');

        var bookmarksListData = bookmarksListContainer.selectAll('li').data(optionsData);

        bookmarksList = bookmarksListData.enter().append('li');
        bookmarksList.append('a').text(function(b){ return b["bookmark-name"];});
        bookmarksList.append('div').text(function(b){ return b.color; });

        // Create dropdown list to select bookmark
        $( bookmarkDropdownList ).dropdown({
            'change' : EVTHANDLER.bookmarkDropdownListChanged
        });

        // Add wrapper div containing icon for color picking, text input and legendbookmarkDetails.append('p').text(d.title);
        var newBookmarkOptions = bookmarkSettings.append("div")
            .attr("class", "eexcess-bookmark-dialog-optional");

        /*newBookmarkOptions.append("div")
            .attr("id", "eexcess-bookmak-dialog-color-picker")
            .attr("title", "Select Color"); */

        newBookmarkOptions.append("div")
            .attr("class", "eexcess-bookmark-dialog-input-wrapper")
            .append("input");

        newBookmarkOptions.append('p')
            .text(STR_BOOKMARK_NAME_MISSING)
            .style('display', 'none');

        var bookmarkButtonsWrapper1 = dialogBookmark.append("div")
            .attr("class", "eexcess-bookmark-buttons-wrapper");

        bookmarkButtonsWrapper1.append("input")
            .attr("type", "button")
            .attr("class", "eexcess-bookmark-button")
            .attr("style", "width:65px;")
            .attr("value", "Save new")
			.on("click", savebutton);
            //.on("click", EVTHANDLER.bookmarkSaveButtonClicked);

        // Also show delete - buttons in this dialog.
		// Todo: remove the old bookmark-info popup
        if (datum && bookmarkedItems[datum.id]){
            //var bookmarkListToDelete = dialogBookmark.append("div")
            //    .attr("class", "eexcess-bookmark-bookmarkList");

            var bookmarkedInSection = dialogBookmark.append('div').attr('class', 'eexcess-bookmark-bookmarked-in-section');
            bookmarkedInSection.append('span').attr('class', 'label').style('width', '100%').text('Already bookmarked in:');

            var itemBookmarksData = bookmarkedInSection.selectAll('div')
                .data(bookmarkedItems[datum.id].bookmarked);

            var itemInBookmarks = itemBookmarksData.enter().append('div')
                    .attr('class', 'eexcess-bookmark-bookmarked-in');

            itemInBookmarks.append('div')
                .attr('class', 'eexcess-bookmark-color-icon')
                .style('background-color', function(d){ return d.color; });

            itemInBookmarks.append('span').text(function(d){ return d["bookmark-name"]; });

            itemInBookmarks.append('img')
                .attr('src', REMOVE_SMALL_ICON)
                .attr('title', 'Remove item from this bookmark')
                .on('click', EVTHANDLER.removeBookmarkIconClicked);
        }

        // Append save and cancel buttons within container
        var bookmarkButtonsWrapper = dialogBookmark.append("div")
            .attr("class", "eexcess-bookmark-buttons-wrapper");

        bookmarkButtonsWrapper.append("input")
            .attr("type", "button")
            .attr("class", "eexcess-bookmark-button")
            .attr("value", "Close")
            .on('click', EVTHANDLER.bookmarkCancelButtonClicked);

        // show bookmark dialog
        $(saveBookmarkDialogId).slideDown('slow');

        // make div icon a color picker
       /* $( colorPickerId ).colorpicker({
            'img' : IMG_COLOR_WHEEL_LARGE,
            'width' : 200,
            'height' : 200
       }); */
    };




    BOOKMARKS.destroyBookmarkDialog = function(){
       //$( colorPickerId ).colorpicker('destroy');
        $( bookmarkDialogClass ).remove();

        isBookmarkDialogOpen = false;
    };



    BOOKMARKS.saveBookmark = function(){

        var bookmark = this.internal.getCurrentBookmark();
        var item = this.internal.getCurrentItem();
        var index = this.internal.getCurrentItemIndex();

        if( this.internal.validateBookmarkToSave() ){
            
            LoggingHandler.log({ action: "Bookmark added", source:"List", itemId: item.id, value: bookmark['bookmark-name']});
            
            if(bookmark['type'] == 'new')
                BookmarkingAPI.createBookmark(bookmark['bookmark-name'], bookmark['color']);

            console.log(BookmarkingAPI.addItemToBookmark(bookmark['bookmark-name'], item));

            BOOKMARKS.destroyBookmarkDialog();
            LIST.turnFaviconOnAndShowDetailsIcon(index);

            // Update ancillary variable
            BOOKMARKS.updateBookmarkedItems();
        }
    };

	


    BOOKMARKS.buildSeeAndEditBookmarkDialog = function( datum, index ){

        BOOKMARKS.destroyBookmarkDialog();
        isBookmarkDialogOpen = true;

        this.internal.setCurrentItem(datum, index);

        var topOffset = $(contentPanel).offset().top;

        var detailsDialog = d3.select('body').append('div')
            .attr('id', 'eexcess-see-and-edit-bookmark-dialog')
            .attr("class", "eexcess-bookmark-dialog")
            .style('top', topOffset + 'px')
            .style('display', 'none')
            .on("click", function(){ d3.event.stopPropagation(); });

        detailsDialog.append("div")
            .attr("class", "eexcess-bookmark-dialog-title")
            .text('Bookmark Info');        // = datum.tilte

        var detailsSection = detailsDialog.append('div')
            .attr('class', 'eexcess-boookmark-dialog-details');

        detailsSection.append('span').text('Title');
        detailsSection.append('p').text(datum.title);


        var bookmarkedInSection = detailsDialog.append('div').attr('class', 'eexcess-bookmark-bookmarked-in-section');
        bookmarkedInSection.append('span').style('width', '100%').text('Bookmarked in:');

        var itemBookmarksData = bookmarkedInSection.selectAll('div')
            .data(bookmarkedItems[datum.id].bookmarked);

        var itemInBookmarks = itemBookmarksData.enter().append('div')
                //.attr('id', function(d, i){ return 'eexcess-bookmark-bookmarked-in-' + i; })
                .attr('class', 'eexcess-bookmark-bookmarked-in');

        itemInBookmarks.append('div')
            .attr('class', 'eexcess-bookmark-color-icon')
            .style('background-color', function(d){ return d.color; });

        itemInBookmarks.append('span').text(function(d){ return d["bookmark-name"]; });

        itemInBookmarks.append('img')
            .attr('src', REMOVE_SMALL_ICON)
            .attr('title', 'Remove item from this bookmark')
            .on('click', EVTHANDLER.removeBookmarkIconClicked);


        // Append done button within container
        var bookmarkButtonsWrapper = detailsDialog.append("div")
            .attr("class", "eexcess-bookmark-buttons-wrapper");

        bookmarkButtonsWrapper.append("input")
            .attr("type", "button")
            .attr("class", "eexcess-bookmark-button")
            .attr("value", "Done")
            .on("click", EVTHANDLER.bookmarkDoneButtonClicked);

        $(detailsBookmarkDialogId).slideDown('slow');
    };
	


    BOOKMARKS.deleteBookmarkAndRefreshDetailsDialog = function(sender, bookmark, bookmarkIndex){

        var item = this.internal.getCurrentItem();
        var itemIndex = this.internal.getCurrentItemIndex();
        
        BookmarkingAPI.deleteItemFromBookmark(item.id, bookmark["bookmark-name"]);

        // sender is img element with remove icon
        $(sender.parentNode).remove();
		
		
		BOOKMARKS.updateBookmarkedItems();

        if(typeof bookmarkedItems[item.id] == 'undefined' || bookmarkedItems[item.id] == 'undefined')
            LIST.turnFaviconOffAndHideDetailsIcon(itemIndex);
			
		FILTER.changeDropDownList();
		
		//update list and drop down list
		$(filterBookmarkDialogId+">div>ul>li:eq("+currentSelectIndexPerFilter+")").trigger("click");
		$(filterBookmarkDialogId+">div>ul").css("display","none");
		$(filterBookmarkDialogId+">div").removeClass("active");
        
		LoggingHandler.log({ action: "Bookmark removed", itemId: item.id, itemTitle: item.title, value: bookmark["bookmark-name"] });
    };
	
	
	BOOKMARKS.exportBookmarks = function(){

		window.URL = window.URL;// || window.webkitURL;

		//console.log(BookmarkingAPI.getAllBookmarks());


		$(exportBookmark).on("click",function(evt){

			var bookmarkData = JSON.stringify(BookmarkingAPI.getAllBookmarks());
			var blob = new Blob([bookmarkData], {type: 'text/plain'});
			$(exportBookmark).attr("href", window.URL.createObjectURL(blob));
			$(exportBookmark).attr("download", "bookmarks.txt");
		});
		//$(exportBookmark).attr("href", window.URL.createObjectURL(blob));
		//$(exportBookmark).attr("download", "bookmarks.txt");
		
		
		

	};

	BOOKMARKS.importBookmarks = function(){
		function doOpen(evt,func) {
			var files = evt.target.files;
			var reader = new FileReader();
			reader.onload = function() {
				func(this.result);
			};
			reader.readAsText(files[0]);
		}
		
		$(importBookmarkStyle).on("click",function(evt){
			$(importBookmark).trigger("click");
		});

		$(importBookmark).on("change",function(evt){
			doOpen(evt,function(dataString){
			
				//update control
				FILTER.changeDropDownList();
				
				FILTER.showStars();
				FILTER.updateData();
				FILTER.showStars();
				FILTER.updateData();
			
			
				var importBookmarks = JSON.parse(dataString);
				//console.log(importBookmarks);
				var allBookmarks = BookmarkingAPI.getAllBookmarks();
				//console.log(allBookmarks);
				
				//compare items id's
				function searchItemId(items,searchedId){
					items.forEach(function(item){
						if(item.id == searchedId){
							return true;
						}
					});
					return false;
				}
				
				//compare and create bookmark items
				function importItems(bookmark){
					importBookmarks[bookmark].items.forEach(function(currentItem){
						if(!searchItemId(allBookmarks[bookmark].items,currentItem.id)){
							BookmarkingAPI.addItemToBookmark(bookmark,currentItem);
						}
					});
				}
				
				//compare and create two bookmarks
				Object.keys(importBookmarks).forEach(function(currentBookmark){
					if(allBookmarks.hasOwnProperty(currentBookmark)){
						importItems(currentBookmark);
					}else{
						BookmarkingAPI.createBookmark(currentBookmark,importBookmarks[currentBookmark].color);
						importItems(currentBookmark);
					}
				});
				

			});
			
			FILTER.showStars();
			FILTER.updateData();
			FILTER.showStars();
			FILTER.updateData();
			
		});
	
	};


	
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
            
        data = _(originalData).filter(function(item){ return _(filteredDataIds).includes(item.id); });
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var FILTER = {};

	var currentSelectIndex = 0;
	var currentSelectIndexPerFilter = 0;

	//change new Bookmarks
	FILTER.changeDropDownList = function(){
	
		$( filterBookmarkDialogId ).remove();
		
		var topOffset = $('#eexcess_bookmarkingcollections-placeholder').offset().top;
		var dialogBookmark = d3.select("#eexcess_bookmarkingcollections-placeholder").append("span")//div
			.attr("id", "eexcess-filter-bookmark-dialog")
			.attr("class", "eexcess-filter-bookmark-dialog")
			.style("top", topOffset + "px" )
			//.style("width","200px")
			;
		
		var bookmarksListContainer = dialogBookmark.append("div")
			.attr("class", "eexcess-bookmark-dropdown-list")
			.append('ul');

		var bookmarks = BookmarkingAPI.getAllBookmarkNamesAndColors();
		
		var bookmarkCount = 0;
		bookmarks.forEach(function(elementData,indexData){
			bookmarkCount = 0;
			bookmarkCount = BookmarkingAPI.getAllBookmarks()[elementData["bookmark-name"]].items.length;
			elementData["bookmark-name"] = elementData["bookmark-name"] + " : ("+bookmarkCount+")";
		});

		var demoUniversityCampus = "Demo University campus";
		var demoHistoricBuildings= "Demo Historic buildings";
		var demoData =  $.merge([{'bookmark-name': demoUniversityCampus, 'color': ''}, 
								 {'bookmark-name': demoHistoricBuildings, 'color': ''}], 
                                 bookmarks );		

        bookmarkingListOffset = 2;
	    var optionsData =  $.merge([{'bookmark-name': STR_SHOWALLRESULTS, 'color': ''}], demoData);
		
		var bookmarksListData = bookmarksListContainer.selectAll('li').data(optionsData);

        var bookmarksList = bookmarksListData.enter().append('li');
        bookmarksList.append('a')
        	//.attr("title", function(b){ return b["bookmark-name"];})
        	.text(function(b){ return b["bookmark-name"];})
	        //.each(function(b) {
	        //    var link = d3.select(this);
	        //    link.attr("title", b["bookmark-name"]);
	        //})
	        ;
        bookmarksList.append('div').text(function(b){ return b.color; });
		
        $(filterBookmarkDropdownList).dropdown({
		   'change':function(evt,index){
				currentSelectIndexPerFilter = index;

				evt = evt.split(":")[0].trim();
				var input ={};
				indicesToHighlight =[];

				if(evt == STR_SHOWALLRESULTS){
				
					FILTER.showStars();
					FILTER.updateData();
					
					$(deleteBookmark).prop("disabled",true);
				}
				else if(evt == demoUniversityCampus) {
    				 onDataReceived(getDemoResultsUniversity()); 					
				}
				else if(evt == demoHistoricBuildings) {					
				 	onDataReceived(getDemoResultsHistoricBuildings()); 
				}else{
					var currentBookmarkItems = BookmarkingAPI.getAllBookmarks()[evt].items;

					//FILTER.filterBookmark(inputData,currentBookmarkItems,function(inputData,indexData){
					//	input.data.push(inputData[indexData]);
					//});
					
					input.data = [];
                    data = [];
					var bookmarkCount = 0;
					currentBookmarkItems.forEach(function(item){
						input.data.push(item);
						indicesToHighlight.push(++bookmarkCount);
					});
					data = input.data;
                    originalData = input.data;
                    FilterHandler.reset();
					FILTER.updateData();
					$(deleteBookmark).prop("disabled",false).css("background","");
				}
                
                LoggingHandler.log({action: "Bookmark collection selected", value: evt})
		   }
        });
		
		$(filterBookmarkDialogId).on("mousedown",function(evt){
			BOOKMARKS.destroyBookmarkDialog();
			isBookmarkDialogOpen = false;	
		});
		
		$(filterBookmarkDialogId).slideDown('slow');
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
	
	    BOOKMARKS.destroyBookmarkDialog();
		inputData=data;
		START.inputData = data;

		FILTER.changeDropDownList();
		
		d3.select(addBookmarkItems).on("click", FILTER.buildAddBookmarkItems);
		
		d3.select(deleteBookmark).on("click",function(){

			if (confirm("Delete current bookmark?") == true) {
				var bookmarkName = $(filterBookmarkDialogId+">div>span").text().split(":")[0].trim();
				BookmarkingAPI.deleteBookmark(bookmarkName);
				
				FILTER.changeDropDownList();
				
				FILTER.showStars();
				FILTER.updateData();
				FILTER.showStars();
				FILTER.updateData();
                LoggingHandler.log({action: "Bookmark collection removed", value: bookmarkName });
			} 

		});
		$(deleteBookmark).prop("disabled",true);
	};
	
	FILTER.showStars = function(){
		var input ={};
		input.data = [];
		input.data = inputData;
		// update bookmarking changes:
		input.data.forEach(function(dataItem){
			if(typeof bookmarkedItems[dataItem.id] != 'undefined' &&
				bookmarkedItems[dataItem.id] != 'undefined'){
				dataItem['bookmarked'] = true;
			}else{
				dataItem['bookmarked'] = false;
			}	
		});
		data = input.data;	
		
		//FILTER.updateData();
	};
	
	FILTER.updateData = function(){
		// Initialize template's elements
		//PREPROCESSING.setAncillaryVariables();
		BOOKMARKS.updateBookmarkedItems();
		//PREPROCESSING.extendDataWithAncillaryDetails();
		QUERY.updateHeaderText( "Query Results : " + data.length );
		QUERY.updateSearchField( query );
		//CONTROLS.reloadChartSelect();
		LIST.buildContentList();
		VISPANEL.drawChart();
	};
	
	
	

	FILTER.buildAddBookmarkItems = function(d, i){
//BookmarkingAPI.deleteBookmark("");
        d3.event.stopPropagation();
		BOOKMARKS.buildSaveBookmarkDialog(
            d,
			function(thisValue){},
			function(bookmarkDetails){
				bookmarkDetails.append('p').text("selected bookmarks items");
			},
			function(){

				FILTER.addBookmarkItems();
				//$(filterBookmarkDialogId+">div>ul>li:eq("+currentSelectIndex+")").trigger("click");
				var bookmark = BOOKMARKS.internal.getCurrentBookmark();
				if(bookmark['type'] == 'new' || bookmark['type'] == ''){
					$(filterBookmarkDialogId+">div>ul>li:eq("+
						(BookmarkingAPI.getAllBookmarkNamesAndColors().length + bookmarkingListOffset)
					+")").trigger("click");
				}else{
					$(filterBookmarkDialogId+">div>ul>li:eq("+currentSelectIndex+")").trigger("click");
				}
				
				$(filterBookmarkDialogId+">div>ul").css("display","none");
				$(filterBookmarkDialogId+">div").removeClass("active");
			},
			this
		);
	};

	
	
	FILTER.addBookmarkItems = function(){
		//console.log(indicesToHighlight);
		var bookmark = BOOKMARKS.internal.getCurrentBookmark();
		
		if( BOOKMARKS.internal.validateBookmarkToSave() ){

			//var bookmark = BOOKMARKS.internal.getCurrentBookmark();
			if(bookmark['type'] == 'new'){
				BookmarkingAPI.createBookmark(bookmark['bookmark-name'], bookmark['color']);
                LoggingHandler.log({ action: "Bookmark collection created", value: bookmark['bookmark-name'] });
			}	

			function addBookmarkFunc(currentData,index){
				var bookmarkItem = {
					'id': currentData.id,
					'title': currentData.title,
					'facets': currentData.facets,
					'uri': currentData.uri,
					'coordinate': currentData.coordinate,
					'query': query
				};
				BookmarkingAPI.addItemToBookmark(bookmark['bookmark-name'], bookmarkItem);
				LIST.turnFaviconOnAndShowDetailsIcon(index);
			}
			
            
            var dataIdsToBookmark = FilterHandler.mergeFilteredDataIds();
			if(dataIdsToBookmark.length > 0){
				dataIdsToBookmark.forEach(function(dataItemId){
                    var index = _.findIndex(data, function (d) { return d.id == dataItemId; });
                    var dataItem = _.find(data, function (d) { return d.id == dataItemId; });
					addBookmarkFunc(dataItem, index);
				});
                
                LoggingHandler.log({ action: "Bookmarks added", value: bookmark['bookmark-name'], itemCount: dataIdsToBookmark.length });
			}
			
			BOOKMARKS.destroyBookmarkDialog();
			FILTER.changeDropDownList();
			
			FILTER.showStars();
			FILTER.updateData();
			FILTER.showStars();
			FILTER.updateData();

		}
	};

    return START;
}


	
	

