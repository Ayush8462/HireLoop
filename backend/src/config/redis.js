import redis from "redis";

const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.on("connect", () => {
  console.log("✅ Redis connected");
});

client.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

export const connectRedis = async () => {
  await client.connect();
}

export default client;