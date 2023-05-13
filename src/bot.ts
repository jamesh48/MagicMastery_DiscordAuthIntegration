import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
//
import { Client, GatewayIntentBits } from 'discord.js';
import authApp from './authApp';

const token = process.env.DISCORD_BOT_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildInvites,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
  message.react('🤔');
  // const invites = await message.member?.guild.invites.fetch();
  // console.info(invites);
});

client.on('guildMemberAdd', async (member) => {
  // Give time for the role to be added by BetterInvites
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve('ok');
    }, 2500);
  });

  const discordId = member.user.id;

  const dmChannel = await member.createDM();
  const theGuild = client.guilds.cache.get(process.env.MM_GUILD_ID);

  const guildMember = theGuild?.members.cache.find((m) => m.id === discordId);

  const isMember = !!guildMember?.roles.cache.find((r) => r.name === 'Member');

  console.info(isMember);
  if (isMember) {
    await new Promise((resolve, _reject) => {
      setTimeout(async () => {
        await dmChannel.send('Hello ' + discordId);
        await dmChannel.send('Click here to sign up!');
        const authUrl = `${process.env.MM_AUTH_URL}/authCode`;
        await dmChannel.send(
          `https://discord.com/api/oauth2/authorize?client_id=${
            process.env.DISCORD_CLIENT_ID
          }&redirect_uri=${encodeURIComponent(
            authUrl
          )}&response_type=code&scope=identify%20email`
        );
        resolve('ok');
      }, 5000);
    });
  }
});

client.login(token);

authApp.listen(process.env.EXPRESS_SERVER_PORT, () =>
  console.info(
    `DiscordBot-MM listening on Port ${process.env.EXPRESS_SERVER_PORT}`
  )
);
