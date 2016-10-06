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

function renderDuration(durationSeconds){
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
    var content = renderDuration(round.decisionTimeTile);
    content += renderDuration(round.decisionTimeFilter);
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

function getDateDiffFormatted(date1, date2){
    var diff = getDateDiffSeconds(date1, date2);
    if (!diff)
        return '<td class="diff"></td>';

    var diffFormatted;
    if (diff / 60/60 < 5*24)
        diffFormatted = Math.round(diff/60/60) + "h";
    else
         diffFormatted = (Math.round(diff/60/60/24*10)/10) + "d";
    return '<td class="questionnairedate diff">' + diffFormatted + '</td>';
}

function getDateDiffSeconds(date1, date2){
    if (!date1 || !date2)
        return undefined;

    return date2.diff(date1) / 1000;
}

function round2(number){
    return Math.round(number*100) / 100;
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
        $userRow.append(getDateDiffFormatted(userResult.startDay1, userResult.startDay2));
        $userRow.append(getDateDiffFormatted(userResult.startDay1, userResult.startDay3));
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


    function isSession1or2or3(round){
        return (round.sessionId == 1 || round.sessionId == 2 || round.sessionId == 3);
    }

    $table.append('<tr><td>Time only</td><td class="number">' + getGroupedByBoolRatio(_rounds.groupBy('timeCorrect').value()) + '</td></tr>');
    $table.append('<tr><td>Geo only</td><td class="number">' + getGroupedByBoolRatio(_rounds.groupBy('geoCorrect').value()) + '</td></tr>');
    $table.append('<tr><td>Category only</td><td class="number">' + getGroupedByBoolRatio(_rounds.groupBy('categoryCorrect').value()) + '</td></tr>');
    $table.append('<tr><td>Overall Textual</td><td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({type:'T'}).groupBy(allThreeCorrect).value()) + '</td></tr>');
    $table.append('<tr><td>Overall Micro-vis</td><td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({type:'V'}).groupBy(allThreeCorrect).value()) + '</td></tr>');
    $table.append('<tr><td>Overall Main-vis</td><td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({type:'M'}).groupBy(allThreeCorrect).value()) + '</td></tr>');
    $table.append('<tr><td>Overall</td><td class="number">' + getGroupedByBoolRatio(_rounds.groupBy(allThreeCorrect).value()) + '</td></tr>');
    
    $('#otherResults').append('<h4>Task Rounds:</h4>');
    $table = $('<table></table>');
    $('#otherResults').append($table);
    $table.append('<tr><th></th><th colspan=2>Day1</th><th>Day2</th><th>Day3</th></tr>');
    $table.append('<tr><th></th><th>Round 1</th><th>Round 2</th><th>Round 3</th><th>Round 4</th></tr>');
    var $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success Main</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'M'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'M'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'M'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'M'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'V'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'V'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'V'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'V'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'T'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'T'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'T'}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'T'}).groupBy(allThreeCorrect).value()) + '</td>');
    
    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Total</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3}).groupBy(allThreeCorrect).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4}).groupBy(allThreeCorrect).value()) + '</td>');
    
    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Geo MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'V'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'V'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'V'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'V'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row = $('<tr class=""></tr>');
    $table.append($row);
    $row.append('<td>Success Geo Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'T'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'T'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'T'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'T'}).groupBy(function (a){ return a.geoCorrect}).value()) + '</td>');

    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Time MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'V'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'V'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'V'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'V'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row = $('<tr class=""></tr>');
    $table.append($row);
    $row.append('<td>Success Time Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'T'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'T'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'T'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'T'}).groupBy(function (a){ return a.timeCorrect}).value()) + '</td>');

    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Category MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'V'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'V'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'V'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'V'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row = $('<tr class=""></tr>');
    $table.append($row);
    $row.append('<td>Success Category Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'T'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'T'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'T'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'T'}).groupBy(function (a){ return a.categoryCorrect}).value()) + '</td>');

    $row = $('<tr class="splitt"></tr>');
    $table.append($row);
    $row.append('<td>Success Filter Main</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'M'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'M'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'M'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'M'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success Filter MicroVis</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'V'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'V'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'V'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'V'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Success Filter Text</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:1, type:'T'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:2, type:'T'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:3, type:'T'}).groupBy('isFilterCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getGroupedByBoolRatio(_rounds.filter(isSession1or2or3).filter({round:4, type:'T'}).groupBy('isFilterCorrect').value()) + '</td>');

    $('#otherResults').append('<h4>Other Results:</h4>');
    $table = $('<table></table>');
    $('#otherResults').append($table);
    $table.append('<tr><th></th><th>I like the design? (avg; 1=agree)</th><th>I think I could remember? (avg; 1=agree)</th></tr>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Main</td>');
    $row.append('<td class="number">' + getScaleRate(_.map(_.map(global.results, 'design'), "M")) + '</td>');
    $row.append('<td class="number">' + getScaleRate(_.map(_.map(global.results, 'remember'), "M")) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Micro</td>');
    $row.append('<td class="number">' + getScaleRate(_.map(_.map(global.results, 'design'), "V")) + '</td>');
    $row.append('<td class="number">' + getScaleRate(_.map(_.map(global.results, 'remember'), "V")) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Text</td>');
    $row.append('<td class="number">' + getScaleRate(_.map(_.map(global.results, 'design'), "T")) + '</td>');
    $row.append('<td class="number">' + getScaleRate(_.map(_.map(global.results, 'remember'), "T")) + '</td>');

    $('#otherResults').append('<h4>Readability (Task 4 & 5):</h4>');
    $table = $('<table></table>');
    $('#otherResults').append($table);
    $table.append('<tr><th></th><th>Time success (avg)</th><th>Geo success (avg)</th><th>Category success (avg)</th><th>I think time is correct (avg; 1=agree)</th><th>I think geo is correct (avg; 1=agree)</th><th>I think category is correct (avg; 1=agree)</th></tr>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Text</td>');
    $row.append('<td class="number">' + getScaleRatePercent(_rounds.filter(isSession4or5).filter({type:'T'}).map('timeCorrect')) + '</td>');
    $row.append('<td class="number">' + getScaleRatePercent(_rounds.filter(isSession4or5).filter({type:'T'}).map('geoCorrect')) + '</td>');
    $row.append('<td class="number">' + getScaleRatePercent(_rounds.filter(isSession4or5).filter({type:'T'}).map('categoryCorrect')) + '</td>');
    $row.append('<td class="number">' + getScaleRate(_rounds.filter(isSession4or5).filter({type:'T'}).map('thinkTimeIsCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getScaleRate(_rounds.filter(isSession4or5).filter({type:'T'}).map('thinkGeoIsCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getScaleRate(_rounds.filter(isSession4or5).filter({type:'T'}).map('thinkCategoryIsCorrect').value()) + '</td>');
    $row = $('<tr></tr>');
    $table.append($row);
    $row.append('<td>Visual</td>');
    $row.append('<td class="number">' + getScaleRatePercent(_rounds.filter(isSession4or5).filter({type:'V'}).map('timeCorrect')) + '</td>');
    $row.append('<td class="number">' + getScaleRatePercent(_rounds.filter(isSession4or5).filter({type:'V'}).map('geoCorrect')) + '</td>');
    $row.append('<td class="number">' + getScaleRatePercent(_rounds.filter(isSession4or5).filter({type:'V'}).map('categoryCorrect')) + '</td>');
    $row.append('<td class="number">' + getScaleRate(_rounds.filter(isSession4or5).filter({type:'V'}).map('thinkTimeIsCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getScaleRate(_rounds.filter(isSession4or5).filter({type:'V'}).map('thinkGeoIsCorrect').value()) + '</td>');
    $row.append('<td class="number">' + getScaleRate(_rounds.filter(isSession4or5).filter({type:'V'}).map('thinkCategoryIsCorrect').value()) + '</td>');
    
    // flat results
    $('#otherResults').append('<h4>Further Flat Results:</h4>');
    $table = $('<table></table>');
    $('#otherResults').append($table);
    var $headerRow = $('<tr></tr>');
    $headerRow.append('<th></th>'); 
    $table.append($headerRow);
    $table.find('th').first().parent()
    .append('<th>Remember M</th><th>Remember T</th><th>Remember V</th><th>I Like Design M</th><th>I Like Design T</th><th>I Like Design V</th>')
    .append('<th>I think time is correct T</th><th>I think geo is correct T</th><th>I think category is correct T</th>')
    .append('<th>I think time is correct V</th><th>I think geo is correct V</th><th>I think category is correct V</th>')

    .append('<th>Number of correct selections round 1 - M</th>')
    .append('<th>Number of correct selections round 2 - M</th>')
    .append('<th>Number of correct selections round 3 - M</th>') // day2
    .append('<th>Number of correct selections round 4 - M</th>') // day3
    .append('<th>How Hard Was it - M</th>')
    .append('<th>Number of correct selections round 1 - T</th>')
    .append('<th>Number of correct selections round 2 - T</th>')
    .append('<th>Number of correct selections round 3 - T</th>')
    .append('<th>Number of correct selections round 4 - T</th>')
    .append('<th>How Hard Was it - T</th>')
    .append('<th>Number of correct selections round 1 - V</th>')
    .append('<th>Number of correct selections round 2 - V</th>')
    .append('<th>Number of correct selections round 3 - V</th>')
    .append('<th>Number of correct selections round 4 - V</th>')
    .append('<th>How Hard Was it - V</th>')
    .append('<th>How Hard Was it to remember - V</th>') // Task 4&5
    .append('<th>How Hard Was it to remember - T</th>') // Task 4&5

    .append('<th>Number of correct selections round 1 - Task1</th>')
    .append('<th>Number of correct selections round 2 - Task1</th>')
    .append('<th>Number of correct selections round 3 - Task1</th>')
    .append('<th>Number of correct selections round 4 - Task1</th>')
    .append('<th>How Hard Was it - Task1</th>')
    .append('<th>Number of correct selections round 1 - Task2</th>')
    .append('<th>Number of correct selections round 2 - Task2</th>')
    .append('<th>Number of correct selections round 3 - Task2</th>')
    .append('<th>Number of correct selections round 4 - Task2</th>')
    .append('<th>How Hard Was it - Task2</th>')
    .append('<th>Number of correct selections round 1 - Task3</th>')
    .append('<th>Number of correct selections round 2 - Task3</th>')
    .append('<th>Number of correct selections round 3 - Task3</th>')
    .append('<th>Number of correct selections round 4 - Task3</th>')
    .append('<th>How Hard Was it - Task3</th>')
    .append('<th>How Hard Was it - Task4</th>')
    .append('<th>How Hard Was it - Task5</th>')
	
    .append('<th>time is correct T</th>')
    .append('<th>geo is correct T</th>')
    .append('<th>category is correct T</th>')
    .append('<th>time is correct V</th>')
    .append('<th>geo is correct V</th>')
    .append('<th>category is correct V</th>')
    .append('<th>It was easy to read the filters  T</th>')
    .append('<th>It was easy to read the filters  V</th>')
    ;
    for(var i=0; i<global.results.length; i++){
        var result = global.results[i];
        if (!result.remember)
            continue;
        $row = $('<tr data-user=' + result.user + '></tr>');
        $row.append('<td>' + result.user + '</td><td>' + (result.remember.M || '') + '</td><td>' + (result.remember.T || '') + '</td><td>' + (result.remember.V || '') + '</td>');
        $row.append('<td>' + (result.design.M  || '')+ '</td><td>' + (result.design.T || '') + '</td><td>' + (result.design.V  || '')+ '</td>');
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'T'}).map('thinkTimeIsCorrect').value()[0] + '</td>');
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'T'}).map('thinkGeoIsCorrect').value()[0] + '</td>');
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'T'}).map('thinkCategoryIsCorrect').value()[0] + '</td>');
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'V'}).map('thinkTimeIsCorrect').value()[0] + '</td>');
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'V'}).map('thinkGeoIsCorrect').value()[0] + '</td>');
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'V'}).map('thinkCategoryIsCorrect').value()[0] + '</td>');
        
        //countCorrects
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 1}).filter({type:'M'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 1 - M
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 2}).filter({type:'M'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 2 - M
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 3}).filter({type:'M'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 3 - M
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 4}).filter({type:'M'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 4 - M
        $row.append('<td class="number">' + round2(_(result.rounds).filter(isSession1or2or3).filter({round: 1}).filter({type:'M'}).map('tlxScore').value()[0]) + '</td>'); // How Hard Was it - M
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 1}).filter({type:'T'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 1 - T
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 2}).filter({type:'T'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 2 - T
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 3}).filter({type:'T'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 3 - T
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 4}).filter({type:'T'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 4 - T
        $row.append('<td class="number">' + round2(_(result.rounds).filter(isSession1or2or3).filter({round: 1}).filter({type:'T'}).map('tlxScore').value()[0]) + '</td>'); // How Hard Was it - T
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 1}).filter({type:'V'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 1 - V
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 2}).filter({type:'V'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 2 - V
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 3}).filter({type:'V'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 3 - V
        $row.append('<td class="number">' + _(result.rounds).filter(isSession1or2or3).filter({round: 4}).filter({type:'V'}).map(countCorrects).value()[0] + '</td>'); // Number of correct selections round 4 - V
        $row.append('<td class="number">' + round2(_(result.rounds).filter(isSession1or2or3).filter({round: 1}).filter({type:'V'}).map('tlxScore').value()[0]) + '</td>'); // How Hard Was it - V
        $row.append('<td class="number">' + round2(_(result.rounds).filter(isSession4or5).filter({round: 1}).filter({type:'V'}).map('tlxScore').value()[0]) + '</td>'); // How Hard Was it to remember - V
        $row.append('<td class="number">' + round2(_(result.rounds).filter(isSession4or5).filter({round: 1}).filter({type:'T'}).map('tlxScore').value()[0]) + '</td>'); // How Hard Was it to remember - T
		
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 1 - Task1
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 2 - Task1
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 3 - Task1
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 4 - Task1
        $row.append('<td class="number">' + '</td>'); // How Hard Was it - Task1
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 1 - Task2
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 2 - Task2
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 3 - Task2
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 4 - Task2
        $row.append('<td class="number">' + '</td>'); // How Hard Was it - Task2
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 1 - Task3
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 2 - Task3
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 3 - Task3
        $row.append('<td class="number">' + '</td>'); // Number of correct selections round 4 - Task3
        $row.append('<td class="number">' + '</td>'); // How Hard Was it - Task3
        $row.append('<td class="number">' + '</td>'); // How Hard Was it - Task4
        $row.append('<td class="number">' + '</td>'); // How Hard Was it - Task5
		
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'T'}).map('timeCorrect').value()[0] + '</td>'); // time is correct T
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'T'}).map('geoCorrect').value()[0] + '</td>'); // geo is correct T
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'T'}).map('categoryCorrect').value()[0] + '</td>'); // category is correct T
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'V'}).map('timeCorrect').value()[0] + '</td>'); // time is correct V
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'V'}).map('geoCorrect').value()[0] + '</td>'); // geo is correct V
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'V'}).map('categoryCorrect').value()[0] + '</td>'); // category is correct V
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'T'}).map('wasEasyToReadFilters').value()[0] + '</td>'); // It was easy to read the filters  T
        $row.append('<td class="number">' + _(result.rounds).filter(isSession4or5).filter({type:'V'}).map('wasEasyToReadFilters').value()[0] + '</td>'); // It was easy to read the filters  V
        $table.append($row);
    }
}

