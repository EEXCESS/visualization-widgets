        require(['jquery', 'jquery-ui'], function($, jqui) {
            require(['c4/APIconnector', 'c4/iframes', 'tag-it/tag-it', 'searchData'], function(api, iframes, jtagit, searchDataF) {

                //Obtain Inputdata
                $('#searchForm').submit(function(e) {
                    e.preventDefault();
                    var $inputs = $('#searchForm :input');

                    var values = {};
                    searchOperator.init();
                    $inputs.each(function() {

                        var keyword = $(this).val();
                        var sliderIdentifer = keyword.replace(/\s/g, "-");
                        var weight = ($('.' + sliderIdentifer + '_Slider').slider("option", "value") / 100);

                        switch (this.name) {
                            case "whodata":
                            var person = {
                                text: keyword,
                                weight: weight,
                                type: 'person'
                                   // confidence: 1.0 // see wheredata
                                    // uri: "http://dbpedia.url.org"
                                }
                                searchOperator.setWhoData(person);
                                break;
                                case "wheredata":
                                var location = {
                                    text: keyword,
                                    weight: weight,
                                    type: 'location'
                                    //confidence: 1.0 // confidence should be 1, since manually given 
                                    // uri: "http://dbpedia.url.org" (if a URI is present, it should point to the respective entitiy, e.g. 'http://dbpedia.org/page/Loom'
                                }
                                searchOperator.setWhereData(location);
                                break;
                                case "whatdata":

                                var what = {
                                    text: keyword,
                                    weight: weight
                                    // reason: 'manual' (no reason attribute in contextKeywords)
                                }
                                searchOperator.setWhatData(what);
                                break;
                                default:
                                //default?                      
                            }
                        });
                    //Set timerange
                    var timerange = {
                        start: $('#startdata').val(),
                        end: $('#enddata').val()
                    };                    
                    searchOperator.setTimeRangeData(timerange);

                    var inputData = searchOperator.getSearchData();
                    
                    // inform container about new query
                    window.top.postMessage({event: 'eexcess.queryTriggered', data: inputData}, '*');


                });

function makeSliderIdentifier(keyword) {
    return keyword.replace(/\s/g, "-");
}
function addWhatTagsByEvent(keyword, weight){
    $('#whatform').tagit('createTag',keyword);    
    var sliderIdentifer = makeSliderIdentifier(keyword);
    $('.'+sliderIdentifer+'_Slider').slider('value',weight*100);
    return false;
}

function addWhoTagsByEvent(keyword, weight){
    $('#whoform').tagit('createTag',keyword);    
    var sliderIdentifer = makeSliderIdentifier(keyword);
    $('.'+sliderIdentifer+'_Slider').slider('value',weight*100);
    return false;
}

function addWhereTagsByEvent(keyword, weight){
    $('#whereform').tagit('createTag',keyword);    
    var sliderIdentifer = makeSliderIdentifier(keyword);
    $('.'+sliderIdentifer+'_Slider').slider('value',weight*100);
    return false;
}


$('#whatform').tagit({
    allowSpaces: true,
    fieldName: 'whatdata',
    afterTagAdded: function(event, ui) {
        var keyword = ui.tag[0].innerText.substring(0, ui.tag[0].innerText.length - 1);
        var identifier = makeSliderIdentifier(keyword);
        $(ui.tag).addClass(identifier);
        $(ui.tag).append("<div class='" + identifier + "_Slider containerSlider'></div>")
        $('.' + identifier + '_Slider').slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 100,
            value: 60
        });
    }
});


$('#whoform').tagit({
    allowSpaces: true,
    fieldName: 'whodata',
    afterTagAdded: function(event, ui) {
        var keyword = ui.tag[0].innerText.substring(0, ui.tag[0].innerText.length - 1);
        var identifier = makeSliderIdentifier(keyword);
        $(ui.tag).addClass(identifier);
        $(ui.tag).append("<div class='" + identifier + "_Slider containerSlider'></div>")
        $('.' + identifier + '_Slider').slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 100,
            value: 60
        });
    }
});


$('#whereform').tagit({
    allowSpaces: true,
    fieldName: 'wheredata',
    afterTagAdded: function(event, ui) {
        var keyword = ui.tag[0].innerText.substring(0, ui.tag[0].innerText.length - 1);
        var identifier = makeSliderIdentifier(keyword);
        $(ui.tag).addClass(identifier);
        $(ui.tag).append("<div class='" + identifier + "_Slider containerSlider'></div>")
        $('.' + identifier + '_Slider').slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 100,
            value: 60
        });
    }
});

                /*
                 * Listen for message from the embedded iframes.
                 */
                 window.onmessage = function(msg) {
                    var test = msg.data;
                    console.log('msg.data: ');
                    console.log(test);
                    if(msg.data.event && msg.data.event === 'eexcess.queryTriggered') {
                        var queryProfile = msg.data.data;
                        
                        $('#whatform').tagit('removeAll');
                        console.log('--------------->queryProfile');
                        console.log(queryProfile);

                        if (queryProfile.contextKeywords) {
                            console.log('--------------->contextKEYWORDS');
                            $.each( queryProfile.contextKeywords, function( key, value ) {                          
                                if (!value.type) {
                                    addWhatTagsByEvent(value.text,value.weight);
                                }else if(value.type == 'person'){
                                    addWhoTagsByEvent(value.text,value.weight);                                
                                }else if(value.type == 'location'){
                                    addWhereTagsByEvent(value.text,value.weight);
                                }
                                
                            });
                        }
                        /*
                        if (queryProfile.contextNamedEntities.locations) {                            
                            $.each( queryProfile.contextNamedEntities.locations, function( key, value ) {
                                
                                
                            });
                        }
                        if (queryProfile.contextNamedEntities.persons) {                            
                            $.each( queryProfile.contextNamedEntities.persons, function( key, value ) {                                
                                
                            });
                        }
                        */
                        if (queryProfile.timeRange) {                            
                            if (queryProfile.timeRange.start) {
                                $('#startdata').val(queryProfile.timeRange.start);
                            }
                            if (queryProfile.timeRange.end) {
                                $('#enddata').val(queryProfile.timeRange.end);
                            }
                        }
                        
                    }
                    /*
                     * Here, we are only interested in ratings that might have been given in one of the included widgets.
                     * For the full list of possible events, see the readme in the root folder.
                     */
                     if (msg.data.event && msg.data.event === 'eexcess.rating') {
                        console.log('The resource: ' + msg.data.data.uri + ' has been rated with a score of ' + msg.data.data.score);
                    }
                };




            });
});