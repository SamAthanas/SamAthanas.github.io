Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

Number.prototype.toDegrees = function() {
    return this * (180 / Math.PI);
}

var light = {
    position: vec4(0.0, 5.0, 0.0, -5.0 ),
    ambient:vec4( 0.19125 , 0.0735, 0.0225, 1.0 ),
    diffuse:vec4( 0.5, 0.5, 0.5, 1.0 ),
    specular:vec4( 0.256777, 0.137622, 0.086014, 1.0 ),
    shininess:0.1
};
var lightPositionLoc; // Load from program

var vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

var vertexColors = [
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 )
];  

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1,1),
    vec2(1, 0)
];

var mouse = {
    prevX: 0,
    prevY: 0,

    leftDown: false,
    rightDown: false,
};


var pointsArray = [];
var normalsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var persp = {
    fov:90,
    aspect:1,
    near:3,
    far:160
};

var viewer = {
	eye: vec3(0.0, 0.3, 3.0),
	at:  vec3(0.0, 8.0, 0.0),
	up:  vec3(0.0, 1.0, 0.0),

	radius: null,
    theta: 0,
};

var diff = subtract(viewer.eye,viewer.at);
viewer.radius = length(diff) * 5;
viewer.phi = 5.8;

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;

    return result;
}

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}

function drawArrays() {
    for (var i = 0; i < 6; i++)
        gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function traverse(Id) {
    if (Id == null)
        return;

    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();

    if (figure[Id].child != null)
        traverse(figure[Id].child);

    modelViewMatrix = stack.pop();

    if (figure[Id].sibling != null)
        traverse(figure[Id].sibling);
}

function quad(a, b, c, d) {
    /*
        pointsArray.push(vertices[a]);
    pointsArray.push(vertices[b]);
    pointsArray.push(vertices[c]);
    pointsArray.push(vertices[d]);
    */

    pointsArray.push(vertices[a]); 
    normalsArray.push(vertices[a]); 
    colorsArray.push(vertexColors[a]); 
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices[b]); 
    normalsArray.push(vertices[b]); 
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[1]); 

    pointsArray.push(vertices[c]); 
    normalsArray.push(vertices[c]); 
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[2]); 
  
    pointsArray.push(vertices[d]); 
    normalsArray.push(vertices[d]); 
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[3]);  
}

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function configureTexture( myimage ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
	// demo: comment out; gif image needs flip of y-coord
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, myimage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

// data.width, data.height, data.color
function bodyFunctionHelper(data) {
    if (typeof data == "object") {
        if (typeof data.length == "undefined")
            data.length = data.width;

        instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * data.height, 0.0));
        instanceMatrix = mult(instanceMatrix, scale4(data.width, data.height, data.length));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
        gl.uniform4fv(colorLoc, flatten(data.color));

        drawArrays();

        if (typeof data.anim == "function" && frame == 0) {
            console.log("Adding Animation Frame Callback");
            setupAnimCallback(data);
        }
    }
}

function setupAnimCallback(data) {
    animData = () => data.anim(data);
    animationData.push(animData);
}

function renderGround() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, -5.0, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(70,1,70));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniform4fv(colorLoc, flatten(vec4(1,1,1,1)));

    drawArrays();
}

function renderLight() {
    instanceMatrix = mult(modelViewMatrix, translate(...light.position));
    instanceMatrix = mult(instanceMatrix, scale4(1,1,1));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniform4fv(colorLoc, flatten(vec4(1,1,1,1)));

    //drawArrays();
    gl.drawArrays( gl.POINTS, pointsArray.length, 1);
}


function setupCanvasDrag() { 
    canvas.onmousedown = function(event) {
        if(event.button == 0 && !mouse.leftDown) {
            mouse.leftDown = true;
            mouse.prevX = event.clientX;
            mouse.prevY = event.clientY;
        }
        else if (event.button == 2 && !mouse.rightDown) {
            mouse.rightDown = true;
            mouse.prevX = event.clientX;
            mouse.prevY = event.clientY;
        }
    };

    canvas.onmouseup = function (event) {
        if (event.button == 0)
            mouse.leftDown = false;
        else if(event.button == 2)
            mouse.rightDown = false;
    };

    canvas.onmouseleave = function () {
        mouse.leftDown = false;
        mouse.rightDown = false;
    };

    canvas.onmousemove = function(event) {
        // Get changes in x and y at this point in time
        var currentX = event.clientX;
        var currentY = event.clientY;

        // calculate change since last record
        var deltaX = event.clientX - mouse.prevX;
        var deltaY = event.clientY - mouse.prevY;

        mouse.prevX = currentX;
        mouse.prevY = currentY;

        if (mouse.leftDown) {
            if (!viewer.up[1] > 0) {
                viewer.theta -= 0.01 * deltaX;
                viewer.phi -= 0.01 * deltaY;
            }
            else {
                viewer.theta += 0.01 * deltaX;
                viewer.phi -= 0.01 * deltaY;
            }
            //console.log("incremented theta=",viewer.theta,"  phi=",viewer.phi);

            // Wrap the angles
            var twoPi = 6.28318530718;
            if (viewer.theta > twoPi)
                viewer.theta -= twoPi;
            else if (viewer.theta < 0)
                viewer.theta += twoPi;

            if (viewer.phi > twoPi)
                viewer.phi -= twoPi;
            else if (viewer.phi < 0)
                viewer.phi += twoPi;

            recomputeViews();
        }
    }
}


function recomputeViews() {
    // Recompute eye and up for camera
    var threePiOver2 = 4.71238898;
    var piOver2 = 1.57079632679;
    var pi = 3.14159265359;

    // pre-compute this value
    var r = viewer.radius * Math.sin(viewer.phi + piOver2);

    // eye on sphere with north pole at (0,1,0)
    // assume user init theta = phi = 0, so initialize to pi/2 for "better" view

    viewer.eye = vec3(r * Math.cos(viewer.theta + piOver2), viewer.radius * Math.cos(viewer.phi + piOver2), r * Math.sin(viewer.theta + piOver2));

    //add vector (at - origin) to move
    for(k=0; k<3; k++)
        viewer.eye[k] = viewer.eye[k] + viewer.at[k];


    if (viewer.phi < piOver2 || viewer.phi > threePiOver2)
        viewer.up = vec3(0.0, 1.0, 0.0);
    else
        viewer.up = vec3(0.0, -1.0, 0.0);

    // Recompute the view
    mvMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
}

recomputeViews();