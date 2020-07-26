import importDir from '../util/ImportDir.js'

import log from '../util/Log.js'

export default class ModuleManager {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        this.mainClient = mainClient;

        this._modules = new Map();
    }

    get(moduleName) {
        return this._modules.get(moduleName);
    }

    async load() {
        const modules = importDir('../modules/');

        await this._mapModules(modules);

        if (!this._setupModules()) {
            log.info('MODULES', 'Some modules failed to setup.');

            process.exit(1);
        }

        log.info('MODULES', 'Finished mapping modules!');
    }

    async _mapModules(modules) {
        for (const bit in modules) {
            if (modules.hasOwnProperty(bit)) {
                if (modules[bit] instanceof Promise) {
                    try {
                        modules[bit] = (await modules[bit]).default;
                    } catch (e) {
                        log.error('MODULES', `An error occured while importing ${bit}`, e);

                        continue;
                    }

                    try {
                        const instance = new modules[bit](this.mainClient);
                        if (instance.disabled) {
                            log.warn('MODULES', `Modules disabled: "${instance.name}"`);

                            continue;
                        }

                        if (this._modules.has(instance.name)) {
                            log.error('MODULES', `Duplicate module error: "${instance.name}"`);

                            continue;
                        }

                        this._modules.set(instance.name, instance);
                    } catch (e) {
                        log.warn('MODULES', `Module is broken, ${bit}`, e);
                    }
                    continue;
                }
                await this.mapModules(modules[bit]);
            }
        }
    }

    _setupModules() {
        for (const module of this._modules) {
            const [ name, instance ] = module;

            if (instance.requires) {
                for (const requirement of instance.requires) {
                    if (!this._modules.has(requirement)) {
                        log.error('MODULES', `Module "${name}" has an unmet requirement "${requirement}"`);

                        return false;
                    }
                }
            }

            if (instance.events) {
                for (const _event of instance.events) {
                    if (_event.mod) {
                        const mod = this._modules.get(_event.mod);
                        if (mod) {
                            mod.on(_event.name, (...args) => instance[_event.call](...args));

                            continue;
                        }
                    }
                    this.mainClient.on(_event.name, (...args) => instance[_event.call](...args));
                }
            }

            instance.setup();
        }

        return true;
    }
}