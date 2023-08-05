require(`./config.js`)
const { default: makeWASocket, DisconnectReason, downloadContentFromMessage, useSingleFileAuthState, jidDecode, areJidsSameUser, makeInMemoryStore } = require('@adiwajshing/baileys')
const { state } = useSingleFileAuthState('./session.json')
const PhoneNumber = require('awesome-phonenumber')
const fs = require('fs')
const pino = require('pino')
const FileType = require('file-type')
const { Boom } = require('@hapi/boom')
const { smsg } = require('./myfunc')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./exif')
const chalk = require('chalk')
const color = (text, color) => { return !color ? chalk.green(text) : chalk.keyword(color)(text) }
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

const connectToWhatsApp = () => {
const client = makeWASocket({ logger: pino ({ level: 'silent' }), printQRInTerminal: true, auth: state, browser: ["SC Simple By TAHU BULAT", "Dekstop", "3.0"]})
console.log(color('[ SC BY DAFFBOTZ ]\n', 'red'),color('\nInfo Script :\n➸ Baileys : Multi Device\n➸ Nama Script : PUSHKONTAK\n➸ Creator : DAFF\n\nFollow My Social Media Account All Yes :\n➸ My Youtube : DaffBotz`\n➸ My Instagram : @egarpcn\n\nDonase Me For Support :\n➸ DONASI : 081229658640\n\nThanks\n', 'red'))

store.bind(client.ev)

client.ev.on('messages.upsert', async chatUpdate => {
try {
m = chatUpdate.messages[0]
if (!m.message) return
m.message = (Object.keys(m.message)[0] === 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message
if (!client.public && !m.key.fromMe && chatUpdate.type === 'notify') return
if (m.key.id.startsWith('BAE5') && m.key.id.length === 16) return
msg = smsg(client, m, store)
require('./kw')(client, msg, chatUpdate, store)
} catch (err) {
console.log(err)}})

client.ev.on('connection.update', (update) => {
const { connection, lastDisconnect } = update
if (connection === 'close') { lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? connectToWhatsApp() : ''}
else if (connection === 'open') {
client.sendMessage(nomorOwner + "@s.whatsapp.net", {text:`${JSON.stringify(update, undefined, 2)}` + `\n\nBot WhatsApp By ` + namaDeveloper})}
console.log(update)})

client.decodeJid = (jid) => {
if (!jid) return jid
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {}
return decode.user && decode.server && decode.user + '@' + decode.server || jid
} else return jid
}

client.ev.on('contacts.update', update => {
for (let contact of update) {
let id = client.decodeJid(contact.id)
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
}
})

client.getName = (jid, withoutContact  = false) => {
id = client.decodeJid(jid)
withoutContact = client.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = client.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === client.decodeJid(client.user.id) ?
client.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

client.public = true

client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
let type = await FileType.fromBuffer(buffer)
trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}

client.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
return buffer
}

const { getImg } = require('./functions')

client.sendImage = async (jid, path, caption = '', quoted = '', options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getImg(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await client.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
}

client.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getImg(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await client.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

client.sendButMessage = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
let buttonMessage = {
text,
footer,
buttons,
headerType: 2,
...options
}
client.sendMessage(jid, buttonMessage, { quoted, ...options })
}

}

connectToWhatsApp()