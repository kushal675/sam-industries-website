<?php
/**
 * csrf-token.php — CSRF Token Endpoint for SAM Industries
 *
 * Since contact.html is a static HTML file, JavaScript must fetch the
 * CSRF token from this endpoint before submitting the contact form.
 *
 * Flow:
 *   1. JS calls GET /csrf-token.php on page load
 *   2. This script starts a session, generates a token, stores it in $_SESSION
 *   3. Returns the token as JSON so JS can include it in the POST
 *   4. send-email.php verifies the token from the same session
 *
 * Security:
 *   - SameSite=Lax cookies prevent cross-site request forgery at the cookie level
 *   - HttpOnly prevents JS from reading the session cookie (token is in the body)
 *   - No-cache headers ensure a fresh token is always fetched
 *   - 64-char hex token from random_bytes(32) — cryptographically secure
 */

// ─── Secure Session Cookie Configuration ─────────────────────────────────────
// Must be called BEFORE session_start().
// SameSite=Lax: cookie is sent on top-level navigations and same-site requests,
//   but NOT on cross-site POST/iframe requests — mitigates CSRF at cookie level.
// HttpOnly: session cookie is inaccessible to client-side JavaScript.
// Secure: set to true in production (HTTPS); set to false only for local dev.
session_set_cookie_params([
    'lifetime' => 0,            // session cookie — expires when browser closes
    'path'     => '/',
    'domain'   => '',           // current domain only
    'secure'   => true,         // HTTPS only (Hostinger supports HTTPS)
    'httponly'  => true,         // no JS access to session cookie
    'samesite' => 'Lax',        // CSRF mitigation at cookie level
]);

session_start();

// ─── Response Headers ────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');

// Prevent caching — each page load should get a fresh token
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// CORS: allow same-origin requests only (default browser behavior).
// If the front-end is on the same domain, no Access-Control-Allow-Origin is needed.
// If you ever need cross-origin, uncomment and set your domain:
// header('Access-Control-Allow-Origin: https://samindgroup.com');
// header('Access-Control-Allow-Credentials: true');

// ─── Method Check ────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use GET.',
    ]);
    exit;
}

// ─── Generate CSRF Token ─────────────────────────────────────────────────────
// 32 random bytes → 64-character hex string.
// random_bytes() is cryptographically secure (uses OS CSPRNG).
$token = bin2hex(random_bytes(32));

// Store in session — send-email.php will verify against this value.
$_SESSION['csrf_token'] = $token;

// ─── Return Token ────────────────────────────────────────────────────────────
echo json_encode([
    'token' => $token,
]);
