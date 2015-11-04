window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.queryTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
            $(showLoadingBar());
        }

        else if (msg.data.event === 'eexcess.newResults') {
            // new results are available in msg.data.data

            $(addIsotopeGrid(msg));
            $(logResultItemClicks(msg));
            //$(".eexcess-isotope-grid-item").each(function () {
            //    $(this).addClass("foo");
            //})


            var checkExist = setInterval(function() {
                if ($('.eexcess-isotope-grid-item').length) {
                    clearInterval(checkExist);
                    $(addFilterCounter);
                    //$(truncateTitles);
                }
            }, 10);

        } else if (msg.data.event === 'eexcess.error') {
            $(showError(msg.data.data));
        }

        }





}

