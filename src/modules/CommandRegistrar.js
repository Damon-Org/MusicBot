import fs from 'fs'

import BaseModule from '../structures/modules/BaseModule.js'
import importDir from '../util/ImportDir.js'
import log from '../util/Log.js'

export default class CommandRegistrar extends BaseModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super(mainClient);

        this.register(CommandRegistrar, {
            name: 'commandRegistrar'
        });
    }

    get(commandName) {
        this._commands.get(commandName);
    }

    /**
     * Check if the received message starts with a valid prefix
     * @param {Message} msg Discord.js Message Class instance
     * @returns {Boolean} True if a command has been detected, false if none were found
     */
    async checkMessage(msg) {
        if (!this.getModule('guildSetting').ready) return false;
        if (msg.system) return false;
        if (msg.partial) return false;
        if (msg.type !== 'DEFAULT') return false;
        if (msg.author.bot) return false;

        // This regex will remove any redudant "spaces"
        const content = msg.content.replace(/\s+/g, ' ');

        let prefix = null;
        if (!msg.guild) {
            prefix = this.defaultPrefix;
        }
        else {
            const server = this.servers.get(msg.guild.id);
            prefix = server.prefix;
        }

        // check if the message starts with the prefix we want
        if (content.startsWith(prefix)) {
            const ctx = content.substr(prefix.length);

            return this._commandMatch(msg, ctx);
        }
        else if (this.config.allow_mention_prefix && content.match(/<@!?(\d+)>/i) && content.match(/<@!?(\d+)>/i)[1] == this.mainClient.user.id) {
            const ctx = content.replace(/<@[^>]+> /, '');

            return this._commandMatch(msg, ctx, true);
        }

        return false;
    }

    /**
     * Tries to match a message's content against all the registered commands
     * @private
     * @param {Message} msg Discord.js Message Class instance
     * @param {Array<String>} ctx
     * @param {Boolean} mentioned If the command was activated through a mention
     */
    _commandMatch(msg, ctx, mentioned) {
        const args = ctx.split(' ');

        for (let i = args.length; 0 < i; i--) {
            const
                attempt = args.slice(0, i).join(' '),
                match = this._commands.get(attempt);
            if (!match) continue;

            const
                instance = match,
                index = attempt.split(' ').length,
                trigger = args.splice(0, index);

            try {
                const clone = instance.clone();
                clone.check(msg, args, trigger.join(' '), mentioned);
            } catch (e) {
                message.channel.send(`An error occured while trying to run the following command \`${command}\`\nWith the following output: \`\`\`js\n${e.stack}\`\`\``);
            }

            return true;
        }

        return false;
    }

    /**
     * @private
     * @param {String} category The original category this bit was part of
     * @param {Object} bits The command category object within a category folder
     * @param {String} [parentBit=''] Defaults to an empty string
     */
    async _recursiveRegister(category, bits, parentBit = '') {
        for (const bit in bits) {
            if (bits.hasOwnProperty(bit)) {
                if (bits[bit] instanceof Promise) {
                    try {
                        bits[bit] = (await bits[bit]).default;

                        const instance = new bits[bit](category, this.mainClient);
                        if (instance.disabled) {
                            log.warn('COMMAND', `Command disabled: '${parentBit}${instance.name}'`);

                            continue;
                        }

                        if (instance.permissions && instance.permissions.levels.filter(x => x.type === 'COMMAND_HANDLED').length == 1) {
                            if (!instance.permission || typeof instance.permission !== 'function') {
                                log.error('COMMAND', `Command '${parentBit}${instance.name}' has COMMAND_HANDLED permission set but doesn't handle these!`);

                                continue;
                            }
                        }

                        this._commands.set(`${parentBit}${instance.name}`, instance);

                        if (this.output && !instance.hidden) {
                            if (parentBit.length == 0) {
                                this.output[category].commands.push(instance.rawData);
                            }
                            else {
                                if (!this.output[category].children) this.output[category].children = {};
                                if (!this.output[category].children[parentBit.trim()]) this.output[category].children[parentBit.trim()] = [];

                                this.output[category].children[parentBit.trim()].push(instance.rawData);
                            }
                        }
                        else if (instance.hidden) {
                            log.info('COMMAND', `Command hidden: '${parentBit}${instance.name}'`);
                        }

                        for (const alias of instance.aliases) {
                            this._commands.set(`${parentBit}${alias}`, instance);
                        }

                        continue;
                    } catch (e) {
                        e.ignore = true;

                        log.warn('COMMAND', `The following command: ${parentBit}${bit}\nGenerated the following error:\n${e.stack}`);
                    }
                }

                await this._recursiveRegister(category, bits[bit], `${parentBit}${bit} `);
            }
        }
    }

    async setup() {
        // This will require all commands within this directory
        const rawCommands = importDir('../commands/', { recurse: true });

        /**
         * @type {external:Map}
         * @private
         */
        this._commands = new Map();
        if (this.config.development && this.config.generate_command_json) this.output = {};

        for (const category in rawCommands) {
            if (rawCommands.hasOwnProperty(category)) {
                if (this.output) this.output[category] = { commands: [] };

                await this._recursiveRegister(category, rawCommands[category]);
            }
        }

        log.info('COMMAND', `Mapping of commands done with ${this._commands.size} commands registered (aliases included).`);

        if (this.output) {
            fs.writeFile(process.cwd() + '/data/commands.json', JSON.stringify(this.output, null, '    '), { flag: 'w+' }, (err) => {
                if (err) {
                    throw err;
                }

                log.info('COMMAND', `Generated new 'data/commands.json' with the mapped commands.`);
            });
        }

        this.defaultPrefix = this.config.development ? this.config.default_prefix.dev : this.config.default_prefix.prod;
    }
}
