import importDir from '@yimura/import-dir'
import log from '../util/Log.js'

export default class ModuleManager {
    _cache = new Map();

    /**
     * @param {Main} main The program entrypoint class
     */
    constructor(main) {
        this._m = main;
    }

    /**
     * Tells the modules it's time to stop execution and cleanup
     */
    async cleanup() {
        for (const module of this._cache) {
            const [ name, instance ] = module;

            if (typeof instance.cleanup === 'function') await instance.cleanup();
        }
    }

    /**
     * @param {string} moduleName
     */
    get(moduleName) {
        return this._cache.get(moduleName);
    }

    async load() {
        const modules = importDir(`${this._m.root}/src/modules/`, { recurse: true, recurseDepth: 1 });

        await this._importModules(modules);

        if (!await this._checkModuleRequirements()) {
            log.error('MODULES', 'Some modules did not meet their requirements.');

            process.exit(1);

            return;
        }
    }

    /**
     * @private
     */
    async _checkModuleRequirements() {
        for (const module of this._cache) {
           const [ name, instance ] = module;

           if (instance.requires) {
               for (const requirement of instance.requires) {
                   if (!this._cache.has(requirement)) {
                       log.error('MODULES', `Module "${name}" has an unmet requirement "${requirement}"`);

                       return false;
                   }
               }
           }

           if (instance.events) {
               for (const _event of instance.events) {
                   if (_event.mod) {
                       const mod = this._cache.get(_event.mod);
                       if (mod) {
                           mod.on(_event.name, (...args) => instance[_event.call](...args));

                           continue;
                       }
                   }

                   if (typeof this._m.on === 'function') this._m.on(_event.name, (...args) => instance[_event.call](...args));
               }
           }

           if (!await instance.setup()) return false;
       }

       return true;
    }

    /**
     * @private
     * @param {Object} modules
     * @param {string} [parentName='']
     */
    async _importModules(modules, parentName) {
        for (const bit in modules) {
            if (modules.hasOwnProperty(bit)) {
                if (modules[bit] instanceof Promise) {
                    try {
                        modules[bit] = (await modules[bit]).default;
                    } catch (e) {
                        log.error('MODULES', `An error occured while importing ${parentName}`, e);

                        continue;
                    }

                    try {
                        const instance = new modules[bit](this._m);
                        if (instance.disabled) {
                            log.warn('MODULES', `Modules disabled: "${instance.name}"`);

                            continue;
                        }

                        if (this._cache.has(instance.name)) {
                            log.error('MODULES', `Duplicate module error: "${instance.name}"`);

                            continue;
                        }

                        this._cache.set(instance.name, instance);
                    } catch (e) {
                        log.warn('MODULES', `Module is broken, ${bit}`, e);
                    }
                    continue;
                }
                await this._importModules(modules[bit], bit);
            }
        }
    }
}
