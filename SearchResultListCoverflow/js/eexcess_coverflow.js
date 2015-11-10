// Most functions based on SearchResultListVis

function truncateTitles(){
        $('.description-image').dotdotdot();
        $('.description-text').dotdotdot();
        $('.description-other').dotdotdot();
};

function showLoadingBar() {
    $('#eexcess-coverflow').hide();
    $('#eexcess-coverflow').empty();
    $('#eexcess-error').hide();
    $('#eexcess_empty_result').hide();
    $('#eexcess_error').hide();
    $('#eexcess_error_timeout').hide();
    $('#eexcess-loading').show();
};

function showError(errorData) {
    $('#eexcess-coverflow').hide();
    $('#eexcess-coverflow').empty();
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
        module: 'Search Result List coverflow'
    };
    // todo: ensure proper logging https://github.com/NUKnightLab/coverflowJS3/blob/master/API.md
    $('.eexcess-coverflow').on('click', '.eexcess-coverflow', function () {
        var item = $('.eexcess-coverflow-item');

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


function createCoverflow(msg) {
    $('.eexcess_error').hide();
    $('.eexcess_error_timeout').hide();
    $('#eexcess-loading').hide();


    if (msg.data.data.result.length == 0) {
        $('.eexcess_empty_result').show();
    } else {
        var $items = $(createcoverflowJSON(msg));
        if ($items.length>0){
            $('.eexcess_empty_result').hide();        
            //check if all items are loaded to avoid overlap, then add items to container
            $items.imagesLoaded(function () {
                $('#eexcess-coverflow').append($items);
                $('#eexcess-coverflow').show();
                $('.eexcess-coverflow-item').css({ 'height' : '100%'});
            //create coverflow object here.
                //if ($.fn.reflect) {
                  //      $('.eexcess-coverflow-item').reflect();
                //}
                $('#eexcess-coverflow').coverflow({
                        confirm:        function() {
                            console.log('Confirm');
                        },

                        change:         function(event, cover) {
                            var img = $(cover).children().andSelf().filter('img').last();
                            $('#eexcess-coverflow-item-description-title').text(img.data('title') || 'unknown');
                            $('#eexcess-coverflow-item-description-decription').text(img.data('description') || 'unknown');
                        }
                        
                    }); 
            });
            
            
        }else {
          $('.eexcess_empty_result').show();  
        }

        //check if all items are loaded to avoid overlap, then add items to container
        //$items.imagesLoaded(function () {
        //    $('.eexcess-isotope-grid').isotope('insert', $items);
        //});

    }
    function createcoverflowJSON(msg) {

        var items = "";
        //sort data according to date first. use simple string sorting, which should be sufficient.
        $.each(msg.data.data.result, function (idx, o) {
        
                 if (o.previewImage != undefined) {

                    items += "<img class='eexcess-coverflow-item' data-title='"+o.title+"' src='"+
                            o.previewImage+"'/>" 
                    //assemble href for item                    
                    /*var documentBadge = 'itemId = "' + o.documentBadge.id + '" itemURI = "' + o.documentBadge.uri + '" provider =' +
                        ' "' + o.documentBadge.provider + '"';                    
                    var event = {};
                    var start_date = {};
                    start_date["year"] = date.year().toString();
                    console.log(date);
                    console.log(o);

                    event["start_date"] = start_date;
                    event["end_date"] = start_date;

                    var text = {};
                    if (o.title && o.title.length > 120){
                        text["headline"] = "<div class='eexcess-coverflow-item' title='"+o.title+"'"+documentBadge+
                                           " style='font-size: 80%'>"+o.title.substring(0,120)+"...</div>";

                    }else {
                        text["headline"] = "<div class='eexcess-coverflow-item' "+documentBadge+" style='font-size: 80%'>"+o.title+"</div>";
                    }
                    if (o.description){
                        text["text"] = "<div style='font-size: 80%'>"+o.description +"</div>";
                    }
                    //if (!text["text"]) text["text"] = "";
                    event["text"] = text;

                    if (o.previewImage) {
                        var media = {};
                        media["caption"] = '<a target="_blank" href="' + o.documentBadge.uri + '">'+o.title+'</a>'; 
                        media["credit"] = '<a target="_blank" style="font-size: 80%" href="o.licence">' + " Licensed by "+ o.documentBadge.provider + " </a> ";
                        media["url"] = o.previewImage;
                        event["media"] = media;

                    }*/
                     
                }             
        });

        // TODO: as soon as there are more details available we might consider 
        //loadEexcessDetails(results, msg.data.data.queryID, msg.data.data.profile.origin, function(data){ 
        //    console.log("received detail data:");
        //    console.log(data);
        // });

        return items;
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



