const
    requireDir = require('require-dir'),
    path = require('path'),
    fs = require('fs');
/**
 * This class registers all commands
 * @category Classes
 */
class CommandRegisterer {
    /**
     * @constructs
     * @param {DamonBase} damonBase DamonFramework instance
     * @param {Array<*>} args Argument array to pass to the commands we initialise
     */
    constructor(damonBase, ...args) {
        /**
         * @type {damonBase}
         * @readonly
         */
        this.db = damonBase;

        this.output = this.db.config.development && this.db.config.generate_command_json;

        this.args = args;

        this.setup();
    }

    /**
     * Private Function
     * @param {external:String} category The original category this bit was part of
     * @param {external:Object} bits The command category object within a category folder
     * @param {external:String} parentBit The parentBit this bit is part of
     */
    recursiveRegister(category, bits, parentBit = '') {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.db.log('COMMAND', 'INFO', `Mapping of commands done with ${this.commands.size} commands registered (aliases included).`);

            if (this.output) {
                fs.writeFile(this.db.main_dir + '/data/commands.json', JSON.stringify(this.output, null, '    '), { flag: 'w+' }, (err) => {
                    if (err) {
                        throw err;
                    }

                    this.db.log('COMMAND', 'INFO', `Generated new 'data/commands.json' with the mapped commands.`);
                });
            }
        }, 50);

        for (const bit in bits) {
            if (bits.hasOwnProperty(bit)) {
                if (typeof bits[bit] === 'function') {
                    try {
                        const instance = new bits[bit](category, ...this.args);
                        if (instance.disabled) {
                            this.db.log('COMMAND', 'WARN', `Command disabled: '${parentBit}${instance.name}'`)

                            continue;
                        }

                        this.commands.set(`${parentBit}${instance.name}`, instance);

                        if (this.output) {
                            if (parentBit.length == 0) {
                                this.output[category].commands.push(instance.rawData);
                            }
                            else {
                                if (!this.output[category].children) this.output[category].children = {};
                                if (!this.output[category].children[parentBit.trim()]) this.output[category].children[parentBit.trim()] = [];

                                this.output[category].children[parentBit.trim()].push(instance.rawData);
                            }
                        }

                        for (const alias of instance.aliases) {
                            this.commands.set(`${parentBit}${alias}`, instance);
                        }

                        continue;
                    } catch (e) {
                        this.db.log('COMMAND', 'WARN', `The following command: ${parentBit}${bit}\nGenerated the following error:\n${e.stack}`);
                    }
                }

                this.recursiveRegister(category, bits[bit], `${parentBit}${bit} `);
            }
        }
    }

    /**
     * This function will loop over the config file and link the class instance to their respective command
     */
    setup() {
        // This will require all commands within this directory
        const rawCommands = requireDir('.', { recurse: true, extensions: ['.js'] });

        /**
         * This is a command map that has the following structure
         * { "command name" => commandInstance }
         * @type {external:Map}
         * @readonly
         */
        this.commands = new Map();
        if (this.output) this.output = {};

        for (const category in rawCommands) {
            if (rawCommands.hasOwnProperty(category)) {
                if (this.output) this.output[category] = { commands: [] };

                this.recursiveRegister(category, rawCommands[category]);
            }
        }

        this.default_prefix = this.db.config.development ? this.db.config.default_prefix.dev : this.db.config.default_prefix.prod;

        // this.db.log('COMMAND', 'INFO', `Mapping of commands done with ${this.commands.size} commands registered.`);
    }

    /**
     * Check if the received message is a valid command
     * @param {external:Discord_Message} message Discord.js Message Class instance
     * @returns {external:Boolean} True if a command has been detected, false if none were found
     */
    async checkMessage(message) {
        if (!this.db.lazyLoader.ready) return false;
        if (message.system) return false;
        if (message.partial) return false;
        if (message.type !== 'DEFAULT') return false;
        if (message.author.bot) return false;

        // This regex will remove any redudant "spaces"
        const content = message.content.replace(/\s+/g, ' ');

        let prefix = null;
        if (!message.guild) {
            prefix = this.default_prefix;
        }
        else {
            const server = this.db.serverUtils.getClassInstance(message.guild.id);
            prefix = await server.getPrefix(this.default_prefix);
        }

        // check if the message starts with the prefix we want
        if (content.startsWith(prefix)) {
            const ctx = content.substr(prefix.length);

            return this.commandMatch(message, ctx);
        }
        else if (this.db.config.allow_mention_prefix && content.match(/<@!?(\d+)>/i) && content.match(/<@!?(\d+)>/i)[1] == this.db.client.user.id) {
            const ctx = content.replace(/<@[^>]+> /, '');

            return this.commandMatch(message, ctx, true);
        }

        return false;
    }

    /**
     * @param {external:Discord_Message} message Discord.js Message Class instance
     * @param {Array<external:String>} ctx
     * @param {external:Boolean} mentioned If the command was activated through a mention
     */
    async commandMatch(message, ctx, mentioned = false) {
        const args = ctx.split(' ');

        for (let i = args.length; 0 < i; i--) {
            const
                attempt = args.slice(0, i).join(' '),
                match = this.commands.get(attempt);
            if (!match) continue;

            const
                instance = match,
                index = attempt.split(' ').length,
                trigger = args.splice(0, index);

            try {
                instance.check(message, args, trigger.join(' '), mentioned);
            } catch (e) {
                message.channel.send(`An error occured while trying to run the following command \`${command}\`\nWith the following output: \`\`\`js\n${e.stack}\`\`\``);
            }

            return true;
        }

        return false;
    }
}

module.exports = CommandRegisterer;
