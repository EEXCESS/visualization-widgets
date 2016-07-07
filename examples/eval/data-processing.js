
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


// $(document).on('ready', function(){
//     $('#file-input-csv').parse({
//         config: {
//             // base config to use for each file
//         },
//         error: function(err, file, inputElem, reason)
//         {        },
//         complete: function(results)
//         {
//             // executed after all files are complete
//             console.log(results);
//         }
//     });
// });

function readCsv(fileEvent) {
    
    var files = fileEvent.target.files;
    if (files.length == 0) 
        return;
    
    _.forEach(files, function(element) {
        Papa.parse(element, {
            complete:function(results){ 
                console.log(results);
                console.log(JSON.stringify(results.meta.fields));
                processCsv(results.data);
            },
            header: true,
            newline:'\n'
        });
    });
	
}

var emailToUserMappings = {
    "belgin.mut@gmail.com": 				"VTMVT_Belgin",
    "cdisciascio@know-center.at": 			"TVMTV_Ceceilia",
    "remoyson@gmail.com": 				    "MVTVT_Rebekka",
    "robert.hafner.32@gmail.com": 			"TMVTV_RobertH",
    "samir.reg@gmail.com": 				    "VTMVT_Samir",
    "amelarendic@yahoo.com": 				"TVMTV_Amela",
    "fbrazao@know-center.at": 				"VMTVT_Fatima",
    "fiona.draxler@student.tugraz.at": 	    "MTVTV_Fiona",
    "michaela.brodesser@gmx.at": 			"VMTVT_MichiB",
    "bogdan.moraru@outlook.com": 			"MTVTV_Popdan",
    "jbaumann@ist.tugraz.at": 				"MVTVT_JoergB",
    "plengauer@know-center.at": 			"TMVTV_Patrick",
    "r.ginthoer@computer.org": 			    "VTMVT_RobertG",
    "gl@interad.at": 						"TVMTV_Gabriel",
    "stefan-reichenauer@gmx.at": 			"VMTVT_StefanR",
    "kemal.halilovic@student.tugraz.at": 	"MTVTV_Kemal",
    "stephan.moser@interad.at": 			"MVTVT_Stephan",
    "sfeyertag@know-center.at": 			"TMVTV_Sandra",
    "daniela.eder01@gmail.com": 			"VTMVT_Daniela",
    "wklieber@gmail.com": 					"TVMTV_Werner",
    "wklieber@know-center.at": 				"TVMTV_Werner",
    "Marina Ago": 							"VTMVT_Marina",
    "marigorti@yahoo.com": 					"VTMVT_Marina",
    "gurak@know-center.at": 				"VMTVT_Gunter",
    "dtheiler@know-center.at": 			    "MTVTV_Dieter",
    "tduricic@know-center.at": 			    "MVTVT_Thomas",
    "tduricic90@know-center.at": 			"MVTVT_Thomas",
    "David": 								"TMVTV_David",
    "pandothang@gmail.com":					"TMVTV_David",
    "Thang": 								"VTMVT_Thang",
    "dstrohmaier@know-center.at":			"VTMVT_Thang",
    "Eduardo": 							    "MVTVT_Eduardo",
    "eveas@know-center.at": 				"MVTVT_Eduardo"
};
function mapUser(email){
    if (emailToUserMappings[email]) 
        return emailToUserMappings[email]

    console.error("email: " + email + " not found");
    return email;
}

function getOrSetRoundTask(userObject, round, sessionId){
    var round = _.find(userObject.rounds, {round: round, sessionId: sessionId});
    if (!round){
        var userPrefixChars = splitUsername(userObject.user);
        round = { round: round, sessionId: sessionId, type: userPrefixChars[sessionId-1]};
        userObject.rounds.push(round);
    }
    return round;
}

function getCorrectFilterSelection(round, sessionId){
    var questionnnaireDay = 1, finalviewOnly = true;
    if (round == 3)
        questionnnaireDay = 2;
    else if (round == 4)
        questionnnaireDay = 3;

    var pos = 0;
    if (sessionId == 1 && finalviewOnly)
        pos = 2
    else if (sessionId == 2 && finalviewOnly)
        pos = 0
    else if (sessionId == 3 && finalviewOnly)
        pos = 1
    // different Positioning on day 2
    if (sessionId == 1 && finalviewOnly && questionnnaireDay == 2)
        pos = 1
    else if (sessionId == 2 && finalviewOnly && questionnnaireDay == 2)
        pos = 2
    else if (sessionId == 3 && finalviewOnly && questionnnaireDay == 2)
        pos = 0
    // different Positioning on day 3
    if (sessionId == 1 && finalviewOnly && questionnnaireDay == 3)
        pos = 0
    else if (sessionId == 2 && finalviewOnly && questionnnaireDay == 3)
        pos = 1
    else if (sessionId == 3 && finalviewOnly && questionnnaireDay == 3)
        pos = 2

    if (pos == 0)
        return "Links"
    if (pos == 1)
        return "Mitte"
    if (pos == 2)
        return "Rechts"
}

function setFilterSelectionResult(round, sessionId, userObject, choosenValue){
    var roundTask = getOrSetRoundTask(userObject, round, sessionId);
    var correctValue = getCorrectFilterSelection(round, sessionId);
    roundTask.isFilterCorrect = choosenValue == correctValue;
}

