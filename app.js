const { useState } = React;

const BookOpen = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const Shield = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const Code = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const FileText = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const Loader2 = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const Download = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const API_EXAMPLE = {
  endpoint: "/api/v2/users/authenticate",
  method: "POST",
  description: "Authenticates a user and returns an access token",
  parameters: [
    { name: "email", type: "string", required: true, description: "User's email address" },
    { name: "password", type: "string", required: true, description: "User's password (min 8 characters)" },
    { name: "remember_me", type: "boolean", required: false, description: "Extend session duration" }
  ],
  responses: {
    "200": {
      description: "Authentication successful",
      schema: { access_token: "string", refresh_token: "string", expires_in: "integer", user_id: "string" }
    },
    "401": {
      description: "Invalid credentials",
      schema: { error: "string", error_code: "string" }
    }
  }
};

const AUDIENCES = [
  { id: 'beginner', name: 'Beginner Developer', icon: BookOpen },
  { id: 'security', name: 'Security Analyst', icon: Shield },
  { id: 'advanced', name: 'Advanced Developer', icon: Code }
];

const FORMATS = [
  { id: 'quick', name: 'Quick Reference', icon: BookOpen },
  { id: 'detailed', name: 'Detailed Guide', icon: Shield },
  { id: 'technical', name: 'Technical Spec', icon: Code }
];

