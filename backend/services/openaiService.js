import Groq from "groq-sdk";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { conversationFlow } from "./conversationFlow.js";

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

export async function generateRAGResponse(context, history, userInput, sessionId = null, persona = null) {
  const MAX_CONTEXT_KZ = 15000;
  const safeContext = context.substring(0, MAX_CONTEXT_KZ);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are ${persona || 'an expert interviewer'} conducting a real-time interview.

CRITICAL CONVERSATION RULES:
1. After your response, you MUST stop speaking and wait for the user
2. Ask ONE question or make ONE statement per turn
3. Do NOT chain multiple questions together
4. Do NOT continue speaking after your response
5. Keep responses focused and concise (under 50 words)
6. Enter LISTENING MODE after each response

CONTEXT FOR INTERVIEW: 
"${safeContext}"

CONVERSATION HISTORY:
${history.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`).join('\n')}

CANDIDATE'S LATEST RESPONSE: "${userInput}"

INSTRUCTIONS:
- If there's document content in the context, ask specific questions about it
- Ask ONE clear, relevant follow-up question based on the candidate's last answer and the Context
- Reference specific details from the document or topic when possible
- If the candidate's answer is vague, ask them to elaborate with specific examples
- Keep your response conversational but professional
- Maximum response length: 2 sentences
- After your response, STOP and wait for user input

Generate your follow-up question:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    // Validate conversation flow
    if (sessionId) {
      const validation = conversationFlow.validateAIResponse(aiResponse);
      if (!validation.isValid) {
        console.warn(`[FLOW] Response validation failed:`, validation.violations);
      }
      conversationFlow.processAIResponse(sessionId, aiResponse);
    }
    
    return aiResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    try {
      const messages = [
        {
          role: "system",
          content: `You are ${persona || 'an expert interviewer'} conducting a real-time interview.
          
          CRITICAL CONVERSATION RULES:
          1. After your response, you MUST stop speaking and wait for the user
          2. Ask ONE question or make ONE statement per turn
          3. Do NOT chain multiple questions together
          4. Keep responses focused and concise (under 50 words)
          
          CONTEXT FOR INTERVIEW: 
          "${safeContext}"
          
          INSTRUCTIONS:
          - Ask ONE clear, relevant follow-up question based on the candidate's last answer and the Context.
          - Keep your response conversational but professional.
          - If the candidate's answer is vague, ask them to elaborate with specific examples.
          - Reference specific details from their response or the context.
          - Maximum response length: 2 sentences.
          - After your response, STOP and wait for user input.`,
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

      const aiResponse = completion.choices[0].message.content;
      
      // Validate conversation flow for fallback too
      if (sessionId) {
        conversationFlow.processAIResponse(sessionId, aiResponse);
      }
      
      return aiResponse;
    } catch (groqError) {
      console.error("GROQ Fallback Error:", groqError);
      const fallbackResponse = "Could you tell me more about your experience with that?";
      
      if (sessionId) {
        conversationFlow.processAIResponse(sessionId, fallbackResponse);
      }
      
      return fallbackResponse;
    }
  }
}