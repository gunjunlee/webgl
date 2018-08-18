window.addEventListener("load", setupWebGL, false);

vertex_positions = [
    -0.25,  0.25, -0.25,
    -0.25, -0.25, -0.25,
    0.25, -0.25, -0.25,

    0.25, -0.25, -0.25,
    0.25,  0.25, -0.25,
    -0.25,  0.25, -0.25,

    0.25, -0.25, -0.25,
    0.25, -0.25,  0.25,
    0.25,  0.25, -0.25,

    0.25, -0.25,  0.25,
    0.25,  0.25,  0.25,
    0.25,  0.25, -0.25,

    0.25, -0.25,  0.25,
    -0.25, -0.25,  0.25,
    0.25,  0.25,  0.25,

    -0.25, -0.25,  0.25,
    -0.25,  0.25,  0.25,
    0.25,  0.25,  0.25,

    -0.25, -0.25,  0.25,
    -0.25, -0.25, -0.25,
    -0.25,  0.25,  0.25,

    -0.25, -0.25, -0.25,
    -0.25,  0.25, -0.25,
    -0.25,  0.25,  0.25,

    -0.25, -0.25,  0.25,
    0.25, -0.25,  0.25,
    0.25, -0.25, -0.25,

    0.25, -0.25, -0.25,
    -0.25, -0.25, -0.25,
    -0.25, -0.25,  0.25,

    -0.25,  0.25, -0.25,
    0.25,  0.25, -0.25,
    0.25,  0.25,  0.25,

    0.25,  0.25,  0.25,
    -0.25,  0.25,  0.25,
    -0.25,  0.25, -0.25];

var gl, program, width, height;
function getRenderingContext() {
    var canvas = document.querySelector("canvas");
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
    var gl = canvas.getContext("webgl")
        || canvas.getContext("experimental-webgl");
    if (!gl) {
        var paragraph = document.querySelector("p");
        paragraph.innerHTML = "Failed to get WebGL context."
        + "Your browser or device may not support WebGL.";
        return null;
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
}

var position_loc, mv_loc, proj_loc;
function setupWebGL (evt) {
    window.removeEventListener(evt.type, setupWebGL, false);
    if (!(gl = getRenderingContext()))
        return;
    program = gl.createProgram();
  
    var source = document.querySelector("#vertex-shader").innerHTML;
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader,source);
    gl.compileShader(vertexShader);
    source = document.querySelector("#fragment-shader").innerHTML
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,source);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    position_loc = gl.getAttribLocation(program, "position")
    mv_loc = gl.getUniformLocation(program, "mv_matrix");
    proj_loc = gl.getUniformLocation(program, "proj_matrix");

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var linkErrLog = gl.getProgramInfoLog(program);
        cleanup();
        document.querySelector("p").innerHTML =
            "Shader program did not link successfully. "
            + "Error log: " + linkErrLog;
        return;
    }
  
    initializeAttributes();
  
    gl.useProgram(program);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);

    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);

    setInterval(render, 16);
    // cleanup();
}

var buffer;
function initializeAttributes() {
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(position_loc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position_loc);
}

function cleanup() {
    gl.useProgram(null);
    if (buffer)
        gl.deleteBuffer(buffer);
    if (program)
        gl.deleteProgram(program);
}

