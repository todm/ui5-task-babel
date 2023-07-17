import { MiddlewareFunction } from '@ui5/server';
import { BaseConfig, splitPathExtension } from './utils';
import BabelTransformer from './transformer';
import micromatch from 'micromatch';
import { AbstractReaderWriter } from '@ui5/fs';

interface MiddlewareConfig extends BaseConfig {
    searchInclude: string | string[];
    searchExclude: string | string[];
    onError: 'next' | 'error' | 'exit';
}

const middlewareFunction: MiddlewareFunction<MiddlewareConfig> = ({ options, middlewareUtil, resources, log }) => {
    const config: MiddlewareConfig = {
        include: ['**/*.js'],
        exclude: [],
        babelConfig: {
            presets: ['@babel/preset-env'],
            sourceMaps: 'inline'
        },
        iife: true,
        searchInclude: ['**/*.js'],
        searchExclude: [],
        onError: 'error',
        ...options.configuration
    };

    const transformer = new BabelTransformer(config.babelConfig, config.iife);

    const reader = middlewareUtil.resourceFactory.createFilterReader({
        reader: resources.all,
        callback: r => micromatch.isMatch(r.getPath(), config.searchInclude, { ignore: config.searchExclude })
    });

    return async (req, res, next) => {
        try {
            const path = middlewareUtil.getPathname(req);
            const matched = micromatch.isMatch(path, config.include, { ignore: config.exclude });
            if (!matched) return next();

            const searchString = splitPathExtension(path)[0] + '.*';
            const potentialResources = await reader.byGlob(searchString);
            const resource = potentialResources[0];
            if (!resource) return next();

            const contents = await resource.getString();
            const transformed = await transformer.transform(contents, resource.getPath());

            res.end(transformed);
        } catch (ex: any) {
            log.error(ex.message || 'unknown error');
            switch (config.onError) {
                case 'next':
                    return next();
                case 'exit':
                    return process.exit(-1);
                default:
                    res.status(503).end();
            }
        }
    };
};

module.exports = middlewareFunction;
