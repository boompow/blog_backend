import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import dbConnect from "./dbConnect.js";

// init the app
const app = express();

// run the mongoose server
dbConnect();

// setup the middleware
// header middleware
app.use(helmet());
app.use(cors()); // the origin is not specified, please do

//body middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// root route
app.get("/", (req, res) => {
  res.send("200! Server is running...");
});

// start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
