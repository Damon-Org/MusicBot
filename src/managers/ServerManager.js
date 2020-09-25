import Server from '../structures/Server.js'

export default class ServerManager extends Map {
    /**
     * @param {MainClient} main
     */
    constructor(main) {
        super();

        this._m = main;
    }

    /**
     * @param {Guild|string} guildResolvable A Discord Guild or Guild Id
     */
    get(guildResolvable) {
        const guild_id = guildResolvable.id ? guildResolvable.id : guildResolvable;

        if (this.has(guild_id)) {
            return super.get(guild_id);
        }

        const guild = guildResolvable.id ? guildResolvable : this._m.guilds.cache.get(guildResolvable);
        const server = new Server(this._m, guild);
        this.set(guild_id, server);

        return server;
    }
}
