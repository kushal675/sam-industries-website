<?php
/**
 * send-email.php — SAM Industries Contact Form Handler
 *
 * Production-hardened email handler with layered security:
 *   1. CSRF token verification
 *   2. Honeypot + timestamp + IP rate-limit spam protection
 *   3. Mail header injection prevention
 *   4. Strict input validation
 *   5. Safe mail() usage with proper headers
 *   6. Structured security logging via error_log()
 *
 * All responses are JSON with appropriate HTTP status codes.
 */

// ─── Session & Headers ──────────────────────────────────────────────────────
// Session cookie config MUST match csrf-token.php exactly, otherwise the
// session that stored the CSRF token won't be found when verifying here.
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => true,
    'httponly'  => true,
    'samesite' => 'Lax',
]);
session_start();
header('Content-Type: application/json; charset=utf-8');

// ─── Constants ───────────────────────────────────────────────────────────────
define('RECIPIENT_EMAIL',   'sumit@samindgroup.com');
define('CC_EMAIL',          'sumitk10@hotmail.com');
define('FROM_EMAIL',        'info@samindgroup.com');
define('RATE_LIMIT_MAX',    5);          // max submissions per window
define('RATE_LIMIT_WINDOW', 600);        // 10 minutes in seconds
define('MIN_SUBMIT_TIME',   3);          // seconds — reject faster (bot)
define('MAX_SUBMIT_TIME',   3600);       // seconds — reject stale forms

// ─── Helper: JSON Response ───────────────────────────────────────────────────
/**
 * Send a JSON response and terminate.
 *
 * @param int    $httpCode HTTP status code
 * @param bool   $success  Whether the operation succeeded
 * @param string $message  Human-readable message
 */
function json_response(int $httpCode, bool $success, string $message): void
{
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ─── Helper: Security Logger ─────────────────────────────────────────────────
/**
 * Log a security event in a consistent format.
 * Format: [SAM-SECURITY] [TYPE] [IP] message
 *
 * @param string $type    Event type (CSRF, RATE_LIMIT, HEADER_INJECTION, MAIL_FAIL, etc.)
 * @param string $message Descriptive message
 */
function security_log(string $type, string $message): void
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    error_log("[SAM-SECURITY] [{$type}] [{$ip}] {$message}");
}

// ─── Helper: Header Injection Detection ──────────────────────────────────────
/**
 * Detect mail header injection characters (\r, \n, null byte).
 * Attackers inject these to add arbitrary headers (BCC, Subject, etc.).
 *
 * @param string $str The string to check
 * @return bool True if injection characters are found
 */
function has_header_injection(string $str): bool
{
    return (bool) preg_match('/[\r\n\0]/', $str);
}

// ─── Helper: IP Rate Limiter (File-Based) ────────────────────────────────────
/**
 * Enforce per-IP submission rate limits using JSON files in the temp directory.
 * Each IP gets a hashed filename containing an array of timestamps.
 * Expired entries are pruned on every check.
 *
 * @return bool True if the IP has exceeded the rate limit
 */
function is_rate_limited(): bool
{
    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $dir = sys_get_temp_dir() . '/sam_ratelimit';

    // Create rate-limit directory if it doesn't exist
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }

    // Use a hashed filename so raw IPs aren't stored on disk
    $file = $dir . '/' . hash('sha256', $ip) . '.json';
    $now  = time();

    // Load existing timestamps for this IP
    $timestamps = [];
    if (file_exists($file)) {
        $data = @file_get_contents($file);
        if ($data !== false) {
            $decoded = json_decode($data, true);
            if (is_array($decoded)) {
                $timestamps = $decoded;
            }
        }
    }

    // Prune entries older than the rate-limit window
    $timestamps = array_values(array_filter($timestamps, function (int $ts) use ($now): bool {
        return ($now - $ts) < RATE_LIMIT_WINDOW;
    }));

    // Check if limit is exceeded
    if (count($timestamps) >= RATE_LIMIT_MAX) {
        // Persist the pruned list (don't add new entry)
        file_put_contents($file, json_encode($timestamps), LOCK_EX);
        return true;
    }

    // Record this submission
    $timestamps[] = $now;
    file_put_contents($file, json_encode($timestamps), LOCK_EX);

    return false;
}

