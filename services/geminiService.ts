
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const suggestionSchema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: "A concise idea for a mind map node.",
      },
    },
  },
  required: ["suggestions"],
};

export const getAISuggestions = async (
  nodePath: string[]
): Promise<string[]> => {
  if (!API_KEY) {
    // Return mock data if API key is not available
    return new Promise(resolve => setTimeout(() => resolve([
        "Mock Idea 1",
        "Mock Idea 2",
        "Mock Idea 3",
        "Mock Idea 4",
        "Mock Idea 5",
    ]), 1000));
  }
  
  const currentNodeName = nodePath[nodePath.length - 1];
  const pathString = nodePath.join(" -> ");

  const prompt = `You are an expert mind mapping assistant. A user is working on a mind map and has selected a node.
  The path to the current node is: "${pathString}".
  The current node is: "${currentNodeName}".
  Generate exactly 5 distinct, concise, and creative ideas that could branch off from the current node. The ideas should be short phrases suitable for a mind map.
  Your response must be a JSON object with a single key "suggestions" which is an array of 5 strings.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema,
        temperature: 0.8,
      },
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);
    return parsed.suggestions || [];
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    return [];
  }
};
