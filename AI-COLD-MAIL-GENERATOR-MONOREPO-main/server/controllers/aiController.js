const axios = require('axios');
const EmailHistory = require('../models/EmailHistory');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const generateWithGroq = async (apiKey, fullPrompt, useJsonMode = true) => {
  const requestBody = {
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',

    messages: [
      {
        role: 'system',
        content:
          'You are an expert job outreach strategist. Always follow the requested output format exactly.'
      },
      {
        role: 'user',
        content: fullPrompt
      }
    ],

    temperature: 0.7,
    max_completion_tokens: 4096,
    include_reasoning: false
  };

  // Primary attempt: JSON Object Mode
  if (useJsonMode) {
    requestBody.response_format = {
      type: 'json_object'
    };
  }

  const response = await axios.post(
    GROQ_URL,
    requestBody,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    }
  );

  return response;
};

const extractJson = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('AI returned an empty response');
  }

  let cleaned = text.trim();

  // Remove markdown code fences if the model adds them.
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // First try the complete response directly.
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    // Continue to object extraction below.
  }

  // Try to find the JSON object inside any extra text.
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonString = cleaned.slice(firstBrace, lastBrace + 1);

    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error(
        `AI returned invalid JSON: ${error.message}`
      );
    }
  }

  throw new Error('AI did not return valid JSON');
};

