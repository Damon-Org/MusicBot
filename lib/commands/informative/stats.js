const humanReadableTime = require('humanize-duration');

module.exports = class Stats {
    constructor() {

    }

    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     * @param {string} command string representing what triggered the command
     * @param {string[]} args array of string arguments
     */
    onCommand(musicBot, msgObj, command, args) {
        msgObj.channel.send(`This bot has been running for more than ${humanReadableTime(Math.round((Date.now() - musicBot.bootUp) / 1000) * 1000)}`)
    }
}
