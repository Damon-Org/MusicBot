import Server from '../structures/Server.js'
import { Guild } from 'discord.js'

export default class ServerManager extends Map {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super();

        this.mainClient = mainClient;
    }

    /**
     * @param {String} guildResolvable A Discord Guild or Guild Id
     */
    get(guildResolvable) {
        const guild_id = guildResolvable instanceof Guild ? guildResolvable.id : guildResolvable;

        if (this.has(guild_id)) {
            return super.get(guild_id);
        }

        const
            guild = guildResolvable instanceof Guild ? guildResolvable : this.mainClient.guilds.cache.get(guildResolvable),
            server = new Server(this.mainClient, guild);
        this.set(guild_id, server);

        return server;
    }
}
