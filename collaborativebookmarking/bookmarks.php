<?php

header('Access-Control-Allow-Origin: *');

$folder = "bookmarks";

$post = $_POST;

$out = array();
$out["error"] = false;


if (!isset($post["method"]))
{
    $out["msg"] = "ERROR: NO METHOD FOUND!";
    $out["error"] = true;
    echo json_encode($out);
    exit;
}



if ($post["method"] === "storebms")
{
    if (!isset($post["user"]))
    {
        $out["msg"] = "ERROR: NO USER FOUND!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }

    if (!isset($post["bms"]))
    {
        $out["msg"] = "ERROR: NO BOOKMARKS FOUND!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }


    $bm_content = json_encode($post["bms"]);

    $userId = $post["user"];

    $filename = $folder . "/" . md5($userId) . ".json";

    $success = file_put_contents($filename, $bm_content);

    if (!$success)
    {
        $out["msg"] = "ERROR: COULD NOT SAVE BOOKMARKS TO FILE ".$filename."!" ;
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }
}


if ($post["method"] === "getbms")
{
    
}
