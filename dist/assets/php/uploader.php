<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$img = $_POST['img'];
echo $img;
$id = $_POST['id'];
$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$data = base64_decode($img);
$file = $_SERVER['DOCUMENT_ROOT'] . '/assets/imgs/uploaded/' .$id. '.png';
file_put_contents($file, $data);

?>