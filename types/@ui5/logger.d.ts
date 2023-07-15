declare module '@ui5/logger' {
    export {};

    /**
     * Standard logging module for UI5 Tooling and extensions.
     * Emits <code>ui5.log</code> events on the [<code>process</code>]{@link https://nodejs.org/api/process.html} object, which can be handled by dedicated writers, like [@ui5/logger/writers/Console]{@link @ui5/logger/writers/Console}. If no listener is attached to an event, messages are written directly to the <code>process.stderr</code> stream.
     */
    export class Logger {
        /**
         * Available log levels, ordered by priority:
         * 
         * - silly
         * - verbose
         * - perf
         * - info <i>(default)</i>
         * - warn
         * - error
         * - silent
         *
         * Log level `silent` is special in the sense that no messages can be submitted with that level.
         * It can be used to suppress all logging.
         */
        static LOG_LEVELS = ['silly', 'verbose', 'perf', 'info', 'warn', 'error', 'silent'];

        /**
         * Event name used for emitting new log-message event on the
         * [`process`](https://nodejs.org/api/process.html) object
         */
        static LOG_EVENT_NAME = 'ui5.log';

        /**
         * Sets the standard log level.
         * **Example:** Setting it to `perf` would suppress all `silly` and `verbose` logging, and only show `perf`, `info`, `warn` and `error` logs.
         * @param levelName New log level
         */
        static setLevel(levelName: string): void;

        /**
         * Gets the current log level
         * @returns The current log level. Defaults to `info`
         */
        static getLevel(): string;

        /**
         * Tests whether the provided log level is enabled by the current log level
         * @param levelName Log level to test
         * @returns True if the provided level is enabled
         */
        static isLevelEnabled(levelName: string): boolean;


        /**
         * The constructor.
         * @param moduleName Identifier for messages created by this logger.
         * Example: `module:submodule:Class`
         */
        constructor(moduleName: string);

        /**
         * Tests whether the provided log level is enabled by the current log level
         * @param levelName Log level to test
         * @returns True if the provided level is enabled
         */
        isLevelEnabled(levelName: string): boolean;
        
        /**
         * Create a log entry with the `silly` level
         * @param message Messages to log. An automatic string conversion is applied if necessary
         */
        silly(...message: any[]): void;
        
        /**
         * Create a log entry with the `verbose` level
         * @param message Messages to log. An automatic string conversion is applied if necessary
         */
        verbose(...message: any[]): void;
        
        /**
         * Create a log entry with the `perf` level
         * @param message Messages to log. An automatic string conversion is applied if necessary
         */
        perf(...message: any[]): void;
        
        /**
         * Create a log entry with the `info` level
         * @param message Messages to log. An automatic string conversion is applied if necessary
         */
        info(...message: any[]): void;
        
        /**
         * Create a log entry with the `warn` level
         * @param message Messages to log. An automatic string conversion is applied if necessary
         */
        warn(...message: any[]): void;
        
        /**
         * Create a log entry with the `error` level
         * @param message Messages to log. An automatic string conversion is applied if necessary
         */
        error(...message: any[]): void;
    }
}
