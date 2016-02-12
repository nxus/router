# Nxus Router

[![Build Status](https://travis-ci.org/nxus/router.svg?branch=master)](https://travis-ci.org/nxus/router)

The Nxus router is an Express compatible web server and router for Nxus applications.

## Installation

In your Nxus application:

    > npm install @nxus/router --save

## Usage

### Defining a route

    app.get('router').route('/', (req, res) => {
      res.send('Hello World')
    })

Alternatively, you can specify a HTTP method:

    app.get('router').route('GET', '/', (req, res) => {
      res.send('Hello World')
    })

### Adding Express/connect middleware

    app.get('router').middleware((req, res) => {
      res.status(404).send('Nothing to see here');
    })

### Adding static files/directories

    app.get('router').static("my-prefix", myPath)

For example, `myFile.txt` in `myPath` is then available at the url `/my-prefix/myFile.txt`

Sometimes its good to have a static assets folder where all your assets live. For that reason, you can use the `assets` gatherer.

## API

### Router

[src/index.js:21-152](https://github.com/nxus/router/blob/8b69fc632c3313c54ee04431a325de759a7b3a8e/src/index.js#L21-L152 "Source code on GitHub")

#### constructor

[src/index.js:26-51](https://github.com/nxus/router/blob/8b69fc632c3313c54ee04431a325de759a7b3a8e/src/index.js#L26-L51 "Source code on GitHub")

Sets up the relevant gather/providers

**Parameters**

-   `app`  

#### getExpressApp

[src/index.js:116-118](https://github.com/nxus/router/blob/8b69fc632c3313c54ee04431a325de759a7b3a8e/src/index.js#L116-L118 "Source code on GitHub")

Returns the Express App instance.

Returns **Instance** ExpressJs app instance.

#### getRoutes

[src/index.js:108-110](https://github.com/nxus/router/blob/8b69fc632c3313c54ee04431a325de759a7b3a8e/src/index.js#L108-L110 "Source code on GitHub")

Returns the internal routing table.

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** routes which have been registered

#### launch

[src/index.js:89-92](https://github.com/nxus/router/blob/8b69fc632c3313c54ee04431a325de759a7b3a8e/src/index.js#L89-L92 "Source code on GitHub")

Launches the Express app. Called by the app.load event.

#### setRoute

[src/index.js:126-141](https://github.com/nxus/router/blob/8b69fc632c3313c54ee04431a325de759a7b3a8e/src/index.js#L126-L141 "Source code on GitHub")

Adds a route to the internal routing table passed to Express. Accessed with the 'route' and 'middleware' gather.

**Parameters**

-   `method` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Either 'get', 'post', 'put' or 'delete'.
-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A URL route.
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** An ExpressJs type callback to handle the route.

#### setStatic

[src/index.js:148-151](https://github.com/nxus/router/blob/8b69fc632c3313c54ee04431a325de759a7b3a8e/src/index.js#L148-L151 "Source code on GitHub")

Adds a path to serve static files.

**Parameters**

-   `prefix` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path at which the static files will be accessible. For example: /js
-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A fully resolved path.

#### stop

[src/index.js:97-102](https://github.com/nxus/router/blob/8b69fc632c3313c54ee04431a325de759a7b3a8e/src/index.js#L97-L102 "Source code on GitHub")

Stops the express app. Called by the app.stop event.
