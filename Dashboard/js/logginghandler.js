var LoggingHandler = {
    buffer:[],
    bufferSize: 10,
    overallLoggingCount:0,
    startTime: null,
    inactiveSince: null,
    initializedAt: new Date().getTime(),
    //loggingEndpoint: 'http://{SERVER}/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/log/moduleStatisticsCollected',
    visExt: undefined,
    wasDocumentWindowOpened: false,
    origin: { clientType: '', clientVersion: '', userID: undefined, module: 'RecDashboard' },
    components: {
        list: { mouseOverTime : 0, mouseOverChangeCount: 0 },
        main: { mouseOverTime : 0, mouseOverChangeCount: 0 },
        config: { mouseOverTime : 0, mouseOverChangeCount: 0 },
        views: { mouseOverTime : 0, mouseOverChangeCount: 0 },
        filters: { mouseOverTime : 0, mouseOverChangeCount: 0 }
    },
    
    init: function(visExt){
        if (!LoggingHandler.origin.userID){
            var userIdCookie = localStorage.getItem('userID');
            if (userIdCookie){
                LoggingHandler.origin.userID = userIdCookie;
            } else {
                var userID = 'SID' + Math.floor(Math.random() * 10000000000);
                localStorage.setItem('userID', userID);
                LoggingHandler.origin.userID = userID;
            }
        }
        
        LoggingHandler.browser = getBrowserInfo();
        LoggingHandler.visExt = visExt;
        LoggingHandler.startTime = new Date();
        
        $(window).bind('beforeunload', function(){
            var duration = (new Date().getTime() - LoggingHandler.initializedAt) / 1000;
            LoggingHandler.log({ action: "Window is closing", source:"LoggingHandler", duration: duration });
            LoggingHandler.log({action: "Mouse over times", components: LoggingHandler.components });
            //console.log(JSON.stringify(LoggingHandler.components));
            
            LoggingHandler.sendBuffer();
            console.log('beforeunload');
        });
        $(window).blur(function(){
            LoggingHandler.inactiveSince = new Date().getTime();
            //console.log('blur');
        });
        $(window).focus(function(){
            //console.log('focus');
            if (LoggingHandler.inactiveSince != null){
                var duration = (new Date().getTime() - LoggingHandler.inactiveSince) / 1000;
                if (duration > 1){
                    LoggingHandler.log({ action: (LoggingHandler.wasDocumentWindowOpened ? "Document reading finished" : "Focused received again"), source:"LoggingHandler", duration: duration });
                }
            }
            LoggingHandler.inactiveSince = null;
            LoggingHandler.wasDocumentWindowOpened = false;
        });
    },
    
    documentWindowOpened: function(){
        LoggingHandler.wasDocumentWindowOpened = true;
    },
    
    componentMouseEnter: function(componentName){
        LoggingHandler.components[componentName].mouseOverTimestamp = new Date().getTime();
    },
    
    componentMouseLeave: function(componentName){
        var component = LoggingHandler.components[componentName];
        if (!component.mouseOverTimestamp)
            return;
            
        component.mouseOverTime += (new Date().getTime() - component.mouseOverTimestamp) / 1000;
        component.mouseOverChangeCount++;
        //LoggingHandler.log({action: "Mouse over time", component: componentName, duration: (new Date().getTime() - component.mouseOverTimestamp) / 1000});
        component.mouseOverTimestamp = undefined;
    },
    
    log: function(logobject) {
        LoggingHandler.overallLoggingCount++;
        // Setting defaults:        
        var logDefaults = {};        
        logDefaults.seq = LoggingHandler.overallLoggingCount;
        logDefaults.timestamp = new Date().getTime();
        logDefaults.uiState = {
            size : LoggingHandler.visExt.getScreenSize(), 
            actVis : LoggingHandler.visExt.getSelectedChartName(), 
            actFltrs : FilterHandler.activeFiltersNames,  
            browser: {name: LoggingHandler.browser.name, vers: LoggingHandler.browser.majorVersion}
        };
        // Enhancing the object passed
        $.extend(logDefaults, logobject);
        LoggingHandler.buffer.push(logDefaults);
        
        console.debug(logobject.action 
            //+ (', userID: ' + LoggingHandler.origin.userID ) 
            + (logobject.duration ? ', Duration: ' + logobject.duration  : '' ) 
            + (logobject.value ? ', value: ' + logobject.value  : '' )
            + (logobject.source ? ', source: ' + logobject.source  : '' )
            + (logobject.component ? ', component: ' + logobject.component  : '' )
            + (logobject.itemTitle ? ', itemTitle: ' + logobject.itemTitle  : '' )
            + (logobject.itemCountOld ? ', itemCountOld: ' + logobject.itemCountOld  : '' )
            + (logobject.itemCountNew ? ', itemCountNew: ' + logobject.itemCountNew  : '' )
            + (logobject.itemCount ? ', itemCount: ' + logobject.itemCount  : '' )
            + (logobject.old ? ', old: ' + logobject.old  : '' )
            + (logobject.new ? ', new: ' + logobject.new  : '' )
            + ' \t(#' + LoggingHandler.overallLoggingCount + ')');
        if (LoggingHandler.buffer.length >= LoggingHandler.bufferSize){
            LoggingHandler.sendBuffer();
        }
        
        LoggingHandler.directLog(logobject);
    },
    
    sendBuffer: function(){
        api2.moduleStatisticsCollected(LoggingHandler.origin, {logs: LoggingHandler.buffer}, globals.queryID);
        LoggingHandler.buffer = [];
    },
    
    directLog: function(logobject){
        if (logobject.action == "Item opened"){
            api2.itemOpened(LoggingHandler.origin, { id: logobject.itemid }, globals.queryID);
        } else if (logobject.action == "Link item clicked"){
            api2.itemCitedAsHyperlink(LoggingHandler.origin, { id: logobject.itemid }, globals.queryID);
        } else if (logobject.action == 'Link item image clicked'){
            api2.itemCitedAsImage(LoggingHandler.origin, { id: logobject.itemid }, globals.queryID);
        } else if (logobject.action == 'Dashboard opened'){
            api2.moduleOpened(LoggingHandler.origin, "RecDashboard");
        } else if (logobject.action == 'Window is closing'){
            api2.moduleClosed(LoggingHandler.origin, 'RecDashboard', logobject.duration);
        }
    }
};


