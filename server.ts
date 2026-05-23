import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization of Gemini API client
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing. Configure it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Local fallback parser for robustness or offline use
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Organize Raw Scratchpad using Gemini
  app.post("/api/organize-scratchpad", async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text field is required." });
    }

    try {
      const api_key = process.env.GEMINI_API_KEY;
      if (!api_key) {
        console.log("No GEMINI_API_KEY found, running local heuristic fallback.");
        return res.json({ tasks: fallbackParse(text), mode: "heuristics" });
      }

      const ai = getGemini();
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
      res.json({ tasks, mode: "gemini" });
    } catch (error: any) {
      console.error("Gemini Scratchpad Parser error:", error);
      // Fallback seamlessly so the customer experience remains incredible
      res.json({
        tasks: fallbackParse(text),
        mode: "heuristics",
        warning: error.message || "Parse exception occurred"
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Error starting server:", err);
});
