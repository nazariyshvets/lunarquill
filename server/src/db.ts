import { connect } from "mongoose";

const connection = async () => {
  try {
    await connect(process.env.DB_URL!);
    console.log("MongoDB successfully connected");
  } catch (error) {
    console.error("Failed to connect to database");
  }
};

export default connection;
