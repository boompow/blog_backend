import mongoose from "mongoose";
import "dotenv/config";

const dbConnect = async () => {
  mongoose.connect(process.env.DB);

  mongoose.connection.on("connected", () => {
    console.log("200: connected successfully!");
  });

  mongoose.connection.on("error", (err) => {
    console.log(`Failed connection \n ${err}`);
  });
};

export default dbConnect;
