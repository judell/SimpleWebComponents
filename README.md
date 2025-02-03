# Simple Web Components

An experiment to build a simple library of web components to enable an HTML author to build CRUD apps in a declarative style like this:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Simple Web Components</title>
  <script type="module" src="lib.js"></script>
  <script type="module" src="app-form.js"></script>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
    }
  </style>
</head>

<body>
  <h1 style="text-align: center;">Cities and Books</h1>
  <layout-box layout="horizontal" align="center" gap="20px" responsive>

    <data-source id="citiesDS" table="cities"></data-source>
    <app-form for="citiesDS" required="city,state">
      <layout-box layout="vertical">
        <h2>Cities</h2>
        <text-box style="width:15em" name="city" placeholder="Keene"></text-box>
        <text-box style="width:2em" name="state" placeholder="NH"></text-box>
        <text-box style="width:4em" name="population" placeholder="23000"></text-box>
        <app-button style="text-align: left;" label="Add City"></app-button>
        <list-view style="text-align: left;" for="citiesDS" fields="city,state,population">
          <list-card style="background-color: rgb(239, 236, 232); border: none;"/>
        </list-view>
      </layout-box>
    </app-form>

    <data-source id="booksDS" table="books"></data-source>
    <app-form for="booksDS" required="title,author">
      <layout-box layout="vertical">
        <h2>Books</h2>
        <text-box style="width:15em" name="title" placeholder="Catch-22"></text-box>
        <text-box name="author" placeholder="Joseph Heller"></text-box>
        <text-box name="Year" placeholder="1965"></text-box>
        <app-button style="text-align: left;" label="Add Book"></app-button>
        <list-view style="text-align: left;" for="booksDS" fields="title,author,year">
          <list-card/>
        </list-view>
      </layout-box>
    </app-form>

  </layout-box>

</body>
</html>
```

## Getting started

## Clone this repo.

```bash
git clone https://github.com/judell/SimpleWebComponents
cd SimpleWebServer
```

## Get the server.   

The demo uses a lightweight web server that embeds sqlite. To get it:

- Visit `https://github.com/judell/sqlite-server/tree/main`

- Click `sqlite-server-macos` for Mac, `sqlite-server-linux` for Linux or WSL.

- Click the `raw` button to download the binary.

- Move the binary to `~/SimpleWebComponents`

## Launch the server

```bash
./sqlite-server-macos
```

or

```bash
./sqlite-server-linux
```

## Launch the app

- visit localhost:8080