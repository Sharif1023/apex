
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateProductDescription(productName: string, features: string[]): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a compelling, SEO-friendly e-commerce product description for a shoe named "${productName}". Key features: ${features.join(', ')}. Target audience: Quality-conscious fashionistas in Bangladesh.`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });
    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI description unavailable at this time.";
  }
}

export async function getProductAdvice(query: string, products: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert fashion consultant for an e-commerce store. Answer the following customer question: "${query}". Here is our current catalog context: ${products}. Provide a helpful, concise recommendation.`,
    });
    return response.text || "I'm not sure, but I recommend checking our bestsellers!";
  } catch (error) {
    return "Our AI assistant is resting. Please try again later.";
  }
}
