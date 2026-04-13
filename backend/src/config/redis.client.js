import redis from "redis";

const redisUrl = process.env.REDIS_URL;
let client = null;
let redisEnabled = false;
let startupErrorLogged = false;

if (redisUrl) {
  client = redis.createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: () => false
    }
  });

  client.on("connect", () => {
    console.log("Redis connected");
  });

  client.on("error", (err) => {
    if (redisEnabled) {
      console.error(`Redis error: ${err.message}`);
    }
  });
}

const runIfReady = async (operation, fallbackValue) => {
  if (!redisEnabled || !client?.isOpen) {
    return fallbackValue;
  }

  try {
    return await operation();
  } catch (error) {
    console.warn(`Redis operation skipped: ${error.message}`);
    return fallbackValue;
  }
};

export const connectRedis = async () => {
  if (!redisUrl) {
    console.warn("Redis disabled: REDIS_URL is not set. Continuing without cache.");
    return false;
  }

  try {
    await client.connect();
    redisEnabled = true;
    return true;
  } catch (error) {
    redisEnabled = false;

    if (!startupErrorLogged) {
      console.warn(`Redis unavailable: ${error.message}. Continuing without cache.`);
      startupErrorLogged = true;
    }

    return false;
  }
};

const redisClient = {
  get isReady() {
    return Boolean(redisEnabled && client?.isOpen);
  },
  async get(key) {
    return runIfReady(() => client.get(key), null);
  },
  async set(key, value, options) {
    return runIfReady(() => client.set(key, value, options), null);
  },
  async del(key) {
    return runIfReady(() => client.del(key), 0);
  }
};

export default redisClient;
