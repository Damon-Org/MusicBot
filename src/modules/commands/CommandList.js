export default class CommandList extends Map {
    _cache = new Map();
    _registered = [];

    constructor() {
        super();
    }

    /**
     * @param {string} categoryName
     */
    getCategory(categoryName) {
        return this._cache.get(categoryName);
    }

    /**
     * @param {string} commandName
     * @param {string} category
     */
    _setCache(commandName, categoryName) {
        const category = this._cache.get(categoryName);
        this._registered.push(commandName);

        if (!category) {
            const list = [];
            list.push(commandName);
            this._cache.set(categoryName, list);

            return;
        }

        category.push(commandName);
    }

    /**
     * @param {string} command
     * @param {Object} instance
     */
    set(command, instance) {
        if (!this._registered.includes(instance.name)) this._setCache(command, instance.category);

        super.set(command, instance);
    }
}
