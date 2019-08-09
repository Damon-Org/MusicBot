const
    requireDir = require('require-dir'),
    path = require('path'),
    fs = require('fs'),
    requireDirectory = require('require-dir');

module.exports = class CommandRegisterer {
    /**
     * @param {MusicBot} musicBot MusicBot instance
     * @param {string} configPath a string pointing towards the command.json
     */
    constructor(musicBot, configPath) {
        this.musicBot = musicBot;
        this.configPath = configPath;

        this.setup();
    }

    setup() {
        // This will require all commands within this directory
        this.command = requireDir('.', { recurse: true });

        this.config = JSON.parse(fs.readFileSync(this.configPath));

        this.commands = new Map();

        // Get the command category
        for (let commandCategory in this.config) {
            if (this.config.hasOwnProperty(commandCategory)) {
                // assign the commandArr inside this category
                const commandArr = this.config[commandCategory];

                // loop through those commands
                for (let i = 0; i < commandArr.length; i++) {
                    // assign commandObj
                    const command = commandArr[i];

                    try {
                        // create a new instance related to this command
                        const instance = new this.command[commandCategory][command.name]();
                        // assign this command to a reference of the instance
                        this.commands.set(command.name, instance);
                        // loop through all command aliases
                        for (let x = 0; x < command.aliases.length; x++) {
                            // assign alias
                            const alias = command.aliases[x];
                            // give alias a spot in the map
                            this.commands.set(alias, instance);
                        }
                    } catch (e) {
                        console.log(`Command does not have valid instance: ${command.name}`);
                    }
                }
            }
        }

        console.log(`Command mapping is done, registered ${this.commands.size} commands (includes aliases).`);
    }

    /**
     * @param {Message} message Discord.js Message Class instance
     */
    checkMessage(message) {
        // assign some basics
        const
            prefix = this.musicBot.config.default_prefix,
            content = message.content;

        // check if the message starts with the prefix we want
        if (content.startsWith(prefix)) {
            // assignments
            let
                args = content.substr(prefix.length).split(' '),
                // assign command
                command = args[0];
            // drop command from the arguments list
            args.shift();

            // check if the command used is in the list of commands
            if (this.commands.has(command)) {
                const instance = this.commands.get(command);

                instance.onCommand(this.musicBot, message, command, args);
                return true;
            }

            return false;
        }
    }
}
