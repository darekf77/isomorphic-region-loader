[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![chat][chat]][chat-url]

<div align="center">
  <h1>Isomorphic #region Loader</h1>
  <p>A loader for webpack that lets you strip #regions code from bundle.</p>
</div>

<h2 align="center">Install</h2>

```bash
npm install --save-dev isomorphic-region-loader
```

<h2 align="center">Usage</h2>

This load is very helpfull if you wanna write isomorphic applications 
in javascript or typescript. Just specify **region** and this loader will
cut it from bundle. Example:

```ts
import * as jquery from 'jquery'
//#region nodejs
import * as fs from 'fs'
//#endregion

class ExampleIsomorphicClass {
  ...
}

```

With webpack configuraiton below:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'isomorphic-region-loader',
        options: { platform: 'browser' }  // 'borwser' default platform, also there is 'nodejs'
      }
    ]
  }
}
```
You will get:
```ts
import * as jquery from 'jquery'

class ExampleIsomorphicClass {
  ...
}

```
As result, code inside **#region nodejs** has been stripped.
Also you can do similar things to your nodejs code and strip off
browser things.

### Inline

**In your application**
```js
import txt from '!isomorphic-region-loader!./file.txt';
```
