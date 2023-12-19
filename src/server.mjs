import { WebSocketServer } from 'ws';

export const runServer = (port, pubsub) => {
    const server = new WebSocketServer({ port });
  
    server.on('connection', socket => {
      socket.on('error', console.error);
      socket.send('Socket connected!');
      console.log('Socket connected!')
  
      socket.on('message', data => {
        console.log('received: %s', data);
        pubsub.publish(data.toString())
      });
  
      const send = (message) => {
        console.log(`subscriber from port ${port}`, message)
        socket.send(message)
      }
  
      pubsub.subscribe(send)
  
      socket.on('close', (code, reason) => {
        pubsub.unsubscribe(send)
      })
  
    });
  }