// The 'fetch' function is available globally in Netlify functions
exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not set in environment variables.");
        }

        const { conversationHistory, systemPrompt } = JSON.parse(event.body);

        // Map the conversation history to the format Google's API expects.
        // This handles cases where the frontend might send different structures.
        const formattedHistory = conversationHistory.map(message => {
            // FIX: Check for the format {role, content} and convert it.
            if (message.role && typeof message.content !== 'undefined') {
                return {
                    role: message.role === 'ai' ? 'model' : message.role, // Gemini API uses 'model' for AI responses
                    parts: [{ text: message.content }]
                };
            }
            // Also handle the legacy {sender, content} format just in case.
            if (message.sender && typeof message.content !== 'undefined') {
                return {
                    role: message.sender === 'ai' ? 'model' : 'user',
                    parts: [{ text: message.content }]
                };
            }
            // If the message is already in the correct {role, parts} format, return it unchanged.
            return message;
        });

        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
        
        const payload = {
            contents: formattedHistory,
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            }
        };

        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
             const errorBody = await response.text();
             console.error("Google API Error:", errorBody);
             return {
                 statusCode: response.status,
                 body: JSON.stringify({ error: `Google API Error: ${response.statusText}`, details: errorBody })
             };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("Proxy Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Internal Server Error: ${error.message}` }),
        };
    }
};

