/**
 * Netlify Function: Gemini API Proxy
 *
 * Proxies chat and image requests from the frontend to the Google Gemini API securely.
 *
 * Supported payloads:
 *   - Chat: { type: 'chat', payload: { contents: [...] } }
 *   - Advanced: { model, endpoint, payload } (for image or other Gemini endpoints)
 *
 * Requires GEMINI_API_KEY as an environment variable in Netlify.
 */

exports.handler = async (event) => {
    // Get Gemini API key from environment
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API key not found." }),
        };
    }

    // Parse and validate request
    let model, endpoint, payload;
    try {
        const body = JSON.parse(event.body);
        if (body.type === 'chat') {
            model = 'gemini-1.5-pro';
            endpoint = 'generateContent';
            payload = body.payload;
        } else if (body.model && body.endpoint && body.payload) {
            model = body.model;
            endpoint = body.endpoint;
            payload = body.payload;
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing or invalid model/type/endpoint/payload." }),
            };
        }
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid request body." }),
        };
    }

    // Build Gemini API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}?key=${API_KEY}`;

    // Proxy the request to Gemini API
    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        let responseData;
        const text = await apiResponse.text();
        try {
            responseData = text ? JSON.parse(text) : {};
        } catch (e) {
            responseData = { error: 'Invalid JSON response from Gemini API', raw: text };
        }

        if (!apiResponse.ok) {
            return {
                statusCode: apiResponse.status,
                body: JSON.stringify({ error: responseData.error || { message: "An unknown API error occurred." } }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(responseData),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to connect to the Gemini API.' }),
        };
    }
};
