const permissions = require('discord.js').Permissions.FLAGS;

/**
 * Basic Constructor class for a command
 * @category Util
 */
class BaseCommand {
    /**
     * @param {*} args The arguments to directly assign to the class
     */
    constructor(...args) {
        this.originalArgs = [...args];

        args.forEach((argument) => this.register(null, argument, false));
    }

    clone() {
        return new this.instance(this.category, ...this.originalArgs);
    }

    /**
     * @param {external:Object} object
     * @param {external:Boolean} internal If this is the raw register object
     */
    register(instance, object, internal = true) {
        if (typeof object !== 'object') throw new Error('Invalid self assignment, expected object but got different type instead.');

        Object.assign(this, object);

        if (internal) {
            this.instance = instance;

            delete object.category;
            this.rawData = object;
        }
        else if (this.rawData) {
            Object.assign(this.rawData, object);
        }
    }

    /**
     * Check if the person calling the command has the right to do so
     * @param {external:Discord_Message} msgObj
     * @param {Array<external:String>} args
     * @param {external:String} command The string that initiated this check
     * @param {external:Boolean} mentioned If the command was activated through a mention
     */
    async check(msgObj, args, command, mentioned) {
        this.msgObj = msgObj;
        this.args = args;

        if (await this.isUserBanned()) return false;

        if (mentioned) this.removeBotMention();

        if (!await this.hasSystemPermission()) return false;
        if (!await this.canCommandRunInChannel(command)) return false;
        if (!await this.hasPermissions()) return false;
        if (!this.hasSelfPermissions()) return false;
        if (!await this.argumentsSatisfied(command)) return false;

        try {
            if (typeof this.beforeRun === 'function' && !await this.beforeRun(command)) return false;
            if (typeof this.afterRun === 'function') await this.run(command);
            else return await this.run(command);
        } catch (e) {
            this.db.log('CMD', 'ERROR', e.stack);
            e.ignore = true;
            throw e;
        } finally {
            // Force our cleanup regardless of errors
            if (typeof this.afterRun === 'function') return await this.afterRun();
        }
    }

    /**
     * Send message shorthands
     */
    async dm(p1, p2) {
        try {
            return await this.user.send(p1, p2);
        } catch (e) {
            throw e;
        }
    }

    reply(p1, p2) {
        return this.send(p1, p2, true);
    }

    send(p1, p2, reply = false) {
        if (!this.textChannel.permissionsFor(this.db.client.user.id).has(['SEND_MESSAGES', 'ATTACH_FILES'])) {
            const
                guild = this.textChannel.guild,
                embed = new this.Discord.MessageEmbed()
                    .setAuthor(guild.name, guild.iconURL({size: 64}), `https://discordapp.com/channels/${guild.id}/${this.textChannel.id}`)
                    .setTitle('Missing permission')
                    .setDescription('I do not have permission to send messages or attach files.');

            this.dm(embed);
            return null;
        }

        if (reply) {
            return this.msgObj.reply(p1, p2);
        }
        return this.textChannel.send(p1, p2);
    }

    /**
     * Discord Shorthands
     */
     get serverMember() {
        if (this.msgObj.member) {
            return this.msgObj.member;
        }
        return null;
    }
    get user() {
        return this.msgObj.author;
    }
    get textChannel() {
        return this.msgObj.channel;
    }
    get voiceChannel() {
        return this.serverMember.voice.channel;
    }
    get serverInstance() {
        return this.serverUtils.getClassInstance(this.msgObj.guild.id);
    }
    get musicSystem() {
        return this.serverInstance.musicSystem;
    }

    /**
     * Util shorthands
     */
    get embedUtils() {
        return this.db.embedUtils;
    }
    get mainUtils() {
        return this.db.mainUtils;
    }
    get musicUtils() {
        return this.db.musicUtils;
    }
    get serverUtils() {
        return this.db.serverUtils;
    }
    get userUtils() {
        return this.db.userUtils;
    }

    async argumentsSatisfied(command) {
        const embed = new this.db.Discord.MessageEmbed();
        let exception = false;

        if (this.args.length > this.params.length && !this.params[0]) {
            embed.setTitle('This command does not expect any arguments.');

            exception = true;
        }

        for (let i = 0; i < this.args.length && !exception; i++) {
            if (!this.params[i] && !this.params[i-1].allow_sentence) {
                embed.setTitle('Too many arguments.');

                exception = true;

                break;
            }
            if (this.params[i].allow_sentence) break;

            if (i+1 == this.args.length && this.params[i+1] && this.params[i+1].required) {
                embed.setTitle('Not enough arguments.');

                exception = true;

                break;
            }
        }

        if (exception) {
            const prefix = await this.serverInstance.getPrefix();

            embed.setDescription(`View the documentation of [this command on our site](https://music.damon.sh/#/commands?c=${encodeURI(this.name)}&child=${encodeURI(command.replace(this.name, '').trim())}${prefix == this.db.commandRegisterer.default_prefix ? '' : `&p=${encodeURI(prefix)}`})`);

            this.textChannel.send(embed);

            return false;
        }

        return true;
    }

