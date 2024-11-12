<?php
// Database connection
$mysqli = new mysqli("localhost", "dparton", "jolenejolenejolene2024!1", "countdowntoxmas");

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Get the subdomain from the current URL
$host = $_SERVER['HTTP_HOST'];
$subdomain = explode('.', $host)[0];

// Prepare and execute the query
$stmt = $mysqli->prepare("SELECT guid, unlockedDays FROM accounts WHERE guid = ?");
$stmt->bind_param("s", $subdomain);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($guid, $unlockedDays);
$stmt->fetch();

// Check if the subdomain exists in the guid column
if ($stmt->num_rows > 0) {
    // Set the cookie
    setcookie("guid", $subdomain, time() + (86400 * 30), "/"); // 86400 = 1 day
    setcookie("unlockedDays", $unlockedDays , time() + (86400 * 30), "/"); // 86400 = 1 day

    // Include the app.html file
    include 'app.html';
}else{
    // Redirect to the login page
    header("Location: https://countdowntochristmas.app");
}

// Close the statement and connection
$stmt->close();
$mysqli->close();

exit();
?>