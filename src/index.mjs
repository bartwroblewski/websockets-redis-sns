import { redisPubSub } from './pubsub/redis.mjs';
import { SNSPubSub } from './pubsub/sns.mjs';
import { runServer } from './server.mjs'

const pubsub = await SNSPubSub()
// const pubsub = await redisPubSub('notifications')

runServer(8887, pubsub)
runServer(8889, pubsub)
