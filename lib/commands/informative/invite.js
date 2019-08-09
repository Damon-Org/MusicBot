module.exports = class Invite {
    constructor() {

    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    onCommand(musicBot, msgObj, command, args) {
        const embed = new musicBot.Discord.RichEmbed()
            .setAuthor('Made by Yimura#9999', 'https://cdn.discordapp.com/avatars/243072972326305798/a_10064694d823a9a176176f37bf65fb5e.gif')
            .setDescription('Click [here](https://discordapp.com/oauth2/authorize?&client_id=544522054930792449&scope=bot&permissions=1278602576) to invite')
            .setColor('#dd0a35')
            .setFooter('Powered by the 🔥 of the gods');

        msgObj.channel.send(embed);
    }
}
