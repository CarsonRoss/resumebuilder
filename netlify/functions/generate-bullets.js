// Netlify Function: Generate AI bullet suggestions for a given job title
// Requires environment variable: OPENAI_API_KEY

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { jobTitle } = JSON.parse(event.body || '{}');
        if (!jobTitle || typeof jobTitle !== 'string' || jobTitle.trim().length === 0) {
            return { statusCode: 400, body: JSON.stringify({ error: 'jobTitle is required' }) };
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) };
        }

        const prompt = [
            'You are an expert resume writer. Generate 8 concise, ATS-friendly resume bullet points',
            `for a candidate applying for the role: "${jobTitle}".`,
            'Each bullet should be results-oriented, quantify impact where reasonable, and use strong verbs.',
            'Return ONLY a JSON array of strings. No prose or markdown.',
        ].join(' ');

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'You write impactful resume bullet points.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            return { statusCode: response.status, body: JSON.stringify({ error: 'OpenAI error', details: text }) };
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content || '';

        let bullets = [];
        try {
            // Try direct parse
            bullets = JSON.parse(content);
        } catch (_) {
            // Fallback: extract first JSON array substring
            const match = content.match(/\[[\s\S]*\]/);
            if (match) {
                bullets = JSON.parse(match[0]);
            }
        }

        if (!Array.isArray(bullets)) bullets = [];
        bullets = bullets
            .filter((b) => typeof b === 'string')
            .map((b) => b.replace(/^[-•]\s*/, '').trim())
            .filter((b) => b.length > 0)
            .slice(0, 8);

        return {
            statusCode: 200,
            body: JSON.stringify({ bullets }),
            headers: { 'Content-Type': 'application/json' },
        };
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Server error', details: err.message }) };
    }
};


