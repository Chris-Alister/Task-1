const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { getUser } = require('./context');

module.exports = {
  typeDefs,
  resolvers,
  getUser
};
