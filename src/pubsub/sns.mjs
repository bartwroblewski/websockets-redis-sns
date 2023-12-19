
import { PublishCommand } from "@aws-sdk/client-sns";
import { SNSClient } from "@aws-sdk/client-sns";
import express from 'express'

// The AWS Region can be provided here using the `region` property. If you leave it blank
// the SDK will default to the region set in your AWS config.
const snsClient = new SNSClient({
  region: 'us-east-1',
  credentials: {
    // I took those credentials from "barciewicz" user (who is part of a group that has full access to SNS) I created in IAM
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

console.log(process.env)

// snsClient.send(
//     new SubscribeCommand({
//       Protocol: "email",
//       TopicArn: topicArn,
//       Endpoint: emailAddress,
//     }),
//   );

export const publish = async (
  message = "Hello from SNS!",
  topicArn = 'arn:aws:sns:us-east-1:387828446052:websockets-notifications-topic',
) => {
  const response = await snsClient.send(
    new PublishCommand({
      Message: message,
      TopicArn: topicArn,
    }),
  );
  return response;
};

const toObservable  = (obj) => ({
  ...obj,
  subscribers: new Array(),
  subscribe(subscriber) {
    this.subscribers.push(subscriber)
  },
  unsubscribe(subscriber) {
    this.subscribers.pop(subscriber)
  },
  notify(data) {
    this.subscribers.forEach(subscriber => subscriber(data))
  },
})

// HTTP server that subscribes to SNS messages and passes them via websocket
export const httpServer  = toObservable({
  run: function() {
    const app = express();
    const port = 3000;
    app.use(express.json());
    app.listen(port, () => console.log(`SNS App listening on port ${port}!`));
    app.get('/', (req, res) => {
      return res.json({hi: 'there'})
    })
    app.post('/receive', (req, res) => {
      const { message } = req.body
      this.notify(message)
      return res.json({status: "ok"})
    })
  },
})

export const SNSPubSub = async () => {
    httpServer.run()
    return {
        subscribe: (f) => httpServer.subscribe(f),
        unsubscribe: (f) => httpServer.unsubscribe(f),
        publish: (data) => publish(data),
    }
}
