import { ChatMessage } from '../models/ChatMessage.js';

export const resolvers = {
  hello: () => 'Hello from GraphQL!',

  addChatMessage: async ({ input }) => {
    try {
      const newMessage = new ChatMessage(input);
      await newMessage.save();
      console.log("Saved to MongoDB:", input);
      return { senderName: input.senderName };
    } catch (error) {
      console.error("MongoDB Save Error:", error.message);
      throw new Error("Failed to save message to database");
    }
  }
};
