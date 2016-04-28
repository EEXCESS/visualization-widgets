// Most functions based on SearchResultListVis

function truncateTitles(){
        $('.description-image').dotdotdot();
        $('.description-text').dotdotdot();
        $('.description-other').dotdotdot();
};

function showLoadingBar() {
    $('#eexcess-timeline').hide();
    $('#eexcess-timeline').empty();
    $('#eexcess-error').hide();
    $('#eexcess_empty_result').hide();
    $('#eexcess_error').hide();
    $('#eexcess_error_timeout').hide();
    $('#eexcess-loading').show();
};

function showError(errorData) {
    $('#eexcess-timeline').hide();
    $('#eexcess-timeline').empty();
    $('#eexcess-loading').hide();
    $('.eexcess_empty_result').hide();
    if (errorData === 'timeout') {
        $('.eexcess_error_timeout').show();
    }
    else {
        $('.eexcess_error').show();
    }
};

function logResultItemClicks(msg) {

    var origin = {
        module: 'Search Result List Timeline'
    };
    // todo: ensure proper logging https://github.com/NUKnightLab/TimelineJS3/blob/master/API.md
    $('.eexcess-timeline').on('click', '.eexcess-timeline', function () {
        var item = $('.eexcess-timeline-item');

        var documentBadge =
        {

            id: "unkown",
            uri: "unknown",
            provider: "unknown"
        };
        //console.log("queryID: " + msg.data.data.queryID);
        //console.log("Type of documentBadge: " + typeof documentBadge);
        LOGGING.itemOpened(origin, documentBadge, msg.data.data.queryID);
        //$('.eexcess-isotope-button.eexcess-unknown').append(' ' + '(' + $('.eexcess-isotope-grid-item.eexcess-unknown').size() + ')');

    });
}


