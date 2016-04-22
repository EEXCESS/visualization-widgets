<?php

require_once("EvalException.php");

class ScreenshotVis
{

    private $users = null;
    private $sessionId = null;
    private $errors = [];
    private $imgPath = "./../rendered";
    private $dataFile = "./evalsettings.json";
    private $evalData = null;

    public function ScreenshotVis()
    {
        
    }

    public function init()
    {
        if ($this->hasDataErrors())
        {
            throw new EvalException();
        }


        $data = $_GET;

        $this->users = [];
        $this->users[] = $data["userId1"];
        $this->users[] = $data["userId2"];

        if (isset($data["userId3"]) && $data[userId3] !== "")
            $this->users[] = $data["userId3"];

        $this->sessionId = $data["sessionId"];
    }

    private function hasDataErrors()
    {
        $required = array(
            "userId1",
            "userId2",
            "sessionId"
        );

        $errors = [];
        foreach ($required as $requiredGetVar)
        {

            if (!isset($_GET[$requiredGetVar]) || $_GET[$requiredGetVar] === "")
            {
                $errors [] = "<p><strong>ERROR</strong>: '" . $requiredGetVar . "'  not found or empty in GET Variable!"
                        . "<strong>Please report that to the evaluation-instructor!</strong></p>";
            }
        }

        $this->errors = array_merge($this->errors, $errors);
        return sizeof($errors) ? true : false;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function getImageLists()
    {

        if ($this->users === null)
        {
            $this->errors[] = "Could not find user list! init() called?";
            throw new EvalException();
        }
        if ($this->sessionId === null)
        {
            $this->errors[] = "Could not find sessionId! init() called?";
            throw new EvalException();
        }


        $this->loadDataContent();

        $outList = [];
        foreach ($this->users as $userId)
        {
            $userName = $this->getUserName($userId);
            if ($userName === false)
            {
                $this->errors[] = "Could not find username with ID " . $userId;
                throw new EvalException();
            }

            $imgFolderPath = $this->imgPath . "/" . $userName . "/" . $this->sessionId;
            $folderContent = scandir($imgFolderPath);

            if ($folderContent === false)
            {
                $this->errors[] = "Could not find image-folder " . $imgFolderPath;
                throw new EvalException();
            }
            unset($folderContent[0]);
            unset($folderContent[1]);


            $outList[$userId] = [];

            foreach ($folderContent as $img)
            {
                $outList[$userId][] = $imgFolderPath."/".$img;
            }
        }

        return $outList;
    }

    private function loadDataContent()
    {
        $content = file_get_contents($this->dataFile);

        if (!$content)
        {
            $this->errors[] = "Could not load Evaluation-Data from file " . $this->dataFile;
            throw new EvalException();
        }

        $data = json_decode($content);
        if (!$data)
        {
            $this->errors[] = "Could not interprete data from file " . $this->dataFile;
            throw new EvalException();
        }

        $this->evalData = $data;
    }

    private function getUserName($id)
    {
        if (!$this->evalData)
        {
            $this->errors[] = "Eval-Data not loaded!";
            throw new EvalException();
        }

        foreach ($this->evalData->users as $key => $val)
            if ($id == $key)
                return $val;

        return false;
    }

}
