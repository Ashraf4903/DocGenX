const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model, maxTokens } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.' });
    }

    // Use the model sent from the client, or default to a valid flash model
    const modelName = model || 'gemini-2.5-flash'; // <-- CORRECTED MODEL NAME
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: maxTokens || 8000,
          temperature: 0.7
        },
        safetySettings: [
          { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
          { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
          { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
          { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error?.message || errorData.error || `API error: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();
    
    // --- START: NEW ERROR HANDLING ---
    // Check if candidates exist and have content
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      // Log the full API response to your server console for debugging
      console.error('Gemini API returned an empty response or was blocked:');
      console.error(JSON.stringify(data, null, 2));

      // Find out why it failed (e.g., "SAFETY")
      const finishReason = data.candidates?.[0]?.finishReason || 'UNKNOWN';
      if (finishReason === 'SAFETY') {
        return res.status(500).json({ error: 'Request blocked by safety filters. Check your server console for details.' });
      }

      return res.status(500).json({ error: `Model returned an empty response. (Finish Reason: ${finishReason})` });
    }
    // --- END: NEW ERROR HANDLING ---

    // Return in a format similar to Anthropic's response structure
    res.json({
      content: [
        {
          type: 'text',
          text: textContent
        }
      ]
    });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (process.env.GEMINI_API_KEY) {
    console.log('✓ Gemini API key loaded');
  } else {
    console.error('✗ WARNING: GEMINI_API_KEY not found in .env file');
    console.error('  Please create a .env file with: GEMINI_API_KEY=your_api_key_here');
  }
});