import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
//
import {
  Client,
  GatewayIntentBits,
  GuildMember,
  PartialGuildMember,
  TextChannel,
} from 'discord.js';
import authApp from './authApp';
import EventEmitter from 'events';
import cron from 'node-cron';
import * as botUtils from './botUtils';

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
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
  ],
});

const kickIdleUser = async (member: GuildMember | PartialGuildMember) => {
  await member.kick();
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  const theGuild = client.guilds.cache.get(process.env.MM_GUILD_ID);

  if (!theGuild) {
    return;
  }
});

client.on('guildMemberRemove', async (member) => {
  console.info('~~guild member remove~~`');
  const channelToDelete = member.guild.channels.cache.find(
    (channel) =>
      channel.name.startsWith('registration-') &&
      (channel as TextChannel).topic === member.id
  );

  try {
    await channelToDelete?.delete();
  } catch (err) {
    console.info('channel already deleted');
  }
});

client.on('guildMemberAdd', async (member) => {
  const event = new EventEmitter();
  event.on('JOB COMPLETED', () => {
    console.info('Job Done!');
    task.stop();
  });

  const task = cron.schedule('* 15 * * * *', async () => {
    await kickIdleUser(member);
    event.emit('JOB COMPLETED');
  });

  const discordId = member.user.id;

  const theGuild = client.guilds.cache.get(process.env.MM_GUILD_ID);

  if (!theGuild) {
    return;
  }

  const newRegistrationChannel = await botUtils.createMaxChannel(
    theGuild,
    discordId
  );

  await newRegistrationChannel.permissionOverwrites.create(discordId, {
    ViewChannel: true,
    SendMessages: true,
  });

  await newRegistrationChannel.send({
    content: 'Hello and welcome to Magic Mastery!',
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve('ok');
    }, 5000);
  });

  await botUtils.registerEmail(
    theGuild,
    newRegistrationChannel,
    discordId,
    'If you are a Magic Mastery Member, please send me the email you signed up for the guild with. If you are not a Magic Mastery Discord Member and just want access to the public channels just respond with "Not now", Please Respond within 15 minutes or you will have to rejoin the guild'
  );
});

client.login(token);

authApp.listen(process.env.EXPRESS_SERVER_PORT, () =>
  console.info(
    `DiscordBot-MM listening on Port ${process.env.EXPRESS_SERVER_PORT}`
  )
);
