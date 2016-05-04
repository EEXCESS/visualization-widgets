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
    if (!isset($post["id"]))
    {
        $out["msg"] = "ERROR: NO GUID FOUND!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }

    if (!isset($post["data"]))
    {
        $out["msg"] = "ERROR: NO COLLECTION FOUND!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }


    $data = $post["data"];
    //echo $bm_content;
    
    
    $id = $post["id"];
    $filename = $folder . "/" . md5($id) . ".json";

    $success = file_put_contents($filename, $data);

    if (!$success)
    {
        $out["msg"] = "ERROR: COULD NOT SAVE COLLECTION TO FILE " . $filename . "!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }

    $out["msg"] = "Collection stored on server successfully (".$id.")!";
    //$out["error"] = false;
    $out["id"] = $id;
    echo json_encode($out);
    exit;
}


if ($post["method"] === "getcollection")
{
    $id = $post["id"];
    $filename = $folder . "/" . md5($id) . ".json";

    $content = file_get_contents($filename);

    if ($content === false)
    {
        $out["msg"] = "ERROR: COULD NOT RETRIEVE COLLECTION FROM FILE " . $filename . "!";
        $out["error"] = true;
        echo json_encode($out);
        exit;
    }

    $out["msg"] = "Collection for id " . $id;
    //$out["error"] = false;
    $out["data"] = json_decode($content);
    echo json_encode($out);
    exit;
}
