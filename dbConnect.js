import mongoose from "mongoose";
import "dotenv/config";

const dbConnect = async () => {
  mongoose.connect(process.env.MONGODB_URI);

  mongoose.connection.on("connected", () => {
    console.log("200: connected to MongoDB Atlas successfully!");
  });

  mongoose.connection.on("error", (err) => {
    console.log(`Failed connection \n ${err}`);
  });
};

export default dbConnect;
