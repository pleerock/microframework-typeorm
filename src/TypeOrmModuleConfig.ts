import {ConnectionOptions} from "typeorm/connection/ConnectionOptions";

/**
 * Configuration for typeorm module.
 */
export interface TypeOrmModuleConfig {

    /**
     * List of directories where from orm entities will be loaded.
     */
    entityDirectories?: string[];

    /**
     * List of directories where from orm subscribers will be loaded.
     */
    subscribersDirectories?: string[];

    /**
     * Sets the options for the default typeorm connection.
     */
    connection: ConnectionOptions;

    /**
     * Sets the driver for the default connection. Defaults to "mysql".
     */
    connectionDriver?: string;

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
    }[];

}
