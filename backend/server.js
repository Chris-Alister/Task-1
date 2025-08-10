const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const mongoose = require('mongoose');
require('dotenv').config();

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { getUser } = require('./graphql/context');

async function startServer() {
  // MongoDB Connection
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-mark-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true, // Enable GraphQL Playground in development
    csrfPrevention: false, // Disable CSRF protection for development
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code,
        path: error.path,
      };
    },
  });

  const PORT = process.env.PORT || 5000;

  // Start the server
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async ({ req }) => {
      const user = await getUser(req);
      return { user };
    },
  });

  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 GraphQL Playground available at ${url}`);
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});