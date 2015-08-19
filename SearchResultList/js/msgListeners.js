define(['resultListHelper'], function(helper){
   // listen for updates
   window.onmessage = function(e) {
      if (e.data.event) {
         if (e.data.event === 'eexcess.newResults') {
            helper.showResults(e.data.data);
         } else if (e.data.event === 'eexcess.queryTriggered') {
             helper._loading();
         } else if (e.data.event === 'eexcess.error') {
             helper._showError(e.data.data);
         } else if (e.data.event === 'eexcess.rating') {
             helper._rating($('.eexcess_raty[data-uri="' + e.data.data.uri + '"]'), e.data.data.uri, e.data.data.score);
         }
      }
   };
});
