import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  senderName: String,
  senderContact: String,
  message: String,
  time: String,
  group: String
});

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema, 'chats');
