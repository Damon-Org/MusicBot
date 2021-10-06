import Modules from '@/src/Modules.js'

export default class AdministratorCommand extends Modules.commandRegistrar.BaseCommand {
    constructor(main) {
        super(main);

        this.register(null, {
            permissions: {
                condition: 'Bot administrator check.',
                logic: 'OR',
                levels: [
                    {
                        type: 'COMMAND_HANDLED',
                        name: 'Check if the user has the required administrator level.'
                    }
                ]
            }
        })
    }

    get admin_level() {
        throw new Error('Not implemented');
    }

    /**
     * Checks if the user has the required permission
     * @returns {Promise<boolean>}
     */
    permission() {
        return this.user.hasPermission(this.admin_level, '>=');
    }
}
