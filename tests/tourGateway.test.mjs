// Integración HTTP real. Requiere XAMPP o RX_APACHE_ROOT y RX_PHP_ROOT.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, copyFile, writeFile, rm, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearHtmlTour } from '../scripts/prerender-tours.mjs';

test('Apache/PHP: documentos 404, aliases 301, QR, parámetros y errores temporales', { timeout: 30000 }, async t => {
  const apache = process.env.RX_APACHE_ROOT || 'C:/xampp/apache';
  const php = process.env.RX_PHP_ROOT || 'C:/xampp/php';
  try { await access(`${apache}/bin/httpd.exe`); await access(`${php}/php8apache2_4.dll`); }
  catch { t.skip('Configura RX_APACHE_ROOT y RX_PHP_ROOT para ejecutar Apache con PHP 8 en Windows.'); return; }
  const root = await mkdtemp(path.join(tmpdir(), 'rutaxplorer-http-'));
  const forward = value => value.replaceAll('\\', '/');
  const api = createServer((req, res) => {
    const slug = req.url.split('/').at(-1);
    if (['inexistente', 'inactivo', 'alias-inactivo', 'eliminado'].includes(slug)) { res.writeHead(404).end('{}'); return; }
    if (slug === 'error-api') { res.writeHead(503).end('{}'); return; }
    if (slug === 'json-invalido') { res.end('<html>Error</html>'); return; }
    if (slug === 'redirect-api') { res.writeHead(301, { Location: '/otra' }).end(); return; }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ slug: ['antiguo', 'intermedio'].includes(slug) ? 'actual' : slug }));
  });
  let child;
  try {
    api.listen(0, '127.0.0.1'); await once(api, 'listening');
    const portProbe = createServer(); portProbe.listen(0, '127.0.0.1'); await once(portProbe, 'listening');
    const port = portProbe.address().port; await new Promise(resolve => portProbe.close(resolve));
    await mkdir(path.join(root, 'app'));
    const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
    for (const file of ['.htaccess', 'tour-gateway.php']) await copyFile(path.join(publicDir, file), path.join(root, 'app', file));
    const html = '<!doctype html><html><body>SPA original</body></html>';
    await writeFile(path.join(root, 'app/index.html'), html);
    await mkdir(path.join(root, 'app/tour'));
    const variants = Object.fromEntries(['es', 'en', 'fr'].map(lang => [lang,
      crearHtmlTour('<html lang="es"><head></head><body>SPA original</body></html>', {
        slug: 'actual', nombre: `Tour ${lang}`, descripcion: `Descripción ${lang}`, fotos: [],
      }, 'https://rutaxplorer.com', lang),
    ]));
    // Incluso un HTML antiguo de un tour inactivo debe quedar bloqueado por el 404.
    for (const slug of ['actual', 'inactivo']) for (const lang of ['es', 'en', 'fr']) await writeFile(path.join(root, 'app/tour', `${slug}.${lang}.html`), variants[lang]);
    await writeFile(path.join(root, 'app/example.js'), 'const prueba = true;');
    const config = `ServerRoot "${forward(apache)}"
Listen 127.0.0.1:${port}
ServerName 127.0.0.1
LoadModule authz_core_module modules/mod_authz_core.so
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule dir_module modules/mod_dir.so
LoadModule env_module modules/mod_env.so
LoadModule headers_module modules/mod_headers.so
LoadFile "${forward(php)}/php8ts.dll"
LoadFile "${forward(php)}/libpq.dll"
LoadFile "${forward(php)}/libsqlite3.dll"
LoadModule php_module "${forward(php)}/php8apache2_4.dll"
PHPINIDir "${forward(php)}"
<FilesMatch "\\.php$">
SetHandler application/x-httpd-php
</FilesMatch>
DocumentRoot "${forward(root)}"
ErrorLog "${forward(root)}/error.log"
PidFile "${forward(root)}/httpd.pid"
DirectoryIndex index.html
<Directory "${forward(root)}">
AllowOverride All
Options FollowSymLinks
Require all granted
SetEnv RUTAXPLORER_API_URL http://127.0.0.1:${api.address().port}
</Directory>
`;
    await writeFile(path.join(root, 'httpd.conf'), config);
    child = spawn(`${apache}/bin/httpd.exe`, ['-X', '-f', forward(path.join(root, 'httpd.conf'))], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = ''; child.stderr.on('data', data => { output += data; });
    child.on('error', err => { output += err.message; });
    const origin = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      try { await fetch(`${origin}/app/example.js`); ready = true; break; } catch {}
      if (child.exitCode !== null) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, `Apache no inició: ${output}`);
    const get = url => fetch(origin + url, { redirect: 'manual' });
    const current = await get('/app/tour/actual?ref=hotel1&lang=fr');
    assert.equal(current.status, 200); assert.equal(await current.text(), variants.fr);
    const whatsapp = await fetch(`${origin}/app/tour/actual`, { headers: { 'User-Agent': 'WhatsApp/2' } });
    assert.equal(await whatsapp.text(), variants.es);
    for (const lang of ['es', 'en', 'fr']) {
      assert.equal(await (await get(`/app/tour/actual?ref=hotel1&lang=${lang}`)).text(), variants[lang]);
      assert.equal(await (await get(`/app/tour/actual?lang=${lang}&ref=hotel1`)).text(), variants[lang]);
    }
    assert.equal(await (await get('/app/tour/actual?lang=de')).text(), variants.es);
    assert.equal(await (await get('/app/tour/actual?lang[]=en')).text(), variants.es);
    assert.equal(await (await get('/app/tour/nuevo')).text(), html, 'Tour nuevo: SPA hasta recompilar');
    assert.equal((await get('/app/tour/actual.html')).status, 404, 'No se publica una segunda URL del HTML');
    for (const slug of ['inexistente', 'inactivo', 'alias-inactivo', 'eliminado', 'undefined', 'null']) {
      const response = await get(`/app/tour/${slug}?lang=en&ref=hotel1`);
      assert.equal(response.status, 404, slug); assert.doesNotMatch(await response.text(), /SPA original/);
    }
    for (const slug of ['antiguo', 'intermedio']) {
      const query = '?lang=fr&ref=Hotel%20Uno&extra=a%2Bb';
      const response = await get(`/app/tour/${slug}${query}`);
      assert.equal(response.status, 301); assert.equal(response.headers.get('location'), `/app/tour/actual${query}`);
      assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    for (const slug of ['error-api', 'json-invalido', 'redirect-api']) {
      const response = await get(`/app/tour/${slug}`);
      assert.equal(response.status, 503, slug); assert.equal(response.headers.get('retry-after'), '60');
    }
    for (const [from, to] of [
      ['/app/tour/RutaExplorer/actual?lang=en', '/app/tour/actual?lang=en'],
      ['/app/tour/Hotel%20Uno/antiguo?lang=fr', '/app/tour/antiguo?ref=Hotel%20Uno&lang=fr'],
      ['/app/tourAdmin/actual?ref=hotel1', '/app/tour/actual?ref=hotel1'],
    ]) {
      const response = await get(from); assert.equal(response.status, 301);
      assert.equal(new URL(response.headers.get('location'), origin).pathname + new URL(response.headers.get('location'), origin).search, to);
    }
    assert.equal((await get('/app/tour-gateway.php')).status, 404);
    assert.equal(await (await get('/app/tours?ref=hotel1')).text(), html);
    assert.equal(await (await get('/app/example.js')).text(), 'const prueba = true;');
    const head = await fetch(`${origin}/app/tour/inexistente`, { method: 'HEAD' });
    assert.equal(head.status, 404); assert.equal(await head.text(), '');
    await new Promise(resolve => api.close(resolve));
    assert.equal((await get('/app/tour/actual')).status, 503, 'API desconectada no se convierte en 404 ni 200');
  } catch (error) {
    try { error.message += '\n' + await readFile(path.join(root, 'error.log'), 'utf8'); } catch {}
    throw error;
  } finally {
    if (child && child.exitCode === null) { child.kill(); await once(child, 'exit'); }
    if (api.listening) { api.closeAllConnections(); await new Promise(resolve => api.close(resolve)); }
    assert.ok(root.startsWith(path.join(tmpdir(), 'rutaxplorer-http-')));
    await rm(root, { recursive: true, force: true });
  }
});
