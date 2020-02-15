const { MessageEmbed } = require('discord.js');

/**
 * Whenever a user starts talking this class will handle into asking them if they want to be recorded or not
 * @category RecordingSystem
 */
class RecordingRequest {
    /**
     * @param {RecordingSystem} recordingSystem
     * @param {external:Discord_User} user
     */
    constructor(recordingSystem, user) {
        /**
         * @type {RecordingSystem}
         */
        this.recordingSystem = recordingSystem;
        /**
         * @type {external:Discord_User}
         */
        this.user = user;

        /**
         * @type {Boolean}
         */
        this.accepted = false;
        /**
         * @type {Boolean}
         */
        this.messageSend = user.bot ? true : false;
    }

    /**
     * Sends a recording request embed to a user
     */
    async sendRequestEmbed() {
        if (this.accepted || this.messageSend) {
            return;
        }

        this.messageSend = true;

        const embed = new MessageEmbed()
            .setTitle('Recording Request')
            .addField('From server', this.recordingSystem.serverInstance.guild.name)
            .addField('Would like to:', 'record your conversation')
            .addField('Click ✅', 'to accept this request', true)
            .addField('Click the cross', 'to decline this request', true)
            .setFooter(`record_permission for ${this.recordingSystem.serverInstance.id}`);

        const newMsg = await this.user.send(embed);

        await newMsg.react('✅');
        newMsg.react('❎');
    }
}

module.exports = RecordingRequest;
