const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys"); const { Boom } = require("@hapi/boom"); const fs = require("fs"); const qrcode = require("qrcode-terminal"); const QRCode = require("qrcode");

let reconnectAttempts = 0; const MAX_RECONNECT_ATTEMPTS = 5;

async function startBot() { try { const { state, saveCreds } = await useMultiFileAuthState("./auth_info_baileys"); const sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: ["Queen Bella Bot", "Safari", "1.0.0"], markOnlineOnConnect: false, generateHighQualityLinkPreview: true, syncFullHistory: false, defaultQueryTimeoutMs: 60000, qrTimeout: 180000, connectTimeoutMs: 60000, keepAliveIntervalMs: 30000 });

sock.ev.on("creds.update", saveCreds);

sock.ev.on("connection.update", async (update) => {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    console.log("🔄 NEW QR CODE GENERATED!");
    qrcode.generate(qr, { small: true });
  }

  if (connection === "connecting") {
    console.log("🔄 Connecting to WhatsApp...");
  }

  if (connection === "close") {
    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
    if (shouldReconnect) {
      console.log("🔄 Reconnecting...");
      setTimeout(() => startBot(), 30000);
    } else {
      console.log("❌ Not reconnecting (logged out)");
    }
  } else if (connection === "open") {
    reconnectAttempts = 0;
    console.log("✅ Successfully connected to WhatsApp!");
  }
});

sock.ev.on("messages.upsert", async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
  const sender = msg.key.remoteJid;

  console.log(`Received message from ${sender}: ${text}`);

  const command = text?.trim().toLowerCase();

  if (command === ".menu") {
    const imagePath = "./queen-bella.jpg";
    const menuText = `

╭───❖ 👑 QUEEN BELLA V1 👑 ❖───╮ 📅 Date: ${new Date().toLocaleDateString()} 👤 Bot Owner: Rodgers (RoyTech) ╰────────────────────────────╯

📜 GENERAL COMMANDS • .menu – Show this help menu • .ping – Check bot status • .now – Get current time • .joke – Tell a joke • .quote – Show a quote

🛠 AUTO FEATURES • .alwaysonline • .autotyping • .autorecording • .autostatusreact • .autoviewstatus

Made with ❤️ by Rodgers Tech; await sock.sendMessage(sender, { image: { url: imagePath }, caption: "👑 *QUEEN BELLA* is here for you!", }); await sock.sendMessage(sender, { text: menuText }); } else if (command === ".ping") { await sock.sendMessage(sender, { text: "🏓 Pong! I'm alive." }); } else if (command === ".now") { await sock.sendMessage(sender, { text: 🕒 ${new Date().toLocaleTimeString()}` }); } else if (command === ".joke") { await sock.sendMessage(sender, { text: "😂 Why don't skeletons fight each other? They don't have the guts." }); } else if (command === ".quote") { await sock.sendMessage(sender, { text: "💡 "Dream big. Start small. But most of all, start." – Simon Sinek" }); } else if (command === ".alwaysonline") { await sock.sendPresenceUpdate("available", sender); await sock.sendMessage(sender, { text: "🟢 Always online mode activated!" }); } else if (command === ".autotyping") { await sock.sendPresenceUpdate("composing", sender); await sock.sendMessage(sender, { text: "⌨️ Typing mode on." }); } else if (command === ".autorecording") { await sock.sendPresenceUpdate("recording", sender); await sock.sendMessage(sender, { text: "🎙️ Recording mode on." }); } else if (command === ".autostatusreact") { await sock.sendMessage(sender, { text: "💬 Auto status reaction activated." }); } else if (command === ".autoviewstatus") { await sock.sendMessage(sender, { text: "👀 Auto view status enabled (simulated)." }); } else { await sock.sendMessage(sender, { text: "❓ Unknown command. Type .menu to see commands." }); } }); } catch (error) { console.error("🚨 Startup error:", error); } }

startBot();

    
