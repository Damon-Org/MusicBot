const
    BasicBot = require('./base.js'),
    CustomEvents = require('./customevents.js');

/**
 * BotEvents class
 * @category Bot
 * @extends BasicBot
 */
class BotEvents extends BasicBot {
    constructor() {
        super();
    }

    startListeners() {
        /**
         * @type {CustomEvents}
         * @readonly
         */
        this.customEvent = new CustomEvents(this.client);

        this.client.on('ready', () => this.ready());

        this.client.on('guildCreate', (guild) => this.onGuildJoin(guild));

        this.client.on('message', (msg) => this.onMsg(msg));

        this.client.on('voiceStateUpdate', (oldMember, newMember) => this.onVoiceStateUpdate(oldMember, newMember));

        this.customEvent.reaction.on('toggle', (messageReaction, user) => this.reactionToggleEvents(messageReaction, user));

        this.customEvent.reaction.on('add', (messageReaction, user) => this.reactionAddEvents(messageReaction, user));
    }

    /**
     * @param {external:Discord_Guild} guild Discord.js Guild Class instance
     */
    onGuildJoin(guild) {
        this.serverUtils.addGuildIfNotExists(guild);
    }

    /**
     * @param {external:Discord_Message} msgObj Discord.js Message Class instance
     */
    onMsg(msgObj) {
        if (!this.commandRegisterer.checkMessage(msgObj)) {
            // Message is not a command
        }
    }

    /**
     * @param {Discord.Discord_GuildMember} oldMember
     * @param {Discord.Discord_GuildMember} newMember
     */
    onVoiceStateUpdate(oldMember, newMember) {
        const voicechannel = this.client.channels.get(oldMember.channelID);
        if (voicechannel != undefined && voicechannel.members.get(this.client.user.id) && voicechannel.members.size == 1) {
            // VoiceChannel is empty except for our bot so we destroy the queue and leave
            const musicSystem = (this.serverUtils.getClassInstance(voicechannel.guild.id)).musicSystem;

            musicSystem.player.disconnect();
            musicSystem.reset();
        }
    }

    /**
     * @param {Discord.MessageReaction} messageReaction
     * @param {Discord.User} user
     */
    reactionAddEvents(messageReaction, user) {
        const
            emoji = messageReaction.emoji,
            choiceOption = ['\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '🚫'].indexOf(emoji.name),
            yesnoOption = ['✅', '❎'].indexOf(emoji.name);

        const
            msgObj = messageReaction.message,
            serverId = msgObj.guild ? msgObj.guild.id : msgObj.embeds[0].footer.text.split(' for ')[1],
            serverInstance = this.serverUtils.getClassInstance(serverId);

        if (choiceOption != -1) {
            if (!messageReaction.message.member) {
                return;
            }

            serverInstance.musicSystem.onChoiceEmbedAction(choiceOption, msgObj, user);
        }
        else if (yesnoOption != -1) {
            if (!msgObj.embeds[0] || !msgObj.embeds[0].footer.text) return;
            const option = msgObj.embeds[0].footer.text.split(' for ')[0];

            switch (option) {
                case 'playlist_detected':
                    serverInstance.musicSystem.onPlaylistAction(yesnoOption, msgObj, user);
                    break;
                case 'record_permission':
                    serverInstance.recordingSystem.onRequestAction(yesnoOption, msgObj, user);
                    break;
            }
        }
    }

    /**
     * @param {Discord.MessageReaction} messageReaction
     * @param {Discord.User} user
     */
    reactionToggleEvents(messageReaction, user) {
        const emoji = messageReaction.emoji.name;

        if (['⏮', '⏸', '⏭', '🔁'].includes(emoji)) {
            if (!messageReaction.message.member) {
                // The MessageReaction did not happen inside a Guild in that case we ignore it
                return;
            }

            const
                msgObj = messageReaction.message,
                serverId = msgObj.guild.id,
                serverInstance = this.serverUtils.getClassInstance(serverId);

            serverInstance.musicSystem.onMusicPlayerAction(emoji, msgObj, user);
        }
    }

    ready() {
        console.log(`[SHARD/INFO]\x1b[0m Took ${Date.now() - this.bootUp}ms to setup.`);

        this.creator = this.client.users.get('243072972326305798');

        const servers = this.client.guilds;
        for (let server of servers) {
            this.serverUtils.addGuildIfNotExists(server[1]);
        }

        this.startIntervals();
    }
}

module.exports = BotEvents;
