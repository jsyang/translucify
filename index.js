(function () {
    /**
     * Makes high brightness pixels in image transparent. Replaces <img> with <canvas>
     * @param {HTMLImageElement} image
     */
    function replaceBrightPixels(image) {
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

        imageCORS.onload = function () {
            ctx.drawImage(imageCORS, 0, 0);

            var imageData = ctx.getImageData(0, 0, w, h);
            var pixelData = imageData.data;

            for (var i = 0, n = pixelData.length; i < n; i += 4) {
                var r = pixelData[i];
                var g = pixelData[i + 1];
                var b = pixelData[i + 2];

                // All pixels brighter than this value will be transparent.
                var highPass = 248;

                if (r >= highPass && g >= highPass && b >= highPass) {
                    pixelData[i] = 0;
                    pixelData[i + 1] = 0;
                    pixelData[i + 2] = 0;
                    pixelData[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            image.parentNode.insertBefore(canvas, image);
            image.remove();
        };

        imageCORS.src = image.src;
    }

    /**
     * Wait for image to load before attempting to translucify.
     * @param {HTMLImageElement} image
     */
    function translucifyOne(image) {
        if(image.complete) {
            replaceBrightPixels(image);
        } else {
            image.onload = replaceBrightPixels;
        }
    }

    /**
     * Translucifies one HTMLImageElement or a set of them via NodeList.
     * @param {HTMLImageElement | NodeList | jQuery} queryResult
     */
    function translucify(queryResult) {
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
