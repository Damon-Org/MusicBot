import BaseModule from '../structures/modules/BaseModule.js'
import ServerUtils from '../util/Server.js'

export default class EventListener extends BaseModule {
    constructor(mainClient) {
        super(mainClient);

        this.register(EventListener, {
            name: 'eventListener',
            requires: [
                'commandRegistrar',
                'ws'
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
                },
                {
                    mod: 'ws',
                    name: 'event',
                    call: '_onWsEvent'
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
     * @param {string} eventName
     * @param {JSON} data
     * @param {string} id The message identifier
     */
    _onWsEvent(eventName, data, id = null) {
        const
            commonValues = this.getModule('common'),
            ws = this.getModule('ws');

        switch (eventName) {
            case 'INFO':{
                ws.sendReply(id, {
                    'shardId': commonValues.id,
                    'channels': this.mainClient.channels.cache.size,
                    'guilds': this.mainClient.guilds.cache.size,
                    'ping': Math.round(this.mainClient.ws.ping),
                    'cachedUsers': this.mainClient.users.cache.size
                });

                break;
            }
            case 'RELOAD': {
                this.getModule('commandRegistrar').setup();

                ws.sendReply(id, {
                    rcvd: true
                });

                break;
            }
            case 'USER_UPDATE': {
                if (!this.users.has(data.id)) break;
                const user = this.users.get(data.id);

                for (const key in data.delta) {
                    if (data.delta.hasOwnProperty(key)) {
                        const value = data.delta[key];

                        if (!isNaN(value)) {
                            const originalVal = user.storage.get(key);
                            user.storage.set(key, originalVal + value);
                        }
                    }
                }

                for (const key in data.props) {
                    if (data.props.hasOwnProperty(key)) {
                        const value = data.props[key];

                        user.storage.set(key, value);
                    }
                }

                ws.sendReply(id, {
                    rcvd: true
                });

                break;
            }
        }
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
