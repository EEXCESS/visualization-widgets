require.config({
   baseUrl: 'js',
   paths: {
      jquery : "lib/jquery-1.10.1.min",
      jquery_ui : "lib/jquery-ui.min",
      jquery_raty : "lib/rating/jquery.raty.min",
      resultList : "searchResultList",
      settings : "settings",
      eventhandler: "eventhandler",
      resultListLib: "lib/resultListLib",
      msgListeners: "msgListeners"
   }
});

require(["resultList", "eventhandler", "msgListeners"]);
