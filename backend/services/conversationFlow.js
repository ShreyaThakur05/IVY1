export class ConversationFlow {
  constructor() {
    this.sessionStates = new Map();
  }

  initializeSession(sessionId, persona) {
    this.sessionStates.set(sessionId, {
      currentState: 'LISTENING', // SPEAKING, LISTENING, WAITING_FOR_USER
      lastAIResponse: null,
      turnCount: 0,
      persona
    });
  }

  getSessionState(sessionId) {
    return this.sessionStates.get(sessionId) || { currentState: 'LISTENING' };
  }

  // Enforce conversation flow rules
  processUserInput(sessionId, userInput) {
    const state = this.getSessionState(sessionId);
    
    // User spoke - AI should now respond and then enter listening mode
    state.currentState = 'SPEAKING';
    state.turnCount += 1;
    
    this.sessionStates.set(sessionId, state);
    return state;
  }

  processAIResponse(sessionId, aiResponse) {
    const state = this.getSessionState(sessionId);
    
    // AI has spoken - now must enter listening mode
    state.currentState = 'LISTENING';
    state.lastAIResponse = aiResponse;
    
    this.sessionStates.set(sessionId, state);
    return state;
  }

  // Generate AI response with conversation flow awareness
  generateContextualResponse(context, history, userInput, persona) {
    const basePrompt = `You are ${persona}, conducting a professional interview.

CRITICAL CONVERSATION RULES:
1. After each response, you MUST stop speaking and wait for the user
2. Ask ONE question or make ONE statement per turn
3. Do NOT chain multiple questions together
4. Do NOT continue speaking after your response
5. Keep responses focused and concise (under 50 words)
6. Wait for user input before continuing

Current context: ${context}
User just said: "${userInput}"

Respond appropriately and then STOP. Wait for the user's next input.`;

    return basePrompt;
  }

  // Validate that AI response follows conversation flow rules
  validateAIResponse(response) {
    const violations = [];
    
    // Check for multiple questions (indicates chaining)
    const questionCount = (response.match(/\?/g) || []).length;
    if (questionCount > 2) {
      violations.push('Multiple questions detected - should ask one at a time');
    }
    
    // Check for continuation phrases that indicate monologuing
    const continuationPhrases = [
      'also', 'additionally', 'furthermore', 'moreover', 
      'let me also ask', 'another question', 'and tell me'
    ];
    
    const lowerResponse = response.toLowerCase();
    continuationPhrases.forEach(phrase => {
      if (lowerResponse.includes(phrase)) {
        violations.push(`Continuation phrase detected: "${phrase}"`);
      }
    });
    
    // Check length (should be concise)
    if (response.length > 300) {
      violations.push('Response too long - should be concise');
    }
    
    return {
      isValid: violations.length === 0,
      violations
    };
  }

  cleanup(sessionId) {
    this.sessionStates.delete(sessionId);
  }
}

export const conversationFlow = new ConversationFlow();