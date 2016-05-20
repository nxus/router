# nxus-router

## 

[![Build Status](https://travis-ci.org/nxus/router.svg?branch=master)](https://travis-ci.org/nxus/router)

The Nxus router is an Express compatible web server and router for Nxus applications.

### Installation

In your Nxus application:

    > npm install @nxus/router --save

### Usage

#### Defining a route

    app.get('router').route('/', (req, res) => {
      res.send('Hello World')
    })

Alternatively, you can specify a HTTP method:

    app.get('router').route('GET', '/', (req, res) => {
      res.send('Hello World')
    })

#### Adding Express/connect middleware

    app.get('router').middleware((req, res) => {
      res.status(404).send('Nothing to see here');
    })

#### Adding static files/directories

    app.get('router').static("my-prefix", myPath)

For example, `myFile.txt` in `myPath` is then available at the url `/my-prefix/myFile.txt`

Sometimes its good to have a static assets folder where all your assets live. For that reason, you can use the `assets` gatherer.

## API

* * *

## Router

### constructor

Sets up the relevant gather/providers

**Parameters**

-   `app`  

### getExpressApp

Returns the Express App instance.

Returns **Instance** ExpressJs app instance.

### getRoutes

Returns the internal routing table.

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** routes which have been registered

### launch

Launches the Express app. Called by the app.load event.

### setMiddleware

Adds a middleware handler to the internal routing table passed to Express. Accessed with 'middleware' gather.

**Parameters**

-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A URL route.
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** An ExpressJs type callback to handle the route.
-   `method`   (optional, default `'use'`)

### setRoute

Adds a route to the internal routing table passed to Express. Accessed with the 'route' gather.

**Parameters**

-   `method` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Either 'get', 'post', 'put' or 'delete'. Defaults to 'get'.
-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A URL route.
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** An ExpressJs type callback to handle the route.

### setStatic

Adds a path to serve static files.

**Parameters**

-   `prefix` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path at which the static files will be accessible. For example: /js
-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A fully resolved path.

### stop

Stops the express app. Called by the app.stop event.
