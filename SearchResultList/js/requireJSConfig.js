require.config({
   baseUrl: 'js',
   paths: {
      jquery : "lib/jquery-1.10.1.min",
      jquery_ui : "lib/jquery-ui.min",
      jquery_raty : "lib/rating/jquery.raty.min",
      result_list : "searchResultList",
      settings : "settings",
      eventhandler: "eventhandler"
   }
});

require(["result_list", "eventhandler"]);
