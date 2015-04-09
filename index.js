(function () {
    // All pixels brighter than this value will be transparent.
    var _highPassValue = 250;

    /**
     * Makes high brightness pixels in image transparent. Replaces <img> with <canvas>
     * @param {HTMLImageElement} image
     */
    function replaceBrightPixels(image) {
        // All pixels brighter than this value will be transparent.
        highPassValue = _highPassValue || 250;

        /*
         Get CORS image without triggering security exceptions
         which occur when accessing pixel data even on an image
         with response header 'Access-Control-Allow-Origin: *'
         */
        var imageCORS = new Image();
        imageCORS.crossOrigin = "Anonymous";

        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        var w = image.naturalWidth;
        var h = image.naturalHeight;

        canvas.width = w;
        canvas.height = h;

        function applyImageFilter() {
            ctx.drawImage(imageCORS, 0, 0);

            var imageData = ctx.getImageData(0, 0, w, h);
            var pixelData = imageData.data;

            for (var i = 0, n = pixelData.length; i < n; i += 4) {
                var r = pixelData[i];
                var g = pixelData[i + 1];
                var b = pixelData[i + 2];

                if (r >= highPassValue && g >= highPassValue && b >= highPassValue) {
                    pixelData[i] = 0;
                    pixelData[i + 1] = 0;
                    pixelData[i + 2] = 0;
                    pixelData[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            image.parentNode.insertBefore(canvas, image);
            image.remove();
        }

        imageCORS.onload = applyImageFilter;

        imageCORS.src = image.src;

        // Apply filter immediately if imageCORS is loaded from cache
        // and doesn't fire the load event.
        if(imageCORS.complete || imageCORS.readyState === 4 || imageCORS.naturalWidth + imageCORS.naturalHeight > 0) {
          applyImageFilter();
        }
    }

    /**
     * Wait for image to load before attempting to translucify.
     * @param {HTMLImageElement} image
     */
    function translucifyOne(image) {
        if(image.complete || image.readyState === 4 || image.naturalWidth + image.naturalHeight > 0) {
            replaceBrightPixels(image);
        } else {
            image.onload = replaceBrightPixels;
        }
    }

    /**
     * Translucifies one HTMLImageElement or a set of them via NodeList.
     * @param {HTMLImageElement | NodeList | jQuery} queryResult
     * @param {number} [highPassValue]
     */
    function translucify(queryResult, highPassValue) {
        if(!isNaN(highPassValue)){
          _highPassValue = highPassValue;
        }

        if (queryResult instanceof HTMLImageElement) {
            // <img> passed in directly
            translucifyOne(queryResult);

        } else if (queryResult instanceof NodeList) {
            // document.querySelectorAll support
            Array.prototype.slice.call(queryResult).forEach(translucifyOne);

        } else {
            // jQuery object support
            if (queryResult.toArray) {
                queryResult.toArray().forEach(translucifyOne);
            }
        }
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = translucify;

    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return translucify;
        });

    } else {
        window.translucify = translucify;
    }
})();
