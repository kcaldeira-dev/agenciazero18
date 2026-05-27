const fs = require('fs');
const path = require('path');
const http = require('http');

const port = process.env.PORT || 3000;
const rootDir = __dirname;
const GOOGLE_PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places/';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function sendJson(res, status, data, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(content);
  });
}

async function handleGoogleReviews(res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    sendJson(res, 503, { error: 'Google reviews are not configured yet.' });
    return;
  }

  const url = new URL(`${GOOGLE_PLACE_DETAILS_URL}${placeId}`);
  url.searchParams.set('languageCode', 'pt-BR');

  try {
    const googleResponse = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'displayName',
          'googleMapsUri',
          'rating',
          'userRatingCount',
          'reviews'
        ].join(',')
      }
    });

    const place = await googleResponse.json();

    if (!googleResponse.ok) {
      sendJson(res, googleResponse.status, {
        error: place?.error?.message || 'Could not load Google reviews.'
      });
      return;
    }

    const reviews = (place.reviews || []).map((review) => ({
      authorName: review.authorAttribution?.displayName || 'Cliente Google',
      authorUri: review.authorAttribution?.uri || '',
      photoUri: review.authorAttribution?.photoUri || '',
      rating: review.rating || 5,
      relativeTime: review.relativePublishTimeDescription || '',
      publishTime: review.publishTime || '',
      time: review.publishTime ? Date.parse(review.publishTime) : 0,
      text: review.text?.text || review.originalText?.text || ''
    }));

    sendJson(res, 200, {
      name: place.displayName?.text || 'Agencia Zero18',
      googleMapsUri: place.googleMapsUri || 'https://maps.app.goo.gl/c6CzL3tizTYcxiAy8',
      rating: place.rating || null,
      userRatingCount: place.userRatingCount || null,
      reviews
    }, {
      'Cache-Control': 'public, max-age=21600, stale-while-revalidate=86400'
    });
  } catch (error) {
    sendJson(res, 500, { error: 'Could not connect to Google Places API.' });
  }
}

function getSafeFilePath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const requestedPath = path.join(rootDir, normalizedPath);
  const resolvedPath = path.resolve(requestedPath);

  if (!resolvedPath.startsWith(rootDir)) {
    return null;
  }

  return resolvedPath;
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/api/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname === '/api/google-reviews') {
    await handleGoogleReviews(res);
    return;
  }

  let filePath = getSafeFilePath(requestUrl.pathname);
  if (!filePath || requestUrl.pathname === '/') {
    filePath = path.join(rootDir, 'index.html');
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    sendFile(res, path.join(rootDir, 'index.html'));
  });
});

server.listen(port, () => {
  console.log(`Agencia Zero18 site running on port ${port}`);
});
