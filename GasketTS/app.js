"use strict";
var WebGLCanvas = (function () {
    function WebGLCanvas(canvasId) {
        // Get canvas element.
        this.canvas = document.getElementById(canvasId);
        // Initialization
        this.initialize();
    }
    WebGLCanvas.prototype.initialize = function () {
        // Initialize WebGL with canvas element.
        this.gl = WebGLUtils.setupWebGL(this.canvas);
        // Set default viewport.
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        // Set default clear color.
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        // Load the data into the GPU
        this.bufferId = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 8 * Math.pow(3, 6), this.gl.STATIC_DRAW);
    };
    Object.defineProperty(WebGLCanvas.prototype, "gl", {
        get: function () {
            return this._gl;
        },
        set: function (gl) {
            if (!gl) {
                var msg = "WebGL is not available.";
                console.log(msg);
                throw msg;
            }
            this._gl = gl;
        },
        enumerable: true,
        configurable: true
    });
    WebGLCanvas.prototype.setShaders = function (vertexShader, fragmentShader) {
        //  Load shaders and initialize attribute buffers
        var program = initShaders(this.gl, vertexShader, fragmentShader);
        this.gl.useProgram(program);
        // Associate shader variables with data buffer
        var vPosition = this.gl.getAttribLocation(program, "vPosition");
        this.gl.vertexAttribPointer(vPosition, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(vPosition);
    };
    WebGLCanvas.prototype.setBuffer = function (buffer) {
        this.buffer = buffer;
    };
    WebGLCanvas.prototype.render = function () {
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.buffer);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffer.length / 2);
        this.buffer = null;
    };
    return WebGLCanvas;
})();
window.onload = function () {
    var gl = new WebGLCanvas("gl-canvas");
    // Set shaders
    gl.setShaders("vertex-shader", "fragment-shader");
    // Create array buffer.
    var buffer = generateBuffer(0);
    gl.setBuffer(buffer);
    // Render the scene
    gl.render();
    var slider = document.getElementById("slider");
    slider.onchange = function () {
        var count = parseInt(event.srcElement.value);
        var buffer = generateBuffer(count);
        gl.setBuffer(buffer);
        gl.render();
    };
};
function generateBuffer(tessellations) {
    var vertices = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)
    ];
    var points = [];
    divideTriangle(vertices[0], vertices[1], vertices[2], tessellations, points);
    return flatten(points);
}
function divideTriangle(a, b, c, count, points) {
    // check for end of recursion
    if (count === 0) {
        points.push(a, b, c);
    }
    else {
        //bisect the sides
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);
        --count;
        // three new triangles
        divideTriangle(a, ab, ac, count, points);
        divideTriangle(c, ac, bc, count, points);
        divideTriangle(b, bc, ab, count, points);
    }
}
//# sourceMappingURL=app.js.map