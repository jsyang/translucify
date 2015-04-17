(function () {
    var DEFAULT_HIGH_PASS_VALUE = 250;
    var DEFAULT_TOLERANCE_VALUE = 0.05;

    // All pixels brighter than this value will be transparent.
    var _highPassValue = DEFAULT_HIGH_PASS_VALUE;

    // Tolerance threshold for flood fill.
    var _toleranceValue = DEFAULT_TOLERANCE_VALUE;

    /**
     * @param {HTMLImageElement} image
     * @returns {boolean}
     */
    function isImageLoaded(image) {
        if (image.nodeType === 1 && image.tagName.toLowerCase() === 'img' && image.src !== '') {
            return image.complete || image.readyState === 4 || image.naturalWidth + image.naturalHeight > 0;
        } else {
            return false;
        }
    }

    /**
     * Generates a set of <canvas>, <img> which is untainted by Cross-Origin image data.
     * @param {HTMLImageElement} image
     * @returns {{canvas: HTMLCanvasElement, imageCORS: HTMLImageElement}}
     */
    function getCanvasAndCORSImage(image) {
        /*
         Get CORS image without triggering security exceptions
         which occur when accessing pixel data even on an image
         with response header 'Access-Control-Allow-Origin: *'
         */
        var imageCORS = new Image();
        imageCORS.crossOrigin = "Anonymous";

        var canvas = document.createElement("canvas");

        var w = image.naturalWidth;
        var h = image.naturalHeight;

        canvas.width = w;
        canvas.height = h;

        return {
            canvas   : canvas,
            imageCORS: imageCORS
        };
    }

    /**
     * Make all pixels brighter than highPassValue transparent.
     * @param {HTMLImageElement} originalImage
     * @param {HTMLImageElement} imageCORS
     * @param {HTMLCanvasElement} canvas
     */
    function applyHighPass(originalImage, imageCORS, canvas) {
        var ctx = canvas.getContext("2d");
        var highPassValue = _highPassValue || DEFAULT_HIGH_PASS_VALUE;

        ctx.drawImage(imageCORS, 0, 0);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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

        if (originalImage.parentNode) {
            originalImage.parentNode.insertBefore(canvas, originalImage);
            originalImage.parentNode.removeChild(originalImage);
        }
    }

    /**
     * Makes high brightness pixels in image transparent. Replaces <img> with <canvas>
     * @param {HTMLImageElement} image
     * @param {Function} modifierFunc
     */
    function modifyImagePixels(image, modifierFunc) {
        var created = getCanvasAndCORSImage(image);
        created.imageCORS.onload = modifierFunc.bind(null, image, created.imageCORS, created.canvas);
        created.imageCORS.src = image.src;

        // Apply filter immediately if imageCORS is loaded from cache
        // and doesn't fire the load event.
        if (isImageLoaded(created.imageCORS)) {
            modifierFunc.call(null, image, created.imageCORS, created.canvas);
        }
    }

    // https://code.google.com/p/canvas-floodfill/downloads/detail?name=canvas_floodfill_v1.0.1.js&can=2&q=
    function floodFill(x, y, context, tolerance) {
        var pixelStack = [[x, y]];
        var width = context.canvas.width;
        var height = context.canvas.height;
        var pixelPos = (y * width + x) * 4;
        var imageData = context.getImageData(0, 0, width, height);

        var startR = imageData.data[pixelPos];
        var startG = imageData.data[pixelPos + 1];
        var startB = imageData.data[pixelPos + 2];

        var rFactor = tolerance;
        var gFactor = tolerance;
        var bFactor = tolerance;

        var rMax = startR * (1 + rFactor);
        var gMax = startG * (1 + gFactor);
        var bMax = startB * (1 + bFactor);

        var rMin = startR * (1 - rFactor);
        var gMin = startG * (1 - gFactor);
        var bMin = startB * (1 - bFactor);

        function matchTolerance(pixelIndex) {
            var r = imageData.data[pixelIndex];
            var g = imageData.data[pixelIndex + 1];
            var b = imageData.data[pixelIndex + 2];

            return (r >= rMin && r <= rMax) && (g >= gMin && g <= gMax) && (b >= bMin && b <= bMax);
        }

        while (pixelStack.length) {
            var newPos = pixelStack.pop();
            x = newPos[0];
            y = newPos[1];
            pixelPos = (y * width + x) * 4;
            while (y-- >= 0 && matchTolerance(pixelPos)) {
                pixelPos -= width * 4;
            }
            pixelPos += width * 4;
            ++y;
            var reachLeft = false;
            var reachRight = false;
            while (y++ < height - 1 && matchTolerance(pixelPos)) {
                imageData.data[pixelPos] = 0;
                imageData.data[pixelPos + 1] = 0;
                imageData.data[pixelPos + 2] = 0;
                imageData.data[pixelPos + 3] = 0;

                if (x > 0) {
                    if (matchTolerance(pixelPos - 4)) {
                        if (!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    }
                    else if (reachLeft) {
                        reachLeft = false;
                    }
                }
                if (x < width - 1) {
                    if (matchTolerance(pixelPos + 4)) {
                        if (!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    }
                    else if (matchTolerance(pixelPos + 4 - (width * 4))) {
                        if (!reachLeft) {
                            pixelStack.push([x + 1, y - 1]);
                            reachLeft = true;
                        }
                    }
                    else if (reachRight) {
                        reachRight = false;
                    }
                }
                pixelPos += width * 4;
            }
        }
        context.putImageData(imageData, 0, 0);
    }

    /**
     * Flood-fill from (0,0).
     * @param {HTMLImageElement} originalImage
     * @param {HTMLImageElement} imageCORS
     * @param {HTMLCanvasElement} canvas
     */
    function applyFloodFill(originalImage, imageCORS, canvas) {
        var ctx = canvas.getContext("2d");
        ctx.drawImage(imageCORS, 0, 0);
        floodFill(0, 0, ctx, _toleranceValue);
        if (originalImage.parentNode) {
            originalImage.parentNode.insertBefore(canvas, originalImage);
            originalImage.parentNode.removeChild(originalImage);
        }
    }

    /**
     * Wait for image to load before attempting to translucify.
     * @param {HTMLImageElement} image
     */
    function translucifyOneHighPass(image) {
        if (isImageLoaded(image)) {
            modifyImagePixels(image, applyHighPass);
        } else {
            image.onload = modifyImagePixels.bind(null, image, applyHighPass);
        }
    }

    function translucifyOneFloodFill(image) {
        if (isImageLoaded(image)) {
            modifyImagePixels(image, applyFloodFill);
        } else {
            image.onload = modifyImagePixels.bind(null, image, applyFloodFill);
        }
    }

    /**
     * Translucifies one HTMLImageElement or a set of them via NodeList.
     * Specifies which modifier to use.
     * @param {Function} modifierFunc
     * @param {HTMLImageElement | NodeList | jQuery} queryResult
     * @param {Object} params
     * @param params.highPassValue
     * @param params.floodFillTolerance
     */
    function translucifyAll(modifierFunc, queryResult, params) {
        if (params) {
            _highPassValue = params.highPassValue;
            _toleranceValue = params.floodFillTolerance;
        }

        if (queryResult instanceof HTMLImageElement) {
            // <img> passed in directly
            modifierFunc(queryResult);

        } else if (queryResult instanceof NodeList) {
            // document.querySelectorAll support
            Array.prototype.slice.call(queryResult).forEach(modifierFunc);

        } else {
            // jQuery object support
            if (queryResult && queryResult.toArray) {
                queryResult.toArray().forEach(modifierFunc);
            }
        }
    }

    var translucify = {
        highpass : translucifyAll.bind(null, translucifyOneHighPass),
        floodfill: translucifyAll.bind(null, translucifyOneFloodFill)
    };

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
