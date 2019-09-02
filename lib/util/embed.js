const RichEmbed = require('discord.js').RichEmbed;

module.exports = class EmbedUtils {
    constructor() {

    }

    editEmbed(msgObj, editObj, edit = true) {
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

    getEmbed(oldEmbed) {
        let richEmbed = new RichEmbed();

        if (oldEmbed.author != undefined) {
            richEmbed.setAuthor(oldEmbed.author.name, oldEmbed.author.iconUrl, oldEmbed.author.link);
        }

        if (oldEmbed.color != undefined) {
            richEmbed.setColor(oldEmbed.color);
        }

        if (oldEmbed.description != undefined) {
            richEmbed.setDescription(oldEmbed.description);
        }

        if (oldEmbed.footer != undefined) {
            richEmbed.setFooter(oldEmbed.footer.text, oldEmbed.footer.iconUrl);
        }

        if (oldEmbed.image != undefined) {
            richEmbed.setImage(oldEmbed.image);
        }

        if (oldEmbed.thumbnail != undefined) {
            richEmbed.setThumbnail(oldEmbed.thumbnail);
        }

        if (oldEmbed.timestamp != undefined) {
            richEmbed.setTimestamp(oldEmbed.timestamp);
        }

        if (oldEmbed.title != undefined) {
            richEmbed.setTitle(oldEmbed.title);
        }

        if (oldEmbed.url != undefined) {
            richEmbed.setUrl(oldEmbed.url);
        }

        return richEmbed;
    }
}
