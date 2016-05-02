import {Module, ModuleInitOptions} from "microframework/Module";
import {TypeOrmModuleConfig} from "./TypeOrmModuleConfig";
import {ConnectionManager, useContainer, createConnection} from "typeorm/typeorm";

/**
 * TypeORM module integration with microframework.
 */
export class TypeOrmModule implements Module {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    // public static DEFAULT_ORM_ENTITY_DIRECTORY = "entity";
    // public static DEFAULT_ORM_SUBSCRIBER_DIRECTORY = "subscriber";

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private options: ModuleInitOptions;
    private configuration: TypeOrmModuleConfig;
    private _connectionManager: ConnectionManager;

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    getName(): string {
        return "TypeOrmModule";
    }

    getConfigurationName(): string {
        return "typeorm";
    }

    isConfigurationRequired(): boolean {
        return true;
    }

    init(options: ModuleInitOptions, configuration: TypeOrmModuleConfig): void {
        this.options = options;
        this.configuration = configuration;
    }

    onBootstrap(): Promise<any> {
        return this.setupORM();
    }

    afterBootstrap(): Promise<any> {
        return Promise.resolve();
    }

    onShutdown(): Promise<any> {
        return this.closeConnections();
    }

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    /**
     * Gets the connection manager.
     */
     get connectionManager(): ConnectionManager {
        return this._connectionManager;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private setupORM(): Promise<any> {
        this._connectionManager = this.options.container.get(ConnectionManager);
        useContainer(this.options.container);
        return this.createConnections();
    }

    private createConnections() {
        let promises: Promise<any>[] = [];

        if (this.configuration.connection) {
            if (!this.configuration.connection.driver || this.configuration.connection.driver === "mysql") {
                // this._connectionManager.createConnection(new MysqlDriver(), this.configuration.connection);
                promises.push(createConnection({
                    driver: "mysql",
                    connection: this.configuration.connection.options,
                    entityDirectories: this.normalizeDirectories(this.configuration.connection.entityDirectories),
                    subscriberDirectories: this.normalizeDirectories(this.configuration.connection.subscriberDirectories),
                    namingStrategyDirectories: this.normalizeDirectories(this.configuration.connection.namingStrategyDirectories)
                }));
            }
        }

        if (this.configuration.connections) {
            promises.concat(
                this.configuration
                    .connections
                    .filter(connection => !connection.driver || connection.driver === "mysql")
                    .map(connection => createConnection({
                        driver: "mysql",
                        connection: connection.options,
                        entityDirectories: this.normalizeDirectories(connection.entityDirectories),
                        subscriberDirectories: this.normalizeDirectories(connection.subscriberDirectories),
                        namingStrategyDirectories: this.normalizeDirectories(connection.namingStrategyDirectories)
                    }))
            );
        }
        // todo: handle errors: if driver not specified, incorrect specified, no directories specified, directories is missing

        return Promise.all(promises);
    }

    private closeConnections(): Promise<any> {
        let promises: Promise<any>[] = [];
        if (this.configuration.connection)
            promises.push(this._connectionManager.get().close());

        if (this.configuration.connections)
            promises.concat(this.configuration
                .connections
                .map(connection => this._connectionManager.get(connection.name).close()));

        return Promise.all(promises);
    }

    /*private connect(): Promise<void> {
        let promises: Promise<any>[] = [];
        if (this.configuration.connection)
            promises.push(this._connectionManager.getConnection().connect());

        if (this.configuration.connections) {
            promises.concat(this.configuration.connections.map(connection => {
                return this._connectionManager.getConnection(connection.name).connect();
            }));
        }
        return Promise.all(promises).then(() => {
        });
    }*/

    private normalizeDirectories(entityDirectories: string[]): string[] {
        if (!entityDirectories || !entityDirectories.length)
            return [];
        
        return entityDirectories.reduce((allDirs, dir) => {
            return allDirs.concat(require("glob").sync(this.getSourceCodeDirectory() + dir));
        }, [] as string[]);
    }

    private getSourceCodeDirectory() {
        return this.options.frameworkSettings.srcDirectory + "/";
    }

}
