import CommandInt from "../../interfaces/CommandInt";
import MagicInt from "../../interfaces/commands/MagicInt";
import axios from "axios";
import { MessageEmbed } from "discord.js";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

const magic: CommandInt = {
  name: "magic",
  description: "Returns a Magic: The Gathering card that matches the **name**.",
  parameters: ["`<card>`: name of the card to search for"],
  category: "game",
  run: async (message) => {
    try {
      const { Becca, channel, commandArguments } = message;

      // Get the arguments as a magic query.
      const query = commandArguments.join(" ");

      // Check if the query is empty.
      if (!query) {
        await message.reply(
          "Would you please try the command again, and tell me the card name you want me to search for?"
        );
        await message.react(message.Becca.no);
        return;
      }

      // Get the data from the magic API.
      const data = await axios.get<MagicInt>(
        `https://api.magicthegathering.io/v1/cards?name=${query}&pageSize=1`
      );

      // Get the first card.
      const card = data.data.cards[0];

      // Check if the data is not valid.
      if (!data.data || !data.data.cards.length || !card) {
        await message.reply("I am so sorry, but I could not find anything.");
        await message.react(message.Becca.no);
        return;
      }

      // Create a new empty embed.
      const cardEmbed = new MessageEmbed();

      const { flavor, imageUrl, manaCost, name, text, types } = card;

      // Add the light purple color.
      cardEmbed.setColor(Becca.color);

      // Add the card name to the embed title.
      cardEmbed.setTitle(name);

      // Add the card image to the embe thumbnail.
      cardEmbed.setThumbnail(
        imageUrl ||
          "https://gamepedia.cursecdn.com/mtgsalvation_gamepedia/thumb/f/f8/Magic_card_back.jpg/250px-Magic_card_back.jpg?version=56c40a91c76ffdbe89867f0bc5172888"
      );

      // Add the card flavor to the embed description.
      cardEmbed.setDescription(flavor || "This card has no flavour text...");

      // Add the card types to an embed field.
      cardEmbed.addField("Types", types.join(", "));

      // Add the card cost to an embed field.
      cardEmbed.addField("Cost", manaCost);

      // Add the card text to an embed field.
      cardEmbed.addField(
        "Abilities",
        text || "This card has no ability text..."
      );

      // Send the card embed to the current channel.
      await channel.send(cardEmbed);
      await message.react(message.Becca.yes);
    } catch (error) {
      await beccaErrorHandler(
        error,
        message.guild?.name || "undefined",
        "magic command",
        message.Becca.debugHook,
        message
      );
    }
  },
};

export default magic;
