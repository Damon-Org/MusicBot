module.exports = class BasicBot {
    constructor() {
        this.Discord = require('discord.js');

        this.client = new this.Discord.Client();
    }

    login(token) {
        this.client.login(token);
    }

    logout() {
        return this.client.destroy();
    }
}
