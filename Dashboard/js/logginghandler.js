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
    origin: { clientType: '', clientVersion: '', userID: '', module: 'RecDashboard' },
    
    init: function(visExt){
        LoggingHandler.browser = getBrowserInfo();
        LoggingHandler.visExt = visExt;
        LoggingHandler.startTime = new Date();
        
        $(window).bind('beforeunload', function(){
            var duration = (new Date().getTime() - LoggingHandler.initializedAt) / 1000;
            LoggingHandler.log({ action: "Window is closing", source:"LoggingHandler", duration: duration });
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
                if (duration > 3){
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
        
        console.log(logobject.action 
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
    },
    
    sendBuffer: function(){
        var logData = {
            "origin": LoggingHandler.origin,
            "content": { logs: LoggingHandler.buffer},
            "queryID": "XX" //A33B29B-BC67-426B-786D-322F85182DA6"
        };
        // calling centralized C4 logging API
        api2.sendLog(api2.logInteractionType.moduleStatisticsCollected, logData, function(event, jqXHR) { console.log(event); console.log(jqXHR); });
        //api2.sendLog(api2.logInteractionType.itemOpened, logData, function(event, jqXHR) { console.log(event); console.log(jqXHR); });
        LoggingHandler.buffer = [];
    }
};


var api2 = {
        logInteractionType: {
            moduleOpened: "moduleOpened",
            moduleClosed: "moduleClosed",
            moduleStatisticsCollected: "moduleStatisticsCollected",
            itemOpened: "itemOpened",
            itemClosed: "itemClosed",
            itemCitedAsImage: "itemCitedAsImage",
            itemCitedAsText: "itemCitedAsText",
            itemCitedAsHyperlink: "itemCitedAsHyperlink",
            itemRated: "itemRated"
        },
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
        suffix_log: 'log/',
        origin: {
            clientType: '',
            clientVersion: '',
            userID: ''
        }
    },
    originException: function(errorMsg) {
        this.toString = function() {
            return errorMsg;
        };
    },

    complementOrigin : function(origin) {
        // if (typeof origin === 'undefined') {
        //     throw new api2.originException("origin undefined");
        // } else if (typeof origin.module === 'undefined') {
        //     throw new api2.originException("origin.module undfined");
        // } else if (typeof api2.settings.origin === 'undefined') {
        //     throw new api2.originException('origin undefined (need to initialize via APIconnector.init({origin:{clientType:"<name of client>", clientVersion:"version nr",userID:"<UUID>"}})');
        // } else if (typeof api2.settings.origin.clientType === 'undefined') {
        //     throw new api2.originException('origin.clientType undefined (need to initialize via APIconnector.init({origin:{clientType:"<name of client>"}})');
        // } else if (typeof api2.settings.origin.clientVersion === 'undefined') {
        //     throw new api2.originException('origin.clientVersion undefined (need to initialize via APIconnector.init({origin:{clientVersion:"<version nr>"}})');
        // } else if (typeof api2.settings.origin.userID === 'undefined') {
        //     throw new api2.originException('origin.userID undefined (need to initialize via APIconnector.init({origin:{userID:"<UUID>"}})');
        // } else {
        //     origin.clientType = api2.settings.origin.clientType;
        //     origin.clientVersion = api2.settings.origin.clientVersion;
        //     origin.userID = api2.settings.origin.userID;
        // }
        return origin;
    },
  
    sendLog: function(interactionType, logEntry, callback) {
        logEntry.origin = api2.complementOrigin(logEntry.origin);
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
