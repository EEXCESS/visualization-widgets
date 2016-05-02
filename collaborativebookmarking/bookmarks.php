<?php
header('Access-Control-Allow-Origin: *');

$post = $_POST;

$out = array();	
$out["error"] = false;


if (!isset($post["method"]))
{		

	$out["msg"] = "ERRROR: NO METHOD FOUND!";
	$out["error"] = true;
	echo json_encode($out);
	exit;
}


