/**
 * This module sets the basic UI elements up
 */
define(['jquery', 'settings', 'resultListLib'], function ($, settings, helper) {
   settings.hostTag.prepend($('<ul class="eexcess_tabs">' +
         '<li class="active"><a href="#">All</a></li>' + 
         '<li><a href="#">Media</a></li>' + 
         '<li><a href="#">Cultural</a></li>' + 
         '<li><a href="#">Scholarly</li>' + 
         '</ul>'));

   settings.hostTag.append(helper.$widgets.innerContainer);
   settings.hostTag = helper.$widgets.innerContainer;

   $('body').append('<p id="eexcess_thumb" style="display:none;">' + 
      '<img id="eexcess_thumb_img" alt="img preview" />' + 
      '</p>');
   settings.hostTag.append(helper.$widgets.loader);
   settings.hostTag.append(helper.$widgets.dialog);
   settings.hostTag.append(helper.$widgets.list);
   settings.hostTag.append(helper.$widgets.error);
   settings.hostTag.append($('<p class="empty_result">no results :(</p>').hide());
});

