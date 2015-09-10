/*
 * Contains methods that are used in different places all over the project.
 */

define(['jquery', 'settings', 'jquery_ui', 'jquery_raty'], function($, settings, jQuery_ui, raty){
   $widgets = {
      loader: $('<div class="eexcess_loading" style="display:none"><img src="' + settings.pathToMedia + 'loading.gif" /></div>'),
      list: $('<ul id="recommendationList" class="block_list" data-total="0"></ul>').append($('<li>no results</li>')),
      dialog: $('<div style="display:none"><div>').append('<p></p>'),
      error: $('<p style="display:none">sorry, something went wrong...</p>'),
      innerContainer: $('<div class="scrollable-y"></div>')
   };


   /**
    * Displays errors.
    *
    * @param errorData: determines the error message. If it is equal to 'timeout' a timeout
    *                   message is shown. Otherwise a general message is shown.
    */
   function showError(errorData) {
      settings.hostTag.find('.pagination').remove();
      $widgets.list.empty();
      $widgets.loader.hide();
      if (errorData === 'timeout') {
         $widgets.error.text('Sorry, the server takes too long to respond. Please try again later');
      } else {
         $widgets.error.text('Sorry, something went wrong');
      }
      $widgets.error.show();
       $('#eexcess_thumb').hide();
   };

   /**
    * Hides the currently displayed UI widgets and shows a loading screen instead.
    */
   function showLoadingScreen() {
      $('#result_gallery').remove();
      $('#eexcess_thumb').hide();
      settings.hostTag.find('.pagination').remove();
      $widgets.error.hide();
      $widgets.list.empty();
      $('.empty_result').hide();
      $widgets.loader.show();
   };

   /**
    * Assembles an a-tag and binds an event handler to it
    */
   function link(url, img, title) {
     var link = $('<a href="' + url + '">' + title + '</a>');
     link.click(function(evt) {
         evt.preventDefault();
         settings.previewHandler(url);
     });
     thumbnail(link, img);
     return link;
   };

   /**
    * Binds a hover and mouseover events to a link
    */
   function thumbnail(link, img) {
      // thumbnail on hover
      var xOffset = 10;
      var yOffset = 30;
      link.hover(
         function(e) {
            $('#eexcess_thumb_img').attr('src', img).css('max-width', '280px');
            $('#eexcess_thumb')
                .css('position', 'absolute')
                .css('top', (e.pageY - xOffset) + 'px')
                .css('left', (e.pageX + yOffset) + 'px')
                .css('z-index', 9999)
                .show();
         },
         function() {
           $('#eexcess_thumb').hide();
         });
      link.mousemove(function(e) {
         $('#eexcess_thumb')
            .css('top', (e.pageY - xOffset) + 'px')
            .css('left', (e.pageX + yOffset) + 'px');
      });
   };

   /**
    * Updates the UI to show new recommendations
    *
    * @param data: the results to be displayed
    */
   function showResults(data) {
      $('.eexcess_tabs li.active').removeClass('active');
      $('.eexcess_tabs li').first().addClass('active');
      $('#result_gallery').remove();
      $widgets.error.hide();
      $widgets.loader.hide();
      data = data || null;
      if(data) {
          data['results'] = data.result;
      }
      $widgets.list.empty();

      if (data === null || data.totalResults === 0 || data.totalResults === '0') {
         $widgets.list.append($('<li>no results</li>'));
          return;
      }
      $widgets.list.attr('data-total', data.results.length);

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

          if (settings.hostTag.find('.pagination').length != 0) {
             settings.hostTag.find('.pagination').remove();
          }

          settings.hostTag.append(_pagination);
      }
      moreResults(data.results);
   };

   /**
    * Continueation of the showResults method.
    * Todo: is this really required?
    */
   function moreResults(items) {
      var offset = $widgets.list.children('li').length;
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

         $widgets.list.append(li);


         if (i >= settings.itemsShown) {
             li.hide();
         }

         // rating
         var raty = $('<div class="eexcess_raty"  data-uri="' + item.documentBadge.uri + '" data-pos="' + pos + '"></div');
         rating(raty, item.documentBadge.uri, item.rating);
         li.append(raty);

         var containerL = $('<div class="resCtL"></div>');
         li.append(containerL);
         containerL.append(link(item.documentBadge.uri, img, '<img class="eexcess_previewIMG" src="' + img + '" />'));

         // contents
         var resCt = $('<div class="eexcess_resContainer"></div>');
         resCt.append(link(item.documentBadge.uri, img, title));
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
            $widgets.dialog.children('p').text(this);
            var at = 'center top+' + evt.pageY;
            $widgets.dialog.dialog({
               title: 'URL of the resource',
               height: 130,
               position: {my: "center", at: at}
             });
             // select the link
             var selection = window.getSelection();
             var range = document.createRange();
             range.selectNodeContents($widgets.dialog.children('p').get()[0]);
             selection.removeAllRanges();
             selection.addRange(range);
          }.bind(item.documentBadge.uri));
          containerL.append(linkCopy);

          // description
          if (typeof item.description !== 'undefined' && item.description !== '') {
             var shortDescription = shortenDescription(item.description);
             resCt.append($('<p class="result_description">' + shortDescription + '</p>'));
          }
          resCt.append($('<p style="clear:both;"></p>'));

      }
      settings.hostTag.find('.eexcess_previewIMG').error(function() {
         $(this).unbind("error").attr("src", settings.pathToMedia + 'no-img.png');
      });
   };

   /**
    * Shortens a String. Strings are beeing truncated to 100 character.
    * Word barriers are respected. Therefor the string can be slightly longer.
    *
    * @param description: The string that need truncation
    */
   function shortenDescription(description) {
      var firstPart = description.substring(0, 100),
      remainder = description.substring(100, description.length),
      endPos = remainder.search(/[.!?; ]/);
      if (endPos != -1) {
         firstPart += remainder.substring(0, endPos);
         firstPart += "...";
      }
      return firstPart;
   };

   /*
    * Binds a rating UI widget the object that is passed in the 'element' parameter
    */
   function rating(element, uri, score) {
      element.raty({
         score: score,
         path: settings.pathToLibs + 'rating/img',
         number: 2,
         width: false,
         iconRange: [
            {range: 1, on: 'thumb_down-on.png', off: 'thumb_down-off.png'},
            {range: 2, on: 'thumb_up-on.png', off: 'thumb_up-off.png'}
         ],
         hints: ['bad', 'good'],
         single: true,
         click: function(score, evt) {
            settings.ratingHandler(this.uri, score, this.element.data('pos'));
         }.bind({uri: uri, element: element})
      });
   };

   /*
    * Makes some objects publicly available
    */
   return {
      $widgets: $widgets,
      showResults: showResults,
      showLoadingScreen: showLoadingScreen,
      showError: showError,
      rating:rating
   };
});
