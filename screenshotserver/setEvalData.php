<?php
$settingsFile = "evalsettings.json";

$msgs = array();
if ($_POST) {
    $data = new stdClass();
    $data->userId = $_POST["user"];
    $data->textualFilterMode = $_POST["textualfiltermode"];

    $succesWriteFile = file_put_contents($settingsFile, json_encode($data));
    if ($succesWriteFile)
        $msgs[] = "Daten <strong style='color:green;'>gespeichert!</strong>" . json_encode($data);
    else
        $msgs[] = "Daten konnten <strong style='color:red;'>NICHT GESCHRIEBEN</strong> werden!!!";
}


$currData = file_get_contents($settingsFile);
$currData = json_decode($currData);


$filterModes = array(
    "textOnly",
    "textAndViz",
    "vizOnly"
);
?>


<html>

    <head>
    </head>


    <body>
        <h1>EEXCESS-Recommender-Dashboard-Evaluierung</h1>
        <img style="float: right; position: absolute; top: 0;right: 0;" src="http://eexcess.eu/wp-content/uploads/2013/04/eexcess_Logo_neu1.jpg" />
        <?php foreach ($msgs as $msg) : ?>
            <div style="background:yellow; float: left; margin:10px; border: 1px solid black"><p><?php echo $msg ?></p></div>
        <?php endforeach; ?>





        <form METHOD ="POST" style="border: 1px solid; width:80%;  float:left; background:#E8E8E8; padding:30px">
            <h2>User-Settings</h2>
            <p>User-ID: <input type="text" name="user" value="<?php echo $currData->userId; ?>" /></p>
            <p>Textual-Filter-Mode: 
                <select name="textualfiltermode">
                    <?php foreach ($filterModes as $filter) : ?>
                        <option value="<?php echo $filter ?>"
                                <?php echo ($filter === $currData->textualFilterMode ? "selected='selected'" : "") ?>>
                            <?php echo $filter ?></option>
                    <?php endforeach; ?>
                </select>
            </p>
            <button type="submit">Aktualisieren</button>
        </form>
    </body>

</html>

