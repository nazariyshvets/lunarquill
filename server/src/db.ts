import { MongoClient, GridFSBucket } from "mongodb";
import { connect } from "mongoose";

let mongoClient: MongoClient | null = null;

const getMongoClient = async () => {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.DB_URL!);
    await mongoClient.connect();
    console.log("MongoDB connected");
  }

  return mongoClient;
};

const getGridFSBucket = async (bucketName: string) => {
  const client = await getMongoClient();
  const database = client.db();

  return new GridFSBucket(database, { bucketName });
};

const connection = async () => {
  try {
    await connect(process.env.DB_URL!);
    console.log("MongoDB successfully connected");
  } catch (error) {
    console.error("Failed to connect to database");
  }
};

process.on("SIGINT", async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log("MongoDB connection closed");
  }

  process.exit(0);
});

export default connection;
export { getMongoClient, getGridFSBucket };
