import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";
import { authors } from "./Authors.js";
import { books } from "./Books.js";

const app = express();

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
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
  description: "This represents an author",
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
  description: "Root Query",
  fields: () => ({
    SingleBook: {
      type: BookType,
      description: "This is a single book",
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

const PORT = 3000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
