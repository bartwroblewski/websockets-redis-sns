import redis from 'redis';
 


export const redisPubSub = async (channel) => {
    const redisClient = redis.createClient({socket: {host: 'redis'}});
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();

    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    const publisher = redisClient.duplicate();
    await publisher.connect();

    return {
        subscribe: (f) => subscriber.subscribe(channel, f),
        unsubscribe: (f) => subscriber.unsubscribe(channel, f),
        publish: (data) => publisher.publish(channel, data),
    }
}