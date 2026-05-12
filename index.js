const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const http = require('http');
const { typeDefs } = require('./Schema/index');
const { resolvers } = require('./resolvers/index');
require('dotenv').config();
const mongoose = require('mongoose');
async function startApolloServer(typeDefs, resolvers){
    const app = express();
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await server.start();
    server.applyMiddleware({ app }); 
    await new Promise(resolve => httpServer.listen({ port: process.env.PORT }, resolve));
    console.log(`Server ready at http://localhost:${process.env.PORT}${server.graphqlPath}`);
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to MongoDB');
    return { server, app };
}

startApolloServer(typeDefs, resolvers);
