const
    BasicBot = require('./base'),
    CustomEvents = require('./customevents'),
    MODE = require('../music/dj/mode');

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

        this.customEvent.voice.on('join', (guild, serverMember, voiceChannel) => this.onVoiceJoin(guild, serverMember, voiceChannel));
        this.customEvent.voice.on('leave', (guild, serverMember, voiceChannel) => this.onVoiceLeave(guild, serverMember, voiceChannel));

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
        if (!this.commandRegistrar.checkMessage(msgObj)) {
            // Message is not a command
        }
    }

    /**
     * @param {external:Discord_Guild} guild
     * @param {external:Discord_GuildMember} serverMember
     * @param {external:Discord_VoiceChannel} voiceChannel
     */
    onVoiceJoin(guild, serverMember, voiceChannel) {
        const musicSystem = this.serverUtils.getClassInstance(guild.id).musicSystem;

        if (!musicSystem.queueExists()) return;

        if (musicSystem.shutdown.type() == 'time' && voiceChannel.members.size > 1) {
            musicSystem.shutdown.cancel();
        }

        musicSystem.djManager.join(serverMember);
    }

    /**
     * @param {external:Discord_Guild} guild
     * @param {external:Discord_GuildMember} serverMember
     * @param {external:Discord_VoiceChannel} voiceChannel
     */
    onVoiceLeave(guild, serverMember, voiceChannel) {
        const musicSystem = this.serverUtils.getClassInstance(guild.id).musicSystem;

        if (!musicSystem.queueExists() || !musicSystem.isDamonInVC(voiceChannel)) return;

        if (musicSystem.isDamonInVC(voiceChannel) && voiceChannel.members.size == 1) {
            musicSystem.shutdown.delay('time', 3e5);
        }
        musicSystem.djManager.remove(serverMember);

        if (!voiceChannel.guild.me.voice.channel) {
            musicSystem.shutdown.instant();
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
            if (!msgObj.embeds[0] || !msgObj.embeds[0].footer || !msgObj.embeds[0].footer.text) return;
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
    async reactionToggleEvents(messageReaction, user) {
        const emoji = messageReaction.emoji.name;

        if (['⏮️', '⏸', '⏭', '🔁'].includes(emoji)) {
            if (!messageReaction.message.member) {
                // The MessageReaction did not happen inside a Guild in that case we ignore it
                return;
            }

            const
                msgObj = messageReaction.message,
                serverId = msgObj.guild.id,
                serverInstance = this.serverUtils.getClassInstance(serverId),
                musicSystem = serverInstance.musicSystem,
                serverMember = await msgObj.guild.members.fetch(user);

            if (musicSystem.djManager.has(serverMember.id)
                || musicSystem.djManager.mode === MODE['FREEFORALL']
                || serverMember.roles.cache.find(x => x.name.toLowerCase() === 'dj')
                || serverMember.hasPermission('MANAGE_GUILD', false, true, true)
            ) serverInstance.musicSystem.onMusicPlayerAction(emoji, msgObj, user);
        }
    }

    async ready() {
        this.log('SHARD', 'INFO', `Took ${Date.now() - this.bootUp}ms to setup.`);

        this.creator = await this.client.users.fetch('243072972326305798');

        const servers = this.client.guilds.cache;
        for (let server of servers) {
            this.serverUtils.addGuildIfNotExists(server[1]);
        }

        this.startIntervals();
    }
}

module.exports = BotEvents;
