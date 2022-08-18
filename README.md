# uGBodyLibJS
My gravitational body Javascript library.


## Installation

It's just a Javascript file.
put: `<script src="path/to/ugbodylib.js"></script>` in your .html
     and the file close to your html file

## How to use:

```js
let gravityBodyManager = new uGBodyManger()
gravityBodyManager.addBody(...)
gravityBodyManager.addAttractor(...)
gravityBodyManager.run((frames, body, index) => { drawRectangleOrSomething(body.getX(), body.getY(), 40, 40) })

document.onclick = function() { gravityBodyManager.stop() } 
```
