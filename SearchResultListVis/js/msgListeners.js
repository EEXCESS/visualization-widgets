var lastProcessedQueryID;

window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.queryTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
            $(showLoadingBar());
        }

        if (msg.data.event && msg.data.event === 'eexcess.newResults') {
            // new results are available in msg.data.data
            if (lastProcessedQueryID && lastProcessedQueryID === msg.data.data.queryID) {
                // data already processed, do nothing
            } else {
                $(addIsotopeGrid(msg));
                $(logResultItemClicks(msg));

                ////make sure elements exist
                //var checkExist = setInterval(function () {
                //    if ($('.eexcess-isotope-grid-item').length) {
                //        clearInterval(checkExist);
                //        //$(addFilterCounter);
                //        //$(truncateTitles);
                //    }
                //}, 10);

                lastProcessedQueryID = msg.data.data.queryID;
                console.log(msg.data);
            }

        } else if (msg.data.event === 'eexcess.error') {
            $(showError(msg.data.data));
        } else if (msg.data.event === 'eexcess.explanation.highlight') {
            //$('.eexcess-isotope-grid-item').removeClass('eexcess-highlight-item');
            msg.data.data.forEach(function(val){
                val = val.toLowerCase();
                if(dict[val]) {
                    dict[val].forEach(function(val2){
                        val2.addClass('eexcess-highlight-item');
                    });
                }
            })
        } else if (msg.data.event === 'eexcess.explanation.unhighlight') {
            $('.eexcess-isotope-grid-item').removeClass('eexcess-highlight-item');
        } else if (msg.data.event === 'eexcess.results.filter') {
            console.log(currentFilter);
            $('.eexcess-isotope-grid').isotope({filter: '.eexcess-highlight-item'});
        }

    }


}

