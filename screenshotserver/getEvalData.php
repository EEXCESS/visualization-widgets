<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$data = file_get_contents("evalsettings.json");
echo $data;