    /**
     * @param {external:String} command The command that invoked the request
     */
    async canCommandRunInChannel(command) {
        const isGuild = this.serverMember || this.msgObj.guild;
        if (!this.guild_only && !isGuild) return true;
        if (this.guild_only && !isGuild) {
            const newMsg = await this.msgObj.reply(`The following command \`${command}\` can not be ran outside of servers.`);

            return false;
        }

        const lockedChannel = (await this.serverInstance.getLockedChannels())[this.category];
        if (lockedChannel == undefined || lockedChannel == null || lockedChannel == 'null' || lockedChannel == this.textChannel.id) {
            return true;
        }

        const newMsg = await this.msgObj.reply(`you can't use commands from the ${this.category} category here, please use <#${lockedChannel}> text-channel for ${this.category} related commands.`);
        newMsg.delete({timeout: 5500});
        this.msgObj.delete();

        return false;
    }

    hasSelfPermissions() {
        if (!this.msgObj.guild || !this.serverMember) return true;
        if (!this.self_permission) return true;

        if (this.self_permission['channel'] || this.self_permission['text_channel'] || this.self_permission['voice_channel']) {
            if (this.voiceChannel && (this.self_permission['channel'] || this.self_permission['voice_channel']) && !this.voiceChannel.permissionsFor(this.db.client.user.id).has(this.self_permission['channel'] || this.self_permission['voice_channel'])) {
                const embed = new this.db.Discord.MessageEmbed()
                    .setTitle("❌ Missing Permissions ❌")
                    .setDescription(`**__I__ don't have the __${this.self_permission['channel'] || this.self_permission['voice_channel']}__ permission**\nfor voice channel you're in.`)
                    .setColor("#ffff00")
                this.textChannel.send(embed);

                return false;
            }

            if ((this.self_permission['channel'] || this.self_permission['voice_channel']) && !this.textChannel.permissionsFor(this.db.client.user.id).has(this.self_permission['channel'] || this.self_permission['text_channel'])) {
                const embed = new this.db.Discord.MessageEmbed()
                    .setTitle("❌ Missing Permissions ❌")
                    .setDescription(`**__I__ don't have the __${this.self_permission['channel'] || this.self_permission['text_channel']}__ permission**\nfor this text channel.`)
                    .setColor("#ffff00")
                this.textChannel.send(embed);

                return false;
            }
        }

        return true;
    }

    async hasPermissions() {
        if (!this.msgObj.guild || !this.serverMember) return true;
        if (!this.permissions) return true;

        const or = this.permissions.logic == 'OR' && this.permissions.levels.length > 1 ? true : false;

        let result = true;

        for (let level of this.permissions.levels) {
            const type = level.type.toUpperCase();

            if (type === 'SERVER') {
                if (!this.serverMember.hasPermission(level.name)) {
                    if (or) {
                        result = false;

                        continue;
                    }

                    this.msgObj.reply(`you do not have permission to use this command.\nYou need the \`${level.name}\` permission(s).`)
                        .then(msg => msg.delete({timeout: 5e3}));

                    return false;
                }

                if (or) return true;
            }
            else if (type === 'ROLE') {
                if (this.serverMember.roles.cache.find(x => x.name.toLowerCase() === level.name)) {
                    if (or) {
                        result = false;

                        continue;
                    }

                    this.msgObj.reply(`you do not have permission to use this command.\nYou need the \`${level.name}\` role to use this command.`)
                        .then(msg => msg.delete({timeout: 5e3}));

                    return false;
                }

                if (or) return true;
            }
            else if (type === 'COMMAND_HANDLED') {
                if (!await this.permission()) {
                    result = false;

                    continue;
                }

                if (or) return true;
            }
            else {
                this.db.log('CMD', 'ERROR', `Command '${this.name}' permissions incorrectly configured, unknown type: ${level.type}`);

                this.send('The developer has incorrectly configured the permissions of this command, contact the developer if this problem keeps occuring.');

                return false;
            }
        }

        return result;
    }

    async hasSystemPermission() {
        if (!this.system_permission) return true;

        return await this.userUtils.hasRole(this.user.id, this.system_permission.level, this.system_permission.condition);
    }

    async isUserBanned() {
        const user = await this.userUtils.getClassInstance(this.user.id);

        return await user.isBanned();
    }

    removeBotMention() {
        if ((this.msgObj.content.match(new RegExp(`<@!?(${this.db.client.user.id})>`, 'g')) || []).length == 1) {
            this.msgObj.mentions.users.delete(this.db.client.user.id);
        }
    }
}

module.exports = BaseCommand;
