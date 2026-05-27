const GOOGLE_PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places/';

module.exports = async function handler(req, res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!apiKey || !placeId) {
    return res.status(500).json({
      error: 'Configure GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID on the server.'
    });
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
      return res.status(googleResponse.status).json({
        error: place?.error?.message || 'Could not load Google reviews.'
      });
    }

    const reviews = (place.reviews || []).map(review => ({
      authorName: review.authorAttribution?.displayName || 'Cliente Google',
      authorUri: review.authorAttribution?.uri || '',
      photoUri: review.authorAttribution?.photoUri || '',
      rating: review.rating || 5,
      relativeTime: review.relativePublishTimeDescription || '',
      publishTime: review.publishTime || '',
      time: review.publishTime ? Date.parse(review.publishTime) : 0,
      text: review.text?.text || review.originalText?.text || ''
    }));

    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      name: place.displayName?.text || 'Agencia Zero18',
      googleMapsUri: place.googleMapsUri || 'https://maps.app.goo.gl/c6CzL3tizTYcxiAy8',
      rating: place.rating || null,
      userRatingCount: place.userRatingCount || null,
      reviews
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Could not connect to Google Places API.'
    });
  }
};
