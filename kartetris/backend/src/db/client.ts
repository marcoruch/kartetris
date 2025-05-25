import { MongoClient, ServerApiVersion } from "mongodb";

export const getClient = (mongoUri: string): MongoClient => new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});