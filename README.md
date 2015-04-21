# Translucify
Makes an image's background pixels transparent. Replaces &lt;img> with &lt;canvas>.

## Usage

### translucify(_selectorResult_, _tolerance_)

Use the flood-fill method for making the background transparent.

<table>
  <thead>
    <tr><th colspan="2"><i>selectorResult</i></th></tr>
    <tr>
      <th>Type</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>jQuery object</td>
        <td><code>$('img:last-child')</code></td>
    </tr>
    <tr>
        <td><a href="https://developer.mozilla.org/en/docs/Web/API/NodeList">NodeList</a></td>
        <td><code>document.querySelectorAll('img')</code></td>
    </tr>
    <tr>
        <td><a href="https://developer.mozilla.org/en/docs/Web/API/HTMLImageElement">HTMLImageElement</a></td>
        <td><code>document.querySelector('img#product')</code></td>
    </tr>
  </tbody>
</table>

`_tolerance_` is a value from 0 to 1 that determines which pixels are part of same group of pixels to be flooded with transparency.

Default value: `0.05`

```javascript
window.translucify($('img'));
```

## Creating the reference image for testing

```bash
npm start
```

## Running the test

```bash
npm install
grunt
```

