Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

var global = {
	logs:[],
	logsPerUser: [],
    results: [], //[{user: "123", visualisationTypes:["V", "T"], rounds [{round: 1, sessionId: 1, type: 'T', isFilterCorrect: true, geoCorrect: true, timeCorrect: true, categoryCorrect: true }]}] 
};

var calc = {
}

function getYesNoOutput(value, css){
    if (value)
        return "<td class='" + css +"'>yes</td>"
    
    return "<td class='warning " + css +"'>no</td>"
}

function getChartTypeValues(type, taskRound){
    var content = "";
    if (type == "time"){
        content += getYesNoOutput(taskRound.timeSelected, "chart-selected");
        content += getYesNoOutput(taskRound.timeCorrect, "chart-correct");
    } else if (type == "geo"){
        content += getYesNoOutput(taskRound.geoSelected, "chart-selected");
        content += getYesNoOutput(taskRound.geoCorrect, "chart-correct");
    } else if (type == "category"){
        content += getYesNoOutput(taskRound.categorySelected, "chart-selected");
        content += getYesNoOutput(taskRound.categoryCorrect, "chart-correct");
    }
    return content;
}

function getStartEnd(durationSeconds){
    if (durationSeconds) {
        var css="";
        if (durationSeconds > 120){
            css = "warning";
        }
        return "<td class='decisiontime "+css+"'>" + durationSeconds +"</td>";
    } else {
        return "<td class='decisiontime'></td>";
    }
}

function getDecitionTimes(round){
    var content = getStartEnd(round.decisionTimeTile);
    content += getStartEnd(round.decisionTimeFilter);
    return content;
}

function getSessionValues(sessionId, taskRound, userResult){
    var content = "";
    var round = _.find(userResult.rounds, {round: taskRound, sessionId: sessionId});

    if (!round || round.hasError){
        if (round && round.errorMessage)
            content += '<td colspan=8>' + round.errorMessage + '</td>';
        else 
            content += '<td class="chart-selected"></td><td class="chart-correct"></td><td class="chart-selected"></td><td class="chart-correct"></td><td class="chart-selected"></td><td class="chart-correct"></td><td class="decisiontime"></td><td class="decisiontime"></td>';
    } else {
        content += getChartTypeValues('time', round);
        content += getChartTypeValues('geo', round);
        content += getChartTypeValues('category', round);
        content += getDecitionTimes(round);
    }

    // Filter success:
    if (!round || round.isFilterCorrect === undefined){
        content += "<td class='isFilterCorrect'></td>";
    } else {
        content += getYesNoOutput(round.isFilterCorrect);
    }
    
    return content;
}

function getSessionHeaderCells(sessionId, taskRound){
    var content = '';
    content += '<td class="chart-selected">Session ' + sessionId + ' #' + taskRound +' Time selected</td>';
    content += '<td class="chart-correct">Session ' + sessionId + ' #' + taskRound +' Time correct</td>';
    content += '<td class="chart-selected">Session ' + sessionId + ' #' + taskRound +' Geo selected</td>';
    content += '<td class="chart-correct">Session ' + sessionId + ' #' + taskRound +' Geo correct</td>';
    content += '<td class="chart-selected">Session ' + sessionId + ' #' + taskRound +' Category selected</td>';
    content += '<td class="chart-correct">Session ' + sessionId + ' #' + taskRound +' Category correct</td>';
    content += '<td class="decisiontime">Session ' + sessionId + ' #' + taskRound +' Decision Time Tiles</td>';
    content += '<td class="decisiontime">Session ' + sessionId + ' #' + taskRound +' Decision Time Filter</td>';
    content += '<td class="chart-correct">Session ' + sessionId + ' #' + taskRound +' Filter correct</td>';
    return content;
}

function getStartCell(start){
    if (!start)
        return  "<td class=start></td>";
    return '<td class="questionnairedate start">' + start.format('YYYY-MM-DD HH:mm:ss') + '</td>';
}

function getDateDiff(date1, date2){
    if (!date1 || !date2)
        return '<td class="diff"></td>';

    var diff = date2.diff(date1);
    var diffFormatted;
    if (diff /1000/ 60/60 < 5*24)
        diffFormatted = Math.round(diff/1000/60/60) + "h";
    else
         diffFormatted = (Math.round(diff/1000/60/60/24*10)/10) + "d";
    return '<td class="questionnairedate diff">' + diffFormatted + '</td>';
}


