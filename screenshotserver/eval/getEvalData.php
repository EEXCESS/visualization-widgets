<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode(getEvalData());

function getEvalData()
{
    $data = file_get_contents("evalsettings.json");
    $data = json_decode($data);

    $userId = $data->userId;
    $userName = $data->users->$userId;

    unset($data->users);
    $data->user = $userName;

    return $data;
}
