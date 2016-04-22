<?php
$settingsFile = "evalsettings.json";

$msgs = array();


$data = file_get_contents($settingsFile);
$data = json_decode($data);

if ($_POST)
{

    $postData = $_POST;

    if ($postData["user_id"] !== "new")
    {
        $data->userId = intval($postData["user_id"]);
    } else
    {

        $existingKeys = array_keys((array) $data->users, $postData["user_new"]);
        if (sizeof($existingKeys))
        {
            $data->userId = $existingKeys[0];
        } else
        {
            $keys = array_keys((array) $data->users);
            $newId = max($keys) + 1;
            $data->users->$newId = substr($postData["user_new"], 0, 12);
            $data->userId = $newId;
        }
    }
    $data->textualFilterMode = substr($postData["textualfiltermode"], 0, 12);

    $succesWriteFile = file_put_contents($settingsFile, json_encode($data));

    if ($succesWriteFile)
        $msgs[] = "Daten <strong style='color:green;'>gespeichert!</strong>";
    else
        $msgs[] = "Daten konnten <strong style='color:red;'>NICHT GESCHRIEBEN</strong> werden!!!";
}




$filterModes = array(
    "textOnly",
    "textAndViz",
    "vizOnly"
);
?>


<html>

    <head>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>

        <script>
            jQuery(document).ready(function () {
                jQuery('#new_user_text').click(function () {
                    jQuery('#new_user_radio').prop("checked", true);
                });
            });
        </script>
    </head>


    <body>
        <h1>EEXCESS-Recommender-Dashboard-Evaluierung</h1>
        <img style="float: right; position: absolute; top: 0;right: 0;" src="http://eexcess.eu/wp-content/uploads/2013/04/eexcess_Logo_neu1.jpg" />
<?php foreach ($msgs as $msg) : ?>
            <div style="background:yellow; float: left; margin:10px; padding: 0 61px; border: 1px solid black"><p><?php echo $msg ?></p></div>
<?php endforeach; ?>





        <form METHOD ="POST" style="border: 1px solid; width:80%;  float:left; background:#E8E8E8; padding:30px">
            <h2>User-Settings</h2>
            <p>User-ID: <br/>
                <?php foreach ($data->users as $userKey => $aUser) : ?>
                    <input name="user_id" type="radio" value="<?php echo $userKey; ?>" 
    <?php echo (intval($userKey) === intval($data->userId) ? "checked='checked'" : "") ?>
                           /> 

    <?php echo $userKey . " " . $aUser; ?><br/>
                    <?php endforeach; ?>

                <input name="user_id" id="new_user_radio" type="radio" value="new" />
                <input type="text" id="new_user_text" name="user_new" value="" placeholder="Neuer User"/></p>
            <p>Textual-Filter-Mode: 
                <select name="textualfiltermode">
<?php foreach ($filterModes as $filter) : ?>
                        <option value="<?php echo $filter ?>"
    <?php echo ($filter === $data->textualFilterMode ? "selected='selected'" : "") ?>>
    <?php echo $filter ?></option>
<?php endforeach; ?>
                </select>
            </p>

            <button type="submit">Aktualisieren</button>
        </form>
    </body>

</html>

