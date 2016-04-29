var TagBasedVisRec = (function () {

    if (!USE_VIZREC)
        return false;

    var _this = {};
    var s = {};

    var defaultOptions = {
    };

    var tagContentConatainerId = "userProvidedTagsContent";
    var mergedTags = "";

    var rating = 0;

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //  Events Listeners
    var Events = {};
    Events.recTagToolTipMouseOuted = function (d) {
        $(this).css("opacity", 0.3);
    };

    Events.recTagToolTipMouseOver = function (d) {
        $(this).css("opacity", 0.9);
    };

    Events.recTagToolTipMouseClick = function (d) {
        mergedTags = "";
        if ($("#" + tagContentConatainerId).length > 0) {
            mergedTags = $("#" + tagContentConatainerId).val().trim().replace(/ /g, '').split(',').join();
        }
        $("#visRecBasedOnTagContainer").remove();

        $('<div id="visRecBasedOnTagContainer"></div>').dialog({
            modal: true,
            title: "Please provide tag separated by comma",
            width: 350,
            height: 200,
            open: function () {
                var markup = '';
                $("#" + tagContentConatainerId).remove();
                var textArea = '<textarea id="' + tagContentConatainerId + '" required cols="5" rows="3"style="width:315px; height:80px; font-size:12px;">' + mergedTags + '</textarea>';
                var rating = ""; /** '<input type="text" name="rating" id="hidden_rating"/>'; **/
                rating += "<div id='rating_container'><p id='rating_label'>Rating:</p>";
                for (var i = 0; i < 7; i++)
                    rating += "<div class='rating_star rating_off' rate_val=" + (i + 1) + " title='" + (i + 1) + "'/>";
                rating += "</div>";

                markup = markup + textArea + rating;
                $(this).html(markup);

                //setRating(4);
            },
            buttons: {
                send: function () {
                    var userInput = $("#" + tagContentConatainerId).val().trim().replace(/ /g, '');
                    tags = userInput.split(',');
                    // TODO send request

                    vizRecConnector.tagCurrentMapping(tags, rating);

                    $(this).dialog("close");
                },
                cancel: function () {
                    $("#" + tagContentConatainerId).val(mergedTags);
                    $(this).dialog("close");
                }
            }
        });


        jQuery(document).ready(function () {
            $('.rating_star').mouseover(function (d) {
                var star_img = jQuery(d.target);

                setRating(star_img.attr("rate_val"));
            });

            $('#rating_label').mouseover(function (d) {
                setRating(0);
            });
        });


    };


    function setRating(val) {
        console.log("set rating " + val);
        //jQuery('#hidden_rating').val(val);

        jQuery('.rating_star').each(function () {
            if (jQuery(this).attr("rate_val") <= val && val !== 0) {
                jQuery(this).removeClass("rating_off");
                jQuery(this).addClass("rating_on");
            } else {
                jQuery(this).removeClass("rating_on");
                jQuery(this).addClass("rating_off");
            }

            console.log(jQuery(this).attr("rate_val"));
        });

        rating = val;
    }
    ;

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //  TagBasedVisRec

    function TagBasedVisRec(arguments) {
        _this = {};
        s = $.extend(defaultOptions, arguments);
        scaledMultipleYAxisRenderer = new MultipleYAxisRenderer();
    }

    var attach = function (container) {
        var recTagToolTip = $("<div class='eexcess-vis-tag-tooltip'/>").appendTo(container);

        window.setTimeout(function () {
            $(recTagToolTip).html("click to tag").css("opacity", 0.3)
                .on("click", Events.recTagToolTipMouseClick)
                .on("mouseover", Events.recTagToolTipMouseOver)
                .on("mouseout", Events.recTagToolTipMouseOuted)
                .animate({
                    top: '30px',
                    opacity: 0.9
                }, {
                    duration: 1000
                }).delay(1000)
                .animate({
                    top: '-4px',
                    opacity: 0.3
                }, {
                    duration: 1000
                });
        }, 0);

    };

    return {
        attach: attach
    };

}); 