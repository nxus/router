# Nxus Router

[![Build Status](https://travis-ci.org/nxus/router.svg?branch=master)](https://travis-ci.org/nxus/router)

The Nxus router is an Express compatible web server and router for Nxus applications.

## Installation

In your Nxus application:

```
> npm install @nxus/router --save
```

## Usage

### Defining a route

```
app.get('router').route('/', (req, res) => {
  res.send('Hello World')
})
```

Alternatively, you can specify a HTTP method:

```
app.get('router').route('GET', '/', (req, res) => {
  res.send('Hello World')
})
```

### Adding Express/connect middleware

```
app.get('router').middleware((req, res) => {
  res.status(404).send('Nothing to see here');
})
```

### Adding static files/directories

```
app.get('router').static("my-prefix", myPath)
```

For example, `myFile.txt` in `myPath` is then available at the url `/my-prefix/myFile.txt`

Sometimes its good to have a static assets folder where all your assets live. For that reason, you can use the `assets` gatherer.
