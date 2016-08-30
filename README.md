# nxus-router

## 

[![Build Status](https://travis-ci.org/nxus/router.svg?branch=master)](https://travis-ci.org/nxus/router)

The Nxus router is an Express compatible web server and router for Nxus applications.

### Installation

In your Nxus application:

    > npm install nxus-router --save

### Usage

#### Defining a route

    import {router} from 'nxus-router'

    router.route('/', (req, res) => {
      res.send('Hello World')
    })

Alternatively, you can specify a HTTP method:

    router.route('GET', '/', (req, res) => {
      res.send('Hello World')
    })

#### Adding Express/connect middleware

    router.middleware((req, res) => {
      res.status(404).send('Nothing to see here')
    })

#### Adding static files/directories

    router.staticRoute("/my-prefix", myPath)

For example, `myFile.txt` in `myPath` is then available at the url `/my-prefix/myFile.txt`

Sometimes its good to have a static assets folder where all your assets live. For that reason, you can use the `assets` gatherer.

## Router

**Extends NxusModule**

Router provides Express based HTTP routing

**Examples**

```javascript
import {router} from 'nxus-router'
```

### getRoutes

Returns the internal routing table.

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** routes which have been registered

### getExpressApp

Returns the Express App instance.

Returns **Instance** ExpressJs app instance.

### middleware

Adds a middleware handler to the internal routing table passed to Express. Accessed with 'middleware' gather.

**Parameters**

-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A URL route or the handler for all routes
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** An ExpressJs type callback to handle the route.
-   `method`   (optional, default `'use'`)

### route

Adds a GET route to the internal routing table passed to Express. Accessed with the 'route' gather.

**Parameters**

-   `method`  
-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A URL route.
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** An ExpressJs type callback to handle the route.

### route

Adds a route of any method. Accessed with the 'route' gather.

**Parameters**

-   `method` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Either 'get', 'post', 'put' or 'delete'. Defaults to 'get'.
-   `route` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A URL route.
-   `handler` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** An ExpressJs type callback to handle the route.

### staticRoute

Adds a path to serve static files.

**Parameters**

-   `prefix` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path at which the static files will be accessible. For example: "/js"
-   `path` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** A fully resolved path.
