declare module '@ui5/project' {}

declare module '@ui5/project/lib/build/helpers' {
    import { ReaderCollection, Resource, resourceFactory } from '@ui5/fs';
    export {};

    export interface ProjectInterface {
        getType();
        getName();
        getVersion();
        getNamespace(): string | null;
        getRootReader();
        getReader(): ReaderCollection;
        getRootPath();
        getSourcePath(): string;
        getCustomConfiguration(): object;
        isFrameworkProject(): boolean;
        getFrameworkName(): string;
        getFrameworkVersion(): string;
        getFrameworkDependencies(): { name: string; development: boolean; optional: boolean }[];
    }

    export class TaskUtil {
        /**
         * Standard Build Tags. See UI5 Tooling [RFC 0008]{@link https://github.com/SAP/ui5-tooling/blob/main/rfcs/0008-resource-tagging-during-build.md} for details.
         */
        STANDARD_TAGS: {
            // "Project" tags:
            // Will be stored on project instance and are hence part of the build manifest
            /**
             * This tag identifies resources that are a debug variant (typically named with a "-dbg" suffix)
             */
            IsDebugVariant: 'ui5:IsDebugVariant';
            /**
             * This tag identifies resources for which a debug variant has been created. This tag is part of the build manifest.
             */
            HasDebugVariant: 'ui5:HasDebugVariant';

            // "Build" tags:
            // Will be stored on the project build context
            // They are only available to the build tasks of a single project
            /**
             * Setting this tag to true will prevent the resource from being written to the build target directory
             */
            OmitFromBuildResult: 'ui5:OmitFromBuildResult';
            /**
             * This tag identifies resources that contain (i.e. bundle) multiple other resources
             */
            IsBundle: 'ui5:IsBundle';
        };

        /**
         * Since <code>@ui5/project/build/helpers/ProjectBuildContext</code> is a private class, TaskUtil must not be instantiated by modules other than @ui5/project itself.
         * @param params parameters
         * @param params.projectBuildContext ProjectBuildContext
         */
        constructor(params: { projectBuildContext: unknown });

        /**
         *
         * Stores a tag with value for a given resource's path. Note that the tag is independent of the supplied
         * resource instance. For two resource instances with the same path, the same tag value is returned.
         * If the path of a resource is changed, any tag information previously stored for that resource is lost.
         *
         * This method is only available to custom task extensions defining **Specification Version 2.2 and above**
         *
         * @param resource Resource-instance the tag should be stored for
         * @param tag Name of the tag. Currently only the [STANDARD_TAGS]{@link @ui5/project/build/helpers/TaskUtil#STANDARD_TAGS} are allowed
         * @param [value=true] Tag value. Must be primitive
         */
        setTag(resource: Resource, tag: string, value?: string | boolean | number): void;

        /**
         * Retrieves the value for a stored tag. If no value is stored, <code>undefined</code> is returned.
         *
         * This method is only available to custom task extensions defining **Specification Version 2.2 and above**
         *
         * @param resource Resource-instance the tag should be retrieved for
         * @param tag Name of the tag
         * @returns Tag value for the given resource. `undefined` if no value is available
         */
        getTag(resource: Resource, tag: string): string | boolean | number | undefined;

        /**
         * Clears the value of a tag stored for the given resource's path.
         * It's like the tag was never set for that resource.
         *
         * This method is only available to custom task extensions defining **Specification Version 2.2 and above**
         *
         * @param resource Resource-instance the tag should be cleared for
         * @param tag Tag
         */
        clearTag(resource: Resource, tag: string): void;

        /**
         * Check whether the project currently being built is the root project.
         *
         * This method is only available to custom task extensions defining **Specification Version 2.2 and above**
         *
         * @returns `true` if the currently built project is the root project
         */
        isRootProject(): boolean;

        /**
         *  Register a function that must be executed once the build is finished. This can be used to, for example,
         * clean up files temporarily created on the file system. If the callback returns a Promise, it will be waited for.
         * It will also be executed in cases where the build has failed or has been aborted.
         *
         * This method is only available to custom task extensions defining **Specification Version 2.2 and above**
         *
         * @param callback Callback to register. If it returns a Promise, it will be waited for
         */
        registerCleanupTask(callback: () => Promise<void> | void): void;

        /**
         * Retrieve a single project from the dependency graph
         *
         * This method is only available to custom task extensions defining **Specification Version 3.0 and above**
         *
         * @param projectNameOrResource Name of the project to retrieve or a Resource instance to retrieve the associated project for. Defaults to the name of the project currently being built
         * @returns Specification Version-dependent interface to the Project instance or `undefined` if the project name is unknown or the provided resource is not associated with any project.
         */
        getProject(projectNameOrResource?: string | Resource): ProjectInterface;

        /**
         * Retrieve a list of direct dependencies of a given project from the dependency graph. Note that this list does not include transitive dependencies.
         *
         * This method is only available to custom task extensions defining **Specification Version 3.0 and above**
         *
         * @param projectName Name of the project to retrieve. Defaults to the project currently being built
         * @returns Names of all direct dependencies
         */
        getDependencies(projectName?: string): string[];

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
}
