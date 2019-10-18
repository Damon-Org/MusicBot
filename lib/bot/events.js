const
    BasicBot = require('./base.js'),
    CustomEvents = require('./customevents.js');

// self is used instead of this as "this" loses its instance when called as an ES6 function
let self = null;
module.exports = class BotEvents extends BasicBot {
    constructor() {
        super();
    }

    startListeners() {
        self = this;
        self.customEvent = new CustomEvents(self.client);

        self.client.on('ready', self.ready);

        self.client.on('message', self.onMsg);

        self.client.on('voiceStateUpdate', self.onVoiceStateUpdate);

        self.customEvent.reaction.on('toggle', (messageReaction, user) => self.reactionToggleEvents(messageReaction, user));

        self.customEvent.reaction.on('add', (messageReaction, user) => self.reactionAddEvents(messageReaction, user));
    }

    /**
     * @param {Discord.Message} msgObj Discord.js Message Class instance
     */
    onMsg(msgObj) {
        if (!self.commandRegisterer.checkMessage(msgObj)) {
            // Message is not a command
        }
    }

    /**
     * @param {Discord.GuildMember} oldMember
     * @param {Discord.GuildMember} newMember
     */
    onVoiceStateUpdate(oldMember, newMember) {
        const voicechannel = self.client.channels.get(oldMember.voiceChannelID);
        if (voicechannel != undefined && voicechannel.members.get(self.client.user.id) && voicechannel.members.size == 1) {
            // VoiceChannel is empty except for our bot so we destroy the queue and leave
            const musicSystem = self.serverUtils.getClassInstance(voicechannel.guild.id);

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
                serverInstance = self.serverUtils.getClassInstance(serverId);

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
        self.client.user.setPresence({
            game: {
                name: 'Yimura pull his hair of his head',
                type: 'WATCHING',
                url: 'https://www.twitch.tv/yimura_'
            }
        });

        console.log(`Shard #${self.client.shard.id + 1} took ${Date.now() - self.bootUp}ms to setup.`);

        const servers = self.client.guilds;
        for (let server of servers) {
            self.serverUtils.addGuildIfNotExists(server[1]);
        }


    }
}