function drawFlatResultsTable(){

    var $headerRow = $('<tr></tr>'); 
    $headerRow.append('<td>userName</td>');
    $headerRow.append('<td class="questionnairedate">Date Day 1</td>');
    $headerRow.append('<td class="questionnairedate">Date Day 2</td>');
    $headerRow.append('<td class="questionnairedate">Date Day 3</td>');
    $headerRow.append('<td class="questionnairedate">diff 1-2</td>');
    $headerRow.append('<td class="questionnairedate">diff 1-3</td>');
    $headerRow.append('<td>T1</td>');
    $headerRow.append('<td>T2</td>');
    $headerRow.append('<td>T3</td>');
    $headerRow.append('<td>T4</td>');
    $headerRow.append('<td>T5</td>');
    for (var taskRound = 1; taskRound <= 4; taskRound ++)
        for (var sessionId = 1; sessionId <= 3; sessionId ++)
            $headerRow.append(getSessionHeaderCells(sessionId, taskRound));
    $('#resultTable').append($headerRow);

    _.forEach(global.results, function(userResult) {
	    var $userRow = $('<tr></tr>'); 
        $userRow.append('<td>' + userResult.user + '</td>');
        $userRow.append(getStartCell(userResult.startDay1));
        $userRow.append(getStartCell(userResult.startDay2));
        $userRow.append(getStartCell(userResult.startDay3));
        $userRow.append(getDateDiff(userResult.startDay1, userResult.startDay2));
        $userRow.append(getDateDiff(userResult.startDay1, userResult.startDay3));
        $userRow.append('<td>' + userResult.visualisationTypes[0] + '</td>');
        $userRow.append('<td>' + userResult.visualisationTypes[1] + '</td>');
        $userRow.append('<td>' + userResult.visualisationTypes[2] + '</td>');
        $userRow.append('<td>' + userResult.visualisationTypes[3] + '</td>');
        $userRow.append('<td>' + userResult.visualisationTypes[4] + '</td>');

        for (var taskRound = 1; taskRound <= 4; taskRound ++)
            for (var sessionId = 1; sessionId <= 3; sessionId ++)
                $userRow.append(getSessionValues(sessionId, taskRound, userResult));

        $('#resultTable').append($userRow);
    });
    $('#resultTable tr').on('click', function(){ $(this).toggleClass('selected'); });
    //$('#otherResults').append('<em>User MVTVT_Eduardo and VTMVT_Thang ignored for further analysis.</em>');
}

function calculateStatistic(){
    drawFlatResultsTable();

    $('#otherResults').append('<h3>Statistic</h4>');
    $('#otherResults').append('<h4>Success statistic</h4>');
    var $table = $('<table></table>');
    $('#otherResults').append($table);
    //var $success = [{user: "123", rounds [{round: 1, sessionId: 1, type: 'T', geoCorrect: true, timeCorrect: true, categoryCorrect: true }]}]
    var _rounds = _(global.results).map('rounds').flatten();//.groupBy('round'); 

    $table.append('<tr><td>Time only</td><td class="number">' + getGroupedByBoolRatio(_rounds.groupBy('timeCorrect').value()) + '</td></tr>');
    $table.append('<tr><td>Geo only</td><td class="number">' + getGroupedByBoolRatio(_rounds.groupBy('geoCorrect').value()) + '</td></tr>');
    $table.append('<tr><td>Category only</td><td class="number">' + getGroupedByBoolRatio(_rounds.groupBy('categoryCorrect').value()) + '</td></tr>');
    $table.append('<tr><td>Overall Textual</td><td class="number">' + getGroupedByBoolRatio(_rounds.filter({type:'T'}).groupBy(allThreeCorrect).value()) + '</td></tr>');
    $table.append('<tr><td>Overall Micro-vis</td><td class="number">' + getGroupedByBoolRatio(_rounds.filter({type:'V'}).groupBy(allThreeCorrect).value()) + '</td></tr>');
    $table.append('<tr><td>Overall Main-vis</td><td class="number">' + getGroupedByBoolRatio(_rounds.filter({type:'M'}).groupBy(allThreeCorrect).value()) + '</td></tr>');
    $table.append('<tr><td>Overall</td><td class="number">' + getGroupedByBoolRatio(_rounds.groupBy(allThreeCorrect).value()) + '</td></tr>');
    
    $('#otherResults').append('<h4>Task Rounds:</h4>');
    $table = $('<table></table>');
    $('#otherResults').append($table);
    $table.append('<tr><th></th><th colspan=2>Day1</th><th>Day2</th><th>Day3</th></tr>');
    $table.append('<tr><th></th><th>Round 1</th><th>Round 2</th><th>Round 3</th><th>Round 4</th></tr>');
    var $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success Main</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'M'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'M'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'M'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'M'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'V'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'V'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'V'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'V'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'T'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'T'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'T'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'T'}).groupBy(allThreeCorrect).value()) + '</td>');
    
    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Total</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4}).groupBy(allThreeCorrect).value()) + '</td>');
    
    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Geo MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'V'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'V'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'V'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'V'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row = $('<tr class=""></tr>');
    $table.append($row);
    $row.append('<td>Success Geo Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'T'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'T'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'T'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'T'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');

    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Time MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'V'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'V'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'V'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'V'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row = $('<tr class=""></tr>');
    $table.append($row);
    $row.append('<td>Success Time Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'T'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'T'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'T'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'T'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');

    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Category MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'V'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'V'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'V'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'V'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row = $('<tr class=""></tr>');
    $table.append($row);
    $row.append('<td>Success Category Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'T'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'T'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'T'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'T'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');

    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Filter Main</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'M'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'M'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'M'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'M'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success Filter MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'V'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'V'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'V'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'V'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success Filter Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:1, type:'T'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:2, type:'T'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:3, type:'T'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter({round:4, type:'T'}).groupBy('isFilterCorrect').value()) + '</td>');
}

