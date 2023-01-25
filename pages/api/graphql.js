import { PrismaClient } from "@prisma/client"
import Cors from "micro-cors"
import { ApolloServer, gql } from "apollo-server-micro"

const prisma = new PrismaClient()
const cors = Cors()

const typeDefs = gql`
    type Token {
        address: String
        name: String
        symbol: String
        decimals: Int
    }

    type Query {
        token: [Token]!
        getTokenByAddress(address: String): Token
        getTokenBySymbol(symbol: String): Token
    }

    type Mutation {
        addToken(address: String, name: String, symbol: String, decimals: Int): Token!
        deleteWithAddress(address: String): Token!
    }
`

const resolvers = {
    Query: {
        token: async (_parent, _args, _context) => await prisma.token.findMany(),
        getTokenByAddress: async (_parent, { address }, _content) =>
            await prisma.token.findUnique({
                where: {
                    address: address,
                },
            }),

        getTokenBySymbol: async (_parent, { symbol }, _content) =>
            await prisma.token.findUnique({
                where: {
                    symbol: symbol,
                },
            }),
    },

    Mutation: {
        addToken: async (_parent, { address, name, symbol, decimals }, _context) => {
            try {
                return await prisma.token.create({ data: { address, name, symbol, decimals } })
            } catch (e) {
                return e
            }
        },

        deleteWithAddress: async (_parent, { address }, _context) =>
            await prisma.token.delete({ where: { address } }),
    },
}

const apolloServer = new ApolloServer({ typeDefs, resolvers })
const startServer = apolloServer.start()

export default cors(async function handler(req, res) {
    if (req.method === "OPTIONS") {
        res.end()
        return false
    }
    await startServer
    apolloServer.createHandler({ path: "/api/graphql" })(req, res)
})

export const config = { api: { bodyParser: false } }
