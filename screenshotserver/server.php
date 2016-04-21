<?php

header('Access-Control-Allow-Origin: *');
error_reporting(E_ERROR);
ini_set('display_errors', 1);


$TMPFOLDER = "tmp/";
$TMPFILESUFFIX = ".data.tmp";

$JSFILE = "makescreenshot.js";



$data = $_POST;



$fileName = $TMPFOLDER . md5(rand()) . $TMPFILESUFFIX;

$exec = "cat " . $fileName . " | phantomjs --ignore-ssl-errors=true --local-to-remote-url-access=true --web-security=false --ssl-protocol=any " . $JSFILE;

//For debugging on failed screenshots
$data["executed_cmd"] = $exec;

$userId = $data["user_id"];
$folderToSave = "rendered/" . trim($userId);

if (!is_dir($folderToSave)) {
    $createdDir = mkdir($folderToSave);
    if (!$createdDir)
        returnWithError("Could not create folder " . $folderToSave);
}



$data["folder"] = $folderToSave;

$argsFromClient = json_encode($data);
file_put_contents($fileName, $argsFromClient);

$return = shell_exec($exec);

$returnData = json_decode($return);

if ($returnData->status === "ERROR") {
    //http_response_code(400);
}


echo $return;
unlink($fileName);



function returnWithError($msg) {
    //http_response_code(400);
    $ret = new stdClass();
    $ret->status = "ERROR";
    $ret->msgs = [$msg];

    echo json_encode($ret);
    exit;
}
