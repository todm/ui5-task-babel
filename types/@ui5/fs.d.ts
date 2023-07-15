declare module '@ui5/fs' {
    import fs from 'fs';
    import { Readable, Stream } from 'stream';
    export {};

    /**
     * Abstract resource locator implementing the general API for <b>reading</b> resources
     */
    export abstract class AbstractReader {
        /**
         * The constructor.
         * @param name Name of the reader. Typically used for tracing purposes
         */
        constructor(name: string);

        /**
         * Returns the name of the reader instance. This can be used for logging/tracing purposes.
         * @returns Name of the reader
         */
        getName(): string;

        /**
         * Locates resources by matching glob patterns.
         * @param virPattern glob pattern as string or array of glob patterns for virtual directory structure
         * @param options options
         * @param [options.nodir=true] Do not match directories
         * @returns Promise resolving to list of resources
         *
         * @example
         * byGlob("**‏/*.{html,htm}");
         * byGlob("**‏/.library");
         * byGlob("/pony/*");
         */
        byGlob(virPattern: string | string[], options?: { nodir?: boolean }): Promise<Resource[]>;

        /**
         * Locates resources by matching a given path.
         * @param virPath Virtual path
         * @param options Options
         * @param [options.nodir=true] Do not match directories
         * @returns Promise resolving to a single resource
         */
        byPath(virPath: string, options?: { nodir?: boolean }): Promise<Resource>;
    }

    /**
     * Abstract resource locator implementing the general API for **reading and writing** resources
     */
    export abstract class AbstractReaderWriter extends AbstractReader {
        /**
         * The constructor.
         * @param name Name of the reader/writer. Typically used for tracing purposes
         */
        constructor(name: string);

        /**
         * Returns the name of the reader/writer instance. This can be used for logging/tracing purposes.
         * @returns Name of the reader/writer
         */
        getName(): string;

        /**
         * Writes the content of a resource to a path.
         * @param resource Resource to write
         * @param options
         * @param [options.readOnly=false] Whether the resource content shall be written read-only
         *						Do not use in conjunction with the `drain` option.
         *						The written file will be used as the new source of this resources content.
         *						Therefore the written file should not be altered by any means.
         *						Activating this option might improve overall memory consumption.
         * @param [options.drain=false] Whether the resource content shall be emptied during the write process.
         *						Do not use in conjunction with the `readOnly` option.
         *						Activating this option might improve overall memory consumption.
         *						This should be used in cases where this is the last access to the resource.
         *						E.g. the final write of a resource after all processing is finished.
         * @returns Promise resolving once data has been written
         */
        write(resource: Resource, options?: { drain?: boolean; readonly?: boolean }): Promise<void>;
    }

    /**
     * Wrapper to keep readers and writers together
     */
    export class DuplexCollection extends AbstractReaderWriter {
        /**
         * The Constructor.
         * @param params Parameters
         * @param params.reader Single reader or collection of readers
         * @param params.writer A ReaderWriter instance which is only used for writing files
         * @param params.name The collection name
         */
        constructor(params: { reader: AbstractReader; writer: AbstractReaderWriter; name?: string });

        /**
         * Locates resources by glob from source reader only.
         * For found resources that are also available in the writer, the writer resource will be returned.
         * @param virPattern glob pattern for virtual directory structure
         * @param options
         * @param [options.nodir=true] Do not match directories
         * @returns Promise resolving to list of resources
         */
        byGlobSource(virPattern: string, options?: { nodir?: boolean }): Promise<Resource[]>;
    }

    /**
     * Resource Locator ReaderCollection
     */
    export class ReaderCollection extends AbstractReader {
        /**
         * The constructor.
         * @param params Parameters
         * @param params.name The collection name
         * @param params.readers List of resource readers (all tried in parallel). If none are provided, the collection will never return any results.
         */
        constructor(params: { name: string; readers?: AbstractReader[] });
    }

    /**
     * Prioritized Resource Locator Collection
     */
    export class ReaderCollectionPrioritized extends AbstractReader {
        /**
         * The constructor.
         * @param params Parameters
         * @param params.name The collection name
         * @param params.readers Prioritized list of resource readers (tried in the order provided). If none are provided, the collection will never return any results.
         */
        constructor(params: { name: string; readers?: AbstractReader[] });
    }

    export namespace readers {
        /**
         * A reader that allows dynamic filtering of resources passed through it
         */
        export class Filter extends AbstractReader {
            /**
             * Constructor
             * @param params Parameters
             * @param params.reader The resource reader or collection to wrap
             * @param params.callback Filter function. Will be called for every resource read through this reader.
             */
            constructor(params: { reader: AbstractReader; callback: (resource: Resource) => boolean });
        }

        /**
         * A reader that allows for rewriting paths segments of all resources passed through it.
         *
         * @example
         * import Link from "@ui5/fs/readers/Link";
         * const linkedReader = new Link({
         *     reader: sourceReader,
         *     pathMapping: {
         *          linkPath: `/app`,
         *          targetPath: `/resources/my-app-name/`
         *      }
         * });
         *
         *
         * // The following resolves with a @ui5/fs/ResourceFacade of the resource
         * // located at "/resources/my-app-name/Component.js" in the sourceReader
         * @example
         * const resource = await linkedReader.byPath("/app/Component.js");
         */
        export class Link extends AbstractReader {
            /**
             * Constructor
             * @param params Parameters
             * @param params.reader The resource reader or collection to wrap
             * @param params.pathMapping pathMapping
             * @param params.pathMapping.linkPath Path to match and replace in the requested path or pattern
             * @param params.pathMapping.targetPath Path to use as a replacement in the request for the source reader
             */
            constructor(params: { reader: AbstractReader; pathMapping: { linkPath: string; targetPath: string } });
        }
    }

    /**
     * Resource. UI5 Tooling specific representation of a file's content and metadata
     */
    export class Resource {
        /**
         * The constructor
         * @param params Parameters
         * @param params.path Absolute virtual path of the resource
         * @param params.statInfo File information. Instance of [fs.Stats]{@link https://nodejs.org/api/fs.html#fs_class_fs_stats} or similar object
         * @param params.buffer Content of this resources as a Buffer instance (cannot be used in conjunction with parameters string, stream or createStream)
         * @param params.string Content of this resources as a string (cannot be used in conjunction with parameters buffer, stream or createStream)
         * @param params.stream Parameters Readable stream of the content of this resource (cannot be used in conjunction with parameters buffer, string or createStream)
         * @param params.createStream Function callback that returns a readablestream of the content of this resource (cannot be used in conjunction with parameters buffer, string or stream). In some cases this is the most memory-efficient way to supply resource content
         * @param params.project Project this resource is associated with
         * @param params.sourceMetadata Source metadata for UI5 Tooling internal use. Typically set by an adapter to store information for later retrieval.
         */
        constructor(params: {
            path: string;
            statInfo?: fs.Stats;
            buffer?: Buffer;
            string?: string;
            stream?: Stream;
            createStream?: () => Readable;
            project?: unknown;
            sourceMetadata?: object;
        });

        /**
         * Gets a buffer with the resource content.
         * @returns Promise resolving with a buffer of the resource content.
         */
        getBuffer(): Promise<Buffer>;

        /**
         * Sets a Buffer as content.
         * @param buffer Buffer instance
         */
        setBuffer(buffer: Buffer): void;

        /**
         * Gets a string with the resource content.
         * @returns Promise resolving with the resource content.
         */
        getString(): Promise<string>;

        /**
         * Sets a String as content
         * @param string Resource content
         */
        setString(string: string): void;

        /**
         * Gets a readable stream for the resource content.
         * Repetitive calls of this function are only possible if new content has been set in the meantime (through [setStream]{@link @ui5/fs/Resource#setStream}, [setBuffer]{@link @ui5/fs/Resource#setBuffer} or [setString]{@link @ui5/fs/Resource#setString}). This is to prevent consumers from accessing drained streams.
         * @returns Readable stream for the resource content.
         */
        getStream(): Readable;

        /**
         * Sets a readable stream as content.
         * @param stream Readable stream of the resource content or callback for dynamic creation of a readable stream
         */
        setStream(stream: Readable | (() => Readable)): void;

        /**
         * Gets the virtual resources path
         * @returns Virtual path of the resource
         */
        getPath(): string;

        /**
         * Sets the virtual resources path
         * @param path Absolute virtual path of the resource
         */
        setPath(path: string): void;

        /**
         * Gets the resource name
         * @returns Name of the resource
         */
        getName(): string;

        /**
         * Gets the resources stat info.
         * Note that a resources stat information is not updated when the resource is being modified.
         * Also, depending on the used adapter, some fields might be missing which would be present for a [fs.Stats]{@link https://nodejs.org/api/fs.html#fs_class_fs_stats} instance.
         * @returns Instance of [fs.Stats]{@link https://nodejs.org/api/fs.html#fs_class_fs_stats} or similar object
         */
        getStatInfo(): fs.Stats;

        /**
         * Size in bytes allocated by the underlying buffer.
         * @returns size in bytes, `0` if there is no content yet
         */
        getSize(): Promise<number>;

        /**
         * Adds a resource collection name that was involved in locating this resource.
         * @param name Resource collection name
         */
        pushCollection(name: string): void;

        /**
         * Returns a clone of the resource. The clones content is independent from that of the original resource
         * @returns Promise resolving with the clone
         */
        clone(): Promise<Resource>;

        /**
         * Retrieve the project assigned to the resource
         *
         * **Note for UI5 Tooling extensions (i.e. custom tasks, custom middleware):**
         * In order to ensure compatibility across UI5 Tooling versions, consider using the
         * `getProject(resource)` method provided by [TaskUtil]{@link module:@ui5/project/build/helpers/TaskUtil} and
         * [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil}, which will
         * return a Specification Version-compatible Project interface.
         * @returns Project this resource is associated with
         */
        getProject(): unknown;

        /**
         * Assign a project to the resource
         * @param project Project this resource is associated with
         */
        setProject(project: unknown): void;

        /**
         * Check whether a project has been assigned to the resource
         * @returns True if the resource is associated with a project
         */
        hasProject(): boolean;

        /**
         * Check whether the content of this resource has been changed during its life cycle
         * @returns True if the resource's content has been changed
         */
        isModified(): boolean;

        /**
         * Tracing: Get tree for printing out trace
         * @returns Trace tree
         */
        getPathTree(): unknown;

        /**
         * Returns source metadata if any where provided during the creation of this resource.
         * Typically set by an adapter to store information for later retrieval.
         * @returns
         */
        getSourceMetadata(): unknown;
    }

    /**
     * Resource Factory
     */
    export namespace resourceFactory {
        /**
         * Creates a ReaderCollection
         * @param params Parameters. same parameters as the [ReaderCollection]{@link @ui5/fs/ReaderCollection} constructor
         * @returns Reader collection wrapping provided readers
         */
        export type createReaderCollection = (...params: ConstructorParameters<typeof ReaderCollection>) => ReaderCollection;

        /**
         * Creates a ReaderCollectionPrioritized
         * @param params Parameters. same parameters as the [ReaderCollectionPrioritized]{@link @ui5/fs/ReaderCollectionPrioritized} constructor
         * @returns Reader collection wrapping provided readers
         */
        export type createReaderCollectionPrioritized = (
            ...params: ConstructorParameters<typeof ReaderCollectionPrioritized>
        ) => ReaderCollectionPrioritized;

        /**
         * Creates a [Resource]{@link @ui5/fs/Resource}. Accepts the same parameters as the [Resource]{@link @ui5/fs/Resource} constructor.
         * @param params Parameters to be passed to the constructor. same parameters as the [Resource]{@link @ui5/fs/Resource} constructor
         * @returns Resource
         */
        export type createResource = (...params: ConstructorParameters<typeof Resource>) => Resource;

        /**
         * Create a [Filter-Reader]{@link @ui5/fs/readers/Filter} with the given reader.
         * The provided callback is called for every resource that is retrieved through the reader and decides whether the resource shall be passed on or dropped.
         *
         * @param params Parameters to be passed to the constructor. same parameters as the [Filter]{@link @ui5/fs/Filter} constructor
         * @returns Reader instance
         */
        export type createFilterReader = (...params: ConstructorParameters<typeof readers.Filter>) => readers.Filter;

        /**
         * Create a [Link-Reader]{@link @ui5/fs/readers/Filter} with the given reader.
         * The provided path mapping allows for rewriting paths segments of all resources passed through it.
         *
         * @example
         * import {createLinkReader} from "@ui5/fs/resourceFactory";
         * const linkedReader = createLinkReader({
         *     reader: sourceReader,
         *     pathMapping: {
         *          linkPath: `/app`,
         *          targetPath: `/resources/my-app-name/`
         *      }
         * });
         *
         * // The following resolves with a @ui5/fs/ResourceFacade of the resource
         * // located at "/resources/my-app-name/Component.js" in the sourceReader
         * const resource = await linkedReader.byPath("/app/Component.js");
         *
         * @param params Parameters to be passed to the constructor. same parameters as the [Link]{@link @ui5/fs/Link} constructor
         * @returns Reader instance
         */
        export type createLinkReader = (...params: ConstructorParameters<typeof readers.Link>) => readers.Link;

        /**
         * Create a [Link-Reader]{@link @ui5/fs/readers/Link} where all requests are prefixed with `/resources/<namespace>`.
         * This simulates "flat" resource access, which is for example common for projects of type "application"
         *
         * @param params Parameters to be passed to the constructor. same parameters as the [Link]{@link @ui5/fs/Link} constructor
         * @returns Reader instance
         */
        export type createFlatReader = (...params: ConstructorParameters<typeof readers.Link>) => readers.Link;

        export type prefixGlobPattern = () => unknown;
        export type createWorkspace = () => unknown;
        export type createWriterCollection = () => unknown;
        export type createAdapter = () => unknown;
        export type createReader = () => unknown;
    }
}
