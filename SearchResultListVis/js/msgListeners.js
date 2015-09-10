window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.newSearchTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
        }
        else if (msg.data.event === 'eexcess.newResults') {
            // new results are available in msg.data.data
            $('.grid').isotope({
                itemSelector: '.grid-item',
                percentPosition: true,
                masonry: {
                    columnWidth: '.grid-sizer'
                }
            });

            //show favicons
//                $.each(msg.data.data.result, function (idx, val) {
//                    $('body').append('<img src="' + msg.data.data.faviconURL + val.documentBadge.provider + '" />');
//                });


            //show images
            console.log(msg.data.data);
            addImages();

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

        });

        var $items = $(items);
        // append elements to container
        $('.grid').append($items)
            // add and lay out newly appended elements
            .isotope('appended', $items);
    }
};