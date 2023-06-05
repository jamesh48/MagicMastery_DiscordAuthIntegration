import axios from 'axios';
import {
  ChannelType,
  Guild,
  GuildMember,
  Message,
  PartialGuildMember,
  TextChannel,
} from 'discord.js';
import * as EmailValidator from 'email-validator';

export const createMaxChannel = async (theGuild: Guild, discordId: string) => {
  const registrationChannels = theGuild.channels.cache.filter((channel) =>
    channel.name.startsWith('registration-')
  );

  const maxChannel =
    (registrationChannels?.size
      ? registrationChannels.reduce((total, channel) => {
          const currentChannelNumber = Number(channel.name.split('-')[1]);
          if (total < currentChannelNumber) {
            total = currentChannelNumber;
          }
          return total;
        }, 0)
      : 0) + 1;

  const newRegistrationChannel = await theGuild.channels.create({
    type: ChannelType.GuildText,
    name: 'registration-' + maxChannel,
    parent: process.env.DISCORD_PARENT_REGISTRATION_CHANNEL,
    topic: discordId,
  });

  return newRegistrationChannel;
};

export const deleteChannel = (
  theGuild: Guild,
  channelToDelete: TextChannel
) => {
  theGuild.channels.delete(channelToDelete);
};

export const registerNewEmail = async (email: string, discordId: string) => {
  try {
    const { data } = await axios.post(
      `${process.env.MM_AUTH_URL}/acmpActivate`,
      {
        email,
        discordId,
      }
    );
    return data.message;
  } catch (err) {
    return err.response.data.error;
  }
};

export const registerEmail = async (
  theGuild: Guild,
  registrationChannel: TextChannel,
  discordId: string,
  initialMessage: string
) => {
  await registrationChannel.send(initialMessage);
  const collectedMessages = await registrationChannel.awaitMessages({
    max: 1,
    filter: (m) => {
      if (m.author.id === discordId) {
        if (EmailValidator.validate(m.content)) {
          return true;
        }

        if (m.content.toLowerCase() === 'exit') {
          return true;
        }
      }
      return false;
    },
  });

  if (!collectedMessages.size) {
    return;
  }

  if (collectedMessages.at(0)?.content.toLowerCase() === 'exit') {
    deleteChannel(theGuild, registrationChannel);
    return true;
  }

  const email = collectedMessages.at(0)?.content;

  try {
    const { data } = await axios.post(
      `${process.env.MM_AUTH_URL}/acmpActivate`,
      {
        email,
        discordId,
      }
    );
    await registrationChannel.send(data.message);
  } catch (err) {
    await registrationChannel.send(err.response.data.error);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('ok');
      }, 1000);
    });
    await registerEmail(
      theGuild,
      registrationChannel,
      discordId,
      'Please try again'
    );
  }
  return true;
};

export const checkForExistingRegistrationChannel = (
  member: GuildMember | PartialGuildMember
) => {
  return !!member.guild.channels.cache.find(
    (channel) =>
      channel.name.startsWith('registration-') &&
      (channel as TextChannel).topic === member.id
  );
};

export const deleteExpiredMsgs = async (guild: Guild, discordId: string) => {
  const mainRegistrationChannel = guild.channels.cache.get(
    process.env.DISCORD_MAIN_REGISTRATION_CHANNEL_ID
  );

  if (mainRegistrationChannel?.isTextBased()) {
    const fetched = await mainRegistrationChannel?.messages.fetch({
      limit: 100,
    });
    const deleteMsgPromiseArr = fetched.reduce((total, existingMsg) => {
      if (
        (existingMsg.member && existingMsg.member.id === discordId) ||
        existingMsg.nonce === discordId
      ) {
        const deletionPromise = existingMsg.delete();
        total.push(deletionPromise);
      }
      return total;
    }, [] as (Promise<Message<false>> | Promise<Message<true>>)[]);

    await Promise.all(deleteMsgPromiseArr);
  }
};

export const deleteIdleChannel = async (
  member: GuildMember | PartialGuildMember
) => {
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
};
