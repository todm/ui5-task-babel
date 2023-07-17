declare module '@ui5/builder' {
    import { AbstractReader, DuplexCollection } from '@ui5/fs';
    import { Logger } from '@ui5/logger';
    import { TaskUtil } from '@ui5/project/lib/build/helpers';

    export {};

    /**
     * Parameters passed to the task function
     */
    export interface TaskFunctionParameters<T> {
        /**
         * Reader to access resources of the project's dependencies
         */
        dependencies: AbstractReader;

        /**
         * Logger instance for use in the custom task.
         * This parameter is only available to custom task extensions
         * defining Specification Version 3.0 and later.
         */
        log: Logger;

        /**
         * Options
         */
        options: TaskFunctionOptions<T>;

        /**
         * Specification Version-dependent interface to a TaskUtil instance.
         * See the corresponding API reference for details:
         * https://sap.github.io/ui5-tooling/v3/api/@ui5_project_build_helpers_TaskUtil.html
         */
        taskUtil: TaskUtil;

        /**
         * Reader/Writer to access and modify resources of the project currently being built
         */
        workspace: DuplexCollection;
    }

    /**
     * Parameters passed to the determinRequiredDependencies function
     */
    export interface DetermineRequiredDependenciesFunctionParameters<T> {
        /**
         * Set containing the names of all direct dependencies of
         * the project currently being built.
         */
        availableDependencies: Set<string>;

        /**
         * Identical to TaskUtil#getDependencies (see https://sap.github.io/ui5-tooling/v3/api/@ui5_project_build_helpers_TaskUtil.html).
         * Creates a list of names of all direct dependencies of a given project.
         */
        getDependencies: TaskUtil['getDependencies'];

        /**
         * Identical to TaskUtil#getProject (see https://sap.github.io/ui5-tooling/v3/api/@ui5_project_build_helpers_TaskUtil.html).
         * Retrieves a Project-instance for a given project name.
         */
        getProject: TaskUtil['getProject'];

        /**
         * Identical to the options given to the standard task function.
         */
        options: TaskFunctionOptions<T>;
    }

    /**
     * Options contained in the task and determinRequiredDependencies function parameters
     */
    interface TaskFunctionOptions<T> {
        /**
         * Name of the project currently being built
         */
        projectName: string;

        /**
         * Namespace of the project currently being built
         */
        projectNamespace: string;

        /**
         * Custom task configuration, as defined in the project's ui5.yaml
         */
        configuration: Partial<T>;

        /**
         * Name of the custom task.
         * This parameter is only provided to custom task extensions defining Specification Version 3.0 and later.
         */
        taskName: string;
    }

    /**
     * Custom task API
     * @param params parameters
     * @returns Promise resolving once the task has finished
     */
    export type TaskFunction<T = any> = (params: TaskFunctionParameters<T>) => Promise<void>;

    /**
     * Callback function to define the list of required dependencies
     * @param params parameters
     * @returns Promise resolving with a Set containing all dependencies that should be made available to the task.
     *          UI5 Tooling will ensure that those dependencies have been built before executing the task.
     */
    export type DetermineRequiredDependenciesFunction<T = any> = (
        params: DetermineRequiredDependenciesFunctionParameters<T>
    ) => Promise<Set<string>>;
}
