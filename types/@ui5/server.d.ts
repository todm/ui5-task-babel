declare module '@ui5/server' {
    import { AbstractReader, Resource, resourceFactory } from '@ui5/fs';
    import { ProjectInterface } from '@ui5/project/lib/build/helpers';
    import { Logger } from '@ui5/logger';
    import { Request, RequestHandler } from 'express';

    export {};

    /**
     * Convenience functions for UI5 Server middleware.
     * An instance of this class is passed to every standard UI5 Server middleware.
     * Custom middleware that define a specification version >= 2.0 will also receive an instance
     * of this class as part of the parameters of their create-middleware function.
     *
     * The set of functions that can be accessed by a custom middleware depends on the specification
     * version defined for the extension.
     */
    export class MiddlewareUtil {
        /**
         * @param params Parameters
         * @param params.graph Relevant ProjectGraph
         * @param params.project Project that is being served
         */
        constructor(params: { graph: unknown; project: unknown });

        /**
         * Returns the [pathname]{@link https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname} of a given request. Any escape sequences will be decoded.
         *
         * This method is only available to custom middleware extensions defining
         * **Specification Version 2.0 and above**.
         * @param req Request object
         * @returns [Pathname]{@link https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname} of the given request
         */
        getPathname(req: Request): string;

        /**
         * Returns MIME information derived from a given resource path.
         *
         * This method is only available to custom middleware extensions defining
         * **Specification Version 3.0 and above**.
         *
         * @param resourcePath
         * @returns mimeInfo
         */
        getMimeInfo(resourcePath: string): { type: string; charset: string; contentType: string };

        /**
         * Retrieve a list of direct dependencies of a given project from the dependency graph.
         * Note that this list does not include transitive dependencies.
         *
         * This method is only available to custom server middleware extensions defining
         * **Specification Version 3.0 and above**.
         *
         * @param projectName Name of the project to retrieve. Defaults to the name of the current root project
         * @returns Names of all direct dependencies
         */
        getDependencies(projectName?: string): string[];

        /**
         * Retrieve a single project from the dependency graph
         *
         * This method is only available to custom server middleware extensions defining
         * **Specification Version 3.0 and above**.
         * @param projectNameOrResource Name of the project to retrieve or a Resource instance to retrieve the associated project for. Defaults to the name of the current root project
         */
        getProject(projectNameOrResource?: string | Resource): ProjectInterface;

        /**
         * Provides limited access to [@ui5/fs/resourceFactory]{@link @ui5/fs/resourceFactory} functions
         *
         * **This method is only available to custom task extensions defining **Specification Version 3.0 and above**
         */
        resourceFactory: {
            createResource: resourceFactory.createResource;
            createReaderCollection: resourceFactory.createReaderCollection;
            createReaderCollectionPrioritized: resourceFactory.createReaderCollectionPrioritized;
            createFilterReader: resourceFactory.createFilterReader;
            createLinkReader: resourceFactory.createLinkReader;
            createFlatReader: resourceFactory.createFlatReader;
        };
    }

    export interface MiddlewareFunctionParameters<T> {
        /**
         * Logger instance for use in the custom middleware.
         * This parameter is only provided to custom middleware extensions defining Specification Version 3.0 and later.
         */
        log: Logger;

        /**
         * Specification version-dependent interface to a MiddlewareUtil instance. See the corresponding API reference for details: https://sap.github.io/ui5-tooling/v3/api/@ui5_server_middleware_MiddlewareUtil.html
         */
        middlewareUtil: MiddlewareUtil;

        /**
         * Options
         */
        options: {
            /**
             * Custom middleware configuration, as defined in the project's ui5.yaml
             */
            configuration: Partial<T>;

            /**
             * Name of the custom middleware. This parameter is only provided to custom middleware extensions defining Specification Version 3.0 and later
             */
            middlewareName: string;
        };

        /**
         * Readers for accessing resources
         */
        resources: {
            /**
             * Reader to access resources of the root project and its dependencies
             */
            all: AbstractReader;

            /**
             * Reader to access resources of the root project
             */
            rootProject: AbstractReader;

            /**
             * Reader to access resources of the project's dependencies.
             */
            dependencies: AbstractReader;
        };
    }

    export type MiddlewareFunction<T = any> = (params: MiddlewareFunctionParameters<T>) => RequestHandler;
}
