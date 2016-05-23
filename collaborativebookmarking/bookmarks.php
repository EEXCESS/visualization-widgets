<?php

header('Access-Control-Allow-Origin: *');

$folder = "bookmarks";

$post = $_POST;

$out = array();
//$out["error"] = false;


if (!isset($post["method"]))
{
    $out["msg"] = "ERROR: NO METHOD FOUND!";
    $out["error"] = true;
    echo json_encode($out);
    exit;
}


/**
 * STORE COLLECTION
 */
if ($post["method"] === "storecollection")
{
    if (!isset($post["data"]))
    {
        $out["msg"] = "ERROR: NO COLLECTION FOUND!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }


    $data = $post["data"];
    //echo $bm_content;


    $guid = (isset($post["guid"]) && $post["guid"]) ? $post["guid"] : uniqid();
    $guid = preg_replace(array('/\s/', '/\.[\.]+/', '/[^\w_\.\-]/'), array('_', '.', ''), $guid);
    $guid = substr($guid, 0, 256);
    $filename = $folder . "/" . $guid . ".json";

    $success = file_put_contents($filename, $data);

    if (!$success)
    {
        $out["msg"] = "ERROR: COULD NOT SAVE COLLECTION TO FILE " . $filename . "!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }

    $out["msg"] = "Collection stored on server successfully (" . $guid . ")!";
    //$out["error"] = false;
    $out["guid"] = $guid;
    echo json_encode($out);
    exit;
}


if ($post["method"] === "getcollection")
{
    $guid = $post["guid"];
    $filename = $folder . "/" . $guid . ".json";

    $content = file_get_contents($filename);

    if ($content === false)
    {
        $out["msg"] = "ERROR: COULD NOT RETRIEVE COLLECTION FROM FILE " . $filename . "!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }

    $out["msg"] = "Collection for id " . $guid;
    //$out["error"] = false;
    $out["data"] = json_decode($content);
    $out["data"]->guid = $guid;
    echo json_encode($out);
    exit;
}



if ($post["method"] === "getAllCollectionIds")
{
    $handle = opendir($folder);
    $out["msg"] = "Get All Collections";

    $data = [];
    while (($entry = readdir($handle)) !== false)
    {
        if ($entry === "." || $entry === "..")
            continue;

        $data[] = str_ireplace(".json", "", $entry);
    }


    $out["collections"] = $data;
    echo json_encode($out);
}

