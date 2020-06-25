const level_types = ['INFO', 'VERBOSE', 'WARNING', 'ERROR', 'CRITICAL'];

export default class log {
    constructor() {}

    /**
     * @param {String} level The level of logging to be used
     * @param {String} name The informative name from where the log came
     * @param {String} message
     * @param {*} [data=null] This can be anything that you want to add to the log
     * @param {Boolean} [show_time=true] If the time of the log should be added with the log
     */
    static _log(level, name, message, data = null, show_time = true) {
        level = level.toUpperCase();

        if (!level_types.includes(level)) throw new TypeError('Invalid logging level used!');

        let
            log = show_time ? `[${new Date().toLocaleTimeString()}] ` : '',
            colors = ['', ''];

        switch (level) {
            case 'WARNING':
                colors = ['\x1b[33m', '\x1b[0m'];
                break;
            case 'ERROR':
            case 'CRITICAL':
                colors = ['\x1b[31m', '\x1b[0m'];
                break;
        }

        console.log(`${log}${colors[0]}[${name.toUpperCase()}/${level}]${colors[1]} ${message}`);
        if (data) console.log(data);
    }

    static info(...args) {
        log._log('info', ...args);
    }

    static verbose(...args) {
        log.info(...args);
    }

    static warn(...args) {
        log._log('warning', ...args);
    }

    static error(...args) {
        log._log('error', ...args);
    }

    static critical(...args) {
        log._log('critical', ...args);
    }
}
