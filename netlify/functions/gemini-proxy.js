/**
 * Netlify Function: OpenRouter API Proxy
 *
 * Proxies requests from the frontend to the OpenRouter API securely.
 *
 * Supported payloads:
 * - Chat: { type: 'chat', payload: { messages: [...] } }
 * - Image: { type: 'image', payload: { model: '...', prompt: '...' } }
 *
 * Requires OPENROUTER_API_KEY as an environment variable in Netlify.
 */

exports.handler = async (event) => {
    // Get OpenRouter API key from environment
    const API_KEY = process.env.OPENROUTER_API_KEY;
    if (!API_KEY) {
        console.error("OPENROUTER_API_KEY not found in environment.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API key not found." }),
        };
    }

    // Forward {model, messages} directly to OpenRouter
    let body;
    try {
        body = JSON.parse(event.body);
        console.log("Incoming request body:", body);
    } catch (e) {
        console.error("Invalid request body:", event.body, e);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid request body.", details: event.body }),
        };
    }

    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    console.log("Proxying to OpenRouter:", { apiUrl, body });

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(body),
        });

        console.log("OpenRouter API status:", apiResponse.status);
        const text = await apiResponse.text();
        console.log("OpenRouter API raw response:", text);
        let responseData;
        try {
            responseData = text ? JSON.parse(text) : {};
        } catch (e) {
            responseData = { error: 'Invalid JSON response from OpenRouter API', raw: text };
        }

        if (!apiResponse.ok) {
            console.error("OpenRouter API error:", responseData);
            return {
                statusCode: apiResponse.status,
                body: JSON.stringify({ error: responseData.error || { message: "An unknown API error occurred." }, details: responseData }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(responseData),
        };
    } catch (error) {
        console.error("Error contacting OpenRouter API:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to connect to the OpenRouter API.', details: error.toString() }),
        };
    }
};