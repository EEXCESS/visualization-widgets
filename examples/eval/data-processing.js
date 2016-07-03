
function readRawFiles(fileEvent) {
    
    var files = fileEvent.target.files;
    if (files.length == 0) 
        return;
    
    if (!$('#doAdd').is(':checked')){
        global.logs = [];
        $('#file-content').html('');
        cleanup();
    }
    
	processFilesSequentially(files, processRawFile, executeAction);
}




/*
Example Log:
{
{"selectedImages":[{"image":"Main-Time-filter.JPEG","user":7},{"image":"Main-Geo-filter.JPEG","user":5}],"userName":"MVTVT_TestNew1","userId":7,"session":1,"timestamp":"2016-06-16T08:57:21.393Z","refUsers":"5_6"}
*/

function processRawFile(content){
	var i, k, logLine, logLineCopy, logEntry, lines;
	lines = content.split(/[\r\n]+/g);
	for (i = 0; i < lines.length; i++) {
        //output.push('<li>' + lines[i] + '<br>');
        //console.log(lines[i]);
        if (lines[i] == "")
            continue;
        logLine = JSON.parse(lines[i]);
        global.logs.push(logLine);		//asdf
	}
	$('#file-content').html(global.logs.length + " Logentries found.\r\n");
}

function processFilesSequentially(inputFilesObject, processFunction, finishFunction) {
	// needs to be an array, because of pop()
	var filesArray = $.map(inputFilesObject, function(value, index) { return [value]; });	
    var reader = new FileReader();

    function processNext() {
        var singleFile = filesArray.pop();
        if (singleFile === undefined) {
            // Cleanup:
            global.logs = _.filter(global.logs, function (l){ 
                return !!l.userName && l.userName !='MVTVT_TestNew1'
                    && !(l.userName =='VMTVT_Gunter' && l.questionnnaireDay == "1" && l.timestamp.indexOf("2016-06-23")>-1) // user did start with wrong questionaire on day 2 
					&& !(l.timestamp == '2016-06-30T09:09:48.836Z') // gabriel clicked back and for
					//&& !(l.timestamp == '2016-06-30T09:10:07.153Z' || l.timestamp == '2016-06-30T09:27:53.727Z') // which one is correct?
                    && !(l.timestamp == '2016-07-02T16:16:04.146Z' || l.timestamp == '2016-07-02T16:16:36.289Z') // Jörg, on Day2 he sumittet one selection 3 times. count the first (wrong one)
            })
			global.logs = _.sortBy(global.logs, 'timestamp');
			_.forEach(global.logs, function(logEntry){ logEntry.date = getDateOfLog(logEntry); });
			global.logsPerUser = _.groupBy(global.logs, function(l){ 
				return l.userName;
			});
			printHeaderStatistics();			
			finishFunction();
            return;
        }

        (function dummy_function(file) {
            reader.onload = function (e) {
                //processRawFile(e.target.result);
                processFunction(e.target.result);
                // process next at the end
                processNext();
            };

            reader.readAsText(file);
        })(singleFile);
    }

    processNext();
}

function printHeaderStatistics(){
    $header = $('#file-content');
    $header.html('');
    $header.html($header.html() + global.logs.length + " Logentries found.\r\n");
}

function printLogs(){
    cleanup();        
    _.forEach(global.logsPerUser, function(n, userName) {
        printLogsForUser(userName, global.logsPerUser[userName]);
    });
}

function printHeaderForUser(userName, timestamp){
	var date = new Date(timestamp);
	$('#resultTable').append('<tr class=header><td colspan=3>' + userName + '</td></tr>');
	$('#resultTable').append('<tr><td colspan=3>' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + ' ' + date.getHours() + ':' + date.getMinutes() +  '</td></tr>');
}

function printLogsForUser(userName, logs){
    printHeaderForUser(userName, logs[0].timestamp);
    logs = _.sortBy(logs, 'timestamp');
    var timeBefore = null;
    for (var j=0; j<logs.length; j++){
        var timeDiff = null;
        if (timeBefore != null)
            timeDiff = (logs[j].timestamp - timeBefore) / 1000
        printLogRow(logs[j], timeDiff);
        timeBefore = logs[j].timestamp;
    }
}

function printLogRow(logobject, timeDiff){    
    $('#resultTable').append('<tr><td>' + (timeDiff || '') + '</td><td>' + logobject.date + '</td><td><a href="#" class="showLogline">+</a><pre class="logline">'+ JSON.stringify(logobject, null, "\t") + '</pre></td></tr>');
}

function leftPad(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
}