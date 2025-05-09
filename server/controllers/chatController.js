const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatController = {
    async getChatResponse(req, res) {
        try {
            const { messages } = req.body;

            if (!messages || !Array.isArray(messages)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid messages format'
                });
            }

            console.log('Received chat request with messages:', messages);

            // Get the model
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            // Add system prompt and format conversation
            const systemPrompt = `You are a helpful farming assistant. Your role is to:
1. Provide practical farming advice and solutions
2. Help with crop selection and management
3. Answer questions about agricultural practices
4. Give weather-based farming recommendations
5. Explain farming techniques and best practices

Keep your responses:
- Concise and practical
- Focused on farming and agriculture
- Easy to understand
- Based on scientific principles
- Helpful for both small and large-scale farmers

Format your responses with:
- Use numbered headings for main sections (e.g., 1. Site Selection)
- Use dashes (-) for bullet points under each section
- Do not mix dashes and numbers on the same line
- No special characters or markdown symbols

If asked about non-farming topics, politely redirect to farming-related subjects.`;

            // Convert messages to a single prompt with system instructions
            const prompt = `${systemPrompt}\n\nConversation:\n` +
                messages.map(msg =>
                    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
                ).join('\n') + '\nAssistant:';

            // Generate response
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Clean up the response
            let cleanedText = text
                .replace(/^\s*Assistant:\s*/i, '') // Remove leading "Assistant:" if present
                .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
                .replace(/(\d+)\.\s*-+\s*/g, '$1. ') // Clean up numbered headings with dashes
                .replace(/^-+\s*/gm, '- ') // Clean up bullet points
                .replace(/\*\*/g, '') // Remove double asterisks
                .replace(/\*/g, '') // Remove single asterisks
                .replace(/_{2,}/g, '') // Remove underscores
                .replace(/`/g, '') // Remove backticks
                .replace(/#{1,6}\s*/g, '') // Remove markdown headings
                .trim();

            res.json({
                success: true,
                message: {
                    role: 'assistant',
                    content: cleanedText
                }
            });
        } catch (error) {
            console.error('Chat API Error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get response from AI',
                error: error.message
            });
        }
    }
};

module.exports = chatController; 