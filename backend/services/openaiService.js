import Groq from "groq-sdk";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function transcribeAudio(filePath) {
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-large-v3",
      language: "en",
    });
    return transcription.text;
  } catch (error) {
    console.error("GROQ Whisper Error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

export async function generateRAGResponse(context, history, userInput) {
  const MAX_CONTEXT_KZ = 15000;
  const safeContext = context.substring(0, MAX_CONTEXT_KZ);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are an expert interviewer conducting a real-time interview.

CONTEXT FOR INTERVIEW: 
"${safeContext}"

CONVERSATION HISTORY:
${history.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`).join('\n')}

CANDIDATE'S LATEST RESPONSE: "${userInput}"

INSTRUCTIONS:
- Ask ONE clear, relevant follow-up question based on the candidate's last answer and the Context.
- Keep your response conversational but professional.
- If the candidate's answer is vague, ask them to elaborate with specific examples.
- Reference specific details from their response or the context.
- Maximum response length: 2 sentences.

Generate your follow-up question:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    try {
      const messages = [
        {
          role: "system",
          content: `You are an expert interviewer conducting a real-time interview.
          
          CONTEXT FOR INTERVIEW: 
          "${safeContext}"
          
          INSTRUCTIONS:
          - Ask ONE clear, relevant follow-up question based on the candidate's last answer and the Context.
          - Keep your response conversational but professional.
          - If the candidate's answer is vague, ask them to elaborate with specific examples.
          - Reference specific details from their response or the context.
          - Maximum response length: 2 sentences.`,
        },
        ...history.map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })),
        { role: "user", content: userInput },
      ];

      const completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.1-8b-instant",
        max_tokens: 150,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (groqError) {
      console.error("GROQ Fallback Error:", groqError);
      return "Could you tell me more about your experience with that?";
    }
  }
}