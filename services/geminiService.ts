import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedCode, Message } from "../types";

// Initialize Gemini Client
// Ensure API_KEY is present in environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are Mourish, an expert full-stack AI software engineer and app builder.
Your goal is to generate complete, functional, and aesthetically pleasing code based on user requests.

RULES:
1.  **Web Apps**: If the user asks for a web application (website, dashboard, calculator, etc.), generate a SINGLE HTML file.
    *   Include all CSS (use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>).
    *   Include all JavaScript inside <script> tags.
    *   Ensure the UI is modern, using dark mode by default unless specified otherwise.
    *   Do NOT include markdown code fences (e.g., \`\`\`html) in the 'code' field.
2.  **Other Languages & Previews**: 
    *   If the user asks for a visual application (e.g., "snake game in python", "calculator in C++"), **prefer generating an HTML/JS Web Application** version instead. This allows the user to preview and interact with the app immediately in the browser. Explain in the 'explanation' field that you adapted it to the web for preview purposes.
    *   If the user strictly asks for a specific language snippet (e.g., "Write a Python script to sort a list"), provide the raw code in that language.
3.  **Modifications**: If the user provides 'currentCode' context, strictly apply their requested changes to that code.
4.  **Format**: You must return a JSON object adhering to the schema provided.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    code: {
      type: Type.STRING,
      description: "The complete source code. For web apps, this is the full HTML string.",
    },
    language: {
      type: Type.STRING,
      description: "The programming language (e.g., 'html', 'python', 'javascript').",
    },
    explanation: {
      type: Type.STRING,
      description: "A very brief summary of what was built or changed (max 2 sentences).",
    },
  },
  required: ["code", "language", "explanation"],
};

export const generateAppCode = async (
  prompt: string,
  history: Message[],
  currentCode: string | null
): Promise<GeneratedCode> => {
  try {
    // Construct the full prompt context
    let fullPrompt = `User Request: ${prompt}\n`;

    if (currentCode) {
      fullPrompt += `\n--- Current Existing Code ---\n${currentCode}\n---------------------------\n
      Instruction: Update the existing code above based on the user request. Return the FULL updated code, not just the diff.`;
    }

    // Add simplified history context (last 6 turns)
    const recentHistory = history.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
    if (recentHistory) {
        fullPrompt = `Conversation History:\n${recentHistory}\n\n${fullPrompt}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for precise code generation
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(text) as GeneratedCode;
    return data;

  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};