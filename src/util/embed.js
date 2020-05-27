const MessageEmbed = require('discord.js').MessageEmbed;

/**
 * Embed Utilities class
 * @category Util
 */
class EmbedUtils {
    constructor() {

    }

    /**
     * This will keep the original data of the embed and modify the embed with the new data from the editObj
     * @param {external:Discord_Message} msgObj The original message containing the embed
     * @param {external:Object} editObj The new object data for the embed
     * @param {external:Boolean} [edit=true] If the embed should be directly updated after modifying it
     * @returns {external:Discord_MessageEmbed} Returns the modified embed, null if the original message was removed
     */
    editEmbed(msgObj, editObj, edit = true) {
        if (msgObj.deleted) return null;

        const richEmbed = msgObj.embeds[0];

        if (!richEmbed) return;
        const newRichEmbed = this.getEmbed(richEmbed);

        if (editObj.author)
            newRichEmbed.setAuthor(editObj.author.name, editObj.author.iconUrl, editObj.author.link);

        if (editObj.color)
            newRichEmbed.setColor(editObj.color);

        if (editObj.description)
            newRichEmbed.setDescription(editObj.description);

        if (editObj.footer)
            newRichEmbed.setFooter(editObj.footer.text, editObj.footer.iconUrl);

        if (editObj.image != undefined)
            newRichEmbed.setImage(editObj.image);

        if (editObj.thumbnail != undefined)
            newRichEmbed.setThumbnail(editObj.thumbnail);

        if (editObj.timestamp)
            newRichEmbed.setTimestamp(editObj.timestamp);

        if (editObj.title)
            newRichEmbed.setTitle(editObj.title);

        if (editObj.url)
            newRichEmbed.setUrl(editObj.url);

        if (edit)
            msgObj.edit(newRichEmbed);

        return newRichEmbed;
    }

    /**
     * @param {external:Discord_MessageEmbed} oldEmbedObj
     * @returns {external:Discord_MessageEmbed} returns a new MessageEmbed made from the oldEmbedObj
     */
    getEmbed(oldEmbedObj) {
        return new MessageEmbed(oldEmbedObj.toJSON());
    }
}

module.exports = EmbedUtils;