function isSession4or5(round){
    return (round.sessionId == 4 || round.sessionId == 5) && round.round == 1;
}

function getScaleRate(groupedObject){
    var count = groupedObject.length;
    var sum = _.sum(groupedObject);
    return (Math.round(sum / count * 10) / 10);
}

function getScaleRatePercent(_groupedObject){
    var groupedObject = _groupedObject.value();
    var count = groupedObject.length;
    var sum = _.sum(groupedObject);
    return (Math.round(sum / count * 100)) + '%';
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

function countCorrects(a){
    var count = 0;
    if (a.timeCorrect === true)
        count++;
    if (a.geoCorrect === true)
        count++;
    if (a.categoryCorrect === true)
        count++;
    return count;
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
	if (action == 'mail')
		gnerateMailLinks();
}

function getAsExcel(outerHTML){
    window.open('data:application/vnd.ms-excel,' + outerHTML.replace(/ /g, '%20'));
}

function gnerateMailLinks(){
    // flat results
    $('#otherResults').append('<h4>Mail:</h4>');
    var $container = $('<div></div>');
    $('#otherResults').append($container);
    for (var i=0; i<global.results.length; i++){
        var email = mapUsernameToEmail(global.results[i].user);
        var name = getFirstnameFromUsername(global.results[i].user);
        var emailBody = encodeURIComponent('Dear ' + name + '!\r\n\r\nYou have participated in our evaluation about the EEXCESS Recommendation Dashboard. We have identified a couple of important additional questions, and it would be great if you could answer them for us.\r\nPlease click on the following link to start: http://eexcess.github.io/visualization-widgets-eval/examples/eval/questionnaire_posteval.html?username=' + global.results[i].user + '&email=' + email + ' \r\n\r\nThank you a lot!\r\nCheers, Gerwald');
        $container.append('<a href="mailto:' + email + '?subject=EEXCESS Evaluation&body=' + emailBody + '">' + global.results[i].user + (email == "" ? " - ERROR" : "") + '</a><br>');
    }
    $container.append();
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
    $table.append('<tr><td>User</td><td>Round Number</td><td>Session Number</td><td>Display Type</td><td>Chart Type</td><td>Success</td></tr>');
    var getBasicRow = function(result, round){
        var $row = $('<tr></tr>');
        $row.append('<td>' + result.user + '</td>');
        $row.append('<td>' + round.round + '</td>');
        $row.append('<td>' + round.sessionId + '</td>');
        $row.append('<td>' + round.type + '</td>');
        return $row;
    }
    function getBoolOrNumberAsNumber(boolOrNumber){
        if (boolOrNumber === undefined || boolOrNumber === false )
            return 0;
        if (boolOrNumber === true)
            return 1;
        return boolOrNumber;
    }
    _.forEach(results, function(result){
        _.forEach(result.rounds, function(round){
            $row = getBasicRow(result, round);
            $row.append('<td>Geo</td><td>' + getBoolOrNumberAsNumber(round.geoCorrect) + '</td>');
            $table.append($row);
            $row = getBasicRow(result, round);
            $row.append('<td>Category</td><td>' + getBoolOrNumberAsNumber(round.categoryCorrect) + '</td>');
            $table.append($row);
            $row = getBasicRow(result, round);
            $row.append('<td>Time</td><td>' + getBoolOrNumberAsNumber(round.timeCorrect) + '</td>');
            $table.append($row);
        });
    });

    

    ////////////
    $otherResultsDiv.append('<h4>Tasks/Rounds</h4>');
    appendDowloadShowLinks($otherResultsDiv, 'durationTable');
    $table = $('<table id=durationTable style="display:none;"></table>');
    $otherResultsDiv.append($table);
    $table.append('<tr><td>User</td><td>Round Number</td><td>Session Number</td><td>Display Type</td><td>Duration Tile</td><td>Duration Filter</td><td>Filter correct</td><td>Duration since day 1 (h)</td></tr>');
    _.forEach(results, function(result){
        _.forEach(result.rounds, function(round){
            if (!round.decisionTimeTile && !round.decisionTimeFilter)
                return;
            $row = getBasicRow(result, round);
            $row.append('<td>' + (round.decisionTimeTile || '') + '</td>');
            $row.append('<td>' + (round.decisionTimeFilter || '')+ '</td>');
            $row.append('<td>' + (round.isFilterCorrect ? 1 : 0) + '</td>');
            $row.append('<td>' + (round.round <= 2 ? 0 : round.round == 3 ? Math.round(getDateDiffSeconds(result.startDay1, result.startDay2) / 60/60) : Math.round(getDateDiffSeconds(result.startDay1, result.startDay3) / 60/60 )) + '</td>');
            $table.append($row);
        });
    });

    

    ////////////
    // $otherResultsDiv.append('<h4>Timespans</h4>');
    // appendDowloadShowLinks($otherResultsDiv, 'timespanTable');
    // $table = $('<table id=timespanTable style="display:none;"></table>');
    // $otherResultsDiv.append($table);
    // $table.append('<tr><td>User</td><td>Round Number</td><td>Session Number</td><td>Display Type</td><td>Duration Tile</td><td>Duration Filter</td><td>Filter correct</td></tr>');
    // _.forEach(results, function(result){
    //     _.forEach(result.rounds, function(round){
    //         if (!round.decisionTimeTile && !round.decisionTimeFilter)
    //             return;
    //         $row = getBasicRow(result, round);
    //         $row.append('<td>' + Math.round((getDateDiffSeconds(result.startDay1, result.startDay2) || 0) / 60 / 60) + '</td>');
    //         $table.append($row);
    //     });
    // });
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