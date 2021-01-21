import { ApolloServer } from 'apollo-server'
import { loadTypeSchema } from './utils/schema'
import { authenticate } from './utils/auth'
import { merge } from 'lodash'
import config from './config'
import { connect } from './db'
import product from './types/product/product.resolvers'
import coupon from './types/coupon/coupon.resolvers'
import user from './types/user/user.resolvers'

const types = ['product', 'coupon', 'user']

export const start = async () => {
  const rootSchema = `
    type Cat {
      name: String
      age: Int!
      bestFriend: Cat!
    }

    input CatInput {
      name: String
      age: Int!
      bestFriend: Cat!
    }

    type Query {
      myCat: Cat
      hello: String
    }

    type Mutation {
      newCat(input: catInput!): Cat!
    }

    schema {
      query: Query
    }
  `
  const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  const server = new ApolloServer({
    // eslint-disable-next-line spaced-comment
    typeDefs: [rootSchema /*, ...schemaTypes*/],
    resolvers: {
      Query: {
        myCat() {
          return {
            name: 'Garfield',
            bestFriend: {
              name: 'Tony',
              bestFriend: {}
            }
          }
        },
        hello() {
          return 'hello'
        }
      }
    },
    context({ req }) {
      return { user: null }
    }
    // resolvers: merge({}, product, coupon, user),
    // async context({ req }) {
    //   const user = await authenticate(req)
    //   return { user }
    // }
  })

  await connect(config.dbUrl)
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}
