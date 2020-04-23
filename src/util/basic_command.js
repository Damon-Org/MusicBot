const permissions = require('discord.js').Permissions.FLAGS;

/**
 * Basic Constructor class for a command
 * @category Util
 */
class BasicCommand {
    /**
     * @param {*} args The arguments to directly assign to the class
     */
    constructor(...args) {
        args.forEach((argument) => this.register(argument, false));
    }

    /**
     * @param {external:Object} object
     * @param {external:Boolean} internal If this is the raw register object
     */
    register(object, internal = true) {
        if (typeof object !== 'object') throw new Error('Invalid self assignment, expected object but got different type instead.');
        if (internal) {
            delete object.category;
            this.rawData = object;
        }

        Object.assign(this, object);
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
        if (!await this.hasServerPermission()) return false;
        if (!this.hasSelfPermissions()) return false;
        if (!this.argumentsSatisfied()) return false;

        try {
            if (typeof this.beforeRun === 'function' && !await this.beforeRun(command)) return false;
            if (typeof this.afterRun === 'function') {
                await this.run();
                return await this.afterRun();
            }
            return await this.run(command);
        } catch (e) {
            throw e;
        }
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

    argumentsSatisfied() {
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
            embed.setDescription(`View the documentation of [this command on our site](https://music.damon.sh/#/commands?c=${encodeURI(this.name)})`);

            this.msgObj.channel.send(embed);

            return false;
        }

        return true;
    }

    /**
     * @param {external:String} command The command that invoked the request
     */
    async canCommandRunInChannel(command) {
        if (!this.guild_only) return true;
        if (!this.serverMember || !this.msgObj.guild) {
            const newMsg = await this.msgObj.reply(`The following command \`${command}\` can not be ran outside of servers.`);

            return false;
        }

        const lockedChannel = (await this.serverInstance.getLockedChannels())[this.category];
        if (lockedChannel == undefined || lockedChannel == null || lockedChannel == 'null' || lockedChannel == this.textChannel.id) {
            return true;
        }

        const newMsg = await this.msgObj.reply(`you can't use commands from the ${this.category} category here, please use <#${lockedChannel}> text-channel for ${this.category} related commands.`);
        newMsg.delete({timeout: 5500});
        this.msgObj.delete({timeout: 1500});

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

    async hasServerPermission() {
        if (!this.msgObj.guild || !this.serverMember) return true;
        if (!this.permission || this.permission.type != 'server') return true;

        if (!this.serverMember.hasPermission(permissions[this.permission.name], false, true, true)) {
            const newMsg = await this.msgObj.reply(`you do not have permission to use this command.\nYou need the \`${this.permission.name}\` permission.`);
            newMsg.delete({timeout: 5000});

            return false;
        }

        return true;
    }

    async hasSystemPermission() {
        if (!this.permission || this.permission.type != 'system') return true;

        return await this.userUtils.hasRequiredMinimalRole(this.user.id, this.permission.level);
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

module.exports = BasicCommand;
