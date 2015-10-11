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
});


function addIsotopeGrid(msg) {
    $("div").remove(".eexcess-isotope-grid-item");

    var $items = $(addGridResultItems(msg));

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
            var itemLink = ' <a target="_blank" href="' + val.documentBadge.uri + '"><span class="emptyspan"></span>';

            // get title to adjust its length according to the space available in the media type's description
            var itemTitle = val.title;


            // add isotoped items
            if (val.mediaType == "IMAGE" || val.mediaType == "image") {
                var previewImage;


                if (itemTitle.length > 50) {
                    itemTitle = itemTitle.substring(0, 49) + "...";
                }

                if (val.previewImage != undefined) {
                    previewImage = val.previewImage;
                } else {
                    previewImage = "http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=image";
                }
                var item = '<div class = "eexcess-isotope-grid-item eexcess-image"  data-category="eexcess-image">' + itemLink + ' <div class="description-image"> <!-- description' +
                    ' content -->  <p class="description_content title">' + itemTitle +
                    '</p><!-- end description content -->   </div>' +
                    '  <img src="' + previewImage + '" /> </div>';


                items += item;
            }

            else if (val.mediaType == "TEXT" || val.mediaType == "text") {

                if (itemTitle.length > 100) {
                    itemTitle = itemTitle.substring(0, 99) + "...";
                }

                if (val.date != "unknown") {
                    var item = '<div class = "eexcess-isotope-grid-item eexcess-text" data-category="eexcess-text">' + itemLink +

                        ' <div class="description-text">' +
                        ' <p class="description_content title"><b>Title:</b> ' + itemTitle + "<br><b>Provider:</b> " + val.documentBadge.provider + " <br><b>Date:</b> " + val.date +
                        '</p></div><img src="' + 'https://dl.dropboxusercontent.com/u/25937134/TextButton.png' + '" /></div>';
                    items += item;
                } else {
                    var item = '<div class = "eexcess-isotope-grid-item eexcess-text" data-category="eexcess-text">' + itemLink +
                        ' <div class="description-text">' +
                        ' <p class="description_content title"><b>Title:</b> ' + itemTitle + "<br><b>Provider:</b> " + val.documentBadge.provider +
                        '</p></div><img src="' + 'https://dl.dropboxusercontent.com/u/25937134/TextButton.png' + '" /></div>';
                    items += item;
                }
            }


            else if (val.mediaType == "AUDIO" || val.mediaType == "audio") {

                var item = '<div class = "eexcess-isotope-grid-item eexcess-audio" data-category="eexcess-audio">' + itemLink +
                    ' <div' +
                    ' class="description">' +
                    ' <p class="description_content title">' + itemTitle+
                    '</p></div><img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=audio' + '" /></div>';
                items += item;
            }
            else if (val.mediaType == "VIDEO" || val.mediaType == "video") {

                var item = '<div class = "eexcess-isotope-grid-item eexcess-video" data-category="eexcess-video">' + itemLink +
                    ' <div class="description">' +
                    ' <p class="description_content title">' + itemTitle+
                    '</p></div><img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=video' + '" /></div>';
                items += item;
            }

            else if (val.mediaType == "3D" || val.mediaType == "3d") {

                var item = '<div class = "eexcess-isotope-grid-item eexcess-3d" data-category="eexcess-3d"> ' + itemLink + ' <div class="description">' +
                    ' <p class="description_content title">' + itemTitle+
                    '</p></div><img src="http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=3d' + '" / > < / div > ';
                items += item;
            }

            else {
                var item = '<div class = "eexcess-isotope-grid-item eexcess-unknown" data-category="eexcess-unknown"->' + itemLink + '<div class="description"> <p' +
                    ' class="description_content title">' + itemTitle+
                    '</p></div> <img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=unknown' + '" /></div>';
                items += item;
            }

        }
    )
    ;
    return items;
}
;

