module.exports = class Invite {
    /**
     * @param {Object} properties
     */
    constructor(properties) {
        Object.assign(this, properties);
    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    onCommand(musicBot, msgObj, command, args) {
        const
            embed = new musicBot.Discord.MessageEmbed()
            .setAuthor(`Made by ${musicBot.creator.tag}`, musicBot.creator.avatarURL)
            .setDescription(`Click [here](https://discordapp.com/oauth2/authorize?&client_id=${musicBot.client.user.id}&scope=bot&permissions=1278602576) to invite`)
            .setColor('#dd0a35')
            .setFooter('Powered by the 🔥 of the gods');

        msgObj.channel.send(embed);
    }
}
