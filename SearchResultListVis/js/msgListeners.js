window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.queryTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
            $(showLoadingBar());
        }

        else if (msg.data.event === 'eexcess.newResults') {
            // new results are available in msg.data.data
            
            received_data = msg.data.data.result;
            $(addIsotopeGrid(msg));
            $(logResultItemClicks(msg));
            //$(".eexcess-isotope-grid-item").each(function () {
            //    $(this).addClass("foo");
            //})

        }


    } else if (msg.data.event === 'eexcess.error') {
        $(showError(msg.data.data));
    }


}