// ═════════════════════════════════════════════════════════════════════════════
// REQUEST PROCESSING BEGINS
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1. Method Check ─────────────────────────────────────────────────────────
// Only POST is accepted; everything else gets 405 Method Not Allowed.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(405, false, 'Method not allowed. Use POST.');
}

// ─── 2. CSRF Token Verification ──────────────────────────────────────────────
// The token must match the one stored in the session (set by csrf-token.php).
// hash_equals() prevents timing attacks on the comparison.
$csrfToken   = $_POST['_csrf_token'] ?? '';
$sessionToken = $_SESSION['csrf_token'] ?? '';

if ($sessionToken === '' || $csrfToken === '' || !hash_equals($sessionToken, $csrfToken)) {
    security_log('CSRF', 'Invalid or missing CSRF token');
    json_response(403, false, 'Invalid security token. Please reload the page and try again.');
}

// ─── 3a. Honeypot Field ──────────────────────────────────────────────────────
// A hidden field named 'website_url' should always be empty for real users.
// Bots auto-fill every field. Silently return success to avoid tipping them off.
if (!empty($_POST['website_url'])) {
    // Return fake success — do NOT log excessively (high volume from bots).
    json_response(200, true, 'Thank you! Your message has been sent successfully.');
}

// ─── 3b. Timestamp Validation ────────────────────────────────────────────────
// A hidden field '_form_ts' records when the form was rendered (Unix timestamp).
// Submissions faster than 3 seconds are almost certainly bots.
// Submissions older than 1 hour are stale and should be rejected.
$formTs  = (int) ($_POST['_form_ts'] ?? 0);
$elapsed = time() - $formTs;

if ($formTs <= 0 || $elapsed < MIN_SUBMIT_TIME) {
    json_response(422, false, 'Form submitted too quickly. Please wait a moment and try again.');
}
if ($elapsed > MAX_SUBMIT_TIME) {
    json_response(422, false, 'Form session has expired. Please reload the page and try again.');
}

// ─── 3c. IP Rate Limiting ────────────────────────────────────────────────────
// Max 5 submissions per IP within a 10-minute window.
if (is_rate_limited()) {
    security_log('RATE_LIMIT', 'Rate limit exceeded');
    json_response(429, false, 'Too many submissions. Please wait a few minutes before trying again.');
}

