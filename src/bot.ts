import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
//
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ComponentType,
  Events,
  GatewayIntentBits,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
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

client.on(Events.InteractionCreate, async (interaction) => {
  const modal = new ModalBuilder();

  const emailTextInput = new TextInputBuilder()
    .setCustomId('register-me-input')
    .setLabel('What is the email you registered with?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('')
    .setRequired(true);

  const actionRowComponents =
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
      emailTextInput
    );

  if (interaction.isButton()) {
    if (interaction.customId === 'magic-mastery-register-me-button') {
      modal
        .setCustomId('magic-mastery-register-me-email-modal')
        .setTitle('Magic Mastery Email Registration')
        .addComponents([actionRowComponents]);

      await interaction.showModal(modal);
      return;
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'magic-mastery-register-me-email-modal') {
      const responseEmail =
        interaction.fields.getTextInputValue('register-me-input');

      if (interaction.member) {
        const { id: discordId } = interaction.member.user;
        const acmpResp = await botUtils.registerNewEmail(
          responseEmail,
          discordId
        );

        const tempErrMsg = await interaction.reply(acmpResp);
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve('ok');
          }, 10000);
        });
        await tempErrMsg.delete();
      }
    }
  }
});

client.on('ready', async (c) => {
  console.log(`Logged in as ${client.user?.tag}!`);

  const registrationChannel = c.channels.cache.get(
    process.env.DISCORD_MAIN_REGISTRATION_CHANNEL_ID
  );

  let button = new ActionRowBuilder<ButtonBuilder>();
  button.addComponents(
    new ButtonBuilder()
      .setCustomId('magic-mastery-register-me-button')
      .setStyle(ButtonStyle.Primary)
      .setLabel('Register Me')
  );

  if (registrationChannel && registrationChannel.isTextBased()) {
    const firstMessage = (await registrationChannel.messages.fetch()).last();
    if (firstMessage && firstMessage.components.length) {
      const firstMessageComponents = firstMessage.components[0].components[0];
      const firstMessageIsButton =
        firstMessageComponents.data.type === ComponentType.Button;
      if (firstMessageIsButton) {
        const firstMessageButtonCustomId = firstMessageComponents.customId;
        const buttonAlreadyExists =
          firstMessageButtonCustomId === 'magic-mastery-register-me-button';

        if (buttonAlreadyExists) {
          return;
        }
      }
    }

    await registrationChannel.send({
      components: [button],
    });
  }

  const theGuild = client.guilds.cache.get(process.env.MM_GUILD_ID);

  if (!theGuild) {
    return;
  }
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;
  if (msg.channelId !== process.env.DISCORD_MAIN_REGISTRATION_CHANNEL_ID)
    return;

  if (msg.content.toLowerCase() === 'register me' && msg.member) {
    const existingChannel = botUtils.checkForExistingRegistrationChannel(
      msg.member
    );

    if (existingChannel) {
      msg.channel.send({
        content: `Registration Channel already exists, look below this channel in the sidebar for your private registration channel`,
        nonce: msg.member.id,
      });
      return;
    }

    // 15 minutes
    const task = cron.schedule('* 15 * * * *', async () => {
      if (msg.member) {
        await botUtils.deleteIdleChannel(msg.member);
        if (msg.inGuild()) {
          await botUtils.deleteExpiredMsgs(msg.guild, msg.member.id);
        }
      }
      event.emit('JOB COMPLETED');
    });

    const event = new EventEmitter();
    event.on('JOB COMPLETED', () => {
      console.info('Idle Channel Deleted!');
      task.stop();
    });

    const discordId = msg.member.id;

    const theGuild = client.guilds.cache.get(process.env.MM_GUILD_ID);

    if (!theGuild) return;

    const newRegistrationChannel = await botUtils.createMaxChannel(
      theGuild,
      discordId
    );

    await newRegistrationChannel.permissionOverwrites.create(discordId, {
      ViewChannel: true,
      SendMessages: true,
    });

    if (msg.inGuild()) {
      await botUtils.deleteExpiredMsgs(msg.guild, discordId);
    }

    await newRegistrationChannel.send({
      content: 'Hello and welcome to Magic Mastery Registration!',
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('ok');
      }, 5000);
    });

    const result = await botUtils.registerEmail(
      theGuild,
      newRegistrationChannel,
      discordId,
      'If you are a Magic Mastery Member, please send me the email you signed up for the guild with. \n If you are not a Magic Mastery Discord Member or just want to signup later respond with "Exit". \n This channel will be deleted in 15 minutes or after you respond.'
    );

    if (result) {
      await botUtils.deleteExpiredMsgs(theGuild, discordId);
    }
  }
});

client.on('guildMemberRemove', async (member) => {
  console.info('~~guild member remove~~`');
  await botUtils.deleteIdleChannel(member);
  await botUtils.deleteExpiredMsgs(member.guild, member.id);
});

client.login(token);

authApp.listen(process.env.EXPRESS_SERVER_PORT, () =>
  console.info(
    `DiscordBot-MM listening on Port ${process.env.EXPRESS_SERVER_PORT}`
  )
);
