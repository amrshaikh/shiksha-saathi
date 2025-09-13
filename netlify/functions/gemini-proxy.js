const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { endpoint, payload } = JSON.parse(event.body);
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${endpoint}?key=${apiKey}`;
  const apiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await apiRes.json();
  return {
    statusCode: apiRes.status,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  };
};