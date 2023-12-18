import { WebSocketServer } from 'ws';
import redis from 'redis';
 
var redisClient = redis.createClient({socket: {host: 'redis'}});
redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect();

const subscriber = redisClient.duplicate();
await subscriber.connect();

const wss = new WebSocketServer({ port: 8887 });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');

  subscriber.subscribe('notifications', (message) => {
    console.log(message);
    ws.send(message)
  });
});