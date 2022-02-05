import { TaskFunction } from '@ui5/builder';
import { excludeFiles, removeFileExtension, Transpiler } from '.';
import { TaskConfig } from '../types';

const task: TaskFunction = async ({ workspace, options }) => {
    const config: TaskConfig = {
        include: ['**/*.js'],
        exclude: [],
        babelConfig: {
            presets: ['@babel/preset-env'],
            sourceMaps: 'inline'
        },
        forceExtension: false,
        iife: true,
        ...options.configuration
    };

    const transpiler = new Transpiler(config);

    let files = await workspace.byGlob(config.include);
    files = excludeFiles(files, config.exclude);
    await Promise.all(
        files.map(async file => {
            const code = await file.getString();
            const result = await transpiler.transpile(code, file.getPath()); // <----------------------------------------------------------------------------------------------
            if (config.forceExtension) file.setPath(removeFileExtension(file.getPath()) + '.' + config.forceExtension);
            file.setString(result);
            await workspace.write(file);
        })
    );
};

module.exports = task;
