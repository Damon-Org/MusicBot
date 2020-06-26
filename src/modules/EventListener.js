import BaseModule from '../structures/BaseModule.js'
import ServerUtils from '../util/Server.js'

export default class EventListener extends BaseModule {
    constructor(mainClient) {
        super(mainClient);

        this.register(EventListener, {
            name: 'eventListener',
            requires: [
                'commandRegistrar'
            ],
            events: [
                {
                    name: 'ready',
                    call: '_onReady'
                },
                {
                    name: 'message',
                    call: '_onMsg'
                },
                {
                    name: 'guildCreate',
                    call: '_onGuildJoin'
                },
                {
                    name: 'voiceJoin',
                    call: '_voiceJoin'
                },
                {
                    name: 'voiceLeave',
                    call: '_voiceLeave'
                }
            ]
        });
    }

    setup() {}

    /**
     * @private
     */
    _onReady() {
        const dbPool = this.getModule('db').pool;

        for (const guildId of this.mainClient.guilds.cache.keys()) {
            ServerUtils.addGuild(dbPool, guildId);
        }
    }

    /**
     * @private
     * @param {Guild} guild
     */
    _onGuildJoin(guild) {
        const server = this.servers.get(guild);

        server.options.create();
    }

    /**
     * @private
     * @param {Message} msg
     */
    _onMsg(msg) {
        this.getModule('commandRegistrar').checkMessage(msg);
    }

    /**
     * @private
     * @param {Guild} guild
     * @param {GuildMember} serverMember
     * @param {VoiceChannel} voiceChannel
     */
    _voiceJoin(guild, serverMember, voiceChannel) {
        const server = this.servers.get(guild);

        if (!server.music.queueExists()) return;

        if (server.music.shutdown.type() == 'time' && voiceChannel.members.size > 1) {
            server.music.shutdown.cancel();
        }

        server.music.djManager.join(serverMember);
    }

    /**
     * @private
     * @param {Guild} guild
     * @param {GuildMember} serverMember
     * @param {VoiceChannel} voiceChannel
     */
    _voiceLeave(guild, serverMember, voiceChannel) {
        const server = this.servers.get(guild);

        if (!server.music.queueExists() || !server.music.isDamonInVC(voiceChannel)) return;

        if (voiceChannel.members.size == 1 && !server.music.shutdown.type()) {
            server.music.shutdown.delay('time', 3e5);
        }
        server.music.djManager.remove(serverMember);

        if (!voiceChannel.guild.me.voice.channel) {
            server.music.shutdown.instant();
        }
    }
}
