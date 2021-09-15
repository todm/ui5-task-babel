const { transformAsync, loadPartialConfig } = require('@babel/core');
const micromatch = require('micromatch');
const Logger = require('@ui5/logger').getLogger('ui5-babel');

class BabelTranspiler {
    constructor(config) {
        this._config = config;
        this._hasBabelConfig = false;


        this.hasConfigFile();
    }

    async transform(code, filename) {
        let result;
        if(this._hasBabelConfig) {
            result = await transformAsync(code, {
                filename
            })
        } else {
            result = await transformAsync(code, {
                filename,
                ...this._config.babelConfig
            })
        }
        return result.code;
    }

    hasConfigFile() {
        this._hasBabelConfig = !!loadPartialConfig().config;
        return this._hasBabelConfig;
    }
}

function includeFiles(files, patterns) {
    const matchableFiles = files.map(file => file.getPath());
    let matches = micromatch(matchableFiles, patterns);
    return files.filter(file => matches.includes(file.getPath()));
}

function excludeFiles(files, patterns) {
    const matchableFiles = files.map(file => file.getPath());
    let matches = micromatch(matchableFiles, patterns);
    return files.filter(file => !matches.includes(file.getPath()));
}

function removeFileExtension(path) {
    let parts = path.split(".");
    parts.pop();
    return parts.join(".");
}

module.exports = {
    BabelTranspiler,
    Logger,
    includeFiles,
    excludeFiles,
    removeFileExtension
}