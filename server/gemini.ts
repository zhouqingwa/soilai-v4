import { GoogleGenAI, Type } from '@google/genai';

type AnalyzePlantInput = {
  base64Data?: string;
  mimeType?: string;
  userQuestion?: string;
  isPro?: boolean;
  basicSummary?: string;
};

type GenerateIllustrationInput = {
  species?: string;
};

type GenerateCareGuideInput = {
  plantName?: string;
};

const getGeminiBaseUrl = () => {
  const baseUrl = process.env.GEMINI_BASE_URL?.trim();
  if (!baseUrl) return undefined;

  if (process.env.NODE_ENV === 'production' && !baseUrl.startsWith('https://')) {
    throw new Error('GEMINI_BASE_URL must use https in production.');
  }

  return baseUrl;
};

const getGeminiClient = () => {
  const apiKey = process.env.CUSTOM_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const baseUrl = getGeminiBaseUrl();

  return new GoogleGenAI({
    apiKey,
    ...(baseUrl ? { httpOptions: { baseUrl } } : {})
  });
};

const parseGeminiJson = (text?: string) => {
  if (!text) return {};
  try {
    // If it's already perfectly valid JSON (especially since we use responseMimeType), just parse it directly.
    return JSON.parse(text.trim());
  } catch (e) {
    console.warn("Direct JSON parsing failed, attempting cleanup...");
    // Fallback cleanup if the model still wrapped it in markdown
    const match = text.match(/```json\n([\s\S]*?)\n```/i);
    let cleanText = text;
    if (match) {
      cleanText = match[1].trim();
    } else {
      cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    }

    // Find the first '{' and last '}' to extract just the JSON object
    const startIdx = cleanText.indexOf('{');
    const endIdx = cleanText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleanText = cleanText.substring(startIdx, endIdx + 1);
    }

    try {
      return JSON.parse(cleanText);
    } catch (finalError) {
      console.error("Failed to parse Gemini response JSON.", text.substring(0, 200) + "...");
      throw finalError;
    }
  }
};

