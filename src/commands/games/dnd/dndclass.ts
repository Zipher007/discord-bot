import CommandInt from "../../../interfaces/CommandInt";
import DndClassInt from "../../../interfaces/commands/dnd/DndClassInt";
import axios from "axios";
import { MessageEmbed } from "discord.js";
import { beccaErrorHandler } from "../../../utils/beccaErrorHandler";

const DNDCLASS_CONSTANT = {
  error: {
    no_query:
      "Would you please try the command again, and provide the class you want me to search for?",
    bad_data: "I am so sorry, but I was unable to find anything...",
  },
  dndApi: "https://www.dnd5eapi.co/api/classes/",
  join_separator: ", ",
};

const dndclass: CommandInt = {
  name: "dndclass",
  description:
    "Gets information on the provided Dungeons and Dragons **class**.",
  parameters: ["`<class>`: the name of the class to search"],
  category: "game",
  run: async (message) => {
    try {
      const { channel, commandArguments } = message;

      // Join all command arguments with `-`.
      const query = commandArguments.join("-");

      // Check if the query is not empty.
      if (!query || !query.length) {
        await message.reply(DNDCLASS_CONSTANT.error.no_query);
        await message.react(message.Becca.no);
        return;
      }

      // Get the data from the dnd api.
      const data = await axios.get<DndClassInt>(
        `${DNDCLASS_CONSTANT.dndApi}${query}`
      );

      // Check if the dnd class is not valid.
      if (!data.data || data.data.error) {
        await message.reply(DNDCLASS_CONSTANT.error.bad_data);
        await message.react(message.Becca.no);
        return;
      }

      // Create a new empty embed.
      const dndClassEmbed = new MessageEmbed();

      const {
        hit_die,
        name,
        proficiencies,
        proficiency_choices,
        url,
      } = data.data;

      // Add the class name to the embed title.
      dndClassEmbed.setTitle(name);

      // Add the class url to the embed title url.
      dndClassEmbed.setURL(`https://www.dnd5eapi.co${url}`);

      // Add the hit die to an embed field.
      dndClassEmbed.addField("Hit die", hit_die);

      // Add the proficiencies to an embed field.
      dndClassEmbed.addField(
        "Proficiencies",
        proficiencies
          .map((el) => el.name)
          .join(DNDCLASS_CONSTANT.join_separator)
      );

      // Add the proficiencies choices to an embed field.
      dndClassEmbed.addField(
        `Plus ${proficiency_choices[0].choose} from`,
        proficiency_choices[0].from
          .map((el) => el.name)
          .join(DNDCLASS_CONSTANT.join_separator)
      );

      // Send the embed to the current channel.
      await channel.send(dndClassEmbed);
      await message.react(message.Becca.yes);
    } catch (error) {
      await beccaErrorHandler(
        error,
        message.guild?.name || "undefined",
        "dndclass command",
        message.Becca.debugHook,
        message
      );
    }
  },
};

export default dndclass;
