import {ConnectionOptions} from "typeorm/connection/ConnectionOptions";

/**
 * Configuration for typeorm module.
 */
export interface TypeOrmModuleConfig {

    /**
     * Default connection options.
     */
    connection?: {
        
        /**
         * Sets the driver for the default connection. Defaults to "mysql".
         */
        driver: string;

        /**
         * Sets the options for the default typeorm connection.
         */
        options: ConnectionOptions;

        /**
         * List of directories where from orm entities will be loaded.
         */
        entityDirectories?: string[];

        /**
         * List of directories where from orm subscribers will be loaded.
         */
        subscriberDirectories?: string[];

        /**
         * List of directories from where naming strategies will be loaded.
         */
        namingStrategyDirectories?: string[];
        
    };

    /**
     * Used in the case when multiple orm connections are required.
     */
    connections: {

        /**
         * Driver to be used by this connection. Defaults to "mysql".
         */
        driver?: string;

        /**
         * Connection name.
         */
        name: string;

        /**
         * Connection options.
         */
        options: ConnectionOptions;

        /**
         * List of directories where from orm entities will be loaded.
         */
        entityDirectories?: string[];

        /**
         * List of directories where from orm subscribers will be loaded.
         */
        subscriberDirectories?: string[];

        /**
         * List of directories from where naming strategies will be loaded.
         */
        namingStrategyDirectories?: string[];
        
    }[];

}
