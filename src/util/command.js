/**
 * Basic Constructor class for a command
 * @category Util
 */
class Command {
    /**
     * @param {external:Object} properties The command properties
     */
    constructor(properties) {
        Object.assign(this, properties);
    }
}

module.exports = Command;
