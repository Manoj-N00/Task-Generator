import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

// 🔹 Debugging: Check available models
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => console.log("Available Models:", data))
  .catch(err => console.error("Error fetching models:", err));

// ✅ Ensure genAI is initialized
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateTasks(topic: string): Promise<string[]> {
  try {
    console.log("Google API Key:", apiKey);

    // ✅ Use "gemini-1.5-pro" instead of "gemini-pro"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Create 5 specific, actionable learning tasks for ${topic}. Each task should be:
    - Clear and concise
    - Practical and achievable
    - Focused on a single learning objective
    - Written in an active voice
    Format as plain text, one task per line.`;

    console.log("Sending prompt:", prompt);

    const result = await model.generateContent(prompt);
    console.log("API Response:", result);

    // ✅ Fix: Get text content correctly
    const text = await result.response.text();

    console.log("Generated Tasks:", text);

    // ✅ Clean and format tasks
    const tasks = text
      .split("\n")
      .map(task => task
        .trim()
        .replace(/^[-*•]|\d+\.\s+/, "") // Remove bullets, numbers, etc.
        .replace(/^(Task|Step)\s*:?\s*/i, "") // Remove "Task:" or "Step:" prefixes
        .trim()
      )
      .filter(task => task.length > 0)
      .slice(0, 5);

    if (tasks.length < 1) {
      throw new Error("No valid tasks were generated");
    }

    while (tasks.length < 5) {
      tasks.push(`Study ${topic} fundamentals - Part ${tasks.length + 1}`);
    }

    return tasks;
  } catch (error) {
    console.error("Error generating tasks:", error);
    throw new Error("Failed to generate tasks. Please try again.");
  }
}
