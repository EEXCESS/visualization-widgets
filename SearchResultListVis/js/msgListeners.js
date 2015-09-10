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
            $("img").remove(".grid-item");

            var $items = $(addImages());

            //init isotope
            $('.grid').isotope({
                itemSelector: '.grid-item',
                percentPosition: true,
                masonry: {
                    columnWidth: '.grid-sizer'
                }
            });

            //check if all items are loaded to avoid overlap, then add items to container
            $items.imagesLoaded(function () {
                $('.grid').isotope('insert', $items);
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

                var item = '<img class = "grid-item" src="' + val.previewImage + '" />';
                items += item;
            }

            else if (val.mediaType == "TEXT" || val.mediaType == "text") {

                var item = '<img class = "grid-item" src="' + 'https://dl.dropboxusercontent.com/u/25937134/Thumbnails_EECXESS_text.png' + '" />';
                items += item;
            }

            else {

                var item = '<img class = "grid-item" src="' + 'https://dl.dropboxusercontent.com/u/25937134/Thumbnails_EECXESS_Unknown.png' + '" />';
                items += item;
            }

        });
        return items;
    }
};
