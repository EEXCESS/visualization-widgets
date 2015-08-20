/**
 * All evenhandlers are collected in this module.
 */
define(['jquery', 'settings'], function($, settings){

   /**
   * Event handler on the pagination buttons
   */

   $(document).on('click', '.page', function() {
      $('.page.active').removeClass('active');
      $(this).addClass('active');
      var page = parseInt($(this).html()) - 1;
      var min = page * settings.itemsShown;
      var max = min + settings.itemsShown;

      $("#recommendationList li").hide().slice(min, max).show();
   });


   /**
   * Event handler for category buttons
   */
   $(document).on('click', '.eexcess_tabs li', function() {
      var hostTag = $(settings.hostTag);
      $('#result_gallery').remove();
      $('.empty_result').hide();
      $('.eexcess_tabs li.active').removeClass('active');
      $(this).addClass('active');
      switch ($(this).children('a').text()) {
         case 'Media':
            $('.pagination').hide();
            $("#recommendationList li").hide();
            var li_items = $("#recommendationList li");
            var no_images = true;
            var l_h = 0;
            var r_h = 0;
            var gallery = $('<div id="result_gallery"></div>');
            gallery.append($('<div id="result_gallery0" class="g_tile"></div>')).append($('<div id="result_gallery1" class="g_tile"></div>'));
            hostTag.append(gallery);
            for (var i = 0; i < li_items.length; i++) {
               var img_src = $(li_items[i]).children('.resCtL').children('a').children('img').attr('src');
               if (img_src.indexOf('media/no-img.png') === -1) {
                  var img = $('<img src="' + img_src + '" class="gallery_img" />');
                  if (img.get(0).naturalWidth === 200 && img.get(0).naturalHeight === 275) {
                     continue;
                  }
                  no_images = false;
                  var original_link = $(li_items[i]).children('.eexcess_resContainer').children('a');
                  var url = original_link.attr('href');
                  var title = original_link.text();
                  var link = $('<a href="' + url + '" title="' + title + '"></a>');
                  link.append(img);
                  link.click(function(evt) {
                     evt.preventDefault();
                     settings.previewHandler(this.href);
                  });
                  if (l_h > r_h) {
                     $('#result_gallery1').append(link);
                     r_h += img.height();
                  } else {
                     $('#result_gallery0').append(link);
                     l_h += img.height();
                  }
               }
            }
            if (no_images) {
               $('#result_gallery').hide();
               $('.empty_result').show();
            } else {
               $('#result_gallery').show();
            }
            break;
         case 'Cultural':
            $('.pagination').hide();
            $("#recommendationList li").hide();
            var li_items = $("#recommendationList li");
            var no_culture = true;
            for (var i = 0; i < li_items.length; i++) {
               var prov = $(li_items[i]).children('.resCtL').children('img').attr('alt');
               if (prov.indexOf('Europeana') !== -1 || prov.indexOf('KIM.Collect') !== -1) {
                  $(li_items[i]).show();
                  no_culture = false;
               }
            }
            if (no_culture) {
               $('.empty_result').show();
            }
            break;
         case 'Scholarly':
            $('.pagination').hide();
            $("#recommendationList li").hide();
            var li_items = $("#recommendationList li");
            var no_scholarly = true;
            for (var i = 0; i < li_items.length; i++) {
               var prov = $(li_items[i]).children('.resCtL').children('img').attr('alt');
               if (prov.indexOf('ZBW') !== -1 || prov.indexOf('Mendeley') !== -1) {
                  $(li_items[i]).show();
                  no_scholarly = false;
               }
            }
            if (no_scholarly) {
               $('.empty_result').show();
            }
            break;
         default:
            $('.pagination').show();
            $("#recommendationList li").hide().slice(0, settings.itemsShown).show();
            $('.page.active').removeClass('active');
            $('.page').first().addClass('active');
     }
   });

});
