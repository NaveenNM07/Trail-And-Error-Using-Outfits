import { GoogleGenAI } from "@google/genai";
import { TryOnRequest } from "../types";

// Helper to strip the data URL prefix (e.g., "data:image/png;base64,")
const stripBase64Prefix = (base64: string): string => {
  return base64.split(',')[1] || base64;
};

// Helper to determine mime type from base64 header or default to png
const getMimeType = (base64: string): string => {
  const match = base64.match(/^data:(.+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

export const generateTryOnLook = async (request: TryOnRequest): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const personData = stripBase64Prefix(request.personImage.base64);
  const personMime = getMimeType(request.personImage.base64);

  const outfitData = stripBase64Prefix(request.outfitImage.base64);
  const outfitMime = getMimeType(request.outfitImage.base64);

  // Construct a prompt that clearly directs the model to perform the virtual try-on
  // We explicitly label the images in the prompt sequence.
  const prompt = `
    Perform a photorealistic virtual try-on.
    Image 1 is the PERSON.
    Image 2 is the OUTFIT.
    
    Task: Put the outfit from Image 2 onto the person in Image 1.
    
    Requirements:
    1. Do NOT change the person's pose, body shape, or facial features.
    2. Maintain the exact lighting, shadows, and background environment of Image 1 (the person's image).
    3. Ensure the outfit from Image 2 is accurately represented, including texture, fabric details, and accessories if present.
    4. The fit should look natural and realistic, respecting the person's posture.
    5. ${request.userInstructions || "Create a cohesive, high-fashion look."}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: personMime,
              data: personData
            }
          },
          {
            inlineData: {
              mimeType: outfitMime,
              data: outfitData
            }
          }
        ]
      },
      config: {
        // "3:4" is generally good for fashion/portrait shots, but "1:1" is safer if inputs vary wildly. 
        // Let's use 3:4 to encourage a full portrait look.
        imageConfig: {
            aspectRatio: "3:4"
        }
      }
    });

    // The model returns parts; we need to find the image part.
    // Usually it's in the candidates[0].content.parts
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini.");
    }

    const parts = candidates[0].content.parts;
    let generatedImageBase64: string | null = null;

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        generatedImageBase64 = part.inlineData.data;
        break; 
      }
    }

    if (!generatedImageBase64) {
       // Fallback: sometimes the model might return text if it refused the request?
       // Check for text refusal or error
       const textPart = parts.find(p => p.text);
       if (textPart) {
         console.warn("Model returned text instead of image:", textPart.text);
         throw new Error("The model could not generate the image. It might have violated safety policies or the prompt was unclear.");
       }
       throw new Error("No image data found in response.");
    }

    return `data:image/png;base64,${generatedImageBase64}`;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};