var LoggingHandler = {
    buffer:[],
    bufferSize: 10,
    overallLoggingCount:0,
    startTime: null,
    inactiveSince: null,
    //loggingEndpoint: 'http://{SERVER}/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/log/moduleStatisticsCollected',
    visExt: undefined,
    
    init: function(visExt){
        LoggingHandler.browser = getBrowserInfo();
        LoggingHandler.visExt = visExt;
        LoggingHandler.startTime = new Date();
        
        $(window).bind('beforeunload', function(){
            LoggingHandler.log({ action: "Window is closing", source:"LoggingHandler" });
            LoggingHandler.sendBuffer();
            console.log('beforeunload');
        });
        $(window).blur(function(){
            LoggingHandler.inactiveSince = new Date();
            LoggingHandler.log({ action: "Focus lost", source:"LoggingHandler" });
            console.log('blur');
        });
        $(window).focus(function(){
            LoggingHandler.log({ action: "Focused", source:"LoggingHandler" });
            console.log('focus');
        });
    },
    
    log: function(logobject) {
        LoggingHandler.overallLoggingCount++;
        var logDefaults = {};
        logDefaults.seq = LoggingHandler.overallLoggingCount;
        logDefaults.uiState = {
            size : LoggingHandler.visExt.getScreenSize(), 
            actVis : LoggingHandler.visExt.getSelectedChartName(), 
            actFltrs : FilterHandler.activeFiltersNames,  
            browser: {name: LoggingHandler.browser.name, vers: LoggingHandler.majorVersion}        
        };
        $.extend(logDefaults, logobject);
        LoggingHandler.buffer.push(logDefaults);        
        if (LoggingHandler.buffer.length > LoggingHandler.bufferSize)
            LoggingHandler.sendBuffer();
    },
    
    sendBuffer: function(){
        var logData = {
            "origin": {
                "clientType": "EEXCESS - ?? ",
                "clientVersion": "2.0",
                "module": "RecDashboard",
                "userID": "XX"
            },
            "content": LoggingHandler.buffer,
            "queryID": "XX" //A33B29B-BC67-426B-786D-322F85182DA6"
        };
        // calling centralized C4 logging API
    }
};


var demo =
{
    action: "Brush created", //--> Mandatory
    source: "GeoVis",
    itemId: "",
    value: "",
    seq: 1,
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
// LoggingHandler.log({ action: "Bookmark added", source:"uRank List", itemId: "id of item",  }); // todo: name of collection
// LoggingHandler.log({ action: "Item opened", source:"List", itemId: "id of item",  });
// LoggingHandler.log({ action: "Item selected", source:"List", itemId: "id of item",  });
// LoggingHandler.log({ action: "Window Resized", value : "123/123" });
// LoggingHandler.log({ action: "Dashboard opened", uiState: { browser : { name: "", } } }); // + closed
// LoggingHandler.log({ action: "Bookmark selected", value : "123 items to collection Asdfasdfasfd" });
// LoggingHandler.log({ action: "Settings clicked"});
// LoggingHandler.log({ action: "Setting changed", value: "word-tagcloud --> landscape-tagcloud"});
// LoggingHandler.log({ action: "zoomed", source: "GeoVis",  });
// LoggingHandler.log({ action: "Bookmarkcollection changed", value: "Demo University campus"});
// LoggingHandler.log({ action: "Brush created", soruce: "Timeline", value: "1980-2010"});
// LoggingHandler.log({ action: "Brush created", soruce: "Barchart", value: "de"});
// // ev. interactiv-zeitraum...
// // wenn interactive nur wegen document open, dann nicht mitzählen
// 
// 
