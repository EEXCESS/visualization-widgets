window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.queryTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
            $(showLoadingBar());
        }

        else if (msg.data.event === 'eexcess.newResults') {
            // new results are available in msg.data.data

            $(createTimeline(msg));

        } else if (msg.data.event === 'eexcess.error') {
            $(showError(msg.data.data));
        }

        }
};

// initially ask for results
window.top.postMessage({event: 'eexcess.currentResults'}, '*');

