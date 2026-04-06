import dotenv from 'dotenv';
import app from "./app.js";
import connectDB from './config/db.js';
import { createServer } from "node:http";

dotenv.config()

const port = process.env.PORT || 3000;
const server = createServer(app);

connectDB()
  .then(()=>{
    server.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`)
    })
  })
  .catch((err)=>{
    console.error("❌ Failed to connect to the database:", err);
    process.exit(1);
  })