function createTimeline(msg) {
    $('.eexcess_error').hide();
    $('.eexcess_error_timeout').hide();
    $('#eexcess-loading').hide();


    if (msg.data.data.result.length == 0) {
        $('.eexcess_empty_result').show();
    } else {
        var json = createTimelineJSON(msg);
        if (json){
            $('.eexcess_empty_result').hide();        

            var options = {
                scale_factor:               1,              // How many screen widths wide should the timeline be
                layout:                     "landscape",    // portrait or landscape
                timenav_position:           "bottom",       // timeline on top or bottom
                optimal_tick_width:         40,            // optimal distance (in pixels) between ticks on axis                            
                timenav_height_percentage:  25,             // Overrides timenav height as a percentage of the screen
                timenav_height_min:         150,            // Minimum timenav height
                marker_height_min:          30,             // Minimum Marker Height
                marker_width_min:           30,            // Minimum Marker Width
                marker_padding:             5,              // Top Bottom Marker Padding
                start_at_slide:             0,
                menubar_height:             0,
                skinny_size:                650,
                relative_date:              false,          // Use momentjs to show a relative date from the slide.text.date.created_time field
                use_bc:                     false,          // Use declared suffix on dates earlier than 0
                // animation
                duration:                   1000,
                ease:                       TL.Ease.easeInOutQuint,
                // interaction
                dragging:                   true,
                trackResize:                true,
                map_type:                   "stamen:toner-lite",
                slide_padding_lr:           10,            // padding on slide of slide
                slide_default_fade:         "0%",           // landscape fade

                api_key_flickr:             "",             // Flickr API Key
                language:                   "en"        
            };
            $('#eexcess-timeline').show();
            var timeline = new TL.Timeline('eexcess-timeline', json);
            $(window).on('resize', function(event) {
                   timeline.updateDisplay();
                });
            
        }else {
          $('.eexcess_empty_result').show();  
        }

        //check if all items are loaded to avoid overlap, then add items to container
        //$items.imagesLoaded(function () {
        //    $('.eexcess-isotope-grid').isotope('insert', $items);
        //});

    }


    function createTimelineJSON(msg) {

        var events = [];
        var results = [];

        $.each(msg.data.data.result, function (idx, o) {

            if (o.date != "unknown" ){
                var date = moment(o.date);
                if (date && date.isValid() && o.previewImage != undefined) {
                    //assemble href for item                    
                    var documentBadge = 'itemId = "' + o.documentBadge.id + '" itemURI = "' + o.documentBadge.uri + '" provider =' +
                        ' "' + o.documentBadge.provider + '"';                    
                    var aevent = {};
                    var start_date = {};
                    start_date["year"] = date.year().toString();
                    //console.log(date);
                    //console.log(o);

                    aevent["start_date"] = start_date;
                    aevent["end_date"] = start_date;

                    var text = {};
                    if (o.title && o.title.length > 120){
                        text["headline"] = "<div class='eexcess-timeline-item' title='"+o.title+"'"+documentBadge+
                                           " style='font-size: 80%'>"+o.title.substring(0,120)+"...</div>";

                    }else {
                        text["headline"] = "<div class='eexcess-timeline-item' "+documentBadge+" style='font-size: 80%'>"+o.title+"</div>";
                    }
                    if (o.description){
                        text["text"] = "<div style='font-size: 80%'>"+o.description +"</div>";
                    }
                    //if (!text["text"]) text["text"] = "";
                    aevent["text"] = text;

                    if (o.previewImage) {
                        var media = {};
                        media["caption"] = '<a target="_blank" href="' + o.documentBadge.uri + '">'+o.title+'</a>'; 
                        media["credit"] = '<a target="_blank" style="font-size: 80%" href="o.licence">' + " Licensed by "+ o.documentBadge.provider + " </a> ";
                        media["url"] = o.previewImage;
                        aevent["media"] = media;

                    }
                    events.push(aevent);   
                    results.push(o);                 
                }
            }
        });
        // TODO: as soon as there are more details available we might consider 
        //loadEexcessDetails(results, msg.data.data.queryID, msg.data.data.profile.origin, function(data){ 
        //    console.log("received detail data:");
        //    console.log(data);
        // });

        if (events.length == 0) return null;
        else {
            var headline = "";
            var text = "";
            $.each(msg.data.data.profile.contextKeywords, function (idx, o ){
                if (o.isMainTopic)
                    headline += o.text + " ";
                else
                    text += o.text + " ";

            });
            return {
                "title": {
                    "text": {
                        "headline": "Timeline for " + headline,
                        "text": "in the context of " + text
                    }
                },
                "events": events
            };
        }
    }

    function loadEexcessDetails(data, queryId, origin, callback){
        // Detail Call:
        // {
        //     "documentBadge": [
        //         {
        //             "id": "E1.6882",
        //             "uri": "http://www.kim.bl.openinteractive.ch/sammlungen#f19e71ca-4dc6-48b8-858c-60a1710066f0",
        //             "provider": "KIM.Portal"
        //         }
        // }

        var detailCallBadges = $.map(data, function(value,key){ return value['documentBadge']});

        var detailscall = $.ajax({
            //url: 'https://eexcess-dev.joanneum.at/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/getDetails', // = old dev
            //url: 'https://eexcess-dev.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/getDetails', // = dev
            url: 'https://eexcess.joanneum.at/eexcess-privacy-proxy-issuer-1.0-SNAPSHOT/issuer/getDetails', // = stable
            data: JSON.stringify({ 
                "documentBadge" : detailCallBadges,
                "origin": origin,
                "queryID": queryId || ''
            }),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json'
        });
        detailscall.done(function(detailData, status, jqXHR) {
            //var mergedData = mergeOverviewAndDetailData(detailData, data);
            callback(detailData);
        });
        detailscall.fail(function(jqXHR, textStatus, errorThrown) {
            console.error('Error while calling details');
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            if(textStatus !== 'abort') {
                console.error(textStatus);
            }
        });
     }


};



