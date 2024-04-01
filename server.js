const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

const app = express();

const authors = [
  { id: 1, name: "J.K.Rowling" },
  { id: 2, name: "Me" },
  { id: 3, name: "Bosoo" },
  { id: 4, name: "UUgii" },
];

const books = [
  { id: 1, name: "Harry Poter 1 section", authorId: 1 },
  { id: 2, name: "Hard Lesson", authorId: 2 },
  { id: 3, name: "Life of Lie", authorId: 3 },
  { id: 4, name: "Fortune to be black", authorId: 4 },
];

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "this represents a book written by an author",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.id);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "this represents an author",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Test for Root Query",
  fields: () => ({
    SingleBook: {
      type: BookType,
      description: "this is single book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "All List of books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "All List of Authors",
      resolve: () => authors,
    },
    singleAuthor: {
      type: AuthorType,
      description: "This is a single author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: () => ({
    addBook: {
      type: BookType,
      description: "Add a Book",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const existingBook = books.find(
          (book) => book.name === args.name && book.authorId === args.authorId
        );
        if (existingBook) {
          throw new Error("This book already exists.");
        }
        const newBook = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(newBook);
        return newBook;
      },
    },
    addAuthor: {
      type: AuthorType,
      description: "Add a new author",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const existingAuthor = authors.find(
          (author) => author.id === args.id && author.name === args.name
        );
        if (existingAuthor) {
          throw new Error("The given Author already exists");
        }
        const newAuthor = {
          id: authors.length + 1,
          name: args.name,
          id: args.id,
        };
        authors.push(newAuthor);
        return newAuthor;
      },
    },
  }),
});

const testSchema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: testSchema,
    graphiql: true,
  })
);

app.listen(3000, () => console.log("server is running"));
