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
                            // create a new instance related to this command
                            instance = new this.command[commandCategory][command.name](command),
                            // make up the command data
                            commandData = {
                                category: commandCategory,
                                guild_only: categoryObject.guild_only,
                                instance: instance,
                                parent: command.name
                            };

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
     * This method will check if a command is ran in a locked channel
     * @param {external:String} command The command that triggered the request
     * @param {external:Object} cmdObj
     * @param {external:Discord_Message} msgObj
     * @param {external:String[]} args An array of command arguments
     * @returns {external:Boolean} True if the stack flow may continue, false if the stack needs to be interrupted
     */
    async beforeRunCommand(command, cmdObj, msgObj, args) {
        if (cmdObj.guild_only) {
            if (!msgObj.member) {
                const newMsg = await msgObj.reply(`The following command \`${command}\` can not be ran outside of guilds.`);
                newMsg.delete(5e3);

                return false;
            }

            let lockedChannel = null;

            const
                serverUtils = this.musicBot.serverUtils,
                server = serverUtils.getClassInstance(msgObj.guild.id),
                channel = msgObj.channel;

            lockedChannel = await server.getLockedChannels();
            lockedChannel = lockedChannel[cmdObj.category];

            if (lockedChannel == undefined || lockedChannel == null || lockedChannel == 'null' || lockedChannel == channel.id) {
                return true;
            }

            const newMsg = await msgObj.reply(`you can't use commands from the ${cmdObj.category} category here, please use <#${lockedChannel}> text-channel for ${cmdObj.category} related commands.`);
            newMsg.delete({timeout: 5500});

            return false;
        }

        return true;
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
                const cmdObj = this.commands.get(command);

                if (! await this.beforeRunCommand(command, cmdObj, message, args)) return false;

                if (!this.checkParams(message, cmdObj.instance, args)) return false;

                try {
                    cmdObj.instance.onCommand(this.musicBot, message, command, args);
                } catch (e) {
                    message.channel.send(`An error occured while trying to run the following command \`${command}\`\nWith the following output: \`\`\`${e.stack}\`\`\``);
                }

                return true;
            }

            return false;
        }
    }

    /**
     * Checks if all params have been satisfied and if there weren't too many given
     * @param {external:Discord_Message} msgObj
     * @param {*} cmdInstance
     * @param {external:String[]} arguments Array of arguments given by the user trying to execute the command
     * @returns {external:Boolean} Returns true on satisfied params, false when incorrect commands were given
     */
    checkParams(msgObj, cmdInstance, args) {
        const newEmbed = new this.musicBot.Discord.MessageEmbed();
        let err = false;

        if (cmdInstance.params.length < args.length && !cmdInstance.params[0].allow_sentence) {
            newEmbed.setTitle('Too many arguments error.');

            err = true;
        }

        if (cmdInstance.params.length > 1 && !err) {
            for (let i = 0; i < cmdInstance.params.length; i++) {
                const param = cmdInstance.params[i];
                if (param.required) {
                    if (!args[i]) {
                        newEmbed.setTitle(`This command expects at least ${i+1} arguments`);

                        err = true;

                        break;
                    }
                }
            }
        }

        if (err) {
            newEmbed.setDescription(`View the documentation of [this command on our site](https://music.damon.sh/#/commands?c=${cmdInstance.name})`);

            msgObj.channel.send(newEmbed);

            return false;
        }

        return true;
    }
}

module.exports = CommandRegisterer;
