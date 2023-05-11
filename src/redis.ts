import { createClient, RedisClientType } from "redis";

export let redisClient: RedisClientType;

(async () => {
  redisClient = createClient({
    url: process.env.REDIS_DB,
  });

  redisClient.on("error", (err) => console.log("Redis Client Error", err));

  await redisClient.connect();
})();

export interface RedisClient {
  get<T>(key: string): Promise<T>;
  set<T>(
    key: string,
    value: T,
    checkIfCreated?: boolean
  ): Promise<void | boolean>;
  del(key: string): Promise<void>;
}

export class Redis implements RedisClient {
  redis: RedisClientType;
  constructor() {
    this.redis = redisClient;
  }

  async get<T>(key: string): Promise<T> {
    const get = await this.redis.get(key);
    return JSON.parse(get as string);
  }

  async set<T>(
    key: string,
    value: T,
    checkIfCreated?: boolean
  ): Promise<void | boolean> {
    const object = JSON.stringify(value);
    await this.redis.set(key, object);
    if (checkIfCreated) {
      const newObject = await this.redis.get(key);
      return newObject === object;
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
