<?php

header('Access-Control-Allow-Origin: *');
error_reporting(E_ERROR);
ini_set('display_errors', 1);

$writeTmpFile = file_put_contents('eval-log-01.txt', urldecode (file_get_contents("php://input")).PHP_EOL, FILE_APPEND);




if (!$writeTmpFile)
{
    http_response_code(400);
    $ret = new stdClass();
    $ret->status = "ERROR";
    $ret->msgs = "Could not write tmp file!!!";

    echo json_encode($ret);
    exit;
}
