<?php

header('Access-Control-Allow-Origin: *');
error_reporting(E_ERROR);
ini_set('display_errors', 1);


$TMPFOLDER = "tmp/";
$TMPFILESUFFIX = ".data.tmp";

$JSFILE = "makescreenshot.js";



$data = $_POST;
if (!sizeof($_POST))
{
    returnWithError("No POST Data found");
}


$fileName = $TMPFOLDER . md5(rand()) . $TMPFILESUFFIX;

$exec = "cat " . $fileName . " | ./phantomjs --ignore-ssl-errors=true --local-to-remote-url-access=true --web-security=false --ssl-protocol=any " . $JSFILE;

//For debugging on failed screenshots
//$data["executed_cmd"] = $exec;

$userId = $data["user_id"];
$sessionId = $data["eval_session"];
$folderToSave = "rendered/" . trim($userId) . "/" . $sessionId;

if (!is_dir($folderToSave))
{
    $createdDir = mkdir($folderToSave, 0777, true);
    if (!$createdDir)
        returnWithError("Could not create folder " . $folderToSave);
}



$data["folder"] = $folderToSave;

$argsFromClient = json_encode($data);
$writeTmpFile = file_put_contents($fileName, $argsFromClient);


$return = shell_exec($exec);

$returnData = json_decode($return);
$returnData->executed_cmd = $exec;

if (!$writeTmpFile)
    $returnData->tmpfile_error = "Could not write tmp file!!!";

if ($returnData->status === "ERROR")
{
    //http_response_code(400);
}


echo json_encode($returnData);
unlink($fileName);

function returnWithError($msg)
{
    //http_response_code(400);
    $ret = new stdClass();
    $ret->status = "ERROR";
    $ret->msgs = array($msg);

    echo json_encode($ret);
    exit;
}