var api2 = {
       settings : {
        //base_url: "https://eexcess-dev.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/", // dev
        base_url: "https://eexcess.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/", // stable
        timeout: 10000,
        logTimeout: 5000,
        logggingLevel: 0,
        cacheSize: 10,
        suffix_recommend: 'recommend',
        suffix_details: 'getDetails',
        suffix_favicon: 'getPartnerFavIcon?partnerId=',
        suffix_log: 'log/'
    },

    moduleOpened: function (origin, moduleName) {
        if (typeof origin !== 'object') {throw new LoggingFormatException(origin, 'object')}
        if (typeof moduleName != 'string') {throw new LoggingFormatException(moduleName, 'string')}
        var eventData = {
            origin: origin,
            content: {
                name: moduleName
            }
        };
        api2.sendLog('moduleOpened', eventData);
    },
    moduleClosed: function (origin, moduleName, duration) {
        if (typeof origin != 'object') {throw new LoggingFormatException(origin, 'object')}
        if (typeof moduleName != 'string') {throw new LoggingFormatException(moduleName, 'string')}
        if (typeof duration != 'number') {throw new LoggingFormatException(duration, 'number')}
        var eventData = {
            origin: origin,
            content: {
                name: moduleName,
                duration: duration
            }
        };
        api2.sendLog('moduleClosed', eventData);
    },
    moduleStatisticsCollected: function (origin, statistics, queryID) {
        if (typeof origin != 'object') {throw new LoggingFormatException(origin, 'object')}
        var eventData = {
            origin: origin,
            content: statistics,
            queryID: queryID
        };
        api2.sendLog('moduleStatisticsCollected', eventData);
    },
    itemOpened: function (origin, documentBadge, queryID) {
        if (typeof origin != 'object') {throw new LoggingFormatException(origin, 'object')}
        if (typeof documentBadge != 'object') {throw new LoggingFormatException(documentBadge, 'object')}
        if (typeof queryID != 'string') {throw new LoggingFormatException(queryID, 'string')}
        var eventData = {
            origin: origin,
            content: {
                documentBadge: documentBadge
            },
            queryID: queryID
        };
        api2.sendLog('itemOpened', eventData);
    },
    //itemClosed: function (origin, documentBadge, queryID, duration) {
    //},
    itemCitedAsImage: function (origin, documentBadge, queryID) {
        if (typeof origin != 'object') {throw new LoggingFormatException(origin, 'object')}
        if (typeof documentBadge != 'object') {throw new LoggingFormatException(documentBadge, 'object')}
        if (typeof queryID != 'string') {throw new LoggingFormatException(queryID, 'string')}
        var eventData = {
            origin: origin,
            content: {
                documentBadge: documentBadge
            },
            queryID: queryID
        };
        api2.sendLog('itemCitedAsImage', eventData);
    },
    //itemCitedAsText: function (origin, documentBadge, queryID) {
    //},
    itemCitedAsHyperlink: function (origin, documentBadge, queryID) {
        if (typeof origin != 'object') {throw new LoggingFormatException(origin, 'object')}
        if (typeof documentBadge != 'object') {throw new LoggingFormatException(documentBadge, 'object')}
        if (typeof queryID != 'string') {throw new LoggingFormatException(queryID, 'string')}
        var eventData = {
            origin: origin,
            content: {
                documentBadge: documentBadge
            },
            queryID: queryID
        };
        api2.sendLog('itemCitedAsHyperlink', eventData);
    },    
  
    sendLog: function(interactionType, logEntry, callback) {        
        var xhr;
        xhr = $.ajax({
            url: api2.settings.base_url + api2.settings.suffix_log + interactionType,
            data: JSON.stringify(logEntry),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            timeout: api2.settings.logTimeout,
            complete: function(event, jqXHR){
                if (callback)
                    callback(event, jqXHR);
            }
        });
    }  
};


