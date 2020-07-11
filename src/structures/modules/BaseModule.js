export default class BaseModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        this.mainClient = mainClient;
    }

    get auth() {
        return this.mainClient.auth;
    }

    get config() {
        return this.mainClient.config;
    }

    get servers() {
        return this.mainClient.serverManager;
    }

    /**
     * @param {external:Object} object
     * @param {external:Boolean} internal If this is the raw register object
     */
    register(instance, object, internal = true) {
        if (typeof object !== 'object') throw new Error('Invalid self assignment, expected object but got different type instead.');

        Object.assign(this, object);

        if (internal) {
            this.instance = instance;

            delete object.category;
            this.rawData = object;
        }
        else if (this.rawData) {
            Object.assign(this.rawData, object);
        }
    }

    getModule(moduleName) {
        return this.mainClient.moduleManager.get(moduleName);
    }
}
