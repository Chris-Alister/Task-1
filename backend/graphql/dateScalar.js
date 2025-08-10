const { GraphQLScalarType, GraphQLError } = require('graphql');
const { Kind } = require('graphql/language');

const DateType = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize: (value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value).toISOString();
    }
    throw new GraphQLError('Value is not a valid Date: ' + value);
  },
  parseValue: (value) => {
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new GraphQLError('Value is not a valid Date: ' + value);
      }
      return date;
    }
    throw new GraphQLError('Value is not a valid Date: ' + value);
  },
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) {
        throw new GraphQLError('Value is not a valid Date: ' + ast.value);
      }
      return date;
    }
    throw new GraphQLError('Value is not a valid Date: ' + ast.value);
  }
});

module.exports = DateType;
