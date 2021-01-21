import { ApolloServer } from 'apollo-server'
import { loadTypeSchema } from './utils/schema'
import { merge } from 'lodash'
import config from './config'
import { connect } from './db'
import product from './types/product/product.resolvers'
import coupon from './types/coupon/coupon.resolvers'
import user from './types/user/user.resolvers'

const types = ['product', 'coupon', 'user']

export const start = async () => {
  const rootSchema = `
    type Car {
      owner: Owner!
      name: String!
      age: Int
    }

    type Owner {
      name: String
      cat: Cat!
    }

    type Query {
      cat(name: String!): Cat!
      owner(name: String!): Owner!
    }

    schema {
      query: Query
    }
  `
  const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  const server = new ApolloServer({
    typeDefs: [rootSchema, ...schemaTypes],
    resolvers: {
      Query: {
        cat(_, args, ctx, info) {
          return {
            // eslint-disable-next-line spaced-comment
            /*name: args.name, age: 3, owner: {} */
          }
        },
        owner(_, args) {
          return {
            // eslint-disable-next-line spaced-comment
            /*name: args.name, cat: {} */
          }
        }
      },
      Cat: {
        name() {
          return 'Daryl'
        },
        age() {
          return 2
        },
        owner() {
          return {}
        }
      },
      Owner: {
        name() {
          return 'Scott'
        },
        cat() {
          return {}
        }
      }
    },
    context({ req }) {
      // use the authenticate function from utils to auth req, its Async!
      return { user: null }
    }
  })

  await connect(config.dbUrl)
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}
