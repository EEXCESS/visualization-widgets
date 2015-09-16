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


function addGridResultItems(msg) {
    var items = '';


    $.each(msg.data.data.result, function (idx, val) {

        // add isotoped items
        if (val.mediaType == "IMAGE" || val.mediaType == "image") {
            var previewImage;
            if (val.previewImage != undefined) {
                previewImage = val.previewImage;
            } else {
                previewImage = "http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=image";
            }
            var item = '<div class = "eexcess-isotope-grid-item eexcess-image"  data-category="eexcess-image"> <div class="description"> <!-- description' +
                ' content -->  <p class="description_content title">' + val.title.substring(0, 49) + "..." +
                '</p><!-- end description content -->   </div>' +
                '  <img src="' + previewImage + '" /> </div>';

            items += item;
        }

        else if (val.mediaType == "TEXT" || val.mediaType == "text") {

            var item = '<div class = "eexcess-isotope-grid-item eexcess-text" data-category="eexcess-text"> <div class="description">' +
                ' <p class="description_content title">' + val.title.substring(0, 49) + "..." +
                '</p></div><img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=text' + '" /></div>';
            items += item;
        }


        else if (val.mediaType == "AUDIO" || val.mediaType == "audio") {

            var item = '<div class = "eexcess-isotope-grid-item eexcess-audio" data-category="eexcess-audio">' +
                ' <div' +
                ' class="description">' +
                ' <p class="description_content title">' + val.title.substring(0, 49) + "..." +
                '</p></div><img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=audio' + '" /></div>';
            items += item;
        }
        else if (val.mediaType == "VIDEO" || val.mediaType == "video") {

            var item = '<div class = "eexcess-isotope-grid-item eexcess-video" data-category="eexcess-video">' +
                ' <div class="description">' +
                ' <p class="description_content title">' + val.title.substring(0, 49) + "..." +
                '</p></div><img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=video' + '" /></div>';
            items += item;
        }

        else if (val.mediaType == "3D" || val.mediaType == "3d") {

            var item = '<div class = "eexcess-isotope-grid-item eexcess-3d" data-category="eexcess-3d"> <div class="description">' +
                ' <p class="description_content title">' + val.title.substring(0, 49) + "..." +
                '</p></div><img src="http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=3d' + '" / > < / div > ';
            items += item;
        }

        else {
            var item = '<div class = "eexcess-isotope-grid-item eexcess-unknown" data-category="eexcess-unknown"-><div class="description"> <p' +
                ' class="description_content title">' + val.title.substring(0, 49) + "..." +
                '</p></div> <img src="' + 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=unknown' + '" /></div>';
            items += item;
        }

    });
    return items;
}
;

