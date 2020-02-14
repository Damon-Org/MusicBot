const { MessageEmbed } = require('discord.js');

class RecordingRequest {
    /**
     * @param {RecordingSystem} recordingSystem
     * @param {Discord.User} user
     */
    constructor(recordingSystem, user) {
        this.recordingSystem = recordingSystem;
        this.user = user;

        this.accepted = false;
        this.messageSend = user.bot ? true : false;
    }

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