var demo =
{
    action: "Brush created", //--> Mandatory
    source: "GeoVis",
    component: "",
    components: [],
    duration: 1, // seconds
    itemId: "",
    itemTitle: "",
    value: "",
    seq: 1,
    itemCount: 1,
    itemCountOld: 1,
    itemCountNew: 2,
    old: "",
    new: "",
    timestamp: 0, // seconds
    uiState: {
        size: "123/123",
        browser: { name: "", vers: "" }, // will only be logged at the beginning
        vers: "11.a", //--> can be used for a/b testing 
        actVis: "Geo",
        actFltrs: ["Geo", "Time"],
        actBkmCol: "Demo Historic buildings", // if undefined, then "search result"
    }
}


// Example usages:
//- LoggingHandler.log({ action: "Item opened", source:"List", itemId: "id of item", itemTitle : "Titel of document"  });
//- LoggingHandler.log({ action: "Item selected", source:"List", itemId: "id of item", itemTitle : "Titel of document"  });
// LoggingHandler.log({ action: "Item inspect", source: "urank|geo|landscape|time", itemId: "id of item"}); // only for duration > 1s // nice to have
//- LoggingHandler.log({ action: "Window Resized" });
//- LoggingHandler.log({ action: "Dashboard opened", uiState: { browser : { name: "", } } }); // + closed
//- LoggingHandler.log({ action: "Settings clicked"});
//- LoggingHandler.log({ action: "zoomed", source: "GeoVis"  });
// LoggingHandler.log({ action: "panned", source: "GeoVis"  });
//- LoggingHandler.log({ action: "Brush created", source: "Timeline", value: "1980-2010", itemCountOld: "25", itemCountNew: "30"}); // source: "Barchart", value: "de" // source: "uRank", value: [{"keyword": "rome", weight: 15}, ...]
//- LoggingHandler.log({ action: "Brush removed", source: "Barchart", widget="recycle bin|esc|...", itemCountOld: "25", itemCountNew: "30" }); 
//- LoggingHandler.log({ action: "ColorMapping changed", old: "language", new: "provider" source: "urank" });
//- LoggingHandler.log({ action: "Chart changed", old: "language", new: "provider" });
//- LoggingHandler.log({ action: "Reset", source: "urank" });
// LoggingHandler.log({ action: "MouseArea changed", source: "urank", component:"tagcloud|list|bars|tagfilter", duration: "16" }); // only for duration > 1s // nice to have
//- LoggingHandler.log({ action: "Filter set", source: "Barchart", value: "de", itemCountOld: "25", itemCountNew: "30" });
//- LoggingHandler.log({ action: "Filter removed", source: "Barchart", value: "de", itemCountOld: "25", itemCountNew: "30" });
//- LoggingHandler.log({ action: "Filter saved|removed"});
//- LoggingHandler.log({ action: "Filter collapsed|expanded by User"});

