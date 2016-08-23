import {Module, ModuleInitOptions} from "microframework/Module";
import {TypeOrmModuleConfig} from "./TypeOrmModuleConfig";
import {ConnectionManager, useContainer, createConnection, ConnectionOptions} from "typeorm";

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
        useContainer(this.options.container);
        this._connectionManager = this.options.container.get(ConnectionManager);
        return this.createConnections();
    }

    private createConnections() {
        let promises: Promise<any>[] = [];

        if (this.configuration.connection) {
            promises.push(createConnection(this.normalizeConnectionOptions(this.configuration.connection)));
        }

        if (this.configuration.connections) {
            promises = promises.concat(
                this.configuration
                    .connections
                    .map(connectionOptions => createConnection(this.normalizeConnectionOptions(connectionOptions)))
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

    private normalizeConnectionOptions(connectionOptions: ConnectionOptions) {
        const newConnectionOptions: ConnectionOptions = Object.assign({}, connectionOptions);
        newConnectionOptions.entityDirectories = this.normalizeDirectories(newConnectionOptions.entityDirectories);
        newConnectionOptions.subscriberDirectories = this.normalizeDirectories(newConnectionOptions.subscriberDirectories);
        newConnectionOptions.namingStrategyDirectories = this.normalizeDirectories(newConnectionOptions.namingStrategyDirectories);
        newConnectionOptions.entitySchemaDirectories = this.normalizeDirectories(newConnectionOptions.entitySchemaDirectories);
        return newConnectionOptions;
    }

    private normalizeDirectories(entityDirectories: string[]): string[] {
        if (!entityDirectories || !entityDirectories.length)
            return [];
        
        return entityDirectories.map(dir => this.options.frameworkSettings.srcDirectory + "/" + dir);
    }

}