// ─── 4. Extract & Trim Inputs ────────────────────────────────────────────────
$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$phone   = trim($_POST['phone']   ?? '');
$company = trim($_POST['company'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

// ─── 5. Mail Header Injection Check ─────────────────────────────────────────
// Check ALL user-supplied fields that could end up in mail headers or body.
// Characters \r \n \0 allow attackers to inject arbitrary mail headers.
$headerFields = [
    'name'    => $name,
    'email'   => $email,
    'phone'   => $phone,
    'company' => $company,
    'subject' => $subject,
];

foreach ($headerFields as $fieldName => $fieldValue) {
    if (has_header_injection($fieldValue)) {
        security_log('HEADER_INJECTION', "Header injection attempt in field '{$fieldName}'");
        json_response(400, false, 'Invalid characters detected in your input. Please remove any special characters and try again.');
    }
}

// ─── 6. Input Validation ─────────────────────────────────────────────────────
$errors = [];

// Name: required, 2–100 chars, Unicode letters/spaces/hyphens/apostrophes/periods
if ($name === '') {
    $errors[] = 'Name is required.';
} elseif (mb_strlen($name, 'UTF-8') < 2 || mb_strlen($name, 'UTF-8') > 100) {
    $errors[] = 'Name must be between 2 and 100 characters.';
} elseif (!preg_match('/^[\p{L}\s\-\'.]+$/u', $name)) {
    $errors[] = 'Name may only contain letters, spaces, hyphens, apostrophes, and periods.';
}

// Email: required, valid format, max 254 chars (RFC 5321 limit)
if ($email === '') {
    $errors[] = 'Email address is required.';
} elseif (mb_strlen($email, 'UTF-8') > 254) {
    $errors[] = 'Email address is too long (max 254 characters).';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please provide a valid email address.';
}

// Phone: optional, but if provided must be 6–20 chars, digits/spaces/hyphens/parens/plus
if ($phone !== '') {
    if (mb_strlen($phone, 'UTF-8') < 6 || mb_strlen($phone, 'UTF-8') > 20) {
        $errors[] = 'Phone number must be between 6 and 20 characters.';
    } elseif (!preg_match('/^[\d\s\-\(\)\+]+$/', $phone)) {
        $errors[] = 'Phone number may only contain digits, spaces, hyphens, parentheses, and plus sign.';
    }
}

// Company: optional, max 200 chars
if ($company !== '' && mb_strlen($company, 'UTF-8') > 200) {
    $errors[] = 'Company name is too long (max 200 characters).';
}

// Subject: required, 2–200 chars
if ($subject === '') {
    $errors[] = 'Subject is required.';
} elseif (mb_strlen($subject, 'UTF-8') < 2 || mb_strlen($subject, 'UTF-8') > 200) {
    $errors[] = 'Subject must be between 2 and 200 characters.';
}

// Message: required, 10–5000 chars
if ($message === '') {
    $errors[] = 'Message is required.';
} elseif (mb_strlen($message, 'UTF-8') < 10 || mb_strlen($message, 'UTF-8') > 5000) {
    $errors[] = 'Message must be between 10 and 5000 characters.';
}

// Return first validation error (keeps response simple for the front-end)
if (!empty($errors)) {
    json_response(422, false, $errors[0]);
}

// ─── 7. Sanitise Display Values ──────────────────────────────────────────────
// htmlspecialchars() prevents stored XSS if the email is ever rendered in HTML.
$safeCompany = htmlspecialchars($company, ENT_QUOTES, 'UTF-8');
$safeSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// ─── 8. Build Email ──────────────────────────────────────────────────────────
// From uses the domain's own address to satisfy SPF/DKIM.
// Reply-To is set to the sender so staff can reply directly.
$to = RECIPIENT_EMAIL;

$mailSubject = "Contact Form: {$safeSubject}";

$mailBody  = "New contact form submission from SAM Industries website\n";
$mailBody .= str_repeat('─', 50) . "\n\n";
$mailBody .= "Name:    {$name}\n";
$mailBody .= "Email:   {$email}\n";
$mailBody .= "Phone:   " . ($phone !== '' ? $phone : 'Not provided') . "\n";
$mailBody .= "Company: " . ($safeCompany !== '' ? $safeCompany : 'Not provided') . "\n";
$mailBody .= "Subject: {$safeSubject}\n\n";
$mailBody .= str_repeat('─', 50) . "\n";
$mailBody .= "Message:\n\n{$safeMessage}\n";
$mailBody .= str_repeat('─', 50) . "\n\n";
$mailBody .= "Sent at: " . date('Y-m-d H:i:s T') . "\n";
$mailBody .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

// Build headers safely — one header per line, no user input in From.
$headers  = "From: SAM Industries <" . FROM_EMAIL . ">\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "CC: " . CC_EMAIL . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: SAM-Industries-Contact-Form\r\n";

// ─── 9. Send Mail ────────────────────────────────────────────────────────────
// NO @ suppression — errors surface in logs for debugging.
$mailSent = mail($to, $mailSubject, $mailBody, $headers);

if (!$mailSent) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    security_log('MAIL_FAIL', "mail() returned false | sender={$email} | time=" . date('c'));
    json_response(500, false, 'Unable to send your message at this time. Please try again later or contact us directly.');
}

// ─── 10. Success ─────────────────────────────────────────────────────────────
json_response(200, true, 'Thank you! Your message has been sent successfully.');
