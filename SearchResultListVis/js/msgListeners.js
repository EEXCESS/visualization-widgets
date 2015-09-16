window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.newSearchTriggered') {
            // new search has been triggered somewhere, show loading bar or similar

        }
        else if (msg.data.event === 'eexcess.newResults') {
            // new results are available in msg.data.data

            //show favicons
//                $.each(msg.data.data.result, function (idx, val) {
//                    $('body').append('<img src="' + msg.data.data.faviconURL + val.documentBadge.provider + '" />');
//                });
            //remove old data
            $("div").remove(".eexcess-isotope-grid-item");

            var $items = $(addImages());

            //init isotope
            $('.eexcess-isotope-grid').isotope({
                itemSelector: '.eexcess-isotope-grid-item',
                layoutMode: 'fitRows'
            });


            //check if all items are loaded to avoid overlap, then add items to container
            $items.imagesLoaded(function () {
                $('.eexcess-isotope-grid').isotope('insert', $items);
            });

            // bind filter button click
            $('#eexcess-isotope-filters').on( 'click', 'button', function() {
                var filterValue = $( this ).attr('data-filter');
                // use filterFn if matches value
                $('.eexcess-isotope-grid').isotope({ filter: filterValue });
            });



            // get details for all results
            var documentBadges = [];
            $.each(msg.data.data.result, function (idx, val) {
                documentBadges.push(val.documentBadge);
            });
            window.top.postMessage({
                event: 'eexcess.detailsRequest',
                data: documentBadges
            }, '*');
        }

        else if (msg.data.event === 'eexcess.detailsResponse') {
            // details received in msg.data.data
        }
    }


    function addImages() {
        var items = '';
        $.each(msg.data.data.result, function (idx, val) {

            // add isotoped images
            if (val.mediaType == "IMAGE" || val.mediaType == "image") {

                var item = '<div class = "eexcess-isotope-grid-item eexcess-image"  data-category="eexcess-image"> <div class="description"> <!-- description' +
                    ' content -->  <p class="description_content">' + val.title.substring(0, 49) + "..." +
                    '</p><!-- end description content -->   </div>' +
                    '  <img src="' + val.previewImage + '" /> </div>';

                items += item;
            }

            else if (val.mediaType == "TEXT" || val.mediaType == "text") {

                var item = '<div class = "eexcess-isotope-grid-item eexcess-text" data-category="eexcess-text"> <div class="description">' +
                    ' <p class="description_content">' + val.title.substring(0, 49) + "..." +
                    '</p></div><img src="' + 'https://dl.dropboxusercontent.com/u/25937134/Thumbnails_EECXESS_text.png' + '" /></div>';
                items += item;
            }

            else {
                var item = '<div class = "eexcess-isotope-grid-item eexcess-unknown" data-category="eexcess-text"-><div class="description"> <p' +
                    ' class="description_content">' + val.title.substring(0, 49) + "..." +
                    '</p></div> <img src="' + 'https://dl.dropboxusercontent.com/u/25937134/Thumbnails_EECXESS_Unknown.png' + '" /></div>';
                items += item;
            }

        });
        return items;
    }
};
