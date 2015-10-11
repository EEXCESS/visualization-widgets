window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.newSearchTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
            //    helper.showLoadingScreen();
            //    $('#result_gallery').remove();
            //    $('#eexcess_thumb').hide();
            //    settings.hostTag.find('.pagination').remove();
            //    $widgets.error.hide();
            //    $widgets.list.empty();
            //    $('.empty_result').hide();
            //    $widgets.loader.show();
            //};
            //$('.eexcess-isotope-grid').append('<div class="eexcess_loading" style="display:none"><img src="' + settings.pathToMedia + 'loading.gif"' +
            //    ' /></div>');
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

