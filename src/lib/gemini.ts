import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(env.googleApiKey);

export async function generateTasks(topic: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Create 5 specific, actionable learning tasks for ${topic}. Each task should be:
- Clear and concise
- Practical and achievable
- Focused on a single learning objective
- Written in an active voice
Format as plain text, one task per line.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Split by newlines and clean up each task
    const tasks = text
      .split('\n')
      .map(task => task
        .trim()
        .replace(/^[-*•]|\d+\.\s+/, '') // Remove bullets, numbers, etc.
        .replace(/^(Task|Step)\s*:?\s*/i, '') // Remove "Task:" or "Step:" prefixes
        .trim()
      )
      .filter(task => task.length > 0)
      .slice(0, 5);

    if (tasks.length < 1) {
      throw new Error('No valid tasks were generated');
    }

    // Pad with default tasks if we got fewer than 5
    while (tasks.length < 5) {
      tasks.push(`Study ${topic} fundamentals - Part ${tasks.length + 1}`);
    }

    return tasks;
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw new Error('Failed to generate tasks. Please try again.');
  }
}