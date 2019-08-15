module.exports = class EmbedUtils {
    constructor() {

    }

    editEmbed(msgObj, editObj, edit = true) {
        const richEmbed = msgObj.embeds[0];

        if (editObj.author != undefined) {
            richEmbed.setAuthor(editObj.author.name, editObj.author.iconUrl, editObj.author.link);
        }

        if (editObj.color != undefined) {
            richEmbed.setColor(editObj.color);
        }

        if (editObj.description != undefined) {
            richEmbed.setDescription(editObj.description);
        }

        if (editObj.footer != undefined) {
            richEmbed.setFooter(editObj.footer.text, editObj.footer.iconUrl);
        }

        if (editObj.image != undefined) {
            richEmbed.setImage(editObj.image);
        }

        if (editObj.thumbnail != undefined) {
            richEmbed.setThumbnail(editObj.thumbnail);
        }

        if (editObj.timestamp != undefined) {
            richEmbed.setTimestamp(editObj.timestamp);
        }

        if (editObj.title != undefined) {
            richEmbed.setTitle(editObj.title);
        }

        if (editObj.url != undefined) {
            richEmbed.setUrl(editObj.url);
        }

        if (edit) {
            msgObj.edit(richEmbed);
        }

        return richEmbed;
    }
}
