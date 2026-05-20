<?php
$method = $_SERVER['REQUEST_METHOD'];
$uri    = $_SERVER['REQUEST_URI'];

// CORS preflight
if ($method === 'OPTIONS') {
    header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? 'https://alunomakerdigital.com.br'));
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    http_response_code(200);
    exit;
}

$url = 'http://127.0.0.1:3000' . $uri;
$ch  = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST  => $method,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER         => true,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_FOLLOWLOCATION => false,
]);

$fwdHeaders = [];
$map = ['CONTENT_TYPE'=>'Content-Type','HTTP_AUTHORIZATION'=>'Authorization','HTTP_ORIGIN'=>'Origin'];
foreach ($map as $srv => $hdr) {
    if (!empty($_SERVER[$srv])) $fwdHeaders[] = $hdr . ': ' . $_SERVER[$srv];
}
if ($fwdHeaders) curl_setopt($ch, CURLOPT_HTTPHEADER, $fwdHeaders);

if (in_array($method, ['POST','PUT','PATCH']))
    curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));

$raw     = curl_exec($ch);
$code    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$hdrSz   = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$curlErr = curl_errno($ch);
curl_close($ch);

if ($raw === false || $curlErr) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(['erro' => 'API indisponivel. Tente novamente.']);
    exit;
}

$body = substr($raw, $hdrSz);
$hdrs = substr($raw, 0, $hdrSz);
http_response_code($code);
foreach (explode("\r\n", $hdrs) as $h) {
    if (preg_match('/^(Content-Type|Access-Control-)/i', $h)) header($h, false);
}
echo $body;
