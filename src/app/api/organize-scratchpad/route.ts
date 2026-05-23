import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

function fallbackParse(text: string) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  return lines.map((line) => {
    let category = "Focus";
    let textCleaned = line;
    let priority = "Medium";

    const lower = line.toLowerCase();
    if (lower.includes("email") || lower.includes("sarah") || lower.includes("write")) {
      category = "Email";
      textCleaned = "Email " + line.replace(/^(email|write about|send email to)\s*/i, "");
    } else if (lower.includes("rent") || lower.includes("pay") || lower.includes("bill")) {
      category = "Rent";
      textCleaned = "Rent payment (" + line.replace(/^(pay|rent|bill)\s*/i, "") + ")";
      priority = "High";
    } else if (lower.includes("grocery") || lower.includes("groceries") || lower.includes("buy") || lower.includes("eggs") || lower.includes("milk")) {
      category = "Grocery";
      textCleaned = "Grocery run: " + line.replace(/^(buy|get|groceries|grocery)\s*/i, "");
    } else if (lower.includes("call") || lower.includes("phone")) {
      category = "Call";
      textCleaned = "Call " + line.replace(/^(call|phone|ring)\s*/i, "");
    } else {
      category = "Organized";
    }

    // Capitalize first letter
    textCleaned = textCleaned.charAt(0).toUpperCase() + textCleaned.slice(1);
    // Remove ending dots or punctuation
    textCleaned = textCleaned.replace(/[.!,]+$/, "");

    return {
      text: textCleaned,
      category,
      priority,
      completed: false
    };
  });
}

export async function POST(request: Request) {
  let text = "";
  try {
    const body = await request.json();
    text = body.text;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text field is required." }, { status: 400 });
    }

    const api_key = process.env.GEMINI_API_KEY;
    if (!api_key) {
      console.log("No GEMINI_API_KEY found, running local heuristic fallback.");
      return NextResponse.json({ tasks: fallbackParse(text), mode: "heuristics" });
    }

    const ai = new GoogleGenAI({
      apiKey: api_key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `You are an expert ADHD coach and cognitive calm systems designer.
Analyze this messy unorganized scratchpad brain-dump and organize it into a clean, structured set of actionable micro-tasks (maximum of 5). 
Filter out sensory noise (like "oh and", "damn I forgot", etc.) and focus on discrete tasks.

Here is the raw scratchpad:
"""
${text}
"""

Return a structured JSON array representing the organized tasks.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "Clean, human-readable clear task (e.g. 'Email Sarah re: Project X', 'Call Mom'). Keep it under 6 words."
              },
              category: {
                type: Type.STRING,
                description: "The primary category descriptor (e.g., 'Email', 'Rent', 'Grocery', 'Call', 'Personal', 'Focus')."
              },
              priority: {
                type: Type.STRING,
                description: "High, Medium, Focus, or Low."
              },
              completed: {
                type: Type.BOOLEAN,
                description: "Set to false."
              }
            },
            required: ["text", "category", "priority", "completed"]
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini.");
    }

    const tasks = JSON.parse(responseText.trim());
    return NextResponse.json({ tasks, mode: "gemini" });
  } catch (error: any) {
    console.error("Gemini Scratchpad Parser error:", error);
    return NextResponse.json({
      tasks: fallbackParse(text),
      mode: "heuristics",
      warning: error.message || "Parse exception occurred"
    });
  }
}
