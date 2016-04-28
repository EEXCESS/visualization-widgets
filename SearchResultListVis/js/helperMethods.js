$(document).ready(function () {


//-----Filter-Buttons-----//
// change is-checked class on buttons
    $('#eexcess-isotope-filters').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function () {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $(this).addClass('is-checked');
        });
    });
    $('#eexcess-isotope-sorts').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function () {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $(this).addClass('is-checked');
        });
    });
})
;


function logResultItemClicks(msg) {

    var origin = {
        module: 'Search Result List Visualization'
    };
    $('.eexcess-isotope-grid').on('click', '.eexcess-isotope-grid-item', function () {
        var item = $('.eexcess-isotope-grid-item');
        var documentBadge =
        {
            id: item.attr('itemid'),
            uri: item.attr('itemuri'),
            provider: item.attr('provider')
        };
        //console.log("queryID: " + msg.data.data.queryID);
        //console.log("Type of documentBadge: " + typeof documentBadge);
        LOGGING.itemOpened(origin, documentBadge, msg.data.data.queryID);


    });
}


function showLoadingBar() {
    $('.eexcess_empty_result').hide();
    $('#eexcess-isotope-filtering-and-sorting').hide();
    $('.eexcess_error').hide();
    $('.eexcess_error_timeout').hide();
    $("div").remove(".eexcess-isotope-grid-item");
    $('#eexcess-loading').show();
}

function showError(errorData) {
    $('#eexcess-loading').hide();
    $('.eexcess_empty_result').hide();
    if (errorData === 'timeout') {
        $('.eexcess_error_timeout').show();
    }
    else {
        $('.eexcess_error').show();
    }
}
;

function addIsotopeGrid(msg) {
    $('.eexcess_error').hide();
    $('.eexcess_error_timeout').hide();
    $('#eexcess-loading').hide();


    if (msg.data.data.result.length == 0) {
        $('.eexcess_empty_result').show();
    }


    else {
        var $items = $(addGridResultItems(msg));
        $('.eexcess_empty_result').hide();
        $('#eexcess-isotope-filtering-and-sorting').show();
        //init isotope
        $('.eexcess-isotope-grid').isotope({
            itemSelector: '.eexcess-isotope-grid-item',
            layoutMode: 'masonry',
            masonry: {
                columnWidth: 50
            },
            getSortData: {
                title: '.title'
            }
        });

        //check if all items are loaded to avoid overlap, then add items to container
        $items.imagesLoaded(function () {
            $('.eexcess-isotope-grid').isotope('insert', $items);
        });

        //------Filtering------//
        // bind filter button click
        $('#eexcess-isotope-filters').on('click', 'button', function () {
            var filterValue = $(this).attr('data-filter');
            // use filterFn if matches value
            $('.eexcess-isotope-grid').isotope({filter: filterValue});
        });

        //------Sorting------//
        // bind sort button click
        $('#eexcess-isotope-sorts').on('click', 'button', function () {
            var sortValue = $(this).attr('data-sort-value');
            console.log(sortValue);
            $('.eexcess-isotope-grid').isotope({sortBy: sortValue});
        });
              
    }
    function addGridResultItems(msg) {

        var items = '';

        $.each(msg.data.data.result, function (idx, val) {

                //assemble href for item
                var itemLink = '<a target="_blank" href="' + val.documentBadge.uri + '"><span' +
                    ' class="emptyspan"></span>';

                var documentBadge = 'itemId = "' + val.documentBadge.id + '" itemURI = "' + val.documentBadge.uri + '" provider =' +
                    ' "' + val.documentBadge.provider + '"';

                // get title to adjust its length according to the space available in the media type's description
                var itemTitle = val.title;
                //if (itemTitle.length > 140) {
                //    itemTitle = itemTitle.substring(0, 139) + "...";
                //}
                
               
                
                
                // add isotoped items
                if (val.mediaType == "IMAGE" || val.mediaType == "image") {
                    var previewImage;


                    //in case of in image, text size is decreased further
                    //if (itemTitle.length > 40) {
                    //    itemTitle = itemTitle.substring(0, 39) + "...";
                    //}

                    if (val.previewImage != undefined) {
                        previewImage = val.previewImage;
                    } else {
                        previewImage = "http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=image";
                    }
                    var item = '<div class' +
                        ' =' +
                        ' "eexcess-isotope-grid-item' +
                        ' eexcess-image"' +
                        ' ' + documentBadge + ' data-category="eexcess-image">' + itemLink + ' <div class="description-image"> <!-- description' +
                        ' content -->  <p class="description_content title">' + itemTitle +
                        '</p><!-- end description content -->   </div>' +
                        '  <img src="' + previewImage + '" /></div>';


                    items += item;
                }

                else if (val.mediaType == "TEXT" || val.mediaType == "text") {

                    var item = '<div class = "eexcess-isotope-grid-item eexcess-text"' + documentBadge + ' data-category="eexcess-text">' + itemLink +
                        ' <div class="description-other">' +
                        ' <p class="description_content title">' + itemTitle + "<br>" +
                        '</p></div><img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=text' + '" /></div>';
                    items += item;
                }


                else if (val.mediaType == "AUDIO" || val.mediaType == "audio") {

                    //
                    //if (itemTitle.length > 50) {
                    //    itemTitle = itemTitle.substring(0, 49) + "...";
                    //}

                    var item = '<div class = "eexcess-isotope-grid-item eexcess-audio"' + documentBadge + ' data-category="eexcess-audio">'  + itemLink +
                        ' <div' +
                        ' class="description-other">' +
                        ' <p class="description_content title">' + itemTitle +
                        '</p></div><img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=audio' + '" /></div>';
                    items += item;
                }
                else if (val.mediaType == "VIDEO" || val.mediaType == "video") {

                    //
                    //if (itemTitle.length > 50) {
                    //    itemTitle = itemTitle.substring(0, 49) + "...";
                    //}

                    var item = '<div class = "eexcess-isotope-grid-item eexcess-video"' + documentBadge + ' data-category="eexcess-video">' + itemLink +
                        ' <div class="description-other">' +
                        ' <p class="description_content title">' + itemTitle +
                        '</p></div><img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=video' + '" /></div>';
                    items += item;
                }

                else if (val.mediaType == "3D" || val.mediaType == "3d") {

                    //
                    //if (itemTitle.length > 50) {
                    //    itemTitle = itemTitle.substring(0, 49) + "...";
                    //}

                    var item = '<div class = "eexcess-isotope-grid-item eexcess-3d"' + documentBadge + ' data-category="eexcess-3d"> ' + itemLink + ' <div class="description-other">' +
                        ' <p class="description_content title">' + itemTitle +
                        '</p></div><img src="http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=3d' + '" / >< / div > ';
                    items += item;
                }

                else {
                    //
                    //if (itemTitle.length > 50) {
                    //    itemTitle = itemTitle.substring(0, 49) + "...";
                    //}
                    var item = '<div class = "eexcess-isotope-grid-item eexcess-unknown"' + documentBadge + ' data-category="eexcess-unknown"->' + itemLink + '<div class="description-other"> <p' +
                        ' class="description_content title">' + itemTitle +
                        '</p></div> <img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=unknown' + '" /></div>';
                    items += item;
                }

            }
        )
        ;
        
        
       
        
        return items;
    }

}

;

