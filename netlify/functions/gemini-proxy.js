exports.handler = async (event, context) => {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API key not found." }),
        };
    }


    let model, endpoint, payload;
    try {
        const body = JSON.parse(event.body);
        // Support {type, payload} for chat only, and {model, endpoint, payload} for advanced use
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

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}?key=${API_KEY}`;

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