// Bookmarking:
// LoggingHandler.log({ action: "Bookmarked items", value : "Demo University campus", itemCountOld: "25", itemCountNew: "30" });
// LoggingHandler.log({ action: "Bookmarked item", value : "Demo University campus" itemId: "id of item" });
// LoggingHandler.log({ action: "Bookmark removed", value : "Demo University campus" itemId: "id of item" });
// LoggingHandler.log({ action: "Collection changed", value: "Demo University campus"});
// LoggingHandler.log({ action: "Collection created", value: "Demo University campus" itemCountOld: "25", itemCountNew: "30"});
// LoggingHandler.log({ action: "Collection removed", value: "Demo University campus" itemCountOld: "25", itemCountNew: "30"});
// LoggingHandler.log({ action: "Collection exported", value: "Demo University campus" itemCountOld: "25", itemCountNew: "30"});
// LoggingHandler.log({ action: "Collection imported", value: "Demo University campus" itemCountOld: "25", itemCountNew: "30"});

// Santokh:
// LoggingHandler.log({ action: "Keyword inspect", source: "landscape|uRank", value = "keyword1"}); // only for duration > 1s // nice to have
// LoggingHandler.log({ action: "Keyword added", source: "landscape|uRank", value = "keyword1"}); // click on keyword
// LoggingHandler.log({ action: "Keyword removed", source: "landscape|uRank", value = "keyword1"}); // click on keyword
// LoggingHandler.log({ action: "Feedback sent", value: ""});


// Nice To haves:
// LoggingHandler.log({ action: "Setting changed", value: "word-tagcloud --> landscape-tagcloud"});
// LoggingHandler.log({ action: "Reference added", itemId: "id of item" source: "urank" });
// LoggingHandler.log({ action: "Scroll", source: "urank", value: "50px" }); // nice to have


//Vis specific:
///uRank: rerank (#, #up, #down), weightChange(keyword, oldValue, newValue), keywordInspect(keyword) // >1s
// geo, timeline: imageSlider(source, action="slide|click"), arregationInspected (source, itemCount, type="donut|imageSlider") // >1s, nice to have

//????? IP bzw. User Identifizierung --> nicht nur session tracken, sondern auch den user

// // ev. interactiv-zeitraum...
// // wenn interactive nur wegen document open, dann nicht mitzählen
// // number of elements found
// // number of elements in collection
// // chart changed



////////////// TODOS:
// itemCountOld + New hinzufügen überall:
