import CommandInt from "../../interfaces/CommandInt";
import { MessageEmbed } from "discord.js";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

const server: CommandInt = {
  name: "server",
  description: "Gives the current status of this server.",
  category: "server",
  run: async (message) => {
    try {
      const { Becca, channel, guild } = message;

      const { color, prefix } = Becca;

      // Check if the guild is not valid.
      if (!guild) {
        await message.react(message.Becca.no);
        return;
      }

      // Create a new empty embed.
      const serverEmbed = new MessageEmbed();

      // Add the light purple color.
      serverEmbed.setColor(color);

      // Add the server name to the embed title.
      serverEmbed.setTitle(guild.name);

      // Add the description.
      serverEmbed.setDescription("Here is the information for this server!");

      // Add the server image to the embed thumbnail.
      serverEmbed.setThumbnail(guild.iconURL({ dynamic: true }) || "");

      // Add the server creation date to an embed field.
      serverEmbed.addField(
        "Creation date",
        new Date(guild.createdTimestamp).toLocaleDateString(),
        true
      );

      // Fetch guild owner
      const guildOwner = await guild.members.fetch(guild.ownerID);

      // Add the server owner to an embed field.
      serverEmbed.addField("Owner", guildOwner, true);

      // Add the server commands prefix to an embed field.
      serverEmbed.addField("Command prefix", prefix[guild.id], true);

      // Add the server members count to an embed field.
      serverEmbed.addField("Recently seen members", guild.memberCount, true);

      // Fetch all members, map to array
      const guildMembers = (await guild.members.fetch()).map((u) => u);

      // Add the server human members count to an embed field.
      serverEmbed.addField(
        "Human members",
        guildMembers.filter((member) => !member.user.bot).length,
        true
      );

      // Add the server bots count to an embed field.
      serverEmbed.addField(
        "Bot members",
        guildMembers.filter((member) => member.user.bot).length,
        true
      );

      // Add the server users banned count to an embed field.
      serverEmbed.addField("Banned users", guild.fetchBans.length, true);

      // Add an empty field.
      serverEmbed.addField("\u200b", "\u200b", true);

      // Add the server roles count to an embed field.
      serverEmbed.addField("Roles count", guild.roles.cache.size, true);

      // Add the server roles names to an embed field.
      serverEmbed.addField(
        "Roles",
        guild.roles.cache.map((role) => role.toString()).join(" "),
        false
      );

      // Add the server channels count to an embed field.
      serverEmbed.addField("Channel count", guild.channels.cache.size, true);

      // Add the server text channels count to an embed field.
      serverEmbed.addField(
        "Text channel count",
        guild.channels.cache.filter((channel) => channel.type === "text").size,
        true
      );

      // Add the server voice channels count to an embed field.
      serverEmbed.addField(
        "Voice Channels",
        guildChannels.filter((chan) => chan.type === "voice").size(),
        true
      );

      // Send the server embed to the current channel.
      await channel.send(serverEmbed);
      await message.react(message.Becca.yes);
    } catch (error) {
      await beccaErrorHandler(
        error,
        message.guild?.name || "undefined",
        "server command",
        message.Becca.debugHook,
        message
      );
    }
  },
};

export default server;
