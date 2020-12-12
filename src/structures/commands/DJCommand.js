import BaseCommand from './BaseCommand.js'

export default class DJCommand extends BaseCommand {
    elevated = true;

    constructor(main) {
        super(main);

        this.register(null, {
            permissions: {
                condition: 'These permissions are only checked if the DJ system is active, they\'re otherwise ignored.',
                logic: 'OR',
                levels: [
                    {
                        type: 'SERVER',
                        name: 'MANAGE_GUILD'
                    },
                    {
                        type: 'ROLE',
                        name: 'dj'
                    },
                    {
                        type: 'COMMAND_HANDLED',
                        name: 'If the DJ system is enabled this command will check if a user has the DJ permissions before allowing them to use it.'
                    }
                ]
            }
        }, false);

        const { DJMode } = this._m.modules.dj.constants;
        this.mode = DJMode;
    }

    get dj() {
        return this.server.dj;
    }

    get music() {
        return this.server.music;
    }

    permission() {
        if (this.music.active() && !this.dj.has(this.serverMember.id)) {
            this.reply(`you aren't the DJ right now, ask the active DJ to add you with \`dj add ${this.serverMember}\``)
                .then(msg => msg.delete({timeout: 7e3}));

            return false;
        }

        this.elevated = false;

        return true;
    }

    beforeRun(command) {
        if (command.startsWith('dj ') && this.name !== 'add' && this.dj.mode == this.mode['FREEFORALL']) {
            this.reply('DJ mode can not be changed once `FREEFORALL` has been enabled, make the bot leave and rejoin to go back to `MANAGED` or `ROLE` if this was previously enabled.');

            return false;
        }

        if (['play', 'play next'].includes(this.name) && this.dj.playlistLock) {
            this.reply('the playlist has been locked by the DJ, you can\'t add songs.')
                .then(msg => msg.delete({timeout: 5e3}));

            return false;
        }

        return true;
    }

    afterRun() {
        if (this.dj.size == 0)
            this.dj.add(this.serverMember);

        this.elevated = true;

        return true;
    }
}
