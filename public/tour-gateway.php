<?php
declare(strict_types=1);

// Decide el estado HTTP y entrega un archivo de Vite; no genera metadatos.
function rxSlugValido(string $slug): bool {
    return strlen($slug) <= 255 && !in_array($slug, ['undefined', 'null'], true)
        && preg_match('/^[a-z0-9]+(?:-[a-z0-9-]+)*$/D', $slug) === 1;
}

function rxConsultarTour(string $slug): array {
    $api = rtrim(getenv('RUTAXPLORER_API_URL') ?: 'https://ruta-explorer-api-production.up.railway.app', '/');
    if (!function_exists('curl_init')) return ['status' => 503];
    $curl = curl_init($api . '/api/tours/estado-publico/' . rawurlencode($slug));
    $body = '';
    curl_setopt_array($curl, [
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
        CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$body): int {
            if (strlen($body) + strlen($chunk) > 65536) return 0;
            $body .= $chunk;
            return strlen($chunk);
        },
    ]);
    $ok = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    if ($ok === false) return ['status' => 503];
    if ($status === 404) return ['status' => 404];
    $data = json_decode($body, true);
    if ($status !== 200 || !is_array($data) || !isset($data['slug']) || !is_string($data['slug']) || !rxSlugValido($data['slug'])) {
        return ['status' => 503];
    }
    return ['status' => 200, 'slug' => $data['slug']];
}

function rxRespuestaTour(string $uri, string $query, callable $consultar, string $index): array {
    $headers = ['Content-Type' => 'text/html; charset=UTF-8', 'Cache-Control' => 'no-store'];
    $error = static function (int $status) use ($headers, $query): array {
        $mensaje = $status === 404 ? 'Tour no encontrado o no disponible.' : 'No pudimos consultar el tour. Inténtalo de nuevo en unos minutos.';
        $volver = htmlspecialchars('/app/tours' . ($query !== '' ? '?' . $query : ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        return ['status' => $status, 'headers' => $headers + ($status === 503 ? ['Retry-After' => '60'] : []),
            'body' => '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>' . $status . '</title></head><body><h1>' . $status . '</h1><p>' . $mensaje . '</p><a href="' . $volver . '">Ver tours</a></body></html>'];
    };
    $path = parse_url($uri, PHP_URL_PATH);
    if (!is_string($path) || !preg_match('#^/app/tour/([^/]+)/?$#D', $path, $match)) return $error(404);
    $slug = rawurldecode($match[1]);
    if (!rxSlugValido($slug) || preg_match('/[\r\n]/', $query)) return $error(404);
    try { $resultado = $consultar($slug); }
    catch (Throwable $errorConsulta) { return $error(503); }
    if (($resultado['status'] ?? 503) === 404) return $error(404);
    if (($resultado['status'] ?? 503) !== 200 || !isset($resultado['slug']) || !is_string($resultado['slug']) || !rxSlugValido($resultado['slug'])) return $error(503);
    if ($resultado['slug'] !== $slug) {
        return ['status' => 301, 'headers' => $headers + ['Location' => '/app/tour/' . $resultado['slug'] . ($query !== '' ? '?' . $query : '')], 'body' => ''];
    }
    // El build ya preparó el HTML. Un tour nuevo conserva la SPA hasta el próximo build.
    parse_str($query, $parametros);
    $idioma = in_array($parametros['lang'] ?? '', ['es', 'en', 'fr'], true) ? $parametros['lang'] : 'es';
    $prerender = dirname($index) . '/tour/' . $slug . '.' . $idioma . '.html';
    $archivo = is_file($prerender) ? $prerender : $index;
    $html = is_file($archivo) ? file_get_contents($archivo) : false;
    if ($html === false) return $error(503);
    return ['status' => 200, 'headers' => $headers, 'body' => $html];
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    $respuesta = rxRespuestaTour($_SERVER['REQUEST_URI'] ?? '', $_SERVER['QUERY_STRING'] ?? '', 'rxConsultarTour', __DIR__ . '/index.html');
    http_response_code($respuesta['status']);
    foreach ($respuesta['headers'] as $nombre => $valor) header($nombre . ': ' . $valor);
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') echo $respuesta['body'];
}
