import Discord from 'discord.js'

import log from '../util/Log.js'

import ModuleManager from '../manager/ModuleManager.js'
import UserManager from '../manager/UserManager.js'
import ServerManager from '../manager/ServerManager.js'

import auth from '../../data/auth.js'
import config from '../../data/config.js'

export default class MainClient extends Discord.Client {
    /**
     * @param {String} root_dir The root directory of the source files
     * @param {String} token A valid Discord Bot token
     */
    constructor(root_dir, token) {
        super(config.client_options);

        /**
         * @type {String}
         */
        this.root_dir = root_dir;

        /**
         * @type {Number}
         */
        this.bootUp = Date.now();
        /**
         * Shard identifier based of off the bootUp Date in hex
         * @type {String}
         */
        this.id = this.bootUp.toString(16).substr(-6);;

        this.auth = auth;
        this.config = config;

        this.login(token);

        /**
         * @type {UserManager}
         */
        this.userManager = new UserManager(this);
        /**
         * @type {ServerManager}
         */
        this.serverManager = new ServerManager(this);
        /**
         * @type {ModuleManager}
         */
        this.moduleManager = new ModuleManager(this);

        this.on('ready', () => log.info('BOT', `Reached ready state in ${Date.now() - this.bootUp}ms`));

        this.reload();
    }

    get version() {
        return `v${process.argv[2]}`;
    }

    getModule(moduleName) {
        return this.moduleManager.get(moduleName);
    }

    /**
     * Cleanup basically
     */
    destroy() {


        super.destroy();

        process.exit();
    }

    /**
     * All non-permanent/reloadable resources will be added in here
     */
    reload() {
        this.moduleManager.load();
    }
}
