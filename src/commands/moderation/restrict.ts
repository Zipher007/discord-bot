import CommandInt from "../../interfaces/CommandInt";
import { MessageEmbed } from "discord.js";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

const restrict: CommandInt = {
  name: "restrict",
  description:
    "Restrict **user**'s access to the channel. Optionally provide a **reason**. Only available to server moderators. Becca will log this action if log channel is available.",
  parameters: [
    "`<user>`: @name of the user to restrict.",
    "`<?reason>`: reason for restricting the user.",
  ],
  category: "moderation",
  run: async (message, config) => {
    try {
      const {
        author,
        Becca,
        commandArguments,
        guild,
        member,
        mentions,
      } = message;

      const { user } = Becca;

      // Check if the member has the kick members permission.
      if (!guild || !user || !member || !member.hasPermission("KICK_MEMBERS")) {
        await message.reply(
          "I am so sorry, but I can only do this for moderators with permission to kick members."
        );
        await message.react(message.Becca.no);
        return;
      }

      // Get the moderator role.
      const moderatorRole = guild.roles.cache.find(
        (role) => role.id === config.moderator_role
      );

      // Check if the moderator role does not exist.
      if (!moderatorRole) {
        await message.reply(
          "I am so sorry, but I do not have a record for your moderator role."
        );
        await message.react(message.Becca.no);
        return;
      }

      // Get the restricted role.
      const restrictedRole = guild.roles.cache.find(
        (role) => role.id === config.restricted_role
      );

      // Check if the restricted role does not exist.
      if (!restrictedRole) {
        await message.reply(
          "I am so sorry, but I do not have a record for your restricted role."
        );
        await message.react(message.Becca.no);
        return;
      }

      // Get the restrict category.
      let category = guild.channels.cache.find(
        (c) => c.name === "Appeals" && c.type === "category"
      );

      const allow: (
        | "VIEW_CHANNEL"
        | "READ_MESSAGE_HISTORY"
        | "SEND_MESSAGES"
      )[] = ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "SEND_MESSAGES"];

      // Check if the restrict category does not exist.
      if (!category) {
        category = await guild.channels.create("Appeals", {
          type: "category",
          permissionOverwrites: [
            {
              id: guild.id,
              deny: allow,
            },
            {
              id: moderatorRole.id,
              allow,
            },
            {
              id: restrictedRole.id,
              allow,
            },
            {
              id: user.id, // Becca's ID.
              allow,
            },
          ],
        });
      }

      // Get the next argument as the user to restrict mention.
      let userToRestrictMention = commandArguments.shift();

      // Get the first user mention.
      const userToRestrictMentioned = mentions.users.first();

      // Check if the user mention is valid.
      if (
        !userToRestrictMention ||
        !userToRestrictMentioned ||
        !mentions.members
      ) {
        await message.reply(
          "Would you please try the command again, and provide the user you want me to restrict?"
        );
        await message.react(message.Becca.no);
        return;
      }

      // Remove the `<@!` and `>` from the mention to get the id.
      userToRestrictMention = userToRestrictMention.replace(/[<@!>]/gi, "");

      // Check if the user mention string and the first user mention id are equals.
      if (userToRestrictMention !== userToRestrictMentioned.id) {
        await message.reply(
          `I am so sorry, but ${userToRestrictMentioned.toString()} is not a valid user.`
        );
        await message.react(message.Becca.no);
        return;
      }

      // Check if trying to restrict itself.
      if (userToRestrictMentioned.id === author.id) {
        await message.reply("Wait, what? You cannot restrict yourself!");
        await message.react(message.Becca.no);
        return;
      }

      // Get the first member mention.
      const memberToRestrictMentioned = mentions.members.first();

      // Check if the member mention exists.
      if (!memberToRestrictMentioned) {
        await message.reply(
          "Would you please try the command again, and provide the user you want me to restrict?"
        );
        await message.react(message.Becca.no);
        return;
      }

      // Check if the user id or member id are Becca's id.
      if (
        userToRestrictMentioned.id === user.id ||
        memberToRestrictMentioned.id === user.id
      ) {
        await message.reply(
          "You want to restrict me? Oh no! Did I do something wrong?"
        );
        await message.react(message.Becca.no);
        return;
      }

      // Check if the user is already restricted.
      if (memberToRestrictMentioned.roles.cache.has(restrictedRole.id)) {
        await message.reply(
          `I am so sorry, but ${userToRestrictMentioned.toString()} is already restricted.`
        );
        await message.react(message.Becca.no);
        return;
      }

      // Get the reason of the warn.
      let reason = commandArguments.join(" ");

      // Add a default reason if it not provided.
      if (!reason || !reason.length) {
        reason = "I am sorry, but the moderator did not provide a reason.";
      }

      //remove all other roles
      memberToRestrictMentioned.roles.cache.forEach(async (role) => {
        //everyone role cannot be removed - it has same ID as guild, so skip it.
        if (role.id === guild.id) {
          return;
        }
        await memberToRestrictMentioned.roles.remove(role);
      });

      // Add the restricted role to the user.
      await memberToRestrictMentioned.roles.add(restrictedRole);

      // Create the new appeal channel.
      await guild.channels.create(
        `suspended-${userToRestrictMentioned.username}`,
        {
          type: "text",
          parent: category,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: allow,
            },
            {
              id: userToRestrictMentioned.id,
              allow,
            },
            {
              id: moderatorRole.id,
              allow,
            },
            {
              id: user.id,
              allow,
            },
          ],
        }
      );

      // Send an advertisement to the user.
      await memberToRestrictMentioned.send(
        `Hello! I am sorry to bother you. It appears you have been suspended from **${guild.name}** for the following reason: ${reason} \n I have created a channel there for you to appeal this decision.`
      );

      // Send an embed message to the logs channel.
      await Becca.sendMessageToLogsChannel(
        guild,
        new MessageEmbed()
          .setColor("#FF0000")
          .setTitle("Access Restricted!")
          .addField("Moderator", author.toString(), true)
          .addField("User", userToRestrictMentioned.toString(), true)
          .addField("Reason", reason)
          .setFooter("Please remember to follow our rules!")
          .setTimestamp()
      );

      //respond
      await message.reply("Okay! I have taken care of that for you.");
      await message.react(message.Becca.yes);
    } catch (error) {
      await beccaErrorHandler(
        error,
        message.guild?.name || "undefined",
        "restrict command",
        message.Becca.debugHook,
        message
      );
    }
  },
};

export default restrict;
