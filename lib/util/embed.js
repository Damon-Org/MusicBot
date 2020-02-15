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
        if (msgObj.deleted) {
            return null;
        }

        const
            richEmbed = msgObj.embeds[0],
            newRichEmbed = this.getEmbed(richEmbed);

        if (editObj.author != undefined) {
            newRichEmbed.setAuthor(editObj.author.name, editObj.author.iconUrl, editObj.author.link);
        }

        if (editObj.color != undefined) {
            newRichEmbed.setColor(editObj.color);
        }

        if (editObj.description != undefined) {
            newRichEmbed.setDescription(editObj.description);
        }

        if (editObj.footer != undefined) {
            newRichEmbed.setFooter(editObj.footer.text, editObj.footer.iconUrl);
        }

        if (editObj.image != undefined) {
            newRichEmbed.setImage(editObj.image);
        }

        if (editObj.thumbnail != undefined) {
            newRichEmbed.setThumbnail(editObj.thumbnail);
        }

        if (editObj.timestamp != undefined) {
            newRichEmbed.setTimestamp(editObj.timestamp);
        }

        if (editObj.title != undefined) {
            newRichEmbed.setTitle(editObj.title);
        }

        if (editObj.url != undefined) {
            newRichEmbed.setUrl(editObj.url);
        }

        if (edit) {
            msgObj.edit(newRichEmbed);
        }

        return newRichEmbed;
    }

    /**
     * @param {external:Object} oldEmbedObj
     * @returns {external:Discord_MessageEmbed} returns a new MessageEmbed made from the oldEmbedObj
     */
    getEmbed(oldEmbedObj) {
        let richEmbed = new MessageEmbed();

        if (oldEmbedObj.author != undefined) {
            richEmbed.setAuthor(oldEmbedObj.author.name, oldEmbedObj.author.iconURL, oldEmbedObj.author.url);
        }

        if (oldEmbedObj.color != undefined) {
            richEmbed.setColor(oldEmbedObj.color);
        }

        if (oldEmbedObj.description != undefined) {
            richEmbed.setDescription(oldEmbedObj.description);
        }

        if (oldEmbedObj.footer != undefined) {
            richEmbed.setFooter(oldEmbedObj.footer.text, oldEmbedObj.footer.iconURL);
        }

        if (oldEmbedObj.image != undefined) {
            richEmbed.setImage(oldEmbedObj.image);
        }

        if (oldEmbedObj.thumbnail != undefined) {
            richEmbed.setThumbnail(oldEmbedObj.thumbnail);
        }

        if (oldEmbedObj.timestamp != undefined) {
            richEmbed.setTimestamp(oldEmbedObj.timestamp);
        }

        if (oldEmbedObj.title != undefined) {
            richEmbed.setTitle(oldEmbedObj.title);
        }

        if (oldEmbedObj.url != undefined) {
            richEmbed.setUrl(oldEmbedObj.url);
        }

        return richEmbed;
    }
}

module.exports = EmbedUtils;