const DocumentationGenerator = () => {
  const [apiData, setApiData] = useState(JSON.stringify(API_EXAMPLE, null, 2));
  const [selectedAudience, setSelectedAudience] = useState('beginner');
  const [selectedFormat, setSelectedFormat] = useState('quick');
  const [loading, setLoading] = useState(false);
  const [documentation, setDocumentation] = useState(null);
  const [error, setError] = useState('');
  const [rawModelText, setRawModelText] = useState('');
  const [extractedDocsPreview, setExtractedDocsPreview] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setApiData(text);
      setError('');
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
  };

  const handleDrop = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setApiData(String(reader.result || ''));
        setError('');
      };
      reader.onerror = () => setError('Failed to read dropped file');
      reader.readAsText(file);
    }
  };

  const handleDragOver = (ev) => {
    ev.preventDefault();
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setError('Clipboard is empty or unsupported.');
        return;
      }
      setApiData(text);
      setError('');
    } catch (err) {
      setError('Unable to read from clipboard. Use paste manually into the editor.');
    }
  };

  const normalizeModelResponseToText = (responseData) => {
    if (!responseData) return '';
    if (typeof responseData === 'string') return responseData;
    if (Array.isArray(responseData)) {
      return responseData.map(item => {
        if (typeof item === 'string') return item;
        if (item.text) return item.text;
        if (item.content) return (typeof item.content === 'string') ? item.content : JSON.stringify(item);
        return JSON.stringify(item);
      }).join('');
    }
    if (responseData.choices && Array.isArray(responseData.choices)) {
      const parts = responseData.choices.map(c => {
        if (c.message && (c.message.content || c.message.role)) return c.message.content || '';
        if (c.text) return c.text;
        if (c.delta && c.delta.content) return c.delta.content;
        return '';
      });
      return parts.join('');
    }
    if (responseData.output && typeof responseData.output === 'string') return responseData.output;
    if (responseData.content && typeof responseData.content === 'string') return responseData.content;
    if (Array.isArray(responseData.content)) return responseData.content.map(c => c.text || '').join('');
    if (responseData.data && typeof responseData.data === 'string') return responseData.data;
    try { return JSON.stringify(responseData); } catch { return String(responseData); }
  };

  const extractFirstJsonObject = (text) => {
    if (!text) return null;

    const startMarker = text.indexOf('<JSON_START>');
    const endMarker = text.indexOf('<JSON_END>');
    if (startMarker !== -1 && endMarker !== -1 && endMarker > startMarker) {
      const jsonString = text.substring(startMarker + '<JSON_START>'.length, endMarker).trim();
      try { return JSON.parse(jsonString); } catch (e) { /* continue */ }
    }

    const codeFenceJson = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeFenceJson && codeFenceJson[1]) {
      const candidate = codeFenceJson[1].trim();
      try { return JSON.parse(candidate); } catch (e) { /* continue */ }
    }

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      let stack = 0;
      for (let i = firstBrace; i < text.length; i++) {
        if (text[i] === '{') stack++;
        if (text[i] === '}') stack--;
        if (stack === 0) {
          const jsonCandidate = text.substring(firstBrace, i + 1);
          try { return JSON.parse(jsonCandidate); } catch (e) { break; }
        }
      }
      try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch (e) { /* continue */ }
    }

    return null;
  };

  const createFallbackDocs = (parsedApi, format, audience) => {
    const params = parsedApi.parameters || [];
    const paramsList = params.length
      ? params.map(p => `- ${p.name}: ${p.type} ${p.required ? '(required)' : '(optional)'}${p.description ? ' — ' + p.description : ''}`).join('\n')
      : 'None';

    const responses = parsedApi.responses || {};
    const responsesList = Object.keys(responses).length
      ? Object.entries(responses).map(([code, r]) => `- ${code}: ${r.description || ''}`).join('\n')
      : 'None';

    const requiredNames = params.filter(p => p.required).map(p => p.name).join(', ') || 'None';

    if (format === 'quick') {
      return {
        quickstart: {
          title: 'Quick Reference',
          content:
`Quick Reference (${audience})

Endpoint: ${parsedApi.endpoint}
Method: ${parsedApi.method}
Required params: ${requiredNames}

Example (curl):
curl -s -X ${parsedApi.method} '${parsedApi.endpoint}' \\
  -H 'Content-Type: application/json' \\
  -d '{"${params.filter(p=>p.required)[0]?.name || ''}": "..."}'

Notes:
- Purpose: ${parsedApi.description || 'N/A'}
- Success response: ${responses['200'] ? responses['200'].description : 'See reference'}`
        },
        reference: {
          title: 'API Reference',
          content: `Endpoint: ${parsedApi.endpoint}\nMethod: ${parsedApi.method}\n\nParameters:\n${paramsList}`
        },
        security: {
          title: 'Security Guide',
          content: "Security Considerations\n\n- Use HTTPS\n- Validate inputs\n- Apply auth/authorization"
        }
      };
    }

    if (format === 'detailed') {
      const exampleRequestBody = params.length
        ? `{\n${params.map(p => `  "${p.name}": /* ${p.type}${p.required ? ' (required)' : ''} */`).join(',\n')}\n}`
        : '{}';
      const exampleResponse = responses['200'] ? JSON.stringify(responses['200'].schema, null, 2) : '{}';

      return {
        quickstart: {
          title: 'Getting Started',
          content:
`Getting Started (${audience})

1) Authenticate (if required).
2) Build request body:
${exampleRequestBody}

3) Send request to ${parsedApi.endpoint} using Content-Type: application/json.
4) Handle responses (200 success, 4xx client errors, 5xx server errors).`
        },
        reference: {
          title: 'Detailed Reference',
          content:
`Endpoint: ${parsedApi.endpoint}
Method: ${parsedApi.method}

Description:
${parsedApi.description || 'N/A'}

Parameters:
${paramsList}

Responses:
${responsesList}

Example success response:
${exampleResponse}`
        },
        security: {
          title: 'Security Guide',
          content:
`Security Considerations

- Use TLS and HSTS
- Rate-limit and log requests
- Validate and sanitize all parameters
- Use short-lived access tokens and secure refresh flows`
        }
      };
    }

    const schema = {
      type: 'object',
      properties: params.reduce((acc, p) => {
        acc[p.name] = { type: p.type || 'string', description: p.description || '' };
        return acc;
      }, {}),
      required: params.filter(p => p.required).map(p => p.name)
    };

    return {
      quickstart: {
        title: 'Technical Spec',
        content:
`Technical Overview (${audience})

Endpoint: ${parsedApi.endpoint}
Method: ${parsedApi.method}

See Reference for machine-readable schemas.`
      },
      reference: {
        title: 'Machine Spec',
        content:
`JSON Schema (request body):
${JSON.stringify(schema, null, 2)}

Responses:
${JSON.stringify(parsedApi.responses || {}, null, 2)}`
      },
      security: {
        title: 'Security Guide',
        content:
`Security (technical)

- Auth: Bearer tokens / OAuth2 recommended
- TLS: TLS1.2+ mandatory
- Headers: Validate Content-Type, Origin, CSP where applicable`
      }
    };
  };

  const generateDocumentation = async () => {
    setLoading(true);
    setError('');
    setDocumentation(null);
    setRawModelText('');
    setExtractedDocsPreview(null);

    const maxRetries = 3;
    let delay = 1000;
    const alternativeModel = "gpt-4o-mini";

    try {
      const parsedApi = JSON.parse(apiData);
      let primaryModel = (selectedFormat === 'detailed' || selectedFormat === 'technical')
        ? 'gemini-2.5-pro'
        : 'gemini-2.5-flash';

      const prompt = `You are a documentation generator. Audience: ${selectedAudience}. Format: ${selectedFormat}.
Given this API JSON object (below), return a single JSON object with keys "quickstart","reference","security".
Each key must be an object with "title" (short) and "content" (plain text).

Important response rules:
- Return ONLY a single valid JSON object. Do not include any explanation, comments, or extra text.
- Wrap the JSON with markers <JSON_START> and <JSON_END> to make extraction reliable.
- CRITICAL: All content inside JSON strings (like in the "content" field) MUST be properly escaped. Use "\\n" for all newlines. Do not use literal newlines.

Format-specific requirements:
- quick: produce a concise, precise quick reference (bulleted) with one curl example and minimal necessary notes.
- detailed: produce exhaustive documentation covering everything: endpoint purpose, auth, headers, full parameter table (names, types, required, constraints, examples, descriptions), body schema, response schemas for all status codes, error examples, handling guidance, pagination, rate-limiting guidance, idempotency, retry behavior, sample requests/responses in curl/node/python, best practices, and troubleshooting notes.
- technical: produce a complete technical specification: machine-readable JSON Schemas for request/response, OpenAPI-like snippets, exact status codes and response schemas, header requirements, authentication flow details, TLS and security requirements, performance/throughput considerations, caching and ETag guidance, rate limits, idempotency contract, validation rules (formats, min/max, patterns), examples, and any recommended monitoring/metrics.

Return structure example (only the JSON, exactly):
<JSON_START>
{
  "quickstart": { "title": "...", "content": "..." },
  "reference": { "title": "...", "content": "..." },
  "security": { "title": "...", "content": "..." }
}
<JSON_END>

API:
${JSON.stringify(parsedApi, null, 2)}
`;

      let responseData = null;
      let modelToUse = primaryModel;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              model: modelToUse,
              maxTokens: 8000,
              metadata: { audience: selectedAudience, format: selectedFormat }
            })
          });

          const resJson = await res.json().catch(() => null);

          if (!res.ok) {
            const errMsg = (resJson && (resJson.error || resJson.message)) || `HTTP ${res.status} ${res.statusText}`;
            const overloaded = /overload|overloaded|busy|503|429/i.test(errMsg) || res.status === 429 || res.status === 503;
            if (overloaded && attempt < maxRetries) {
              if (attempt === 1) modelToUse = alternativeModel;
              await new Promise(r => setTimeout(r, delay));
              delay *= 2;
              continue;
            }
            throw new Error(errMsg);
          }

          responseData = resJson || {};
          const textPreview = normalizeModelResponseToText(responseData);

          if (/model is overloaded|model overloaded|model busy/i.test(textPreview) && attempt < maxRetries) {
            if (attempt === 1) modelToUse = alternativeModel;
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
            continue;
          }

          setRawModelText(textPreview);
          break;
        } catch (err) {
          const transient = /Failed to fetch|network|timeout|overload|overloaded|429|503/i.test(err.message || '');
          if (transient && attempt < maxRetries) {
            if (attempt === 1) modelToUse = alternativeModel;
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
            continue;
          }
          throw err;
        }
      }

      if (!responseData) {
        setError('Primary model unavailable — using local fallback documentation.');
        setDocumentation(createFallbackDocs(parsedApi, selectedFormat, selectedAudience));
        return;
      }

      const text = normalizeModelResponseToText(responseData) || '';
      let docs = extractFirstJsonObject(text);

      if (docs && docs.quickstart && docs.reference && docs.security) {
        setExtractedDocsPreview(docs);
      } else {
        setExtractedDocsPreview(null);
      }

      if (!docs || !(docs.quickstart && docs.reference && docs.security)) {
        console.warn('Model response invalid or unparsable — using fallback docs.', { text });
        setError('Model response unparsable; showing raw model output below. Using local fallback docs.');
        setDocumentation(createFallbackDocs(parsedApi, selectedFormat, selectedAudience));
        return;
      }

      setDocumentation(docs);
    } catch (err) {
      console.error('Generation error:', err);
      try {
        const parsedApi = JSON.parse(apiData);
        setDocumentation(createFallbackDocs(parsedApi, selectedFormat, selectedAudience));
      } catch (parseErr) {
        setError(err.message || 'Failed to generate documentation');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadDoc = (format, content) => {
    const text = typeof content.content === 'string' ? content.content : JSON.stringify(content.content, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${format}_${selectedAudience}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            DocGenX — AI-Powered API Documentation Generator
          </h1>
          <p className="text-purple-200 text-lg">
            Transform API specs into tailored documentation for any audience with DocGenX
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Code /> API Structure (JSON or YAML)
            </h2>

            <div className="flex gap-2 mb-4">
              <label className="flex items-center gap-2 bg-slate-800/60 text-slate-200 px-3 py-2 rounded-md cursor-pointer border border-slate-700">
                <input
                  type="file"
                  accept=".json,.yaml,.yml,application/json,text/yaml"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                Upload file
              </label>

              <button
                type="button"
                onClick={pasteFromClipboard}
                className="px-3 py-2 rounded-md bg-slate-800/60 text-slate-200 border border-slate-700"
              >
                Paste from clipboard
              </button>

              <button
                type="button"
                onClick={() => { setApiData(JSON.stringify(API_EXAMPLE, null, 2)); setError(''); }}
                className="px-3 py-2 rounded-md bg-slate-800/60 text-slate-200 border border-slate-700"
              >
                Load example
              </button>
            </div>

            <textarea
              value={apiData}
              onChange={(e) => setApiData(e.target.value)}
              className="w-full h-96 bg-slate-900/50 text-green-300 font-mono text-sm p-4 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none resize-none"
              placeholder="Paste or upload your API JSON/YAML here (you can also drag & drop a file onto this panel)..."
            />

            <p className="text-slate-400 text-xs mt-2">
              Tip: For best results provide a JSON object with endpoint, method, parameters and responses. If using YAML paste it as text.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-200">
                <div className="mb-2">{error}</div>

                {rawModelText && (
                  <div className="mb-2">
                    <div className="text-xs text-slate-300 mb-1">Raw model output (for debugging):</div>
                    <pre className="bg-slate-900/60 p-3 rounded text-xs text-slate-200 max-h-48 overflow-auto whitespace-pre-wrap">
                      {rawModelText}
                    </pre>
                  </div>
                )}

                {extractedDocsPreview ? (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { setDocumentation(extractedDocsPreview); setError(''); }}
                      className="px-3 py-2 rounded bg-green-600 text-white"
                    >
                      Use extracted JSON from model
                    </button>
                    <button
                      onClick={() => navigator.clipboard?.writeText(JSON.stringify(extractedDocsPreview, null, 2))}
                      className="px-3 py-2 rounded bg-slate-700 text-white"
                    >
                      Copy extracted JSON
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 mt-2">
                    No valid JSON found in the model output. Check the console for full raw output.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Select Target Audience</h2>
            <div className="space-y-3 mb-6">
              {AUDIENCES.map((audience) => {
                const Icon = audience.icon;
                return (
                  <button
                    key={audience.id}
                    onClick={() => setSelectedAudience(audience.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      selectedAudience === audience.id
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-purple-500'
                    }`}
                    type="button"
                  >
                    <Icon />
                    <span className="font-medium">{audience.name}</span>
                  </button>
                );
              })}
            </div>

            <h2 className="text-xl font-semibold text-white mb-4">Select Documentation Format</h2>
            <div className="space-y-3 mb-6">
              {FORMATS.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      selectedFormat === format.id
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-blue-500'
                    }`}
                    type="button"
                  >
                    <Icon />
                    <span className="font-medium">{format.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={generateDocumentation}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              type="button"
            >
              {loading ? (
                <>
                  <Loader2 />
                  Generating Documentation...
                </>
              ) : (
                <>
                  <FileText />
                  Generate Documentation
                </>
              )}
            </button>
          </div>
        </div>

        {documentation && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">Generated Documentation</h2>

            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{documentation.quickstart.title}</h3>
                <button onClick={() => downloadDoc('quickstart', documentation.quickstart)} className="text-blue-300 hover:text-blue-100 transition-colors" type="button">
                  <Download />
                </button>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-slate-200 whitespace-pre-wrap font-mono text-sm">
                {documentation.quickstart.content}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{documentation.reference.title}</h3>
                <button onClick={() => downloadDoc('reference', documentation.reference)} className="text-purple-300 hover:text-purple-100 transition-colors" type="button">
                  <Download />
                </button>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-slate-200 whitespace-pre-wrap font-mono text-sm">
                {documentation.reference.content}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-red-400/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">{documentation.security.title}</h3>
                <button onClick={() => downloadDoc('security', documentation.security)} className="text-red-300 hover:text-red-100 transition-colors" type="button">
                  <Download />
                </button>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 text-slate-200 whitespace-pre-wrap font-mono text-sm">
                {documentation.security.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<DocumentationGenerator />, document.getElementById('root'));