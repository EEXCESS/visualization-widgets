//var executed = false;
var dict = {};

$(document).ready(function () {


//-----Filter-Buttons-----//
// change is-checked class on buttons
    $('#eexcess-isotope-filters').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function () {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $(this).addClass('is-checked');
            //chrome.storage.sync.set({'currentFilter': $(this).attr('data-filter')}, function () {
            //});
            var filter = $(this).attr('data-filter');
            localStorage.currentFilter = filter;

            logFilter(filter);


        });
    });
    $('#eexcess-isotope-sorts').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function () {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $(this).addClass('is-checked');
        });
    });
});

function logFilter(filter) {
    var filteredMediaType;
    if (filter.length < 2) {
        filteredMediaType = "all"
    } else {
        //slice off "eexcess-"
        filteredMediaType = filter.substr(9);
    }
    window.top.postMessage({event: 'eexcess.filter', data: {mediaType: filteredMediaType}}, '*');

}

function logResultItemClicks(msg) {

    var origin = {
        module: 'Search Result List Visualization'
    };
    $('.eexcess-isotope-grid').on('click', '.eexcess-isotope-grid-item', function () {
        var item = $('.eexcess-isotope-grid-item');


        var documentBadge =
        {
            id: item.attr('itemid'),
            uri: item.attr('itemuri'),
            provider: item.attr('provider')
        };
        //console.log("queryID: " + msg.data.data.queryID);
        //console.log("Type of documentBadge: " + typeof documentBadge);
        LOGGING.itemOpened(origin, documentBadge, msg.data.data.queryID);
    });
}

function truncateTitles() {
    $('.description-other-with-preview-content').dotdotdot();
    $('.description-text').dotdotdot();
    $('.description-text-with-preview').dotdotdot();
    $('.description-other').dotdotdot();
}


function showLoadingBar() {

    $('.eexcess_empty_result').hide();

    $('#eexcess-isotope-filtering-and-sorting').hide();

    if (localStorage.currentFilter) {
        logFilter(localStorage.currentFilter);
    }
    //$('#eexcess-isotope-filters').each(function (i, buttonGroup) {
    //    var $buttonGroup = $(buttonGroup);
    //    //chrome.storage.sync.set({'currentFilter': currentFilter}, function () {
    //    //});
    //
    //    var currentSelection = $buttonGroup.find('.is-checked').attr("class");
    //    if (typeof currentSelection !== 'undefined') {
    //        currentFilter = currentSelection;
    //        localStorage.currentFilter = $(currentFilter).attr('data-filter');
    //    }
    //});


    //executed = false;
    $("#eexcess-isotope-filters").empty();
    $('.eexcess_error').hide();
    $('.eexcess_error_timeout').hide();
    $("div").remove(".eexcess-isotope-grid-item");
    $('#eexcess-loading').show();
}

function showError(errorData) {
    $('#eexcess-loading').hide();
    $('.eexcess_empty_result').hide();
    if (errorData === 'timeout') {
        $('.eexcess_error_timeout').show();
    }
    else {
        $('.eexcess_error').show();
    }
}
;

