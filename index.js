const { Client, GatewayIntentBits, SlashCommandBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const dotenv = require("dotenv").config();
const fs = require('fs');
// dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);

    // Debug: List all servers the bot is in
   client.guilds.cache.forEach(guild => {
        console.log(`Bot is in: ${guild.name} (ID: ${guild.id})`);
    });
});
// message moderation defined here ---------------------
let badwords = [];
try{
  badwords = JSON.parse(fs.readFileSync('badwords.json', 'utf-8'));
}
catch{
  console.error('Failed to load swear dictionary', error);
}
client.on('messageCreate', async msg => {
  if(msg.author.bot) return;
  const comment = msg.content.toLowerCase(); // Normalize case sensitivity
  const found = badwords.find(word=>comment.includes(word))
  if(found === 'nigger' || found === 'nigga'){
	msg.reply(`\`\`\`|"${found}"|\`\`\`\nWoah there! Next time, please refrain from using this horribly racist word. Instead, please use the universally accepted term "Basketball American".Thank you for your understanding. I am a bot, and this action was performed automatically.`);
  return;
  }
  if(found === 'sand nigg' || found === 'flight risk'){
	msg.reply(`\`\`\`|"${found}"|\`\`\`\nWoah there! Next time, please refrain from using this horribly racist term. Instead, please use the universally accepted term "Bomb American".Thank you for your understanding. I am a bot, and this action was performed automatically.`);
  return;
  }
  if(found){
    msg.reply(`\`\`\`|"${found}"|\`\`\`\nNot in my Christian server >:( `);
  }
  if (comment.includes('furry') || comment.includes('furries')) {
    msg.reply('🚨 **FURRY ALERT! FURRY ALERT!** 🚨')
       .then(sentMessage => {
           setTimeout(() => sentMessage.edit('🛑 **INITIATING DESTRUCTION SEQUENCE...** 🛑'), 3000);
           setTimeout(() => sentMessage.edit('🔥 **3...** 🔥'), 6000);
           setTimeout(() => sentMessage.edit('🔥 **2...** 🔥'), 9000);
           setTimeout(() => sentMessage.edit('💥 **1...** 💥'), 12000);
           setTimeout(() => sentMessage.edit('☠ **TARGET ELIMINATED.** ☠'), 15000);
       });
}
});
// Slash commands defined below ------------------------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "trash") {
      const user = interaction.options.getUser("user");
      if (!user) {
          await interaction.reply("You must mention a user!");
          return;
      }

      // Ensure the avatar is PNG
      const avatarUrl = user.displayAvatarURL({ extension: "png", size: 256 });

      try {
          // Create canvas
          const canvasSize = 125; // Keep canvas small to prevent Discord stretching
          const canvas = createCanvas(canvasSize, canvasSize);
          const ctx = canvas.getContext("2d");

          // Load trash bag image
          const trashBag = await loadImage("trash.png").catch(err => {
              console.error("❌ Error loading trash bag image:", err);
              return null;
          });

          if (!trashBag) {
              await interaction.reply("Error loading the trash bag image.");
              return;
          }

          // Load avatar image
          const avatar = await loadImage(avatarUrl).catch(err => {
              console.error("❌ Error loading avatar:", err);
              return null;
          });

          if (!avatar) {
              await interaction.reply("Error loading the user's avatar.");
              return;
          }

          // Draw the trash bag background
          ctx.drawImage(trashBag, 0, 0, canvasSize, canvasSize);

          // Resize and position avatar dynamically
          const avatarSize = 50; // Adjust size of the avatar relative to canvas
          const avatarX = (canvasSize - avatarSize) / 2; // Center horizontally
          const avatarY = canvasSize * 0.55; // Place in lower section of bag

          // Overlay the avatar onto the trash bag
          ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
          console.log("✅ Avatar placed on trash bag at", avatarX, avatarY);

          // Convert to buffer and send image
          const buffer = canvas.toBuffer("image/png");
          await interaction.reply({ files: [{ attachment: buffer, name: "trashed.png" }] });

      } catch (error) {
          console.error("Error processing image:", error);
          await interaction.reply("Error generating image.");
      }
  }
});


client.login(process.env.DISCORD_TOKEN);
