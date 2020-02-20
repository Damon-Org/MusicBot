const
    requireDir = require('require-dir'),
    path = require('path'),
    fs = require('fs'),
    requireDirectory = require('require-dir');
/**
 * This class registers all commands
 * @category Classes
 */
class CommandRegisterer {
    /**
     * @constructs
     * @param {MusicBot} musicBot MusicBot instance
     * @param {string} configPath a string pointing towards the command.json
     */
    constructor(musicBot, configPath) {
        /**
         * @type {MusicBot}
         * @readonly
         */
        this.musicBot = musicBot;
        /**
         * The path to the command.json config file
         * @type {external:String}
         */
        this.configPath = configPath;

        this.setup();
    }

    /**
     * This function will loop over the config file and link the class instance to their respective command
     */
    setup() {
        // This will require all commands within this directory
        this.command = requireDir('.', { recurse: true });

        this.config = JSON.parse(fs.readFileSync(this.configPath));

        /**
         * This is a command map that has the following structure
         * { "command_name" => commandInstance }
         * @type {external:Map}
         * @readonly
         */
        this.commands = new Map();

        // Get the command category
        for (const commandCategory in this.config) {
            if (this.config.hasOwnProperty(commandCategory)) {
                // assign the commandArr inside this category
                const
                    categoryObject = this.config[commandCategory],
                    commandArr = categoryObject.commands;

                // loop through those commands
                for (let i = 0; i < commandArr.length; i++) {
                    // assign commandObj
                    const command = commandArr[i];

                    try {
                        if (command.disabled) {
                            throw 'Command disabled, skipping';
                        }

                        const
                            commandData = {
                                category: commandCategory,
                                guild_only: categoryObject.guild_only,
                                musicBot: this.musicBot
                            },
                            args = [commandData, command],
                            // create a new instance related to this command
                            instance = new this.command[commandCategory][command.name](...args);

                        commandData.instance = instance;

                        // assign this command to a reference of the instance
                        this.commands.set(command.name, commandData);
                        // loop through all command aliases
                        for (let x = 0; x < command.aliases.length; x++) {
                            // assign alias
                            const alias = command.aliases[x];
                            // give alias a spot in the map
                            this.commands.set(alias, commandData);
                        }
                    } catch (e) {
                        console.log(`\x1b[33m[COMMAND/WARN]\x1b[0m Invalid instance or disabled: ${command.name}`);
                    }
                }
            }
        }

        console.log(`[COMMAND/INFO] Mapping of commands done with ${this.commands.size} commands registered.`);
    }

    /**
     * Check if the received message is a valid command
     * @param {external:Discord_Message} message Discord.js Message Class instance
     * @returns {external:Boolean} True if a command has been detected, false if none were found
     */
    async checkMessage(message) {
        // This regex will remove any redudant
        const content = message.content.replace(/\s+/g, ' ');

        let prefix = null;
        if (!message.guild) {
            prefix = this.musicBot.config.development ? this.musicBot.config.default_prefix.dev : this.musicBot.config.default_prefix.prod;
        }
        else {
            const server = this.musicBot.serverUtils.getClassInstance(message.guild.id);
            prefix = await server.getPrefix()
        }

        // check if the message starts with the prefix we want
        if (content.startsWith(prefix)) {
            const
                args = content.substr(prefix.length).split(' '),
                // assign command
                command = args[0];
            // drop command from the arguments list
            args.shift();

            // check if the command used is in the list of commands
            if (this.commands.has(command)) {
                const
                    cmdObj = this.commands.get(command),
                    cmd = cmdObj.instance;

                cmd.msgObj = message;
                cmd.args = args;

                try {
                    cmd.check(command);
                } catch (e) {
                    message.channel.send(`An error occured while trying to run the following command \`${command}\`\nWith the following output: \`\`\`${e.stack}\`\`\``);
                }

                return true;
            }

            return false;
        }
    }
}

module.exports = CommandRegisterer;
