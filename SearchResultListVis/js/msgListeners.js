window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.queryTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
       $(showLoadingBar());
        }

        else if (msg.data.event === 'eexcess.newResults') {
            // new results are available in msg.data.data

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


        } else if (msg.data.event === 'eexcess.error') {
            $(showError(msg.data.data));
        }
        else if (msg.data.event === 'eexcess.detailsResponse') {
            // details received in msg.data.data
        }


    }
}

