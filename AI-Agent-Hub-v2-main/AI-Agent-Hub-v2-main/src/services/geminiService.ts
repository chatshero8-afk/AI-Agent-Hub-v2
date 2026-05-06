import { GoogleGenAI } from "@google/genai";

let aiInstance: any = null;

function getAi() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables. Please configure it in the Secrets panel.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export async function chatWithAgent(
  agentName: string,
  agentRole: string,
  agentDescription: string,
  history: ChatMessage[],
  userInput: string
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }

  const systemInstruction = `You are ${agentName}, the ${agentRole}. 
Your background: ${agentDescription}.
Maintain this persona at all times. Use a tone appropriate for your department and role. 
Keep responses concise but flavorful, reflecting your unique character.`;

  const response = await getAi().models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [...history, { role: 'user', parts: [{ text: userInput }] }],
    config: {
      systemInstruction,
    },
  });

  return response.text;
}

export async function generateAgentImages(
  name: string,
  role: string,
  department: string,
  count: number = 3
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const ai = getAi();

  const prompts = [
    `A high-quality 3D chibi-style character render of '${name}', a ${role} in the ${department} department. Style: 3D vinyl toy, large head, simple black curved eyes, rounded proportions, matte clay texture, vibrant solid colors. The character is centered against a clean white background, looking like a collectible game miniature.`,
    `A stylized 3D toy figure of ${name}, representing their role as ${role}. Chibi art style, smooth 3D surfaces, vibrant ${department} themed palette, minimalist cute features, high-detail soft studio lighting, professional character design, 3D render.`,
    `A unique 3D character model of ${name} the ${role}. 3D chibi aesthetic, thick rounded edges, glossy toy accents, expressive simple face, part of an elite collectible set, soft ambient occlusion, high-end mobile game character style.`
  ];

  const results: string[] = [];

  for (let i = 0; i < Math.min(count, prompts.length); i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompts[i] }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      if (response && response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            results.push(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Image gen error:', err);
      // Fallback if AI gen fails or quota hit
      results.push(`https://picsum.photos/seed/${role}-${i}/800/800`);
    }
  }

  return results;
}