function render(){
    var seconds = new Date().getTime() / 1000 ;

    var color = [0, 0, 0, 1];
    gl.clearColor(color[0], color[1], color[2], color[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);

    proj_matrix = get_proj_matrix(60.0, width/height, 0.01, 1000.0);
    gl.uniformMatrix4fv(proj_loc, false, proj_matrix);
    var temp_rot1 = [Math.cos(seconds), -Math.sin(seconds), 0, 0,
                     Math.sin(seconds), Math.cos(seconds), 0, 0,
                     0, 0, 1, 0, 
                     0, 0, 0, 1];
    var temp_rot2 = [Math.cos(seconds), 0, Math.sin(seconds), 0,
                    0, 1, 0, 0,
                    -Math.sin(seconds), 0, Math.cos(seconds), 0, 
                    0, 0, 0, 1];
    mv_matrix = multiplyMatrices(temp_rot1, temp_rot2);
    gl.uniformMatrix4fv(mv_loc, false, mv_matrix);
    
    gl.drawArrays(gl.TRIANGLES, 0, 36);
}


// below Math library

function get_proj_matrix(fovy, aspect, n, f){
    var q = 1.0 / Math.tan(radian(0.5 * fovy));
    // console.log(q);
    var a = q / aspect;
    var b = (n + f) / (n - f);
    var c = (2.0 * n * f) / (n - f);

    return [a, 0.0, 0.0, 0.0,
            0.0, q, 0.0, 0.0,
            0.0, 0.0, b, -1,
            0.0, 0.0, c, 1.0];
}

function radian(deg){
    return deg * Math.PI / 180.0;
}

//TODO use glMatrix library from http://glmatrix.net/
function multiplyMatrixAndPoint(matrix, point) {

    //행렬의 모든 원소에 행번호와 열번호로 이뤄진 간단한 변수 명을 부여.
    var c0r0 = matrix[ 0], c1r0 = matrix[ 1], c2r0 = matrix[ 2], c3r0 = matrix[ 3];
    var c0r1 = matrix[ 4], c1r1 = matrix[ 5], c2r1 = matrix[ 6], c3r1 = matrix[ 7];
    var c0r2 = matrix[ 8], c1r2 = matrix[ 9], c2r2 = matrix[10], c3r2 = matrix[11];
    var c0r3 = matrix[12], c1r3 = matrix[13], c2r3 = matrix[14], c3r3 = matrix[15];

    //점을 이루는 좌푯값들마다 간단한 변수명을 부여
    var x = point[0];
    var y = point[1];
    var z = point[2];
    var w = point[3];

    //각각의 좌푯값을 첫번째 열의 원소들과 곱한 뒤 더한다.
    var resultX = (x * c0r0) + (y * c0r1) + (z * c0r2) + (w * c0r3);

    //각각의 좌푯값을 두번째 열의 원소들과 곱한 뒤 더한다. 
    var resultY = (x * c1r0) + (y * c1r1) + (z * c1r2) + (w * c1r3);

    //각각의 좌푯값을 세번째 열의 원소들과 곱한 뒤 더한다.
    var resultZ = (x * c2r0) + (y * c2r1) + (z * c2r2) + (w * c2r3);

    //각각의 좌푯값을 네번째 열의 원소들과 곱한 뒤 더한다.
    var resultW = (x * c3r0) + (y * c3r1) + (z * c3r2) + (w * c3r3);

    return [resultX, resultY, resultZ, resultW];
}

function multiplyMatrices(matrixA, matrixB) {

    // 두 번째 행렬을 열로 나눕니다.
    var column0 = [matrixB[0], matrixB[4], matrixB[8], matrixB[12]];
    var column1 = [matrixB[1], matrixB[5], matrixB[9], matrixB[13]];
    var column2 = [matrixB[2], matrixB[6], matrixB[10], matrixB[14]];
    var column3 = [matrixB[3], matrixB[7], matrixB[11], matrixB[15]];

    // 행렬에 의해 다른 열과 곱합니다.
    var result0 = multiplyMatrixAndPoint(matrixA, column0);
    var result1 = multiplyMatrixAndPoint(matrixA, column1);
    var result2 = multiplyMatrixAndPoint(matrixA, column2);
    var result3 = multiplyMatrixAndPoint(matrixA, column3);

    // 결과에서 나온 열들을 하나의 행렬로 되돌립니다.
    return [
        result0[0], result1[0], result2[0], result3[0],
        result0[1], result1[1], result2[1], result3[1],
        result0[2], result1[2], result2[2], result3[2],
        result0[3], result1[3], result2[3], result3[3]
    ];
}