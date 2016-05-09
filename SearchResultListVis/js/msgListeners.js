var lastProcessedQueryID;

window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.queryTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
            $(showLoadingBar());
        }

        if (msg.data.event && msg.data.event === 'eexcess.newResults') {
            // reselt filters
            // new results are available in msg.data.data
            if (lastProcessedQueryID && lastProcessedQueryID === msg.data.data.queryID && !$('#eexcess-loading').is(':visible')) {
                // data already processed, do nothing
            } else {
                $(addIsotopeGrid(msg));
                $(logResultItemClicks(msg));

                //make sure elements exist
                var checkExist = setInterval(function () {
                    if ($('.eexcess-isotope-grid-item').length) {
                        clearInterval(checkExist);
                        $(addFilterCounter);
                        $(truncateTitles);
                    }
                }, 10);

                lastProcessedQueryID = msg.data.data.queryID;
                
                 $('.eexcess-isotope-grid').isotope({filter: '*'});
            }

        } else if (msg.data.event === 'eexcess.error') {
            $(showError(msg.data.data));
        } else if (msg.data.event === 'eexcess.explanation.highlight') {
            //$('.eexcess-isotope-grid-item').removeClass('eexcess-highlight-item');
            $('.eexcess-isotope-grid-item').addClass('eexcess-highlight-fade');
            msg.data.data.forEach(function (val) {
                val = val.toLowerCase();
                if (dict[val]) {
                    dict[val].forEach(function (val2) {
                        if (val2.is(':visible')) {
                            val2.addClass('eexcess-highlight-item');
                            val2.removeClass('eexcess-highlight-fade');
                        }
                    });
                }
            })
        } else if (msg.data.event === 'eexcess.explanation.unhighlight') {
            $('.eexcess-isotope-grid-item').removeClass('eexcess-highlight-item');
            $('.eexcess-isotope-grid-item').removeClass('eexcess-highlight-fade');
        } else if (msg.data.event === 'eexcess.results.filter') {
            $('.eexcess-isotope-grid').isotope({filter: '.eexcess-highlight-item'});
        }

    }


}

