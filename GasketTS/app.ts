"use strict";

class WebGLCanvas
{
    constructor(canvasId : string)
    {
        // Get canvas element.
        this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);

        // Initialization
        this.initialize();
    }

    private initialize() : void
    {
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
    }

    private get gl(): WebGLRenderingContext
    {
        return this._gl;
    }

    private set gl(gl: WebGLRenderingContext)
    {
        if (!gl)
        {
            var msg = "WebGL is not available.";
            console.log(msg);
            throw msg;
        }

        this._gl = gl;
    }

    setShaders(vertexShader : string, fragmentShader : string)
    {
        //  Load shaders and initialize attribute buffers
        var program = initShaders(this.gl, vertexShader, fragmentShader);
        this.gl.useProgram(program);

        // Associate shader variables with data buffer
        var vPosition = this.gl.getAttribLocation(program, "vPosition");
        this.gl.vertexAttribPointer(vPosition, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(vPosition);
    }

    setBuffer(buffer: Float32Array)
    {
        this.buffer = buffer;
    }

    render()
    {
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.buffer);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffer.length / 2);
        this.buffer = null;
    }

    private canvas: HTMLCanvasElement;
    private _gl: WebGLRenderingContext;
    private bufferId: WebGLBuffer;
    private buffer: Float32Array;
}

window.onload = () =>
{
    var gl = new WebGLCanvas("gl-canvas");

    // Set shaders
    gl.setShaders("vertex-shader", "fragment-shader");

    // Create array buffer.
    var buffer = generateBuffer(0);
    gl.setBuffer(buffer);
    
    // Render the scene
    gl.render();

    var slider: HTMLElement = document.getElementById("slider");
    slider.onchange = function ()
    {
        var count = parseInt((<HTMLInputElement>event.srcElement).value)
        var buffer = generateBuffer(count);
        gl.setBuffer(buffer);
        gl.render();
    }
};

function generateBuffer(tessellations : number) : Float32Array
{
    var vertices : number[][] = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)
    ];

    var points : number[][] = [];
    divideTriangle(vertices[0], vertices[1], vertices[2], tessellations, points);

    return flatten(points);
}

function divideTriangle(a: number[], b: number[], c: number[], count: number, points : number[][])
{
    // check for end of recursion
    if (count === 0)
    {
        points.push(a, b, c);
    }
    else
    {
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