function processDay1(userObject, result){
    setFilterSelectionResult(1, 1, userObject, result["Task 1 #1: Which of the following filters did you set?"]);
    setFilterSelectionResult(1, 2, userObject, result["Task 2 #1: Which of the following filters did you set?"]);
    setFilterSelectionResult(1, 3, userObject, result["Task 3 #1: Which of the following filters did you set?"]);
    setFilterSelectionResult(2, 1, userObject, result["Task 1 (#2): Which of the following filters did you set?"]);
    setFilterSelectionResult(2, 2, userObject, result["Task 2 #2: Which of the following filters did you set?"]);
    setFilterSelectionResult(2, 3, userObject, result["Task 3 #2: Which of the following filters did you set?"]);
}

function processDay2(userObject, result){
    setFilterSelectionResult(3, 1, userObject, result["Task 1 (#3): Which of the following filters did you set?"]);
    setFilterSelectionResult(3, 2, userObject, result["Task 2 #3: Which of the following filters did you set?"]);
    setFilterSelectionResult(3, 3, userObject, result["Task 3 #3: Which of the following filters did you set?"]);
}

function processDay3(userObject, result){
    setFilterSelectionResult(4, 1, userObject, result["Task 1 (#4): Which of the following filters did you set?"]);
    setFilterSelectionResult(4, 2, userObject, result["Task 2 #4: Which of the following filters did you set?"]);
    setFilterSelectionResult(4, 3, userObject, result["Task 3 #4: Which of the following filters did you set?"]);
}

function processCsv(results){
    _.forEach(results, function(result){
        var userName = mapUser(result['Email:'] || result['Email']);
        var userObject = _.find(global.results, {user: userName});
        if (!userObject){
            userObject = {user: userName, rounds:[]};
            global.results.push(userObject);
        }
        var day;
        if (result["Gender"]){
            processDay1(userObject, result);
        }
        else if (result["Task 1 (#3): Which of the following filters did you set?"])
            processDay2(userObject, result);
        else if (result["Task 1 (#4): Which of the following filters did you set?"])
            processDay3(userObject, result);
    });
    /*
[  
   "Submission Date",
   "",
   "Email:",
   "Gender",
   "Age",
   "English knowledge",
   "IT background",
   "Are you often researching for documents on the internet?",
   "What documents are you normally looking for?",
   "Data visualisation experience",
   "Task 1 #1: Which of the following filters did you set?",
   "I could remember the text/micro/main filters",
   "I like the design of the text/micro/main filters",
   "How mentally demanding was the task?",
   "How physically demanding was the task?",
   "How hurried or rushed was the pace of the task?",
   "How successful were you in accomplishing what you were asked to do?",
   "How hard did you have to work to accomplish your level of performance?",
   "How insecure, discouraged, irritated, stressed, and annoyed were you?",
   "Task 2 #1: Which of the following filters did you set?",
   "I could remember the text/micro/main filters",
   "I like the design of the text/micro/main filters",
   "How mentally demanding was the task?",
   "How physically demanding was the task?",
   "How hurried or rushed was the pace of the task?",
   "How successful were you in accomplishing what you were asked to do?",
   "How hard did you have to work to accomplish your level of performance?",
   "How insecure, discouraged, irritated, stressed, and annoyed were you?",
   "Task 3 #1: Which of the following filters did you set?",
   "I could remember the text/micro/main filters",
   "I like the design of the text/micro/main filters",
   "How mentally demanding was the task?",
   "How physically demanding was the task?",
   "How hurried or rushed was the pace of the task?",
   "How successful were you in accomplishing what you were asked to do?",
   "How hard did you have to work to accomplish your level of performance?",
   "How insecure, discouraged, irritated, stressed, and annoyed were you?",
   "The selection mechanism in the main visualisation understandable.",
   "Setting the selection constraint (e.g. time interval) as permanent filter is understandable.",
   "It was easy to select in the main visualization",
   "It was easy to apply a filter",
   "It was easy to apply multiple filters",
   "What language(s) did the researcher look into?",
   "I am quite sure, my answer about the language(s) are correct",
   "What geographic area was he interested in?",
   "I am quite sure, my answer about the geographic area is correct",
   "What timerange did he look into?",
   "I am quite sure, my answer about the timerange is correct",
   "It was easy to read the filters",
   "Comments",
   "How mentally demanding was the task?",
   "How physically demanding was the task?",
   "How hurried or rushed was the pace of the task?",
   "How successful were you in accomplishing what you were asked to do?",
   "How hard did you have to work to accomplish your level of performance?",
   "How insecure, discouraged, irritated, stressed, and annoyed were you?",
   "What language(s) did the researcher look into?",
   "I am quite sure, my answer about the language(s) are correct",
   "What geographic area was he interested in?",
   "I am quite sure, my answer about the geographic area is correct",
   "What timerange did he look into?",
   "I am quite sure, my answer about the timerange is correct",
   "It was easy to read the filters",
   "Comments",
   "How mentally demanding was the task?",
   "How physically demanding was the task?",
   "How hurried or rushed was the pace of the task?",
   "How successful were you in accomplishing what you were asked to do?",
   "How hard did you have to work to accomplish your level of performance?",
   "How insecure, discouraged, irritated, stressed, and annoyed were you?",
   "",
   "Task 1 (#2): Which of the following filters did you set?",
   "Task 2 #2: Which of the following filters did you set?",
   "Task 3 #2: Which of the following filters did you set?"
]
     */
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