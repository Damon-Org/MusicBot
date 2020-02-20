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
        args.forEach((argument) => {
            Object.assign(this, argument);
        });
    }

    /**
     * Check if the person calling the command has the right to do so
     * @param {external:String} command The string that initiated this check
     */
    async check(command) {
        if (!await this.hasSystemPermission()) return false;
        if (!await this.canCommandRunInChannel(command)) return false;
        if (!await this.hasServerPermission()) return false;
        if (!this.argumentsSatisfied()) return false;

        return await this.run(command);
    }

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
        return this.musicBot.embedUtils;
    }
    get musicUtils() {
        return this.musicBot.musicUtils;
    }
    get serverUtils() {
        return this.musicBot.serverUtils;
    }
    get socketUtils() {
        return this.musicBot.socketUtils;
    }
    get userUtils() {
        return this.musicBot.userUtils;
    }

    argumentsSatisfied() {
        const embed = new this.musicBot.Discord.MessageEmbed();
        let exception = false;

        if (this.params.length < this.args.length && (!this.params[0] || !this.params[0].allow_sentence)) {
            embed.setTitle('Too many arguments error.');

            exception = true;
        }

        if (this.params.length > 1 && !exception) {
            for (let i = 0; i < this.params.length; i++) {
                const param = this.params[i];
                if (param.required) {
                    if (!this.args[i]) {
                        embed.setTitle(`This command expects at least ${i+1} arguments`);

                        exception = true;

                        break;
                    }
                }
            }
        }

        if (exception) {
            embed.setDescription(`View the documentation of [this command on our site](https://music.damon.sh/#/commands?c=${this.name})`);

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
        return await this.userUtils.hasRequiredMinimalRole(this.user.id, 2);
    }
}

module.exports = BasicCommand;
