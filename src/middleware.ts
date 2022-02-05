import { MiddlewareFunction } from '@ui5/server';
import { MiddlewareConfig } from '../types';
import micromatch from 'micromatch';
import { Resource } from '@ui5/fs';
import { includeFiles, Logger, removeFileExtension, Transpiler } from '.';
import { Request } from 'express';

const middleware: MiddlewareFunction = ({ resources, options }) => {
    const config: MiddlewareConfig = {
        include: ['**/*.js'],
        exclude: [],
        babelConfig: {
            presets: ['@babel/preset-env'],
            sourceMaps: 'inline'
        },
        searchInclude: ['**/*.js'],
        passFile: false,
        iife: true,
        onError: 'error',
        ...options.configuration
    };

    const transpiler = new Transpiler(config);

    return async (req: PRequest, res, next) => {
        try {
            const matched = !!micromatch([req.path], config.include).length && !micromatch([req.path], config.exclude).length;
            if (!matched) return next();

            let file: Resource;
            if (req.passedFile) {
                file = req.passedFile;
            } else {
                let potentialFiles = await resources.rootProject.byGlob(removeFileExtension(req.path) + '.*');
                potentialFiles = includeFiles(potentialFiles, config.searchInclude);
                if (!potentialFiles.length) return next();
                file = potentialFiles[0];
            }

            const code = await file.getString();
            const result = await transpiler.transpile(code, file.getPath()); // <------------------------------------------------------------------------------------------

            if (config.passFile) {
                file.setString(result);
                req.passedFile = file;
                return next();
            }
            res.end(result);
        } catch (ex) {
            const msg = (<Error>ex).message || 'Unknown Error';
            Logger.error(msg);
            switch (config.onError) {
                case 'next':
                    return next();
                case 'error':
                    return res.status(503).end();
                default:
                    process.exit(-1);
            }
        }
    };
};

interface PRequest extends Request {
    passedFile?: Resource;
}

module.exports = middleware;
