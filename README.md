# Translucify
Makes high brightness pixels in an image transparent. Replaces &lt;img> with &lt;canvas>.

## Usage

### translucify.highpass(_selectorResult_, _options_)

Use the high pass method for making the background transparent.

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

<table>
  <thead>
    <tr><th colspan="3"><i>options</i></th></tr>
    <tr>
      <th>Name</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>highPassValue</td>
        <td><code>{ highPassValue : 250 }</code></td>
        <td>All pixels in the image with RGB components above this value will become transparent</td>
    </tr>
  </tbody>
</table>

```javascript
window.translucify.highpass($('img:last-child'), { highPassValue: 230 });
```

### translucify.floodfill(_selectorResult_, _options_)

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

<table>
  <thead>
    <tr><th colspan="3"><i>options</i></th></tr>
    <tr>
      <th>Name</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
        <td>floodFillTolerance</td>
        <td><code>{ floodFillTolerance : 0.05 }</code></td>
        <td>Transparent flood fills the pixels starting from (0,0) that are within a tolerance value of (0,0)'s color</td>
    </tr>
  </tbody>
</table>

```javascript
window.translucify.floodfill($('img'));
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

