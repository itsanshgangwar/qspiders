//! create an express server and check if it's working

import express from "express";
import cors from "cors"; // cross origin resource sharing (browser blocks the request which comes from anywhere but localhost:8000)
// 1) we are importing express module which we installed using npm i
import dotenv from "dotenv";
import path from "path";

dotenv.config();

import { connectDB } from "./config/database-config.js";
import userRoutes from "./routes/auth-route.js";
import sessionRoutes from "./routes/session-route.js";
import aiRoutes from "./routes/ai-route.js";

// 2) call/invoke the function
let app = express(); // object = {listen}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
  }),
);

app.use(express.urlencoded({ extended: true }));// this 
app.use(express.json());

app.use("/api/auth", userRoutes); // http://localhost:9001/api/auth/signup
app.use("/api/sessions", sessionRoutes);
app.use("/api/ai", aiRoutes);

// Note: Static files served separately by frontend deployment

// Connect to database
await connectDB();

// Export the app for Vercel
export default app;

// For local development
const PORT = process.env.PORT || 9001;

app.listen(PORT, () => {
  console.log(`Server Started on port ${PORT}.....`);
});
// app.listen(PORT_NUMBER, callback)

//! to check if the server is running, in cmd(git bash), goto backend folder and type "npx nodemon index.js"
// open browser -> localhost:PORT_NUMBER and press enter

// https://nodejs.org/en/ (/) =>  this is base url
// https://nodejs.org/en/blog => /blog is one endpoint
// https://nodejs.org/en/download

// https://github.com/Sarvesh-1999/NIGHT-CODING-MARATHON
