import { ProjectInterface } from '@ui5/project/lib/build/helpers';
import { join } from 'path';
import { TransformOptions } from '@babel/core';

/**
 * Base configuration for Task and Middleware
 */
export interface BaseConfig {
    include: string | string[];
    exclude: string | string[];
    babelConfig: TransformOptions;
    iife: boolean;
}

/**
 * Splits filename/path and extension into tupel
 * @param fileName Path to be handled
 * @returns path and extension in a tupel
 */
export function splitPathExtension(fileName: string): [string, string] {
    const i = fileName.lastIndexOf('.');
    return [fileName.substring(0, i), fileName.substring(i + 1)];
}

/**
 * Gets the real path for a given ui5 resource path
 * 
 * @example
 * // Relative
 * "/resources/my/namespace/file.ext" => "/file.ext"
 * // Absolute
 * "/resources/my/namespace/file.ext" => "C:/Documents/ui5-project/webapp/file.ext"
 * 
 * @param path Path given by ui5
 * @param project Project interface
 * @param absolute if the new path should be absolute
 * @returns The real path
 */
export function getRealPath(path: string, project: ProjectInterface, absolute = false) {
    const root = project.getSourcePath();
    const prefix = '/resources/';
    const namespace = project.getNamespace() ?? '';

    let newPath = path;
    if (newPath.startsWith(prefix)) newPath = newPath.substring(prefix.length);
    if (newPath.startsWith(namespace)) newPath = newPath.substring(namespace.length);

    return absolute ? join(root, newPath) : newPath;
}