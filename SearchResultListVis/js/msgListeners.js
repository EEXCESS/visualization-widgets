window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.queryTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
            $('#eexcess-isotope-filtering-and-sorting').hide();
            $("div").remove(".eexcess-isotope-grid-item");
            $('#eexcess-loading').show();


        }
        else if (msg.data.event === 'eexcess.newResults') {
            // new results are available in msg.data.data

            //show favicons
//                $.each(msg.data.data.result, function (idx, val) {
//                    $('body').append('<img src="' + msg.data.data.faviconURL + val.documentBadge.provider + '" />');
//                });
            //remove old data

            $(addIsotopeGrid(msg));


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

