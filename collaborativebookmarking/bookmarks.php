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


    $bm_content = $post["bms"];
    //echo $bm_content;
    
    
    $userId = $post["user"];
    $filename = $folder . "/" . md5($userId) . ".json";

    $success = file_put_contents($filename, $bm_content);

    if (!$success)
    {
        $out["msg"] = "ERROR: COULD NOT SAVE BOOKMARKS TO FILE " . $filename . "!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }

    $out["msg"] = "Bookmarks stored on server successfully !";
    $out["error"] = false;
    echo json_encode($out);
    exit;
}


if ($post["method"] === "getbms")
{
    $userId = $post["user"];
    $filename = $folder . "/" . md5($userId) . ".json";

    $content = file_get_contents($filename);

    if ($content === false)
    {
        $out["msg"] = "ERROR: COULD NOT RETRIEVE BOOKMARKS FROM FILE " . $filename . "!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }

    $out["msg"] = "Bookmarks for user " . $userId;
    $out["error"] = false;
    $out["bookmarks"] = json_decode($content);
    echo json_encode($out);
    exit;
}
