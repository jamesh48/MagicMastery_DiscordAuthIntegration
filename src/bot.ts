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

client.login(token);

authApp.listen(process.env.EXPRESS_SERVER_PORT, () =>
  console.info(
    `DiscordBot-MM listening on Port ${process.env.EXPRESS_SERVER_PORT}`
  )
);
