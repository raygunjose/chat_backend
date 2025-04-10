import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { graphqlHTTP } from 'express-graphql';
import { readFileSync } from 'fs';
import path from 'path';
import { buildSchema } from 'graphql';
import { request, gql } from 'graphql-request';
import { resolvers } from './graphql/resolvers.js';

// Express app setup
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// MongoDB (optional)
mongoose.connect('mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Load GraphQL schema from file
const __dirname = path.resolve();
const schemaString = readFileSync(path.join(__dirname, 'graphql/schema.graphql'), 'utf8');
const schema = buildSchema(schemaString);

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolvers,
  graphiql: true
}));

// Default route
app.get('/', (req, res) => {
  res.send('Chat server is running with GraphQL & Socket.IO');
});

// GraphQL client config
const GRAPHQL_ENDPOINT = 'http://localhost:3000/graphql';
const ADD_CHAT_MESSAGE = gql`
  mutation AddChatMessage($input: ChatMessageInput!) {
    addChatMessage(input: $input) {
      senderName
    }
  }
`;

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('message', async ({ username, message }) => {
    const log = {
      senderName: username,
      senderContact: "1234567890",
      message,
      time: new Date().toISOString(),
      group: "public"
    };

    io.emit('message', { username, message });

    try {
      await request(GRAPHQL_ENDPOINT, ADD_CHAT_MESSAGE, { input: log });
      console.log('Message saved via GraphQL');
    } catch (error) {
      console.error('GraphQL error:', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
  console.log('GraphQL at http://localhost:3000/graphql');
});
