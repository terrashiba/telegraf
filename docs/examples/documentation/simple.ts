import { Telegraf } from 'telegraf'

// Create a new bot
const bot = new Telegraf('<your token here>')
// Respond to text messages
bot.on('text', (ctx) => ctx.reply('Yay, some text from you!'))
// Launch!
bot.launch()