export const analyzePlant = async ({ base64Data, mimeType, userQuestion, isPro, basicSummary }: AnalyzePlantInput) => {
  if (!base64Data || !mimeType) {
    throw new Error('Missing image data.');
  }

  const ai = getGeminiClient();

  const basicPrompt = `You are the "Sarcastic Plant Professor," a brilliant but grumpy botanical expert who is tired of seeing amateur plant parents accidentally killing easy plants. Your tone must be cynical, witty, direct, humorous, and slightly condescending, but your underlying botanical assessment must be strictly accurate.

Analyze the provided plant image. Identify the plant species and honestly assess its health condition. Be absolutely deterministic and precise.

Your JSON output must exactly match this structure:
{
  "basic": {
    "species": "Latin and Common name",
    "coreName": "The base species name without varieties (e.g., 'Monstera').",
    "risk": "Healthy" | "Moderate" | "High" | "Critical" | "Dead" | "N/A",
    "isPlantOrAnimal": true if real plant/animal/human, false if inanimate object,
    "killerTitle": "A highly creative, funny, and shareable 'Title' or 'Alias' based on the plant's condition (e.g., 'SERIAL PLANT CHOKER'). Must be UPPERCASE.",
    "summary": "1-2 short paragraphs highlighting the main problem. Playfully tease their care habits. CRITICAL: You MUST use Markdown bold (**like this**) to highlight key botanical terms, symptoms, or actions in your text so the UI can style them dynamically.",
    "mainIssue": "Short, clear diagnosis of the main issue (or confirmation of health).",
    "warning": "A short, sarcastic warning about what happens if they keep doing what they're doing.",
    "basicCareRule": "One simple, immediate rule they must follow right now.",
    "recommendedProducts": [
      {
        "name": "Product Name",
        "reason": "Sarcastic reason why they desperately need this.",
        "searchKeyword": "amazon search keyword"
      }
    ]
  },
  "proPreview": {
    "teaserSummary": "1-2 sentences playfully offering a much deeper, step-by-step intervention to truly save this plant. Point out that the basic diagnosis only tells them what's wrong, but the full plan tells them exactly what to do next.",
    "lockedSections": [
      "Professor's Step-by-Step Rescue Plan",
      "7-Day Recovery Schedule",
      "Specific Environmental Adjustments",
      "Common Mistakes to Avoid",
      "Botanical Deep Dive Analysis",
      "Professor's Prescriptions"
    ]
  }
}

CRITICAL: Return strictly JSON.

User's specific question: ${userQuestion || 'No specific question provided.'}`;

  const proPrompt = `You are the "Sarcastic Plant Professor". The user has unlocked the full Pro diagnosis for the provided plant image.
${basicSummary ? `\nYou previously provided this basic diagnosis:\n"${basicSummary}"\nDo NOT repeat this information.` : ''}

Provide a highly detailed, sarcastic, yet botanically accurate professional rescue plan.

Your JSON output must exactly match this structure:
{
  "pro": {
    "deepDive": "A highly detailed botanical deep dive explaining the science behind why the plant is suffering (or thriving). Do not repeat the basic summary! Build upon it by explaining the underlying physiological/biological mechanisms, keeping the sarcastic tone. CRITICAL: You MUST use Markdown bold (**like this**) to highlight key botanical terms. DO NOT include '**' unless it wraps text precisely with no spaces.",
    "stepByStepPlan": [
      "A specific, actionable step to start rescuing.",
      "Another step."
    ],
    "recoverySchedule": [
      {
        "day": "Day 1",
        "action": "What to do",
        "whatToWatch": "What signs to look for"
      },
      {
        "day": "Day 3-4",
        "action": "...",
        "whatToWatch": "..."
      },
      {
        "day": "Day 7",
        "action": "...",
        "whatToWatch": "..."
      }
    ],
    "environmentalAdjustments": {
      "light": "Practical, easy-to-understand light advice (e.g. 'Put it near a window where you can easily read a book without a lamp' instead of '400 foot-candles').",
      "water": "Relatable and actionable watering advice (e.g. 'Water it like you would a sponge you want to keep barely damp', not technical jargon).",
      "soil": "Simple soil advice that a regular person can understand without being a chemist.",
      "humidity": "Practical humidity advice (e.g., 'Group it with other plants or stick it in your bathroom' instead of 'Maintain 60% relative humidity')."
    },
    "mistakesToAvoid": [
      "Common mistake 1",
      "Common mistake 2"
    ],
    "recommendedProducts": [
      {
        "name": "Product Name",
        "reason": "Sarcastic reason why they desperately need this.",
        "searchKeyword": "amazon search keyword"
      }
    ]
  }
}

CRITICAL: Return strictly JSON.

User's specific question: ${userQuestion || 'No specific question provided.'}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
        {
          text: isPro ? proPrompt : basicPrompt,
        },
      ],
    },
    config: {
      responseMimeType: 'application/json',
      temperature: 0.0,
    },
  });

  const parsedResponse = parseGeminiJson(response.text);
  return parsedResponse;
};

export const analyzeFullProPlant = async ({ base64Data, mimeType, userQuestion }: AnalyzePlantInput) => {
  const basicResult = await analyzePlant({
    base64Data,
    mimeType,
    userQuestion,
    isPro: false,
  });

  const summary = basicResult?.basic?.summary || basicResult?.summary || '';
  const proResult = await analyzePlant({
    base64Data,
    mimeType,
    userQuestion,
    basicSummary: summary,
    isPro: true,
  });

  return {
    ...basicResult,
    pro: proResult?.pro,
    billing: {
      usedScanPoint: true,
      mode: 'full-pro',
    },
  };
};

export const generateIllustration = async ({ species }: GenerateIllustrationInput) => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A beautiful botanical illustration of ${species || 'a plant'}, clean background.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return {
          imageData: part.inlineData.data,
          imageType: part.inlineData.mimeType || 'image/png',
        };
      }
    }
  } catch (error: any) {
    console.warn('Failed to generate illustration:', error.message);
  }

  return { imageData: null, imageType: null };
};

export const generateCareGuide = async ({ plantName }: GenerateCareGuideInput) => {
  if (!plantName) {
    throw new Error('Missing plant name.');
  }

  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide care guide information for the plant: ${plantName}. Keep the description short (1-2 sentences).`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          difficulty: { type: Type.STRING, description: 'e.g., Easy, Medium, Hard' },
          desc: { type: Type.STRING, description: 'A short 1-2 sentence description of the plant and its care.' },
          bgColor: { type: Type.STRING, description: 'A hex color code suitable for the background of this plant card (e.g., #E8F3E8)' },
          textColor: { type: Type.STRING, description: 'A hex color code for the text on the card, contrasting with bgColor (e.g., #2D4A22)' },
        },
        required: ['difficulty', 'desc', 'bgColor', 'textColor'],
      },
    },
  });

  return parseGeminiJson(response.text);
};
