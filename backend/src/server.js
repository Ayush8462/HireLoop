import "dotenv/config";
import app from "./app.js";
import connectDB from './config/db.js';
import { createServer } from "node:http";
import { connectRedis } from './config/redis.client.js';



const port = process.env.PORT || 3000;
const server = createServer(app);

const startServer = async () => {
  try {
    //connect database
    await connectDB();

    // connect redis if configured
    await connectRedis();

    server.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`)
    })
  } catch (err) {
    console.error("❌ Failed to connect to the database:", err);
    process.exit(1);

  }
}

startServer();

