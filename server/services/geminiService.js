// Step 8: Implementing Gemini Service
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateAIResponse = async (message, history) => {
  try {
    // Format conversation history for context
    let conversationContext = "";
    if (history && history.length > 0) {
      conversationContext = "Previous conversation:\n" +
        history.map(msg => {
          let messageString = "";
          
          if (msg.content) {
            messageString += `Message: ${msg.content}\n`;
          }
          
          if (msg.summary) {
            messageString += `Summary: ${msg.summary}\n`;
          }
          
          if (msg.question) {
            messageString += `Question: ${msg.question}\n`;
          }
          
          return `${msg.isUser ? 'User' : 'AI'}:\n${messageString}`;
        }).join("\n") + "\n\n";
    }

    // if (history.length > 0) {
    //   conversationContext = "Previous conversation:\n" + 
    //     history.map(msg => {
    //       const content = msg.isUser ? msg.message : `${msg.summary || ''}\n${msg.question || ''}`;
    //       return `${msg.isUser ? 'User' : 'AI'}: ${content}`;
    //     }).join('\n') + 
    //     "\n\n";
    // }

    // Create prompt for Gemini
    const prompt = `${conversationContext}
      You are an Active Listener AI. Your goal is to:
      1. Listen carefully to what the user shares
      2. Provide a thoughtful summary that shows you understand their message
      3. Ask a meaningful follow-up question that encourages deeper reflection

      User's message: "${message}"

      Respond in the following format:
      SUMMARY: [A concise summary showing you understand what they've shared. Be empathetic and reflective.]
      QUESTION: [A single, thoughtful follow-up question. Keep it open-ended and focused on the user's sharing.]

      Maintain an empathetic tone, but keep your response concise.`;

    // Get response
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the response
    const summaryMatch = responseText.match(/SUMMARY:\s*([\s\S]*?)(?=QUESTION:|$)/i);
    const questionMatch = responseText.match(/QUESTION:\s*([\s\S]*?)(?=$)/i);

    const summary = summaryMatch ? summaryMatch[1].trim() : "I understand what you're saying.";
    const question = questionMatch ? questionMatch[1].trim() : "Is there anything else you'd like to talk about?";

    return {
      summary,
      question,
      message: `${summary}\n\n${question}`
    };
  } catch (error) {
    console.error('Gemini service error:', error);
    return {
      summary: "I apologize, but I had trouble processing your message.",
      question: "Could you please share your thoughts again?",
      message: "I apologize, but I had trouble processing your message. Could you please share your thoughts again?"
    };
  }
};