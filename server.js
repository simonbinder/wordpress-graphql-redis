import express from 'express';
import bodyParser from 'body-parser';
import {graphqlExpress, graphiqlExpress} from 'graphql-server-express'
import typeDefs from './schema';
import resolvers from './resolvers';
import {makeExecutableSchema} from "graphql-tools";
import Redis from "ioredis";
import compression from "compression";
import {ApolloServer} from "apollo-server-express";
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import cluster from 'cluster';
import {GraphQLExtension} from "graphql-extensions";

export const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const numCPUs = 7;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`)
    })
} else {
    const redis = new Redis();
    const posts = new Redis({keyPrefix: 'post:*'});

    const PORT = 4000;

    const app = express();

// bodyParser is needed just for POST.
    app.use('/graphql', bodyParser.json(), graphqlExpress({schema, context: {redis, posts}}));

    const server = new ApolloServer({
        schema, context: {redis, posts}, plugins: [responseCachePlugin()],
    });
    server.applyMiddleware({app, path: "/"});

    app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))
    app.use(compression());

    app.listen(PORT);

    console.log(`Process ${process.pid} started`)
}
