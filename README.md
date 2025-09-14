# ShikshaSaathi

ShikshaSaathi is a GenAI-powered teaching assistant chatbot for students and teachers in India. It provides a simple, friendly chat interface for asking questions and getting AI-powered answers in English or Hindi.

## Features

- **Conversational Chatbot**: Ask questions on any topic and get helpful, concise answers.
- **Language Support**: Switch between English and Hindi for both questions and answers.
- **Gamification**: Earn points and badges for asking questions and engaging with the chatbot.
- **Chat History**: View and manage your previous conversations.
- **Text-to-Speech (TTS)**: Listen to AI answers with a Speak button. _(Currently under maintenance)_
- **Image Generation**: Request educational diagrams and images. _(Currently under maintenance)_

## How It Works

- The frontend is a modern HTML/JS web app with a clean, mobile-friendly UI.
- All AI requests are securely proxied through a Netlify Function to the OpenRouter API (OpenAI-compatible).
- Environment variables are used to keep API keys secure.

## Limitations & Maintenance

- **Text-to-Speech (TTS)**: The TTS feature is currently under maintenance and may not work reliably.
- **Image Generation**: Image generation is currently disabled and will be restored in a future update.
- **Model/API Limits**: Free OpenRouter models may be rate-limited or unavailable at times. For best results, use your own API key and select a supported model.
