import {ConnectionOptions} from "typeorm";

/**
 * Configuration for typeorm module.
 */
export interface TypeOrmModuleConfig {

    /**
     * Default connection options.
     */
    connection?: ConnectionOptions;

    /**
     * Used in the case when multiple orm connections are required.
     */
    connections: ConnectionOptions[];

}
