import {Module, ModuleInitOptions} from "microframework/Module";
import {TypeOrmModuleConfig} from "./TypeOrmModuleConfig";
import {ConnectionManager} from "typeorm/connection/ConnectionManager";
import {MysqlDriver} from "typeorm/driver/MysqlDriver";

/**
 * TypeORM module integration with microframework.
 */
export class TypeOrmModule implements Module {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    public static DEFAULT_ORM_ENTITY_DIRECTORY = "entity";
    public static DEFAULT_ORM_SUBSCRIBER_DIRECTORY = "subscriber";

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
        this._connectionManager.importEntitiesFromDirectories(this.getOrmEntityDirectories());
        this._connectionManager.importSubscribersFromDirectories(this.getOrmSubscriberDirectories());
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
        this._connectionManager.container = this.options.container;
        this.addConnections();
        return this.connect();
    }

    private addConnections() {
        if (this.configuration.connection) {
            if (!this.configuration.connectionDriver || this.configuration.connectionDriver === "mongodb")
                this._connectionManager.createConnection(new MysqlDriver(), this.configuration.connection);
        }

        if (this.configuration.connections) {
            this.configuration.connections
                .filter(connection => !connection.driver || connection.driver === "mongodb")
                .forEach(connection => this._connectionManager.createConnection(connection.name, new MysqlDriver(), connection.options));
        }
    }

    private closeConnections(): Promise<any> {
        let promises: Promise<any>[] = [];
        if (this.configuration.connection)
            promises.push(this._connectionManager.getConnection().close());

        if (this.configuration.connections)
            promises.concat(this.configuration
                .connections
                .map(connection => this._connectionManager.getConnection(connection.name).close()));

        return Promise.all(promises);
    }

    private connect(): Promise<void> {
        let promises: Promise<any>[] = [];
        if (this.configuration.connection)
            promises.push(this._connectionManager.getConnection().connect());

        if (this.configuration.connections) {
            promises.concat(this.configuration.connections.map(connection => {
                return this._connectionManager.getConnection(connection.name).connect();
            }));
        }
        return Promise.all(promises).then(() => {});
    }

    private getOrmEntityDirectories(): string[] {
        if (!this.configuration || !this.configuration.entityDirectories)
            return [this.getSourceCodeDirectory() + TypeOrmModule.DEFAULT_ORM_ENTITY_DIRECTORY];

        return this.configuration.entityDirectories;
    }

    private getOrmSubscriberDirectories(): string[] {
        if (!this.configuration || !this.configuration.subscribersDirectories)
            return [this.getSourceCodeDirectory() + TypeOrmModule.DEFAULT_ORM_SUBSCRIBER_DIRECTORY];

        return this.configuration.subscribersDirectories;
    }

    private getSourceCodeDirectory() {
        return this.options.frameworkSettings.srcDirectory + "/";
    }

}
