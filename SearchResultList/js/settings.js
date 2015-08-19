define(['jquery'], function($){
   return {
      pathToMedia: 'media/',
      pathToLibs: 'js/lib/',
      itemsShown: null,
      hostTag: $('#resultListArea'),
      previewHandler: function(url) {
         window.open(url, '_blank');
         window.top.postMessage({
            event: 'eexcess.logging', 
            data: {
               action: 'resultOpened', 
               details: url
            }
         }, '*');
      },
      ratingHandler: function(uri, score) {
         window.top.postMessage({
             event: 'eexcess.rating',
             data: {
                 uri: uri,
                 score: score
             }
         }, '*');
      },
   }
});
