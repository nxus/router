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

[src/index.js:21-169](https://github.com/nxus/router/blob/3af3cb380392f189a102879221e74c2eb0c44917/src/index.js#L21-L169 "Source code on GitHub")

#### constructor

[src/index.js:26-54](https://github.com/nxus/router/blob/3af3cb380392f189a102879221e74c2eb0c44917/src/index.js#L26-L54 "Source code on GitHub")

Sets up the relevant gather/providers

**Parameters**

-   `app`  

#### getExpressApp

[src/index.js:119-121](https://github.com/nxus/router/blob/3af3cb380392f189a102879221e74c2eb0c44917/src/index.js#L119-L121 "Source code on GitHub")

Returns the Express App instance.

Returns **Instance** ExpressJs app instance.

#### getRoutes

[src/index.js:111-113](https://github.com/nxus/router/blob/3af3cb380392f189a102879221e74c2eb0c44917/src/index.js#L111-L113 "Source code on GitHub")

Returns the internal routing table.

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** routes which have been registered

#### launch

[src/index.js:92-95](https://github.com/nxus/router/blob/3af3cb380392f189a102879221e74c2eb0c44917/src/index.js#L92-L95 "Source code on GitHub")

Launches the Express app. Called by the app.load event.

#### setRoute

[src/index.js:129-139](https://github.com/nxus/router/blob/3af3cb380392f189a102879221e74c2eb0c44917/src/index.js#L129-L139 "Source code on GitHub")

Adds a route to the internal routing table passed to Express. Accessed with the 'route' and 'middleware' gather.

**Parameters**

-   `method` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Either 'get', 'post', 'put' or 'delete'.
-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A URL route.
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** An ExpressJs type callback to handle the route.

#### setStatic

[src/index.js:146-149](https://github.com/nxus/router/blob/3af3cb380392f189a102879221e74c2eb0c44917/src/index.js#L146-L149 "Source code on GitHub")

Adds a path to serve static files.

**Parameters**

-   `prefix` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path at which the static files will be accessible. For example: /js
-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A fully resolved path.

#### stop

[src/index.js:100-105](https://github.com/nxus/router/blob/3af3cb380392f189a102879221e74c2eb0c44917/src/index.js#L100-L105 "Source code on GitHub")

Stops the express app. Called by the app.stop event.
