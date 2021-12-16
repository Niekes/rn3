**RN3** is a data visualization toolkit based on d3.js

[![Codecov](https://img.shields.io/codecov/c/github/niekes/rn3)](https://app.codecov.io/gh/niekes/rn3)
[![Build][build-badge]][build]
[![npm](https://img.shields.io/npm/dt/rn3)](https://www.npmjs.com/package/rn3)
[![npm](https://img.shields.io/npm/dw/rn3)](https://www.npmjs.com/package/rn3)
[![npm](https://img.shields.io/npm/l/rn3)](https://github.com/Niekes/rn3/blob/master/LICENSE)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/rn3)](https://bundlephobia.com/result?p=rn3)
[![npm](https://img.shields.io/npm/v/rn3)](https://www.npmjs.com/package/rn3)


# Installing

### Npm
```bash
npm i rn3 --save
```

### CDN
```html
<script src="https://unpkg.com/rn3/src/rn3.min.js"></script>
```

# Demo
* [Go to examples](https://codepen.io/collection/Wvvkzv)

# Usage

### ES6
```js
import {
    Barchart,
} from 'rn3';

const barchart = new Barchart({
    el: '#barchart',
});
```

### Browser
```js
const barchart = new rn3.Barchart({
    el: '#barchart',
});
```

### Node (CommonJs)
```js
const rn3 = require('rn3');

const barchart = new rn3.Barchart({
    el: '#barchart',
});
```

# Funding
<a href="https://www.buymeacoffee.com/niekes" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="70"></a>

# License
[BSD-3-Clause](https://github.com/Niekes/rn3/blob/master/LICENSE) © [Stefan Nieke](https://www.niekes.com)

<!-- Definitions -->
[build-badge]: https://github.com/niekes/rn3/workflows/master/badge.svg
[build]: https://github.com/niekes/rn3/actions