function addIsotopeGrid(msg) {
    $('.eexcess_error').hide();
    $('.eexcess_error_timeout').hide();
    $('#eexcess-loading').hide();


    if (msg.data.data.result.length == 0) {
        $('.eexcess_empty_result').show();
    }


    else {
        var $items = $(addGridResultItems(msg));
        $('.eexcess_empty_result').hide();
        // add full result data to items
        msg.data.data.result.forEach(function (val, idx) {
            var item = $($items[idx]);
            item.data('result', val);
            val.title.split(/[ .?!-:;,]+/).forEach(function (val) {
                val = val.toLowerCase();
                if (val.length > 3) {
                    if (dict[val]) {
                        dict[val].push($($items[idx]));
                    } else {
                        dict[val] = [$($items[idx])];
                    }
                }
            });
            item.hover(function (e) {
                $('.eexcess-isotope-grid-item').addClass('eexcess-highlight-fade');
                var terms = $(this).data('result').title.split(/[ .?!-:;,]+/);
                terms.forEach(function (val) {
                    val = val.toLowerCase();
                    if (dict[val]) {
                        dict[val].forEach(function (tile) {
                            tile.addClass('eexcess-highlight-item');
                            tile.removeClass('eexcess-highlight-fade');
                        });
                    }
                });
                window.top.postMessage({event: 'eexcess.explanation.highlight', data: terms}, '*');
            }, function (e) {
                $('.eexcess-isotope-grid-item').removeClass('eexcess-highlight-item');
                $('.eexcess-isotope-grid-item').removeClass('eexcess-highlight-fade');
                window.top.postMessage({event: 'eexcess.explanation.unhighlight'}, '*');
            });
        });


        //init isotope
        $('.eexcess-isotope-grid').isotope({
            itemSelector: '.eexcess-isotope-grid-item',
            layoutMode: 'masonry',
            masonry: {
                columnWidth: 50
            },
            getSortData: {
                itemTitle: '.itemTitle',
                date: '[itemDate]'
            }
        });

        //check if all items are loaded to avoid overlap, then add items to container
//        $items.imagesLoaded(function () {
        $('.eexcess-isotope-grid').isotope('insert', $items);
//        });

        //------Filtering------//
        // bind filter button click
        $('#eexcess-isotope-filters').on('click', 'button', function () {
            var filterValue = $(this).attr('data-filter');
            // use filterFn if matches value
            $('.eexcess-isotope-grid').isotope({filter: filterValue});
        });

        //------Sorting------//
        // bind sort button click
        $('#eexcess-isotope-sorts').on('click', 'button', function () {
            var sortValue = $(this).attr('data-sort-value');
            $('.eexcess-isotope-grid').isotope({sortBy: sortValue});
        });

    }
    function addGridResultItems(msg) {

        var items = '';

        $.each(msg.data.data.result, function (idx, val) {

                var mediaType = val.mediaType;
                var itemTitle = val.title;
                var itemDate = ' itemDate = "' + val.date + '" ';
                var previewImage = val.previewImage;
                var itemAbstract = val.abstract;

                //assemble href for item
                var itemLink = '<a target="_blank" href="' + val.documentBadge.uri + '"><span' +
                    ' class="emptyspan"></span>';

                //assemble documentBadge for logging
                var documentBadge = 'itemId = "' + val.documentBadge.id + '" itemURI = "' + val.documentBadge.uri + '" provider =' +
                    ' "' + val.documentBadge.provider + '"';

                // add isotoped items
                if (mediaType == "IMAGE" || mediaType == "image") {
                    if (previewImage == undefined) {
                        previewImage = "http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=image";
                        item = '<div class ="eexcess-isotope-grid-item eexcess-image eexcess-other-without-preview"' + documentBadge + itemDate + ' data-category="eexcess-image">' + itemLink + ' <div class="description-other itemTitle"> <p>' +
                            itemTitle + '</p>   </div>' + '  <img src="' + previewImage + '" /> </div>';
                    } else {

                        item = '<div class ="eexcess-isotope-grid-item eexcess-image eexcess-other-with-preview"' + documentBadge + itemDate + ' data-category="eexcess-image">' + itemLink + ' <div class="description-other-with-preview-area eexcess-image itemTitle"> <div class="description-other-with-preview-content">' +
                            itemTitle + '</div>   </div>' + '  <img src="' + previewImage + '" /> </div>';
                    }
                    items += item;

                }
                else if (mediaType == "TEXT" || mediaType == "text") {

                    //if (itemAbstract == undefined) {

                    if (previewImage == undefined) {
                        previewImage = 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=text';

                        item = '<div class = "eexcess-isotope-grid-item eexcess-text eexcess-text-without-preview"' + documentBadge + itemDate + ' data-category="eexcess-text">' + itemLink +
                            ' <div class="description-text eexcess-text itemTitle">' +
                            itemTitle + "<br>" +
                            '</p></div><img src="' + previewImage + '" /></div>';
                    }
                    else {
                        item = '<div class = "eexcess-isotope-grid-item eexcess-text eexcess-text-with-preview "' + documentBadge + itemDate + ' data-category="eexcess-text">' + itemLink +
                            ' <div class="description-text-with-preview eexcess-text itemTitle">' +
                            itemTitle + "<br>" +
                            '</p></div><img src="' + previewImage + '" /></div>';
                    }
                    items += item;
                    //}else{
                    //    if (previewImage == undefined) {
                    //        previewImage = 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=text';
                    //
                    //        item = '<div class = "eexcess-isotope-grid-item eexcess-text"' + documentBadge + itemDate + ' data-category="eexcess-text">' + itemLink +
                    //            ' <div class="description-other itemTitle">' +
                    //            itemTitle + "<br>" + ' <div class="description-other itemAbstract">' +itemAbstract + "<br></div>"+
                    //        '</p></div><img src="' + previewImage + '" /></div>';
                    //
                    //    }
                    //    else {
                    //        item = '<div class = "eexcess-isotope-grid-item eexcess-text-with-preview eexcess-text"' + documentBadge + itemDate + ' data-category="eexcess-text">' + itemLink +
                    //            ' <div class="description-text-with-preview itemTitle">' +
                    //            itemTitle + "<br>" + itemAbstract + "<br>"+
                    //            '</p></div><img src="' + previewImage + '" /></div>';
                    //    }
                    //    items += item;
                    //}
                }

                else if (mediaType == "AUDIO" || mediaType == "audio") {
                    if (previewImage == undefined) {
                        previewImage = 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=audio';
                        item = '<div class = "eexcess-isotope-grid-item eexcess-audio eexcess-other-without-preview"' + documentBadge + itemDate + ' data-category="eexcess-audio">' + itemLink +
                            ' <div' + ' class="description-other eexcess-audio itemTitle">' + itemTitle +
                            '</p></div><img src="' + previewImage + '" /></div>';

                    } else {
                        item = '<div class = "eexcess-isotope-grid-item eexcess-audio eexcess-other-with-preview"' + documentBadge + itemDate + ' data-category="eexcess-audio">' + itemLink +
                            ' <div' + ' class="description-other-with-preview-area eexcess-audio itemTitle"><div class="description-other-with-preview-content">' + itemTitle +
                            '</div></div><img src="' + previewImage + '" /></div>';
                    }
                    items += item;
                }
                else if (mediaType == "VIDEO" || mediaType == "video") {
                    if (previewImage == undefined) {
                        previewImage = 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=video';
                        item = '<div class = "eexcess-isotope-grid-item eexcess-video eexcess-other-without-preview"' + documentBadge + itemDate + ' data-category="eexcess-video">' + itemLink +
                            ' <div class="description-other itemTitle">' +
                            itemTitle +
                            '</p></div><img src="' + previewImage + '" /> </div>'
                    } else {
                        item = '<div class ="eexcess-isotope-grid-item eexcess-video eexcess-other-with-preview"' + documentBadge + itemDate + ' data-category="eexcess-video">' + itemLink +
                            ' <div class="description-other-with-preview-area eexcess-video itemTitle"> <div class="description-other-with-preview-content">' +
                            itemTitle + '</div>   </div>' + '  <img src="' + previewImage + '" /> </div> ';
                    }
                    items += item;
                }

                else if (mediaType == "3D" || mediaType == "3d") {
                    if (previewImage == undefined) {
                        previewImage = 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=3d';
                        item = '<div class = "eexcess-isotope-grid-item eexcess-3d eexcess-other-without-preview"' + documentBadge + itemDate + ' data-category="eexcess-3d"> ' + itemLink + ' <div class="description-other itemTitle">' +
                            ' <' + itemTitle + '</p></div><img src=""' + previewImage + '" / > < / div > ';
                    } else {
                        item = '<div class = "eexcess-isotope-grid-item eexcess-3d eexcess-other-with-preview"' + documentBadge + itemDate + ' data-category="eexcess-3d"> ' + itemLink + ' <div class="description-other-with-preview-area eexcess-3d itemTitle"><div class="description-other-with-preview-content">' +
                            ' <' + itemTitle + '</div></div><img src=""' + previewImage + '" / > < / div > ';
                    }
                    items += item;
                }

                else {
                    if (previewImage == undefined) {
                        previewImage = 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=unknown';
                        item = '<div class = "eexcess-isotope-grid-item eexcess-unknown eexcess-other-without-preview"' + documentBadge + itemDate + ' data-category="eexcess-unknown"->' + itemLink + '<div class="description-other itemTitle"> ' + itemTitle +
                            '</p></div> <img src="' + previewImage + '" /></div>';
                    } else {
                        item = '<div class = "eexcess-isotope-grid-item eexcess-unknown eexcess-other-with-preview"' + documentBadge + itemDate + ' data-category="eexcess-unknown"->' + itemLink + '<div class="description-other-with-preview-area eexcess-unknown itemTitle"> <div class="description-other-with-preview-content">' + itemTitle +
                            '</div></div> <img src="' + previewImage + '" /></div>';
                    }
                    items += item;
                }

            }
        );

        return items;
    }


}


