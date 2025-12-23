<?php
session_start();

$db = new PDO("users.db");
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    die("User not found");
}

if (password_verify($password, $user['password'])) {
    $_SESSION['user'] = $user['username'];
    echo "Login successful. Welcome " . htmlspecialchars($user['username']);
} else {
    echo "Incorrect password";
}
