import axios from 'axios';
import { ChannelType, Guild, TextChannel } from 'discord.js';
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

        if (m.content.toLowerCase() === 'not now') {
          return true;
        }
      }
      return false;
    },
  });

  if (!collectedMessages.size) {
    return;
  }

  if (collectedMessages.at(0)?.content.toLowerCase() === 'not now') {
    deleteChannel(theGuild, registrationChannel);
    return;
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
  return;
};
