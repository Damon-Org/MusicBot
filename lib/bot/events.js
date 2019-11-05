const
    BasicBot = require('./base.js'),
    CustomEvents = require('./customevents.js');

module.exports = class BotEvents extends BasicBot {
    constructor() {
        super();
    }

    startListeners() {
        this.customEvent = new CustomEvents(this.client);

        this.client.on('ready', () => this.ready());

        this.client.on('message', (msg) => this.onMsg(msg));

        this.client.on('voiceStateUpdate', (oldMember, newMember) => this.onVoiceStateUpdate(oldMember, newMember));

        this.customEvent.reaction.on('toggle', (messageReaction, user) => this.reactionToggleEvents(messageReaction, user));

        this.customEvent.reaction.on('add', (messageReaction, user) => this.reactionAddEvents(messageReaction, user));
    }

    /**
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     */
    onMsg(msgObj) {
        if (!this.commandRegisterer.checkMessage(msgObj)) {
            // Message is not a command
        }
    }

    /**
     * @param {Discord.GuildMember} oldMember
     * @param {Discord.GuildMember} newMember
     */
    onVoiceStateUpdate(oldMember, newMember) {
        const voicechannel = this.client.channels.get(oldMember.voiceChannelID);
        if (voicechannel != undefined && voicechannel.members.get(this.client.user.id) && voicechannel.members.size == 1) {
            // VoiceChannel is empty except for our bot so we destroy the queue and leave
            const musicSystem = (this.serverUtils.getClassInstance(voicechannel.guild.id)).musicSystem;

            musicSystem.reset();
            voicechannel.leave();
        }
    }

    /**
     * @param {Discord.MessageReaction} messageReaction
     * @param {Discord.User} user
     */
    reactionAddEvents(messageReaction, user) {
        const
            emoji = messageReaction.emoji.name,
            choiceOption = ['\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '🚫'].indexOf(emoji);

        if (choiceOption != -1) {
            if (!messageReaction.message.member) {
                return;
            }

            const
                msgObj = messageReaction.message,
                serverId = msgObj.guild.id,
                serverInstance = this.serverUtils.getClassInstance(serverId);

            serverInstance.musicSystem.onChoiceEmbedAction(choiceOption, msgObj, user);
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
        this.client.user.setPresence({
            game: {
                name: 'Yimura pull his hair of his head',
                type: 'WATCHING',
                url: 'https://www.twitch.tv/yimura_'
            }
        });

        console.log(`Shard #${this.client.shard.id + 1} took ${Date.now() - this.bootUp}ms to setup.`);

        const servers = this.client.guilds;
        for (let server of servers) {
            this.serverUtils.addGuildIfNotExists(server[1]);
        }
    }
}