function addFilterCounter() {

//TODO generalize
//    if (!executed) {
    var buttonGroup = $("#eexcess-isotope-filters");
    buttonGroup.empty();

    buttonGroup.append(' <button class="eexcess-isotope-button show-all " data-filter="*">all </button>');
    var currentFilter;
    //chrome.storage.sync.get(['currentFilter'], function (result) {

    if (localStorage.getItem('currentFilter')) {
        currentFilter = localStorage.getItem('currentFilter');
        //console.log("addFilter = " + currentFilter )
    }
    //if no filter was selected "show all" will be selected
    if (currentFilter == undefined || currentFilter.indexOf("*") > -1 || currentFilter == "undefined") {
        $('.eexcess-isotope-button.show-all').addClass('is-checked');
        $('.eexcess-isotope-grid').isotope({filter: '*'});

    }


    var numberOfImages = $('.eexcess-isotope-grid-item.eexcess-image').size();
    var numberOfTexts = $('.eexcess-isotope-grid-item.eexcess-text').size();
    var numberOfVideos = $('.eexcess-isotope-grid-item.eexcess-video').size();
    var numberOfAudios = $('.eexcess-isotope-grid-item.eexcess-audio').size();
    var numberOf3D = $('.eexcess-isotope-grid-item.eexcess-3d').size();
    var numberOfUnknown = $('.eexcess-isotope-grid-item.eexcess-unknown').size();


    if (numberOfImages > 0) {
        var imageFilterButton = '<button class="eexcess-isotope-button eexcess-image"' +
            ' data-filter=".eexcess-image">images (' + numberOfImages + ')</button>';
        buttonGroup.append(imageFilterButton);
        if (currentFilter != undefined && currentFilter.indexOf("eexcess-image") > -1) {
            $('.eexcess-isotope-button.eexcess-image').addClass('is-checked');
            $('.eexcess-isotope-button').first().removeClass('is-checked');
            $('.eexcess-isotope-grid').isotope({filter: '.eexcess-image'});
        }
    }
    if (numberOfTexts > 0) {
        var textFilterButton = '<button class="eexcess-isotope-button eexcess-text"' +
            ' data-filter=".eexcess-text">text (' + numberOfTexts + ')</button>';
        buttonGroup.append(textFilterButton);
        if (currentFilter != undefined && currentFilter.indexOf("eexcess-text") > -1) {
            $('.eexcess-isotope-button.eexcess-text').addClass('is-checked');
            $('.eexcess-isotope-button').first().removeClass('is-checked');
            $('.eexcess-isotope-grid').isotope({filter: '.eexcess-text'});
        }
    }
    if (numberOfVideos > 0) {
        var videoFilterButton = ' <button class="eexcess-isotope-button eexcess-video"' +
            ' data-filter=".eexcess-video">video (' + numberOfVideos + ')</button>';
        buttonGroup.append(videoFilterButton);
        if (currentFilter != undefined && currentFilter.indexOf("eexcess-video") > -1) {
            $('.eexcess-isotope-button.eexcess-video').addClass('is-checked');
            $('.eexcess-isotope-button').first().removeClass('is-checked');
            $('.eexcess-isotope-grid').isotope({filter: '.eexcess-video'});
        }

    }
    if (numberOfAudios > 0) {
        var audioFilterButton = ' <button class="eexcess-isotope-button eexcess-audio"' +
            ' data-filter=".eexcess-audio">audio (  ' + numberOfAudios + ')</button>';
        buttonGroup.append(audioFilterButton);
        if (currentFilter != undefined && currentFilter.indexOf("eexcess-audio") > -1) {
            $('.eexcess-isotope-button.eexcess-audio').addClass('is-checked');
            $('.eexcess-isotope-button').first().removeClass('is-checked');
        }
    }
    if (numberOf3D > 0) {
        var threedFilterButton = ' <button class="eexcess-isotope-button eexcess-3d" data-filter=".eexcess-3d">3d' +
            ' (' + numberOf3D + ')</button>';
        buttonGroup.append(threedFilterButton);
        if (currentFilter != undefined && currentFilter.indexOf("eexcess-3d") > -1) {
            $('.eexcess-isotope-button.eexcess-3d').addClass('is-checked');
            $('.eexcess-isotope-button').first().removeClass('is-checked');
            $('.eexcess-isotope-grid').isotope({filter: '.eexcess-3d'});
        }
    }
    if (numberOfUnknown > 0) {
        var unknownFilterButton = '<button class="eexcess-isotope-button eexcess-unknown"' +
            ' data-filter=".eexcess-unknown"> unknown (' + numberOfUnknown + ')</button>';
        buttonGroup.append(unknownFilterButton);
        if (currentFilter != undefined && currentFilter.indexOf("eexcess-unknown") > -1) {
            $('.eexcess-isotope-button.eexcess-unknown').addClass('is-checked');
            $('.eexcess-isotope-button').first().removeClass('is-checked');
            $('.eexcess-isotope-grid').isotope({filter: '.eexcess-unknown'});
        }

    }
    // if previous selected filter doesn't have any new results select "show-all"
    if (currentFilter != undefined) {
        if ((numberOfImages == 0 && currentFilter.indexOf("eexcess-image") > -1)
            || (numberOfTexts == 0 && currentFilter.indexOf("eexcess-text") > -1)) {
            $(".show-all").addClass("is-checked");
            $('.eexcess-isotope-grid').isotope({filter: '*'});
        }
    }

    //});
    //executed = true;
    $('#eexcess-isotope-filtering-and-sorting').show();
    //}


}

//window.addEventListener('storage', function(e) {
//   console.log(e.key);
//    console.log(e.url);
//    console.log(e.storageArea);
//});