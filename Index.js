const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@adiwajshing/baileys");
const { Boom } = require("@hapi/boom");
const fs = require("fs");

const { state, saveState } = useSingleFileAuthState("./auth.json");

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("connection closed due to ", lastDisconnect.error, ", reconnecting ", shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("✅ Connected as", sock.user.name || sock.user.id);
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const sender = msg.key.remoteJid;

    if (text === ".menu") {
      const imagePath = "./queen-bella.jpg";
      const menuText = `
*╭───❖ 👑 QUEEN BELLA V1 👑 ❖───╮*
*📅 Date:* ${new Date().toLocaleDateString()}
*👤 Bot Owner:* Rodgers (RoyTech)
*╰────────────────────────────╯*

*📜 GENERAL COMMANDS*
• .menu – Show this help menu
• .ping – Check bot status
• .now – Get current time
• .joke – Tell a joke
• .quote – Show a quote

*🛠 AUTO FEATURES*
• .alwaysonline
• .autotyping
• .autorecording
• .autostatusreact
• .autoviewstatus

*Made with ❤️ by Rodgers Tech*
      `;
      await sock.sendMessage(sender, {
        image: { url: imagePath },
        caption: "👑 *QUEEN BELLA* is here for you!",
      });
      await sock.sendMessage(sender, { text: menuText });
    }

    if (text === ".ping") {
      await sock.sendMessage(sender, { text: "🏓 Pong! I'm alive." });
    }

    if (text === ".now") {
      await sock.sendMessage(sender, { text: `🕒 ${new Date().toLocaleTimeString()}` });
    }

    if (text === ".joke") {
      await sock.sendMessage(sender, { text: "😂 Why don’t skeletons fight each other? They don’t have the guts." });
    }

    if (text === ".quote") {
      await sock.sendMessage(sender, { text: "💡 “Dream big. Start small. Act now.” – Robin Sharma" });
    }
  });
}

startBot();
