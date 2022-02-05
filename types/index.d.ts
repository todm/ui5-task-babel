import { TransformOptions } from '@babel/core';

interface BaseConfig {
    include: string | string[];
    exclude: string | string[];
    babelConfig: TransformOptions;
    iife: boolean;
}

export interface TaskConfig extends BaseConfig {
    forceExtension: string | false;
}

export interface MiddlewareConfig extends BaseConfig {
    searchInclude: string | string[];
    passFile: boolean;
    onError: 'next' | 'error' | 'exit';
}