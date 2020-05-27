const
    BaseCommand = require('./base_command'),
    MODE = require('../music/dj/mode');

class DJCommand extends BaseCommand {
    /**
     * @param {Array<*>} args
     */
    constructor(...args) {
        super(...args);

        // By using register here I can set mutual permissions
        this.register(null, {
            permissions: {
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
                        name: 'Music and DJ commands will check if a user is in the DJ group before allowing them to use this command.'
                    }
                ]
            }
        }, false);
    }

    permission() {
        if (!['play', 'play next'].includes(this.name) && !this.musicSystem.djManager.has(this.serverMember.id) && this.musicSystem.queueExists()) {
            this.reply('you aren\'t the DJ right now, ask the DJ to add you with `dj add @mention`')
                .then(msg => msg.delete({timeout: 7e3}));

            return false;
        }

        this.elevated = false;

        return true;
    }

    beforeRun(command) {
        if (command.startsWith('dj ') && this.musicSystem.djManager.mode == MODE['FREEFORALL']) {
            this.reply('DJ mode can not be changed once `FREEFORALL` has been enabled, make the bot leave and rejoin to go back to `MANAGED` or `ROLE` if this was previously enabled.');

            return false;
        }

        if (['play', 'play next'].includes(this.name) && this.musicSystem.djManager.playlistLock) {
            this.reply('the playlist has been locked by the DJ, you can\'t add songs.')
                .then(msg => msg.delete({timeout: 5e3}));

            return false;
        }

        return true;
    }

    afterRun() {
        if (this.musicSystem.djManager.size == 0)
            this.musicSystem.djManager.add(this.serverMember);

        this.elevated = true;

        return true;
    }
}

module.exports = DJCommand;
