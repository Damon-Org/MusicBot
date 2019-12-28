const
    { promisify } = require('util'),
    exec = promisify(require('child_process').exec),
    humanReadableTime = require('humanize-duration');

module.exports = class Stats {
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
    async onCommand(musicBot, msgObj, command, args) {
        const
            ffmpegOutput = (await exec('ffmpeg -version')).stdout,
            ffmpegVersion = ffmpegOutput.substring(ffmpegOutput.indexOf('ffmpeg version') + 'ffmpeg version '.length, ffmpegOutput.indexOf(' Copyright'));

        const richEmbed = new musicBot.Discord.RichEmbed()
            .setTitle('Statistics? Stats? Mmmm whatever...')
            .addField('Uptime', humanReadableTime(Math.round((Date.now() - musicBot.bootUp) / 1000) * 1000))
            .addField('Environment Version', `Node ${process.version}`)
            .addField('ffmpeg Version', ffmpegVersion)
            .addField('Created by', musicBot.creator.tag)
            .addField('This instance is managing', `${musicBot.client.guilds.size} servers`);

        msgObj.channel.send(richEmbed);
        //msgObj.channel.send(`This bot has been running for more than ${humanReadableTime(Math.round((Date.now() - musicBot.bootUp) / 1000) * 1000)}`)
    }
}
