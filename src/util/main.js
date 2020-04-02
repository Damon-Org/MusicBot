class MainUtils {
    /**
     * @param {DamonFramework} damonFramework
     */
    constructor(damonFramework) {
        /**
         * @type {DamonFramework}
         */
        this.df = damonFramework;
    }

    async awaitTimeout(timeout)
    {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, timeout);
        });
    }

    presenceStringEval(string) {
        let outputStr = '';
        const split_str = string.split('${');

        for (let i = 0; i < split_str.length; i++) {
            if (split_str[i].includes('}')) {
                const temp_split = split_str[i].split('}');

                outputStr += this.df.presence_values[temp_split[0]];
                outputStr += temp_split[1];

                continue;
            }
            outputStr += split_str[i];
        }

        return outputStr;
    }
}

module.exports = MainUtils;
