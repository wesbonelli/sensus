<?php

ini_set('display_errors', 1);

function errorReport($errno, $errstr) {
  echo "Error: [$errno] $errstr<br>";
  error_log("Error: [$errno] $errstr", 1, "wpb3hw@virginia.edu");
}

?>
