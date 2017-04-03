> This repository is deprecated. Microframework architecure has changed. Please consider writing your own module for a newer versions of microframework.

# TypeORM module for Microframework

Adds integration between [typeorm](http://github.com/pleerock/typeorm) and
[microframework](https://github.com/pleerock/microframework).

## Usage

1. Install module:

    `npm install microframework-typeorm --save`

2. Simply register module in the microframework when you are bootstrapping it.
    
    ```typescript
    
        import {MicroFrameworkBootstrapper} from "microframework/MicroFrameworkBootstrapper";
        import {TypeOrmModule} from "microframework-typeorm/TypeOrmModule";
        
        new MicroFrameworkBootstrapper({ baseDirectory: __dirname })
            .registerModules([
                new TypeOrmModule()
            ])
            .bootstrap()
            .then(result => console.log('Module is running. TypeODM is available now.'))
            .catch(error => console.error('Error: ', error));
    ```

3. ES6 features are used, so you may want to install [es6-shim](https://github.com/paulmillr/es6-shim) too:

    `npm install es6-shim --save`

    you may need to `require("es6-shim");` in your app.

4. Now you can use [typeorm](http://github.com/pleerock/typeorm) module in your microframework.

## Todos

* cover with tests
* add more docs
