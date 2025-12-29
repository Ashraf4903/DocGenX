# DocGenX

AI-powered API documentation generator that transforms API specifications into tailored documentation for different audiences and formats.

## Features

- **Multiple Audiences**: Generate docs for Beginner Developers, Security Analysts, or Advanced Developers
- **Multiple Formats**: Choose between Quick Reference, Detailed Guide, or Technical Spec
- **AI-Powered**: Uses Google Gemini to create intelligent, context-aware documentation
- **Three Documentation Types**: Quickstart Guide, API Reference, and Security Guide
- **Download Options**: Export generated documentation as text files

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
GEMINI_API_KEY=your_api_key_here
```

3. Start the server:
```bash
npm start
```

4. Open `http://localhost:3000` in your browser

## Usage

1. Paste your API JSON structure in the left panel (or use the example)
2. Select your target audience
3. Select documentation format
4. Click "Generate Documentation"
5. Download the generated docs using the download buttons

## API JSON Format

```json
{
  "endpoint": "/api/endpoint",
  "method": "POST",
  "description": "Endpoint description",
  "parameters": [
    {
      "name": "param_name",
      "type": "string",
      "required": true,
      "description": "Parameter description"
    }
  ],
  "responses": {
    "200": {
      "description": "Success response",
      "schema": {}
    }
  }
}
```

## Tech Stack

- React (via CDN)
- Express.js
- Google Gemini API
- Tailwind CSS
