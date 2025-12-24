
import { GoogleGenAI, Type } from "@google/genai";
import { DataListItem } from "../types";

// Initialize the client
// NOTE: In a real production app, never expose keys in client-side code.
// This is strictly for the requested playground environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates structured data for the DataList component using the AI Model.
 * It uses the 'gemini-3-pro-preview' model with high thinking budget for complex reasoning
 * if the user asks for derived data (e.g., "Analyze stocks and show top 5").
 */
export const generateMockData = async (userPrompt: string): Promise<DataListItem[]> => {
  try {
    const modelId = 'gemini-3-pro-preview';

    const prompt = `
      You are Orion AI, a specialized Data Generator for a UI library.
      
      User Request: "${userPrompt}"
      
      Your task is to generate a JSON array of items suitable for a dashboard list component.
      
      Each item must strictly follow this schema:
      - id: string (unique)
      - title: string (main text)
      - subtitle: string (secondary text, short description)
      - value: string (numeric value, price, or metric)
      - badge: string (short status label like 'High', 'Buy', '+5%')

      Generate 3 to 6 items.
      Ensure the data is realistic and strictly matches the user's request.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              value: { type: Type.STRING },
              badge: { type: Type.STRING }
            },
            required: ['id', 'title']
          }
        },
        // Using high thinking budget as requested for complex query handling capability
        thinkingConfig: {
          thinkingBudget: 32768 
        } 
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data as DataListItem[];
    }
    
    throw new Error("No data returned from AI");

  } catch (error) {
    console.error("AI API Error:", error);
    throw error;
  }
};
