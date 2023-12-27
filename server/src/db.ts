import { connect } from "mongoose";

const connection = async () => {
  try {
    await connect(process.env.DB_URL!);
    console.log("MongoDB successfully connected");
  } catch (error) {
    console.log("Failed to connect to database");
  }
};

export default connection;
