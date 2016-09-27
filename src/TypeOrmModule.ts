import {Module, ModuleInitOptions} from "microframework/Module";
import {TypeOrmModuleConfig} from "./TypeOrmModuleConfig";
import {ConnectionManager, useContainer, createConnection, ConnectionOptions} from "typeorm";

// todo: handle errors: if driver not specified, incorrect specified, no directories specified, directories is missing

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

        // note that this must be before this module bootstrap, because on bootstrap other modules
        // that bootstrapped before this module can load same files, and if they do it, they will be
        // registered in default typeorm container
        useContainer(this.options.container);
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
        return this.createConnections();
    }

    private createConnections() {
        let promises: Promise<any>[] = [];

        if (this.configuration.connection)
            promises.push(createConnection(this.normalizeConnectionOptions(this.configuration.connection)));

        if (this.configuration.connections)
                this.configuration
                    .connections
                    .map(connectionOptions => createConnection(this.normalizeConnectionOptions(connectionOptions)))
                    .forEach(closePromise => promises.push(closePromise));

        return Promise.all(promises);
    }

    private closeConnections(): Promise<any> {
        let promises: Promise<any>[] = [];

        if (this.configuration.connection)
            promises.push(this._connectionManager.get().close());

        if (this.configuration.connections)
            this.configuration.connections
                .map(connection => this._connectionManager.get(connection.name).close())
                .forEach(closePromise => promises.push(closePromise));

        return Promise.all(promises);
    }

    private normalizeConnectionOptions(connectionOptions: ConnectionOptions): ConnectionOptions {
        return Object.assign({}, connectionOptions, {
            entities: this.normalizeDirectories(connectionOptions.entities),
            subscribers: this.normalizeDirectories(connectionOptions.subscribers),
            namingStrategies: this.normalizeDirectories(connectionOptions.namingStrategies),
            entitySchemas: this.normalizeDirectories(connectionOptions.entitySchemas),
        });
    }

    private normalizeDirectories<T>(directoriesOrClasses: string[]|T[]): string[]|T[] {
        if (!directoriesOrClasses || !directoriesOrClasses.length)
            return [];
        
        return (directoriesOrClasses as any[]).map(entity => {
            if (typeof entity === "string") {
                return this.options.frameworkSettings.srcDirectory + "/" + entity;
            }

            return entity;
        });
    }

}
