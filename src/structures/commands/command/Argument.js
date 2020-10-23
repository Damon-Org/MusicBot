import { GuildMember, Role, TextChannel, User } from 'discord.js'

const typeChars = {
    'channel': '#',
    'mention': '@',
    'number': '# ',
    'string': ''
}

export default class CommandArgument {
    _parsed = null;

    /**
     * @param {string} arg
     * @param {Object} data
     */
    constructor(arg, data) {
        this._arg = arg;
        this._data = data;

        if (!data) this._parseArg();
    }

    get required() {
        return this._data.required != false;
    }

    _parseArg() {
        switch (this._data.type) {
            case 'number':
                this._parsed = new Number(this._arg);
                break;
            default:

        }
    }

    /**
     * @returns {string} The name of the argument
     */
    name() {
        return this._data.name;
    }

    toString() {
        return this._arg;
    }

    /**
     * @returns {boolean}
     */
    valid() {
        return !this._data;
    }

    valueOf() {
        return this._parsed;
    }

    /**
     * @returns {string} The string as how it should be show in text, for example
     * required arguments have arrow heads while optional arguments have brackets.
     */
    toUserString() {
        const brackets = this._data.required ? ['<', '>'] : ['[', ']'];
        const specialChar = typeChars[this._data.type];

        return `${brackets[0]}${specialChar}${this._data.name}${brackets[1]}`;
    }
}
