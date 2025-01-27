import BeccaInt from "../interfaces/BeccaInt";
import {
  GuildMember,
  MessageEmbed,
  PartialGuildMember,
  TextChannel,
} from "discord.js";
import { sleep } from "../utils/extendsMessageToMessageInt";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";

/**
 * Send a message when a new user join to the server,
 * the message can be customed by every server owner.
 *
 * ## Elements inside a message
 * - `{@username}` - New user name.
 * - `{@servername}` - Current server name.
 *
 * @async
 * @function
 * @param { GuildMember | PartialGuildMember } member
 * @param { BeccaInt } Becca
 * @returns { Promise<void> }
 */
async function onGuildMemberAdd(
  member: GuildMember | PartialGuildMember,
  Becca: BeccaInt
): Promise<void> {
  try {
    // Get the user and the current guild.
    const { user, guild } = member;

    // Check if the new member is a valid user.
    if (!user) {
      return;
    }

    const serverSettings = await Becca.getSettings(guild.id, guild.name);

    // Get the welcomes channel from the database.
    const welcomesChannel = guild.channels.cache.find(
      (chan) => chan.id === serverSettings.welcome_channel
    );

    // Check if the welcomes channel exists.
    if (!welcomesChannel) {
      return;
    }

    // Set a default welcome message.
    let welcomeMessage =
      "Hello `{@username}`! Welcome to {@servername}! My name is Becca, and I am here to help!";

    // Get the custom welcome message from the database.
    const welcomeMessageSetting = serverSettings.custom_welcome;

    // Check if the custom welcome message exists and replace the default for it.
    if (welcomeMessageSetting) {
      welcomeMessage = welcomeMessageSetting;
    }

    // Replace the custom elements.
    welcomeMessage = welcomeMessage
      .replace(/{@username}/gi, user.username)
      .replace(/{@servername}/gi, guild.name);

    (welcomesChannel as TextChannel).startTyping();
    await sleep(3000);

    (welcomesChannel as TextChannel).stopTyping();

    // Send an embed message to the welcomes channel.
    await (welcomesChannel as TextChannel).send(
      new MessageEmbed()
        .setColor("#AB47E6")
        .setTitle("A new user has joined! 🙃")
        .setDescription(welcomeMessage)
    );
  } catch (error) {
    await beccaErrorHandler(
      error,
      member.guild?.name || "undefined",
      "guildMemberAdd event",
      Becca.debugHook
    );
  }
}

export default onGuildMemberAdd;