exports.generateEmail = async (req, res) => {
  try {
    const { prompt } = req.body;

    // -----------------------------
    // Validate prompt
    // -----------------------------
    if (!prompt) {
      return res.status(400).json({
        message: 'Prompt is required'
      });
    }

    if (typeof prompt !== 'string') {
      return res.status(400).json({
        message: 'Prompt must be a string'
      });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({
        message: 'Prompt cannot be empty'
      });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({
        message: 'Prompt cannot exceed 2000 characters'
      });
    }

    // -----------------------------
    // Check Groq API key
    // -----------------------------
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res.status(500).json({
        message: 'AI service is not configured'
      });
    }

    // -----------------------------
    // AI instructions
    // -----------------------------
    const systemPrompt = `
You are an expert job outreach strategist.

Your task is to generate a HIGH-CONVERTING cold email to a recruiter for a job opportunity.

IMPORTANT:
- Even if the user gives only 2–4 words, assume realistic context.
- Do NOT ask for clarification.
- Make professional assumptions.
- Avoid generic phrases.
- Keep the content concise and professional.
- Do not use emojis.

====================================================
OUTPUT FORMAT
====================================================

Return ONLY one valid JSON object.

The JSON object MUST contain exactly these four fields:

{
  "subject": "string",
  "emailBody": "string",
  "linkedInDM": "string",
  "followUpEmail": "string"
}

Do not return markdown.
Do not return code fences.
Do not return explanations.
Do not return anything before or after the JSON object.

====================================================
CONTEXT ASSUMPTIONS
====================================================

Assume:

- Candidate has 2+ years of experience.
- Strong in DSA and system design.
- Has worked on backend APIs or scalable systems.
- Has contributed to production-level features.
- Actively seeking Software Engineer roles.

If the prompt is short, such as:

"SDE role"
"Backend engineer"
"Startup job"
"Product company"

make intelligent and realistic assumptions.

====================================================
SUBJECT LINE
====================================================

Rules:

- 6–9 words.
- Confident and professional.
- Highlight value or experience.
- Avoid generic phrases such as:
  "Quick question"
  "Looking for opportunity"
  "Job application"

====================================================
EMAIL BODY
====================================================

Write approximately 60–90 words.

Structure:

1. Personalized observation about hiring.
2. Mention a common hiring/scaling challenge.
3. Mention candidate experience and strengths.
4. Mention a specific potential contribution or impact.
5. Give a clear CTA.
6. Professional sign-off.

Tone:

- Confident.
- Professional.
- Concise.
- Not desperate.
- No hype.
- No emojis.

====================================================
LINKEDIN DM
====================================================

Write approximately 30–50 words.

Keep it:

- Short.
- Conversational.
- Professional.
- Observation + value + soft ask.

====================================================
FOLLOW-UP EMAIL
====================================================

Write approximately 50–80 words.

It should:

- Use a new angle.
- Emphasize long-term value.
- Have professional urgency.
- End with a clear CTA.

====================================================
JSON RULES
====================================================

The response MUST be valid JSON.

Use double quotes around all JSON keys and string values.

If you need a quotation mark inside a string, escape it with a backslash.

Do not put literal unescaped newlines inside JSON strings.

Return ONLY the JSON object.
`;

    const fullPrompt = `
${systemPrompt}

USER REQUEST:
${prompt.trim()}

Generate the cold email package now.

Return ONLY this JSON structure:

{
  "subject": "string",
  "emailBody": "string",
  "linkedInDM": "string",
  "followUpEmail": "string"
}
`;

    // -----------------------------
    // First AI attempt
    // -----------------------------
    let aiResponse;

    try {
      aiResponse = await generateWithGroq(
        groqApiKey,
        fullPrompt,
        true
      );
    } catch (firstError) {
      console.error(
        'Groq primary generation failed:',
        firstError.response?.data || firstError.message
      );

      /*
       * Groq can sometimes reject JSON Object Mode before
       * returning model output. In that situation retry once
       * without response_format and let our own parser handle it.
       */
      const groqErrorCode =
        firstError.response?.data?.error?.code;

      if (
        groqErrorCode === 'json_validate_failed' ||
        firstError.response?.data?.error?.type === 'invalid_request_error'
      ) {
        console.log(
          'Retrying Groq request without JSON response_format...'
        );

        aiResponse = await generateWithGroq(
          groqApiKey,
          fullPrompt,
          false
        );
      } else {
        throw firstError;
      }
    }

    // -----------------------------
    // Validate Groq response
    // -----------------------------
    if (
      !aiResponse.data ||
      !aiResponse.data.choices ||
      !aiResponse.data.choices[0] ||
      !aiResponse.data.choices[0].message
    ) {
      throw new Error('Invalid response from Groq API');
    }

    const generatedText =
      aiResponse.data.choices[0].message.content;

    console.log(
      'AI response received successfully.'
    );

    // -----------------------------
    // Parse JSON
    // -----------------------------
    let parsedResponse;

    try {
      parsedResponse = extractJson(generatedText);
    } catch (parseError) {
      console.error(
        'JSON parse error:',
        parseError.message
      );

      console.error(
        'Generated text:',
        generatedText
      );

      return res.status(500).json({
        message: 'Failed to parse AI response',
        error:
          'The AI generated an invalid response. Please try again.'
      });
    }

    // -----------------------------
    // Normalize AI response
    // -----------------------------
    const emailData = {
      subject:
        typeof parsedResponse.subject === 'string'
          ? parsedResponse.subject.trim()
          : '',

      emailBody:
        typeof parsedResponse.emailBody === 'string'
          ? parsedResponse.emailBody.trim()
          : '',

      linkedInDM:
        typeof parsedResponse.linkedInDM === 'string'
          ? parsedResponse.linkedInDM.trim()
          : '',

      followUpEmail:
        typeof parsedResponse.followUpEmail === 'string'
          ? parsedResponse.followUpEmail.trim()
          : ''
    };

    // -----------------------------
    // Validate generated content
    // -----------------------------
    if (!emailData.subject || !emailData.emailBody) {
      console.error(
        'Incomplete AI response:',
        parsedResponse
      );

      return res.status(500).json({
        message:
          'AI generated incomplete email data. Please try again.'
      });
    }

    // -----------------------------
    // Save generation history
    // -----------------------------
    const historyEntry = await EmailHistory.create({
      userId: req.user._id,
      prompt: prompt.trim(),
      subject: emailData.subject,
      emailBody: emailData.emailBody,
      linkedInDM: emailData.linkedInDM,
      followUpEmail: emailData.followUpEmail
    });

    // -----------------------------
    // Send response to frontend
    // -----------------------------
    return res.status(200).json(historyEntry);

  } catch (error) {
    console.error(
      'AI Generation Error:',
      error.response?.data || error.message
    );

    // -----------------------------
    // Rate limit
    // -----------------------------
    if (error.response?.status === 429) {
      return res.status(429).json({
        message:
          'Too many requests. Please wait a moment before trying again.',
        error: 'Rate limit exceeded'
      });
    }

    // -----------------------------
    // Authentication error
    // -----------------------------
    if (error.response?.status === 401) {
      return res.status(500).json({
        message: 'AI authentication failed',
        error:
          'Please check the GROQ_API_KEY in server/.env'
      });
    }

    // -----------------------------
    // Model error
    // -----------------------------
    if (error.response?.status === 400) {
      return res.status(500).json({
        message: 'AI request was rejected',
        error:
          error.response?.data?.error?.message ||
          error.message
      });
    }

    // -----------------------------
    // Generic error
    // -----------------------------
    return res.status(500).json({
      message: 'Failed to generate email',
      error:
        error.response?.data?.error?.message ||
        error.message
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await EmailHistory
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json(history);

  } catch (error) {
    console.error(
      'History fetch error:',
      error.message
    );

    return res.status(500).json({
      message: 'Failed to fetch history'
    });
  }
};