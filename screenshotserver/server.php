
<?php

header('Access-Control-Allow-Origin: *');


$data = $_POST;

var_dump($data);
$argsFromClient = base64_encode(json_encode($data));
var_dump($argsFromClient);

$jsFile = "makescreenshot.js";
$exec = "phantomjs " . $jsFile . " " . $argsFromClient;
var_dump($exec);

$return = shell_exec($exec);

var_dump($return);

