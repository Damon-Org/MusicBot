export default class BaseCommand extends Map {
    /**
     * The raw data of the command
     * @type {Object}
     */
    raw = {};

    constructor(main) {
        super();

        this._m = main;
    }

    /**
     * Merge Object into one
     * @param  {...any} args 
     */
    assign(...args) {
        return Object.assign(...args);
    }

    /**
     * Clone the command instance so the command runs in its own space.
     */
    clone() {
        return new this._self(this.category, this._m);
    }

    /**
     * 
     * @param {Message} msgObj 
     * @param {Array<string>} args 
     * @param {string} command 
     * @param {boolean} mentioned 
     */
    exec(msgObj, args, command, mentioned) {
        this._msg = msgObj;
        this._parseArguments(args);
        if (!this._checkArguments()) return false;

        if (mentioned) this._removeBotMention();

        if (!await this._canCommandRunInChannel(command)) return false;
        if (!await this._hasPermissions()) return false;
        if (!this._hasSelfPermissions()) return false;
        if (!this._argumentsSatisfied()) return false;

        // The command itself wants to do some kind of validation before going further
        if (typeof this.validate === 'function' && !this.validate(msgObj.author, args)) return false;

        try {
            if (typeof this.beforeRun === 'function' && !await this.beforeRun(command)) return false;
            if (typeof this.afterRun === 'function') await this.run(command);
            else return await this.run(command);
        } catch (e) {
            this.log.error('CMD', 'Check error occured:', e.stack);
        } finally {
            // Force our cleanup regardless of errors
            if (typeof this.afterRun === 'function') return await this.afterRun();
        }
    }

    /**
     * @param {Class} instance The command instance registering itself
     * @param {Object} object The constraint data of the command
     * @param {boolean} [init = true] If this register is called from the parent class
     */
    register(instance, object, init = true) {
        if (typeof object !== 'object') throw new Error('Invalid self assignment, expected object but got different type instead.');

        this.assign(this, object);

        if (!init) return this.assign(this.raw, object);

        this._self = instance;

        delete object.category;
        this.raw = object;
    }

    /**
     * This function will
     * @param {string} title The title of the argument embed
     * @param {number} index The index at which the check failed
     */
    _argumentValidationError(title, index = null) {
        return false;
    }

    /**
     * @private
     */
    _checkArguments() {
        if (this.args.length > this.params.length) return this._argumentValidationError('Too many arguments.');

        this.args.forEach((arg, i) => {
            const param = this.params[i];

            if (param.required && !arg) {
                return this._argumentValidationError('Missing arguments', i);
            }
        });
    }

    /**
     * Parses all the arguments
     * @private
     * @param {Array<string>} arguments 
     */
    _parseArguments(arguments) {
        this.args = [];

        arguments.forEach((arg, index) => {
            const param = this.params[index];
            let argument = null;

            switch (param.type) {
                case 'channel':
                    argument =  this._msg.mentions.channels.get(arg);
                    if (!argument) argument = null;

                    break;
                case 'member':
                    argument =  this._msg.mentions.members.get(arg);
                    if (!argument) argument = null;

                    break;
                case 'everyone':
                    argument =  this._msg.mentions.everyone;

                    break;
                case 'float':
                    argument = isNaN(arg) ? null : parseFloat(arg);

                    break;
                case 'int':
                    argument = isNaN(arg) ? null : parseInt(arg);

                    break;
                case 'role':
                    argument =  this._msg.mentions.roles.get(arg);
                    if (!argument) argument = null;

                    break;
                case 'string':
                    if (param.is_sentence) {
                        argument = arguments.slice(index)

                        break;
                    }
                    argument = arg;
                    
                    break;
                case 'user':
                    argument =  this._msg.mentions.users.get(arg);
                    if (!argument) argument = null;

                    break;
            }

            this.set(param.name, argument);
            this.args.push(argument);
        });
    }
}