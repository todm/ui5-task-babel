import { loadPartialConfig, transformAsync } from '@babel/core';
import { Resource } from '@ui5/fs';
import { getLogger } from '@ui5/logger';
import micromatch from 'micromatch';
import { BaseConfig } from '../types';

export class Transpiler {
    private hasConfigFile: boolean;

    constructor(private config: BaseConfig) {
        this.hasConfigFile = this.checkHasConfigFile();
    }

    private checkHasConfigFile() {
        return !!loadPartialConfig()?.config;
    }

    public async transpile(code: string, filename: string) {
        const config = {
            filename,
            ...(this.hasConfigFile ? {} : this.config.babelConfig)
        };

        const babelResult = await transformAsync(code, config);
        const result = babelResult?.code || "";

        return this.config.iife ? this.wrapIIFE(result) : result;
    }

    private wrapIIFE(code: string) {
        return `(function(){${code}\n})()`;
    }
}

export function includeFiles(files: Resource[], patterns: string | string[]) {
    const matchableFiles = files.map(file => file.getPath());
    const matches = micromatch(matchableFiles, patterns);
    return files.filter(file => matches.includes(file.getPath()));
}

export function excludeFiles(files: Resource[], patterns: string | string[]) {
    const matchableFiles = files.map(file => file.getPath());
    const matches = micromatch(matchableFiles, patterns);
    return files.filter(file => !matches.includes(file.getPath()));
}

export function removeFileExtension(path: string) {
    return path.split('.').slice(0, -1).join('.');
}

export const Logger = getLogger('ui5-babel');
