define(['jquery'], function($){
////////////////////////////////////////////////////

       var showResults = function(data) {
           $('.eexcess_tabs li.active').removeClass('active');
           $('.eexcess_tabs li').first().addClass('active');
           $('#result_gallery').remove();
           _error.hide();
           _loader.hide();
           data = data.results || null;
           _list.empty();

           if (data === null || data.totalResults === 0 || data.totalResults === '0') {
               _list.append($('<li>no results</li>'));
               return;
           }
           _list.attr('data-total', data.totalResults);

           var height = (window.innerHeight || document.body.clientHeight) - 120;
           settings.itemsShown = Math.floor(height / 50);


           var _pagination = $('<div class="pagination"></div>');
           var pages = (Math.ceil(data.results.length / settings.itemsShown) > 10) ? 10 : Math.ceil(data.results.length / settings.itemsShown);

           if (pages > 1) {

               for (var i = 1; i <= pages; i++) {
                   var _btn = $('<a href="#" class="page gradient">' + i + '</a>');
                   if (i == 1) {
                       _btn.addClass('active');
                   }
                   _pagination.append(_btn);
               }

               if (divContainer.find('.pagination').length != 0) {
                   divContainer.find('.pagination').remove();
               }

               divContainer.append(_pagination)
           }
           moreResults(data.results);
       };

       var moreResults = function(items) {
   //            $('#eexcess_content').unbind('scroll'); TODO: check scrolling...
           var offset = _list.children('li').length;
           for (var i = 0, len = items.length; i < len; i++) {

               var item = items[i];
               var img = item.previewImage;
               if (typeof img === 'undefined' || img === '') {
                   img = settings.pathToMedia + 'no-img.png';
               }
               var title = item.title;

               if (typeof title === 'undefined') {
                   title = 'no title';
               }
               var pos = i + offset;
               var li = $('<li data-pos="' + pos + '" data-id="' + item.documentBadge.id + '"></li>');

               _list.append(li);


               if (i >= settings.itemsShown) {
                   li.hide();
               }

               // rating
               var raty = $('<div class="eexcess_raty"  data-uri="' + item.documentBadge.uri + '" data-pos="' + pos + '"></div');
               _rating(raty, item.documentBadge.uri, item.rating);
               li.append(raty);

               var containerL = $('<div class="resCtL"></div>');
               li.append(containerL);
               containerL.append(_link(item.documentBadge.uri, img, '<img class="eexcess_previewIMG" src="' + img + '" />'));

               // contents
               var resCt = $('<div class="eexcess_resContainer"></div>');
               resCt.append(_link(item.documentBadge.uri, img, title));
               li.append(resCt);

               // partner icon and name
               if (typeof item.documentBadge.provider !== 'undefined') {
                   var providerName = item.documentBadge.provider.charAt(0).toUpperCase() + item.documentBadge.provider.slice(1);
                   containerL.append($('<img alt="provided by ' + providerName + '" title="provided by ' + providerName + '" src="' + settings.pathToMedia + 'icons/' + item.documentBadge.provider + '-favicon.ico" class="partner_icon" />'));
               }

               // show link
               var linkCopy = $('<a href="" title="show URL of the resource"><img src="' + settings.pathToMedia + 'icons/link.png" /></a>');
               linkCopy.click(function(evt) {
                   evt.preventDefault();
                   _dialog.children('p').text(this);
                   var at = 'center top+' + evt.pageY;
                   _dialog.dialog({
                       title: 'URL of the resource',
                       height: 130,
                       position: {my: "center", at: at}
                   });
                   // select the link
                   var selection = window.getSelection();
                   var range = document.createRange();
                   range.selectNodeContents(_dialog.children('p').get()[0]);
                   selection.removeAllRanges();
                   selection.addRange(range);
               }.bind(item.documentBadge.uri));
               containerL.append(linkCopy);

               // description
               if (typeof item.description !== 'undefined' && item.description !== '') {
                   var shortDescription = shortenDescription(item.description);
   //                resCt.append($('<p class="result_description">' + item.description + '</p>'));
                   resCt.append($('<p class="result_description">' + shortDescription + '</p>'));
               }
               resCt.append($('<p style="clear:both;"></p>'));

           }
           divContainer.find('.eexcess_previewIMG').error(function() {
               $(this).unbind("error").attr("src", settings.pathToMedia + 'no-img.png');
           });
       };

//////////////////////////////////////////////////////
//
   var _showError = function(errorData) {
      divContainer.find('.pagination').remove();
      _list.empty();
      _loader.hide();
      if (errorData === 'timeout') {
         _error.text('Sorry, the server takes too long to respond. Please try again later');
      } else {
         _error.text('Sorry, something went wrong');
      }
      _error.show();
       $('#eexcess_thumb').hide();
   },

   _loading = function() {
      $('#result_gallery').remove();
      $('#eexcess_thumb').hide();
      divContainer.find('.pagination').remove();
      _error.hide();
      _list.empty();
      $('.empty_result').hide();
      _loader.show();
   };

   /**
   * Event handler on the pagination buttons
   * 
   */
   $(document).on('click', '.page', function() {
      $('.page.active').removeClass('active');
      $(this).addClass('active');
      var page = parseInt($(this).html()) - 1;
      var min = page * settings.itemsShown;
      var max = min + settings.itemsShown;

      $("#recommendationList li").hide().slice(min, max).show();
   });

   // listen for updates
   window.onmessage = function(e) {
      if (e.data.event) {
         if (e.data.event === 'eexcess.newResults') {
            showResults(e.data.data);
         } else if (e.data.event === 'eexcess.queryTriggered') {
             _loading();
         } else if (e.data.event === 'eexcess.error') {
             _showError(e.data.data);
         } else if (e.data.event === 'eexcess.rating') {
             _rating($('.eexcess_raty[data-uri="' + e.data.data.uri + '"]'), e.data.data.uri, e.data.data.score);
         }
      }
   };
       
});
