import { loadPartialConfig, transformAsync } from '@babel/core';
import { TransformOptions } from '@babel/core';

export default class BabelTransformer {
    private hasConfigFile: boolean;

    constructor(private babelConfig: TransformOptions, private iife = true) {
        this.hasConfigFile = !!loadPartialConfig()?.config;
    }

    async transform(contents: string, filename: string) {
        const config = {
            filename,
            ...(this.hasConfigFile ? {} : this.babelConfig)
        };
        const result = await transformAsync(contents, config);
        const code = result?.code ?? '';
        return this.iife ? this.wrapIIFE(code) : code;
    }

    private wrapIIFE(code: string) {
        return `(function(){${code}\n})()`;
    }
}
