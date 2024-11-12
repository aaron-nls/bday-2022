<?php

if (!isset($_POST['unlockedDays']) || !isset($_POST['guid'])) {
    echo "0";
    exit();
}
$mysqli = new mysqli("localhost", "dparton", "jolenejolenejolene2024!1", "countdowntoxmas");

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Get the parameters from the URL
$unlockedDays = $_POST['unlockedDays'];
$guid = $_POST['guid'];

// Prepare and bind
$stmt = $mysqli->prepare("UPDATE accounts SET unlockedDays = ? WHERE guid = ?");
$stmt->bind_param("ss", $unlockedDays, $guid);

// Execute the statement
if ($stmt->execute()) {
    echo "1";
} else {
    echo "Error updating record: " . $stmt->error;
}

// Close the statement and connection
$stmt->close();
$mysqli->close();
?>