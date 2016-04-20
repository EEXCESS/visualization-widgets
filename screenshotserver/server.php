<?php

header('Access-Control-Allow-Origin: *');

$TMPFOLDER = "tmp/";
$TMPFILESUFFIX = ".data.tmp";

$JSFILE = "makescreenshot.js";



$data = $_POST;



$fileName = $TMPFOLDER . md5(rand()) . $TMPFILESUFFIX;

$exec = "cat " . $fileName . " | phantomjs --ignore-ssl-errors=true --local-to-remote-url-access=true --web-security=false " . $JSFILE;

//For debugging on failed screenshots
$data["executed_cmd"] = $exec;
$argsFromClient = json_encode($data);
file_put_contents($fileName, $argsFromClient);

$return = shell_exec($exec);

$returnData = json_decode($return);

if ($returnData->status === "ERROR") {
    http_response_code(400);
}

echo $return;
//unlink($fileName);
