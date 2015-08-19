define(['jquery', 'settings', 'resultListHelper'], function ($, settings, helper) {

   var EEXCESS = EEXCESS || {};

   (function() {
      var hostTag = $(settings.hostTag);
      hostTag.prepend($('<ul class="eexcess_tabs"><li class="active"><a href="#">All</a></li><li><a href="#">Media</a></li><li><a href="#">Cultural</a></li><li><a href="#">Scholarly</li></ul>'));

      hostTag.append(helper.$widgets.innerContainer);
      hostTag = helper.$widgets.innerContainer;

       // init
      $('body').append('<p id="eexcess_thumb" style="display:none;"><img id="eexcess_thumb_img" alt="img preview" /></p>');
      hostTag.append(helper.$widgets.loader);
      hostTag.append(helper.$widgets.dialog);
      hostTag.append(helper.$widgets.list);
      hostTag.append(helper.$widgets.error);
      hostTag.append($('<p class="empty_result">no results :(</p>').hide());

      // obtain current results
      // TODO: neccessary??????
      window.top.postMessage({event: 'eexcess.currentResults'}, '*');
   }());
});

