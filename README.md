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

[src/index.js:21-178](https://github.com/nxus/router/blob/aa386292dbd1ff1c11d669e1bb578bc8bc4b97d0/src/index.js#L21-L178 "Source code on GitHub")

#### constructor

[src/index.js:26-55](https://github.com/nxus/router/blob/aa386292dbd1ff1c11d669e1bb578bc8bc4b97d0/src/index.js#L26-L55 "Source code on GitHub")

Sets up the relevant gather/providers

**Parameters**

-   `app`  

#### getExpressApp

[src/index.js:121-123](https://github.com/nxus/router/blob/aa386292dbd1ff1c11d669e1bb578bc8bc4b97d0/src/index.js#L121-L123 "Source code on GitHub")

Returns the Express App instance.

Returns **Instance** ExpressJs app instance.

#### getRoutes

[src/index.js:113-115](https://github.com/nxus/router/blob/aa386292dbd1ff1c11d669e1bb578bc8bc4b97d0/src/index.js#L113-L115 "Source code on GitHub")

Returns the internal routing table.

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** routes which have been registered

#### launch

[src/index.js:94-97](https://github.com/nxus/router/blob/aa386292dbd1ff1c11d669e1bb578bc8bc4b97d0/src/index.js#L94-L97 "Source code on GitHub")

Launches the Express app. Called by the app.load event.

#### setMiddleware

[src/index.js:130-132](https://github.com/nxus/router/blob/aa386292dbd1ff1c11d669e1bb578bc8bc4b97d0/src/index.js#L130-L132 "Source code on GitHub")

Adds a middleware handler to the internal routing table passed to Express. Accessed with 'middleware' gather.

**Parameters**

-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A URL route.
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** An ExpressJs type callback to handle the route.
-   `method`   (optional, default `'use'`)

#### setRoute

[src/index.js:140-150](https://github.com/nxus/router/blob/aa386292dbd1ff1c11d669e1bb578bc8bc4b97d0/src/index.js#L140-L150 "Source code on GitHub")

Adds a route to the internal routing table passed to Express. Accessed with the 'route' gather.

**Parameters**

-   `method` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Either 'get', 'post', 'put' or 'delete'.
-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A URL route.
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** An ExpressJs type callback to handle the route.

#### setStatic

[src/index.js:157-160](https://github.com/nxus/router/blob/aa386292dbd1ff1c11d669e1bb578bc8bc4b97d0/src/index.js#L157-L160 "Source code on GitHub")

Adds a path to serve static files.

**Parameters**

-   `prefix` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path at which the static files will be accessible. For example: /js
-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A fully resolved path.

#### stop

[src/index.js:102-107](https://github.com/nxus/router/blob/aa386292dbd1ff1c11d669e1bb578bc8bc4b97d0/src/index.js#L102-L107 "Source code on GitHub")

Stops the express app. Called by the app.stop event.
