<?php
$log_file = fopen('/log.txt','a');
date_default_timezone_set('America/New_York');
$date = date('Y-m-d H:i:s', time());
$request_body = file_get_contents('php://input');
$log_entry = $date . " " . $request_body . "\r\n";
fwrite($log_file, $log_entry);
fclose($log_file);
echo $log_entry;
?>
