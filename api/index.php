<?php
$method = $_SERVER['REQUEST_METHOD'];
$uri    = $_SERVER['REQUEST_URI'];

$url = 'http://127.0.0.1:3000' . $uri;
$ch  = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST  => $method,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER         => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_FOLLOWLOCATION => false,
]);

// Encaminhar Authorization sempre; Content-Type só para requisições sem arquivo
$fwdHeaders = [];
if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $fwdHeaders[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}

if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    if (!empty($_FILES)) {
        // multipart/form-data: usa CURLFile para reencaminhar os arquivos ao Node.js
        // Não define Content-Type — o curl define automaticamente com o boundary correto
        $postFields = [];
        foreach ($_POST as $k => $v) {
            $postFields[$k] = $v;
        }
        foreach ($_FILES as $field => $info) {
            if ($info['error'] === UPLOAD_ERR_OK) {
                $postFields[$field] = new CURLFile(
                    $info['tmp_name'],
                    $info['type'],
                    $info['name']
                );
            }
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
    } else {
        // JSON ou form-urlencoded: encaminhar body bruto
        if (!empty($_SERVER['CONTENT_TYPE'])) {
            $fwdHeaders[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
        }
        curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
    }
}

if ($fwdHeaders) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $fwdHeaders);
}

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
    if (preg_match('/^Content-Type:/i', $h)) header($h, false);
}
echo $body;
