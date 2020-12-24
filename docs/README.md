![Telegraf](https://raw.githubusercontent.com/telegraf/telegraf/develop/docs/header.png)

# Introduction

Bots are special [Telegram](https://telegram.org) accounts designed to handle messages automatically.
Users can interact with bots by sending them command messages in private or group chats.
These accounts serve as an interface for code running somewhere on your server.

Telegraf is a library that makes it simple for you to develop your own Telegram bots using [TypeScript](https://www.typescriptlang.org/) or JavaScript running in Node.js.

## Features

- Full [Telegram Bot API 5.0](https://core.telegram.org/bots/api) support
- Written in TypeScript including 100 % Bot API type coverage
- [Inline mode](https://core.telegram.org/bots/api#inline-mode)
- Incredibly fast
- [Telegram Payment Platform](https://telegram.org/blog/payments)
- [HTML5 Games](https://core.telegram.org/bots/api#games)
- [Firebase](https://firebase.google.com/products/functions/)/[Glitch](https://dashing-light.glitch.me)/[Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction)/[AWS **λ**](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html)/Whatever ready
- `http/https/fastify/Connect.js/express.js` compatible webhooks
- Easy to extend

## Installation

```shellscript
npm install telegraf --save
```

## Getting started

Get your bot token from [@BotFather](https://t.me/BotFather). Next, run this code:

```ts
import { Telegraf } from 'telegraf'

// Create a new bot
const bot = new Telegraf('<your token here>')
// Respond to text messages
bot.on('text', (ctx) => ctx.reply('Yay, some text from you!'))
// Launch!
bot.launch()
```

**Congratulations!**
You have successfully created your first Telegram bot.
You can run it with `node bot.js`.
Send a text message to it and watch it respond!

Here is a more complex example.

```ts
import { Telegraf } from 'telegraf'

// Get bot token from environment variable
const bot = new Telegraf(process.env.BOT_TOKEN)

// Command handling
// (command shortcuts exist for /start, /help, and /settings)
bot.start((ctx) => ctx.reply('You sent the /start command!'))
bot.command('telegraf', (ctx) => ctx.reply('❤️'))
bot.command('pic', (ctx) =>
  ctx.replyWithPhoto({ url: 'https://source.unsplash.com/random' })
)

// Listen to different kinds of messages
bot.on('text', (ctx) => ctx.reply('Nice words!'))
bot.on('animation', (ctx) =>
  ctx.reply('It is pronounced <i>GIF</i>.', { parse_mode: 'HTML' })
)

// Listen to different types of updates
bot.on('message', (ctx) => ctx.reply('Cool message!'))
bot.on('edited_message', (ctx) =>
  ctx.reply('You just edited this!', {
    reply_to_message_id: ctx.editedMessage.message_id,
  })
)

// Catch errors
bot.catch(async (err, ctx) => {
  console.error(`Error while processing update ${ctx.update.update_id}`, err)
})

bot.launch().catch((err) => console.error('Could not start bot!', err))

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
```

Every time you register a listener (they are called “middleware”) for a certain kind of message, you get access to a _context object_.
We call it `ctx`.
The context object [holds relevant information](https://telegraf.js.org/#/?id=context) such as the chat of the incoming message, the user who sent that message, and of course the message itself.

The context also [allows you to easily interact](https://telegraf.js.org/#/?id=shortcuts) with the message, such as sending a new message in the same chat, or deleting the received message.
These interactions wrap regular methods of the Telegram Bot API and pre-supply information such as the `chat_id`, which is very convenient.
(If you want to call the raw Telegram API yourself, you can do this via `ctx.telegram`.)

See the [`examples`](https://github.com/telegraf/telegraf/tree/master/docs/examples) folder for additional bot examples.

<!--
TODO: update all links in this file

TODO: split this file across several pages
-->

## Resources

- [API Reference](https://telegraf.js.org/)
- Telegram groups (sorted by number of members):
  - [Russian](https://t.me/telegraf_ru)
  - [English](https://t.me/TelegrafJSChat)
  - [Uzbek](https://t.me/telegrafJS_uz)
  - [Ethiopian](https://t.me/telegraf_et)
- [GitHub Discussions](https://github.com/telegraf/telegraf/discussions)

## Telegraf Bots In-Depth

### Telegram Token

To use the [Telegram Bot API](https://core.telegram.org/bots/api), you first have to [get a bot account](https://core.telegram.org/bots) by [chatting with BotFather](https://core.telegram.org/bots#6-botfather).
BotFather will give you a _token_, something like `123456789:AbCdfGhIJKlmNoQQRsTUVwxyZ`.
This token will be used by Telegraf to identify as your bot and send messages on its behalf.

### Bot

A Telegraf bot is an object containing an array of middlewares which are composed and executed in a stack-like manner upon request. Is similar to many other middleware systems that you may have encountered such as Express, Koa, Ruby's Rack, Connect.

### Middleware

Middleware is an essential part of any modern framework.
It allows you to modify requests and responses as they pass between Telegram and your bot.

You can imagine middleware as a chain of logic that each request from Telegram passes through.
This chain of logic is implemented as a list of concatenated functions that operate on a context object, and that are called one-by-one.
Each of them receives the result of its predecessor.

Middleware normally takes the two parameters: **`ctx`** and **`next`**.

**`ctx`** is the context for one [Telegram update](https://core.telegram.org/bots/api#update).
It mainly contains three things:

- the update object, containing for example the incoming message and the respective chat, and
- a number of useful shortcuts to access value inside the update, such as `ctx.message` for `ctx.update.message`.
- a number of useful methods for reacting to the update, such as replying to the message or answering a callback query.

See [the context section](https://telegraf.js.org/#/?id=context) below for a detailed overview.

**`next`** is a function that is invoked to execute the downstream middleware.
It returns a `Promise` with a function `then` for running code after completion.

Here is a simple example for how to use middleware to track the response time, using `async` and `await` to deal with the `Promise`.

```ts
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log('Response time: %sms', ms)
})

bot.on('text', (ctx) => ctx.reply('Hello World'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
```

Note how the function `next` is used to invoke the subsequent layers of the middleware stack, performing the actual processing of the update (in this case, replying with “Hello World”).

### What You Can Do with Middleware

Middleware is an extremely flexible concept that can be used for a myriad of things, including these:

- storing data per chat, per user, you name it
- allowing access to old messages (by storing them)
- making internationalization available
- rate limiting
- tracking response times (see above)
- much more

All important kinds of middleware have already been implemented, and the community keeps on adding more.
Just install a package via `npm`, add it to your bot, and you're ready to go.

Here is a list of

### Known Middleware

- [Internationalization](https://github.com/telegraf/telegraf-i18n)—simplifies selecting the right translation to use when responding to a user.
- [Redis powered session](https://github.com/telegraf/telegraf-session-redis)—store session data using Redis.
- [Local powered session (via lowdb)](https://github.com/RealSpeaker/telegraf-session-local)—store session data in a local file.
- [Rate-limiting](https://github.com/telegraf/telegraf-ratelimit)—apply rate limitting to chats or users.
- [Bottleneck powered throttling](https://github.com/KnightNiwrem/telegraf-throttler)—apply throttling to both incoming updates and outgoing API calls.
- [Menus via inline keyboards](https://github.com/EdJoPaTo/telegraf-inline-menu)—simplify creating interfaces based on menus.
- [Stateless Questions](https://github.com/EdJoPaTo/telegraf-stateless-question)—create stateless questions to Telegram users working in privacy mode.
- [Natural language processing via wit.ai](https://github.com/telegraf/telegraf-wit)
- [Natural language processing via recast.ai](https://github.com/telegraf/telegraf-recast)
- [Multivariate and A/B testing](https://github.com/telegraf/telegraf-experiments)—add experiments to see how different versions of a feature are used.
- [Powerfull bot stats via Mixpanel](https://github.com/telegraf/telegraf-mixpanel)
- [statsd integration](https://github.com/telegraf/telegraf-statsd)
- [and more...](https://www.npmjs.com/search?q=telegraf-)

### Error Handling

By default, Telegraf will print all errors to `stderr` and rethrow error.

Use following snippet to perform custom error-handling logic:

```ts
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.catch((err, ctx) => {
  console.log(`Oops, encountered an error for ${ctx.updateType}`, err)
})
bot.start((ctx) => {
  throw new Error('Example error')
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
```

### Context

A Telegraf context encapsulates one Telegram update.
The context is created per request and contains these properties.

<!-- TODO: link -->

```ts
bot.use((ctx) => {
  // this is how you can access the above properties
  console.log(ctx.message)
})
```

#### Shortcuts

In addition to various properties, a context object provides a number of shortcuts.

<!-- TODO: link -->

They are convenient wrappers around the Telegram API that operate in the context of the incoming message.

```ts
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.command('quit', (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id)

  // Using context shortcut
  ctx.leaveChat()
})

bot.on('text', (ctx) => {
  // Explicit usage
  ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`)

  // Using context shortcut
  ctx.reply(`Hello ${ctx.state.role}`)
})

bot.on('callback_query', (ctx) => {
  // Explicit usage
  ctx.telegram.answerCbQuery(ctx.callbackQuery.id)

  // Using context shortcut
  ctx.answerCbQuery()
})

bot.on('inline_query', (ctx) => {
  const result = []
  // Explicit usage
  ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

  // Using context shortcut
  ctx.answerInlineQuery(result)
})

bot.launch()
```

#### Extending Context

The recommended way to extend the bot's context:

```ts
import { Context, Telegraf } from 'telegraf'

// You can skip this interface declaration if you're not using TypeScript.
interface BotContext extends Context {
  // define the types of custom properties here
  db: {
    getScores: (username: string) => number
  }
}

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN)

// set properties that will be available to every context object
bot.context.db = {
  getScores: () => {
    return 42
  },
}

bot.on('text', (ctx) => {
  const scores = ctx.db.getScores(ctx.from.username)
  return ctx.reply(`${ctx.from.username}: ${scores}`)
})

bot.launch()
```

### State

The recommended namespace to share information between middlewares is `ctx.state`.
If you are using TypeScript, you have to extend the `Context` type and declare your own properties.

```ts
import { Context, Telegraf } from 'telegraf'

// You can skip this interface declaration if you're not using TypeScript.
interface BotContext extends Context {
  // define the types of custom properties here
  state: {
    role: string
  }
}

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN)

// Naive authorization middleware
bot.use((ctx, next) => {
  ctx.state.role = getUserRole(ctx.message)
  return next()
})

bot.on('text', (ctx) => {
  return ctx.reply(`Hello ${ctx.state.role}`)
})

bot.launch()
```

### Session

Sessions are used to store data per user or per chat (or per whatever if you want, this is the _session key_).

Think of a session as an object that can hold any kind of information you provide.
This could be the ID of the last message of the bot, or simply a counter about how many photos a user already sent to the bot.

You can use session middleware to add sessions support to your bot.
This will do the heavy lifting for you.
Using session middleware will result in a sequence like this:

1. A new update comes in.
2. The session middleware loads the current session data for the respective chat/user/whatever.
3. The session middleware makes that session data available on the context object `ctx`.
4. Your middleware stack is run, all of your code can do its work.
5. The session middleware takes back control and checks how you altered the session data on the `ctx` object.
6. The session middleware write the session back to your storage, i.e. a file, a database, an in-memory storage, or even a cloud storage solution.

Here is a simple example of how the built-in session middleware of Telegraf can be used to count photos.

```ts
import { Context, session, Telegraf } from 'telegraf'

// You can skip this interface declaration if you're not using TypeScript.
interface BotContext extends Context {
  session?: {
    counter: number
  }
}

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN)
bot.use(session())
bot.on('photo', (ctx) => {
  ctx.session ??= { counter: 0 }
  ctx.session.counter++
  return ctx.reply(`Photo counter: ${ctx.session.counter}`)
})

bot.launch()
```

The default session key is <code>`${ctx.from.id}:${ctx.chat.id}`</code>.
If either `ctx.from` or `ctx.chat` is `undefined`, default session key and thus `ctx.session` are also `undefined`.
You can customize the session key resolver function by passing in the options argument:

```ts
import { Context, session, Telegraf } from 'telegraf'

// You can skip this interface declaration if you're not using TypeScript.
interface BotContext extends Context {
  session?: {
    counter: number
  }
}

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN)
bot.use(
  session({
    makeKey: (ctx) => ctx.from?.id, // only store data per user, but across chats
  })
)
bot.on('photo', (ctx) => {
  ctx.session ??= { counter: 0 }
  ctx.session.counter++
  return ctx.reply(`Photo counter: ${ctx.session.counter}`)
})

bot.launch()
```

**Tip: To use same session in private chat with bot and in inline mode, use following session key resolver:**

```ts
{
  makeKey: (ctx) => {
    if (ctx.from && ctx.chat) {
      return `${ctx.from.id}:${ctx.chat.id}`
    } else if (ctx.from && ctx.inlineQuery) {
      return `${ctx.from.id}:${ctx.from.id}`
    }
    return undefined
  }
}
```

However, in the above example, the session middleware just stores the counters in-memory.
This means that all counters will be lost when the process is terminated.
If you want to store data across restarts, or share it among workers, you need to use _persistent sessions_.

There are already [a lot of packages](https://www.npmjs.com/search?q=telegraf-session) that make this a breeze.
You can simply add `npm install` one and to your bot to support exactly the type of storage you want.

Alternatively, Telegraf also allows you to easily integrate your own persistence without any other package.
The `session` function can take a `storage` in the options object.
A storage must have three methods: one for loading, one for storing, and one for deleting a session.
This works as follows:

```ts
import { Context, session, Telegraf } from 'telegraf'

// You can skip this interface declaration if you're not using TypeScript.
interface BotContext extends Context {
  session?: {
    counter: number
  }
}

// may also return `Promise`s (or use `async` functions)!
const storage = {
  getItem(key) {
    /* load a session for `key` ... */
  },
  setItem(key, value) {
    /* save a session for `key` ... */
  },
  deleteItem(key) {
    /* delete a session for `key` ... */
  },
}

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN)
bot.use(session({ storage }))
bot.on('photo', (ctx) => {
  ctx.session ??= { counter: 0 }
  ctx.session.counter++
  return ctx.reply(`Photo counter: ${ctx.session.counter}`)
})

bot.launch()
```

### Update Types

You can react to several different types of updates (and types of messages), see the example below.

<!-- TODO: link -->

```ts
// Handle message update
bot.on('message', (ctx) => {
  return ctx.reply('Hello')
})

// Handle sticker or photo update
bot.on(['sticker', 'photo'], (ctx) => {
  console.log(ctx.message)
  return ctx.reply('Cool!')
})
```

[Official Docs](https://core.telegram.org/bots/api#message)

### Webhooks

<!-- TODO: rework everything below this comment -->

```ts
import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.BOT_TOKEN)

// TLS options
const tlsOptions = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  ca: [
    // This is necessary only if the client uses a self-signed certificate.
    fs.readFileSync('client-cert.pem'),
  ],
}

// Set telegram webhook
// The second argument is necessary only if the client uses a self-signed
// certificate. Including it for a verified certificate may cause things to break.
bot.telegram.setWebhook('https://server.tld:8443/secret-path', {
  source: 'server-cert.pem',
})

// Start https webhook
bot.startWebhook('/secret-path', tlsOptions, 8443)

// Http webhook, for nginx/heroku users.
bot.startWebhook('/secret-path', null, 5000)
```

Use `webhookCallback()` if you want to attach Telegraf to an existing http server.

```js
require('http').createServer(bot.webhookCallback('/secret-path')).listen(3000)

require('https')
  .createServer(tlsOptions, bot.webhookCallback('/secret-path'))
  .listen(8443)
```

#### Express.js Example Integration

```js
const { Telegraf } = require('telegraf')
const express = require('express')
const expressApp = express()

const bot = new Telegraf(process.env.BOT_TOKEN)
expressApp.use(bot.webhookCallback('/secret-path'))
bot.telegram.setWebhook('https://server.tld:8443/secret-path')

expressApp.get('/', (req, res) => {
  res.send('Hello World!')
})

expressApp.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
```

#### Fastify Example Integration

You can use `fastify-telegraf` package

```js
const { Telegraf } = require('telegraf')
const fastifyApp = require('fastify')()
const fastifyTelegraf = require('fastify-telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.on('text', ({ reply }) => reply('Hello'))

fastifyApp.register(fastifyTelegraf, { bot, path: '/secret-path' })
// Set telegram webhook
// npm install -g localtunnel && lt --port 3000
bot.telegram.setWebhook('https://------.localtunnel.me/secret-path')

fastifyApp.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
```

#### Koa.js Example Integration

```js
const { Telegraf } = require('telegraf')
const Koa = require('koa')
const koaBody = require('koa-body')

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.telegram.setWebhook('https://server.tld:8443/secret-path')

const app = new Koa()
app.use(koaBody())
app.use(async (ctx, next) => {
  if (ctx.method !== 'POST' || ctx.url !== '/secret-path') {
    return next()
  }
  await bot.handleUpdate(ctx.request.body, ctx.response)
  ctx.status = 200
})
app.use(async (ctx) => {
  ctx.body = 'Hello World'
})

app.listen(3000)
```

### Working with Files

Supported file sources:

- `Existing file_id`
- `File path`
- `Url`
- `Buffer`
- `ReadStream`

Also, you can provide an optional name of a file as `filename` when you send the file.

```js
bot.on('message', (ctx) => {
  // resend existing file by file_id
  ctx.replyWithSticker('123123jkbhj6b')

  // send file
  ctx.replyWithVideo({ source: '/path/to/video.mp4' })

  // send stream
  ctx.replyWithVideo({
    source: fs.createReadStream('/path/to/video.mp4'),
  })

  // send buffer
  ctx.replyWithVoice({
    source: Buffer.alloc(),
  })

  // send url via Telegram server
  ctx.replyWithPhoto('https://picsum.photos/200/300/')

  // pipe url content
  ctx.replyWithPhoto({
    url: 'https://picsum.photos/200/300/?random',
    filename: 'kitten.jpg',
  })
})
```

### Telegram Passport

To enable Telegram Passport support you can use [`telegram-passport`](https://www.npmjs.com/package/telegram-passport) package:

```js
const { Telegraf } = require('telegraf')
const TelegramPassport = require('telegram-passport')

const bot = new Telegraf(process.env.BOT_TOKEN)
const passport = new TelegramPassport('PRIVATE_KEY_IN_PEM_FORMAT')

bot.on('passport_data', (ctx) => {
  const decryptedPasswordData = passport.decrypt(ctx.passportData)
  console.log(decryptedPasswordData)
  return ctx.setPassportDataErrors([
    {
      source: 'selfie',
      type: 'driver_license',
      file_hash: 'file-hash',
      message: 'Selfie photo is too low quality',
    },
  ])
})
```

### Telegraf Modules

Telegraf Modules is higher level abstraction for writing modular Telegram bots.

A module is simply a .js file that exports Telegraf middleware:

```js
module.exports = (ctx) => ctx.reply('Hello from Telegraf Module!')
```

```js
const Composer = require('telegraf/composer')

module.exports = Composer.mount('sticker', (ctx) => ctx.reply('Wow, sticker'))
```

To run modules, you can use Telegraf module runner, it allows you to start Telegraf module easily from the command line.

```shellscript
npm install telegraf -g
```

### Telegraf CLI Usage

```text
telegraf [opts] <bot-file>
  -t  Bot token [$BOT_TOKEN]
  -d  Webhook domain
  -H  Webhook host [0.0.0.0]
  -p  Webhook port [$PORT or 3000]
  -s  Stop on error
  -l  Enable logs
  -h  Show this help message
```

#### Telegraf Module Example

Create module with name `bot.js` and following content:

```js
const Composer = require('telegraf/composer')
const PhotoURL = 'https://picsum.photos/200/300/?random'

const bot = new Composer()
bot.start((ctx) => ctx.reply('Hello there!'))
bot.help((ctx) => ctx.reply('Help message'))
bot.command('photo', (ctx) => ctx.replyWithPhoto({ url: PhotoURL }))

module.exports = bot
```

then run it:

```shellscript
telegraf -t "bot token" bot.js
```

### Stage

Simple scene-based control flow middleware.

```js
const { Telegraf } = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { leave } = Stage

// Greeter scene
const greeter = new Scene('greeter')
greeter.enter((ctx) => ctx.reply('Hi'))
greeter.leave((ctx) => ctx.reply('Bye'))
greeter.hears(/hi/gi, leave())
greeter.on('message', (ctx) => ctx.reply('Send `hi`'))

// Create scene manager
const stage = new Stage()
stage.command('cancel', leave())

// Scene registration
stage.register(greeter)

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())
bot.use(stage.middleware())
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'))
bot.startPolling()
```

Scenes related context props and functions:

```js
bot.on('message', (ctx) => {
  ctx.scene.state // Current scene state (persistent)
  ctx.scene.enter(sceneId, [defaultState, silent]) // Enter scene
  ctx.scene.reenter() // Reenter current scene
  ctx.scene.leave() // Leave scene
})
```

## Community Bots

<!-- Please keep the table sorted -->

| Name                                                                                          | Description                                                                                              |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [BibleBot](https://github.com/Kriv-Art/BibleBot)                                              | Bot to get bible verses                                                                                  |
| [BibleQuizzleBot](https://github.com/Samleo8/BibleQuizzle)                                    | Bible quiz game - group fun similar to Quizzarium                                                        |
| [BitcoinDogBot](https://github.com/jibital/bitcoin-dog-bot)                                   | Bitcoin prices, Technical analysis and Alerts!                                                           |
| [BooksAndBot](https://github.com/dmtrbrl/BooksAndBot)                                         | An inline bot that allows you to search for books and share them in a conversation. Powered by Goodreads |
| [CaptchaOnlyBot](https://github.com/Piterden/captcha_only_bot)                                | Configurable question \w set of buttons on a new group user                                              |
| [ChannelHashBot](https://github.com/YouTwitFace/ChannelHashBot)                               | Keep track of hashtags that are sent in your group by forwarding them to a channel                       |
| [ChatAdmin](https://github.com/Khuzha/chatAdmin)                                              | Helps to administer the chats                                                                            |
| [ChatLinkerBot](https://github.com/jt3k/chat-linker)                                          | The bridge between jabber and telegram                                                                   |
| [ChessBot](https://github.com/Piterden/chessbot)                                              | Inline chess game in a message                                                                           |
| [CounterBot](https://github.com/leodj/telegram-counter-bot)                                   | Keep track of multiple counters and increment, decrement, set and reset them to your hearts content      |
| [DefendTheCastle](https://github.com/TiagoDanin/Defend-The-Castle)                            | Telegram Bot Game - Defend The Castle                                                                    |
| [DiscordTelegramBridge](https://github.com/daaniiieel/discord-telegram-bridge)                | A simple, small and fast discord to telegram bridge written in node.js                                   |
| [EveMoviesBot](https://github.com/dmbaranov/evemovies-bot)                                    | Track movie torrent releases and get notifications when it's there                                       |
| [GNU/LinuxIndonesiaBot](https://github.com/bgli/bglibot-js)                                   | BGLI Bot a.k.a Miranda Salma                                                                             |
| [GoogleItBot](https://github.com/Edgar-P-yan/google-it-telegram-bot)                          | Instant inline search                                                                                    |
| [GroupsAdminBot](https://github.com/Azhant/AdminBot)                                          | Telegram groups administrator bot                                                                        |
| [KitchenTimerBot](https://github.com/DZamataev/kitchen-timer-bot)                             | Bot for setting up multiple timers for cooking                                                           |
| [LyricsGramBot](https://github.com/lioialessandro/LyricsGramBot)                              | Song Lyrics                                                                                              |
| [MangadexBot](https://github.com/ejnshtein/mangadex_bot)                                      | Read manga from Mangadex                                                                                 |
| [Memcoin](https://github.com/backmeupplz/memcoin)                                             | Memcoin for the Memconomy                                                                                |
| [MetalArchivesBot](https://github.com/amiralies/metalarchives-telegram-bot)                   | Unofficial metal-archives.com bot                                                                        |
| [MidnaBot](https://github.com/wsknorth/midnabot)                                              | Midnabot for telegram                                                                                    |
| [MineTelegram](https://github.com/hexatester/minetelegram)                                    | Minecraft - Telegram bridge                                                                              |
| [MonitorBot](https://github.com/inigochoa/monitorbot)                                         | Private website status checker bot                                                                       |
| [NodeRSSBot](https://github.com/fengkx/NodeRSSBot)                                            | Bot to subscribe RSS feed which allows many configurations                                               |
| [Nyaa.si Bot](https://github.com/ejnshtein/nyaasi-bot)                                        | Nyaa.si torrents                                                                                         |
| [OCRToolBot](https://github.com/Piterden/tesseract-bot)                                       | Tesseract text from image recognition                                                                    |
| [OneQRBot](https://github.com/Khuzha/oneqrbot)                                                | Scan and generate QR                                                                                     |
| [OrdisPrime](https://github.com/MaxTgr/Ordis-Prime)                                           | A telegram bot helper for warframe                                                                       |
| [PodSearchBot](https://fazendaaa.github.io/podsearch_bot/)                                    | TypeScript                                                                                               |
| [RandomPassBot](https://github.com/Khuzha/randompassbot)                                      | Generate a password                                                                                      |
| [Randy](https://github.com/backmeupplz/randymbot)                                             | Randy Marsh raffle Telegram bot                                                                          |
| [ReferalSystem](https://github.com/Khuzha/refbot)                                             | Channels promoter                                                                                        |
| [ScrobblerBot](https://github.com/drvirtuozov/scrobblerBot)                                   | An unofficial Last.fm Scrobbler                                                                          |
| [Shieldy](https://github.com/backmeupplz/shieldy)                                             | Telegram bot repository                                                                                  |
| [SimpleRegBot](https://github.com/Khuzha/simpleRegBot)                                        | Simple bot for registration users to any event                                                           |
| [SpyfallGameBot](https://github.com/verget/telegram-spy-game)                                 | Simple telegram bot for an interesting board game                                                        |
| [StickersPlayBot](https://github.com/TiagoDanin/StickersPlayBot)                              | Search series covers stickers via inline                                                                 |
| [StoreOfBot](https://github.com/TiagoDanin/StoreOfBot)                                        | Search, explore & discover the bests bots, channel or groups                                             |
| [SyntaxHighlighterBot](https://github.com/piterden/syntax-highlighter-bot)                    | A code highlighting tool for telegram chats                                                              |
| [TelegrafRutrackerTransmission](https://github.com/DZamataev/telegraf-rutracker-transmission) | Bot for searching torrents at Rutracker and add them to your Transmission web service                    |
| [TelegramTelegrafBot](https://github.com/Finalgalaxy/telegram-telegraf-bot)                   | Telegram bot example using Telegraf with easy configuration steps                                        |
| [Temply](https://github.com/backmeupplz/temply)                                               |                                                                                                          |
| [TereGramBot](https://github.com/juandjara/TereGramBot)                                       | Simple telegram node bot with a few funny commands                                                       |
| [TheGuardBot](https://github.com/TheDevs-Network/the-guard-bot)                               | Manage a network of related groups                                                                       |
| [ThemerBot](https://github.com/YouTwitFace/ThemerBot)                                         | Create themes for Telegram based on colors chosen from a picture                                         |
| [TTgram](https://github.com/TiagoDanin/TTgram)                                                | Receive and send Twitters used a Telegram Bot                                                            |
| [Voicy](https://github.com/backmeupplz/voicy)                                                 |                                                                                                          |
| [Watchy](https://github.com/backmeupplz/watchy)                                               |                                                                                                          |
| [YtSearchBot](https://github.com/Finalgalaxy/yt-search-bot)                                   | Bot to share YouTube fetched videos from any channel                                                     |
| [YTubevideoBot](https://github.com/n1ghtw0lff/YTubevideoBot)                                  | Bot created to help you find and share any video from youtube                                            |
| Send PR to add link to your bot                                                               |                                                                                                          |

<!-- Please keep the table sorted -->
