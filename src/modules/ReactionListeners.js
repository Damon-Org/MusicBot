import BaseModule from '../structures/modules/BaseModule.js'
import MODE from '../structures/server/music/dj/Mode.js'

export default class ReactionListeners extends BaseModule {
    constructor(mainClient) {
        super(mainClient);

        this.register(ReactionListeners, {
            name: 'reactionListeners',

            events: [
                {
                    name: 'reactionAdd',
                    call: '_reactionAdd'
                },
                {
                    name: 'reactionToggle',
                    call: '_reactionToggle'
                }
            ]
        });
    }

    setup() {}

    /**
     * @private
     * @param {MessageReaction} messageReaction
     * @param {User} user The user that initiated the reaction event
     */
    _reactionAdd(messageReaction, user) {
        const
            emoji = messageReaction.emoji,

            choiceOption = ['\u0031\u20E3','\u0032\u20E3','\u0033\u20E3','\u0034\u20E3','\u0035\u20E3', '🚫'].indexOf(emoji.name),
            yesnoOption = ['✅', '❎'].indexOf(emoji.name);

        const
            msgObj = messageReaction.message,
            guildId = msgObj.guild ? msgObj.guild.id : msgObj.embeds[0]?.footer.text.split(' for ')[1],
            server = this.servers.get(guildId);

        if (choiceOption != -1) {
            if (!messageReaction.message.member) {
                return;
            }

            server.music.onChoiceEmbedAction(choiceOption, msgObj, user);
        }
        else if (yesnoOption != -1) {
            if (!msgObj.embeds[0] || !msgObj.embeds[0].footer || !msgObj.embeds[0].footer.text) return;
            const option = msgObj.embeds[0].footer.text.split(' for ')[0];

            switch (option) {
                case 'playlist_detected':
                    server.music.onPlaylistAction(yesnoOption, msgObj, user);
                    break;
                case 'record_permission':
                    server.recording.onRequestAction(yesnoOption, msgObj, user);
                    break;
            }
        }
    }

    /**
     * @private
     * @param {MessageReaction} messageReaction
     * @param {User} user The user that initiated the reaction event
     */
    async _reactionToggle(messageReaction, user) {
        const emoji = messageReaction.emoji.name;

        if (['⏮️', '⏸', '⏭', '🔁'].includes(emoji)) {
            if (!messageReaction.message.member || user.id === this.mainClient.user.id) {
                // The MessageReaction did not happen inside a Guild in that case we ignore it
                return;
            }

            const
                msgObj = messageReaction.message,
                serverId = msgObj.guild.id,
                server = this.servers.get(serverId),
                music = server.music,
                serverMember = await msgObj.guild.members.fetch(user);

            if (music.djManager.has(serverMember.id)
                || music.djManager.mode === MODE['FREEFORALL']
                || serverMember.roles.cache.find(x => x.name.toLowerCase() === 'dj')
                || serverMember.hasPermission('MANAGE_GUILD', false, true, true)
            ) music.onMusicPlayerAction(emoji, msgObj, user);
        }
    }
}
