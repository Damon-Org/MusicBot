// const { BotEvents } = require('./bot_events.js');

module.exports = class BasicBot {
    constructor() {
        this.Discord = require('discord.js');

        this.client = new this.Discord.Client();
    }

    login(token) {
        this.client.login(token);
    }

    async logout() {
        await this.client.destroy();

        console.log('Client has been logged out');

        return true;
    }
}
