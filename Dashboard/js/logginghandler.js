var LoggingHandler = {
    log: function(logobject) {
        var logDefaults = {};
        logDefaults.screensize = "123/123";
        logDefaults.uiState = { selectedVis:"Geo", activeFilters:["Geo", "Time"] };
        $.extend(logDefaults, logobject);
    }
};


var demo =
{
    action: "Brush created", //--> Mandatory
    source: "GeoVis",
    itemId: "",
    value: "",
    uiState: {
        size: "123/123",
        browser: { name: "", version: "" }, // will only be logged at the beginning
        vers: "11.a", //--> can be used for a/b testing 
        actVis: "Geo",
        actFilters: ["Geo", "Time"],
        actBkmColl: "Demo Historic buildings" // if undefined, then "search result"
    }
}

// Example usages:
LoggingHandler.log({ action: "Bookmark added", source:"uRank List", itemId: "id of item",  });
LoggingHandler.log({ action: "Item opened", source:"List", itemId: "id of item",  });
LoggingHandler.log({ action: "Item selected", source:"List", itemId: "id of item",  });
LoggingHandler.log({ action: "Window Resized", value : "123/123" });
LoggingHandler.log({ action: "Dashboard opened", uiState: { browser : { name: "", } } });
LoggingHandler.log({ action: "Bookmark selected", value : "123 items to collection Asdfasdfasfd" });
LoggingHandler.log({ action: "Settings clicked"});
LoggingHandler.log({ action: "Setting changed", value: "word-tagcloud --> landscape-tagcloud"});
LoggingHandler.log({ action: "zoomed", source: "GeoVis",  });
LoggingHandler.log({ action: "Bookmarkcollection changed", value: "Demo University campus"});
LoggingHandler.log({ action: "Brush created", soruce: "Timeline", value: "1980-2010"});
LoggingHandler.log({ action: "Brush created", soruce: "Barchart", value: "de"});