function getGroupedByBoolRatio(groupedObject){
    var total=0, positive=0;
    if (groupedObject['true'])
        positive += groupedObject['true'].length;
    if (groupedObject['false'])
        total += groupedObject['false'].length;
    total += positive;
    
    if (total == 0)
        return "";

    return Math.round(positive * 100 / total) + ' %' ;
}

function allThreeCorrect(a){
    if (a.timeCorrect === true && a.geoCorrect === true && a.categoryCorrect === true)
        return true
    else if (a.timeCorrect === undefined || a.geoCorrect === undefined || a.categoryCorrect === undefined)
        return undefined;
    return false;
}

function allThreeCorrect(a){
    if (a.timeCorrect === true && a.geoCorrect === true && a.categoryCorrect === true)
        return true
    else if (a.timeCorrect === undefined || a.geoCorrect === undefined || a.categoryCorrect === undefined)
        return undefined;
    return false;
}

function getMedian(valueArray){
	valueArray.sort();
		
	var middle = Math.floor((valueArray.length - 1) / 2); // NB: operator precedence
    if (valueArray.length % 2) {
        return valueArray[middle];
    } else {
        return (valueArray[middle] + valueArray[middle + 1]) / 2.0;
    }
}

function cleanup(){
	$('#resultTable, #otherResults').empty();
}

function executeAction(){

	cleanup();
		
	var action = $('#actionType').val();
	if (action == 'showLogs')
		printLogs();
	if (action == 'statistic')
		calculateStatistic();
	if (action == 'exports')
		calculateExports();
}

function getAsExcel(outerHTML){
    window.open('data:application/vnd.ms-excel,' + outerHTML.replace(/ /g, '%20'));
}


function calculateExports(){

    drawFlatResultsTable();
    var results = global.results, $row, $table;
    var $otherResultsDiv = $('#otherResults');

    $otherResultsDiv.append('<h3>Export</h3>');
    //var $success = [{user: "123", rounds [{round: 1, sessionId: 1, type: 'T', geoCorrect: true, timeCorrect: true, categoryCorrect: true }]}]

    ////////////
    $otherResultsDiv.append('<h4>Success</h4>');
    appendDowloadShowLinks($otherResultsDiv, 'transformedTableSuccess');
    $table = $('<table id=transformedTableSuccess style="display:none;"></table>');
    $otherResultsDiv.append($table);
    $table.append('<tr><td>User</td><td>Round Number</td><td>Display Type</td><td>Chart Type</td><td>Success</td></tr>');
    var getBasicRow = function(result, round){
        var $row = $('<tr></tr>');
        $row.append('<td>' + result.user + '</td>');
        $row.append('<td>' + round.round + '</td>');
        $row.append('<td>' + round.type + '</td>');
        return $row;
    }
    _.forEach(results, function(result){
        _.forEach(result.rounds, function(round){
            $row = getBasicRow(result, round);
            $row.append('<td>Geo</td><td>' + (round.geoCorrect ? 1 : 0) + '</td>');
            $table.append($row);
            $row = getBasicRow(result, round);
            $row.append('<td>Category</td><td>' + (round.categoryCorrect ? 1 : 0) + '</td>');
            $table.append($row);
            $row = getBasicRow(result, round);
            $row.append('<td>Time</td><td>' + (round.timeCorrect ? 1 : 0) + '</td>');
            $table.append($row);
        });
    });

    

    ////////////
    $otherResultsDiv.append('<h4>Duration</h4>');
    appendDowloadShowLinks($otherResultsDiv, 'durationTable');
    $table = $('<table id=durationTable style="display:none;"></table>');
    $otherResultsDiv.append($table);
    $table.append('<tr><td>User</td><td>Round Number</td><td>Display Type</td><td>Duration</td></tr>');
    _.forEach(results, function(result){
        _.forEach(result.rounds, function(round){
            if (!round.tileSelectionDuration)
                return;

            $row = getBasicRow(result, round);
            $row.append('<td>' + round.tileSelectionDuration + '</td>');
            $table.append($row);
        });
    });
}

function appendDowloadShowLinks($target, tableName){
    var $showLink = $('<a href=#>Show/Hide Table</a>').on('click', function(e){
        e.preventDefault();
        $('#' + tableName).toggle();
    });
    var $downLink = $('<a href=#>Download</a>').on('click', function(e){
        e.preventDefault();
        getAsExcel(document.getElementById(tableName).outerHTML);
    });
    $target.append($showLink).append('<br>').append($downLink).append('<br>');
}