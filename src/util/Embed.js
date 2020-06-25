import { MessageEmbed } from 'discord.js'

export default class EmbedUtil {
    constructor() {}

    /**
     * @param {Message} msgObj
     * @param {Object} newProperties
     * @param {Boolean} [edit=true] If the message should be immediatly edited with the new embed data
     */
    static editEmbed(msgObj, newProperties, edit = true) {
        if (msgObj.deleted || msgObj.embeds.length == 0) return null;

        const embedData = msgObj.embeds[0].toJSON();

        Object.assign(embedData, newProperties);

        const embed = new MessageEmbed(embedData);

        if (edit)
            msgObj.edit(embed)

        return embed;
    }
}
