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
