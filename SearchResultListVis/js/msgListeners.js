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

            var $items = $(addGridResultItems(msg));

            //init isotope
            $('.eexcess-isotope-grid').isotope({
                itemSelector: '.eexcess-isotope-grid-item',
                layoutMode: 'fitRows',
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
}

