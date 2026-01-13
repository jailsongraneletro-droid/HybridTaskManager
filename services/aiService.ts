
import { GoogleGenAI, Type } from "@google/genai";
import { Task, BoardData } from "../types";

export const AIService = {
  generateTasks: async (prompt: string, boardData: BoardData): Promise<Partial<Task>[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const availablePriorities = boardData.priorities.map(p => p.id).join(", ");
    const firstColumn = boardData.columnOrder[0] || "To Do";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of tasks to achieve the following: "${prompt}". 
      Use only these priority IDs: [${availablePriorities}]. 
      Assign all tasks to status ID: "${firstColumn}".
      Generate between 5 to 8 tasks.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  status: { type: Type.STRING },
                  dueDate: { type: Type.STRING, description: "ISO Date string, set to a reasonable future date" }
                },
                required: ["title", "description", "priority", "status", "dueDate"]
              }
            }
          },
          required: ["tasks"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || '{"tasks": []}');
      return data.tasks;
    } catch (e) {
      console.error("Failed to parse AI response", e);
      return [];
    }
  }
};
