var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc,projectionMatrixLoc;
var colorLoc;

var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;


var torsoHeight = 3.0;
var torsoWidth = 5.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 0.8;

var torsoColor = vec4(1.0, 0.0, 0.0, 1.0);
var headColor = vec4(1.0, 1.0, 0.0, 1.0);
var upperArmColor = vec4(1.0, 0.0, 1.0, 1.0);
var lowerArmColor = vec4(0.0, 0.0, 1.0, 1.0);
var upperLegColor = vec4(1.0, 0.0, 1.0, 1.0);
var lowerLegColor = vec4(0.0, 0.0, 1.0, 1.0);

var numNodes = 10;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0];
var stack = [];
var figure = [];

for (var i = 0; i < numNodes; i++)
    figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var animationData = [];
var frame = 0;
var frameDown = 0;

var torsoPos = vec3(0,0,0);

var tt=0;
function initNodes(Id) {
    var m = mat4();

    switch(Id) {
        case torsoId: {
            m = translate(torsoPos[0],torsoPos[1],torsoPos[2]);
            m = mult(m,rotate(theta[torsoId], 0, 1, 0) );

            figure[torsoId] = createNode(m,() => {
                bodyFunctionHelper({width:6,height:3,length:4,color:vec4(1,1,1,1),
                anim:() => {
                    var useFrame = frameDown * 0.05;

                    torsoPos[1] = Math.sin(frameDown) * 0.30; // Up and down bob
                    //theta[torsoId] = rotateY(Math.atan2(Math.cos(2*frames/250), 2 * Math.cos(frames/250)));
                    //console.log(theta[torsoId])
                    var vector2 = {
                        x:0,
                        y:0
                    }
                    torsoPos[0] = Math.cos(useFrame * 3) * 20;
                    torsoPos[2] = Math.sin(useFrame) * 20;
                    var vector1 = {
                        x:torsoPos[0],
                        y:torsoPos[2]
                    }
                    angle = Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x);
                    theta[torsoId] = angle.toDegrees();

                    initNodes(Id);
                }})
            },null,headId);
            
            break;
        }

        case headId: {
            m = translate(3.0, torsoHeight, 0.0);
            m = mult(m,rotate(theta[headId], 0, 1, 0) );
            
            figure[headId] = createNode(m, () => {
                bodyFunctionHelper({width:2,height:1.5,color:vec4(1,0.5,0.5,1),
                    anim:() => {
                        theta[headId] = Math.sin(frameDown * 0.5) * 20;
                        initNodes(Id);
                    }})
            }, leftUpperArmId, null);

            break;
        }

        /*** */
        case leftUpperArmId: {
            m = translate(-(torsoWidth - upperLegWidth) / 2, 0.1 * upperLegHeight, 1.5);
            m = mult(m, rotate(180, 1, theta[leftUpperArmId], 0));

            figure[leftUpperArmId] = createNode(m, () => {
                bodyFunctionHelper({width:0.5,height:3.0,color:vec4(0.6,0.6,1,1),
                    anim:data => {
                        theta[leftUpperArmId] = Math.sin(frameDown) / 20;
                        initNodes(Id);
                    }
                })}, rightUpperArmId, leftLowerArmId);

            break;
        }

        case rightUpperArmId: {
            m = translate((torsoWidth - upperLegWidth) / 2, 0.1 * upperLegHeight, 1.5);
            m = mult(m, rotate(180, 1, theta[leftUpperArmId], 0));

            figure[rightUpperArmId] = createNode(m, () => {
                bodyFunctionHelper({width:0.5,height:3.0,color:vec4(0.6,0.6,1,1),
                    anim:data => {
                        theta[leftUpperArmId] = Math.sin(frameDown) / -20;
                        initNodes(Id);
                    }
                })}, leftUpperLegId, rightLowerArmId);

            break;
        }

        case leftUpperLegId: {
            m = translate(-(torsoWidth - upperLegWidth) / 2, 0.1 * upperLegHeight, -1.5);
            m = mult(m, rotate(180, 1, theta[leftUpperLegId], 0));

            figure[leftUpperLegId] = createNode(m, () => {
                bodyFunctionHelper({width:0.5,height:3.0,color:vec4(0.6,0.6,1,1),
                    anim:data => {
                        theta[leftUpperLegId] = Math.sin(frameDown) / -20;
                        initNodes(Id);
                    }
                })}, rightUpperLegId, leftLowerLegId);
            
            break;
        }

        case rightUpperLegId: {
            m = translate((torsoWidth - upperLegWidth) / 2, 0.1 * upperLegHeight, -1.5);
            m = mult(m, rotate(180, 1, theta[rightUpperLegId], 0));

            figure[rightUpperLegId] = createNode(m, () => {
                bodyFunctionHelper({width:0.5,height:3.0,color:vec4(0.6,0.6,1,1),
                    anim:data => {
                        theta[rightUpperLegId] = Math.sin(frameDown) / 20;
                        initNodes(Id);
                    }
                })}, null, rightLowerLegId);

            break;
        }

        case leftLowerArmId: {
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));

            figure[leftLowerArmId] = createNode(m, () => {
                bodyFunctionHelper({width:0.5,height:2.0,color:vec4(0.6,0.6,1,1)})
            }, null, null);

            break;
        }

        case rightLowerArmId: {
            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));

            figure[rightLowerArmId] = createNode(m, () => {
                bodyFunctionHelper({width:0.5,height:2.0,color:vec4(0.6,0.6,1,1)})
            }, null, null);

            break;
        }

        case leftLowerLegId: {
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));

            figure[leftLowerLegId] = createNode(m, () => {
                bodyFunctionHelper({width:0.5,height:2.0,color:vec4(0.6,0.6,1,1)})
            }, null, null);

            break;
        }

        case rightLowerLegId: {
            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));

            figure[rightLowerLegId] = createNode(m, () => {
                bodyFunctionHelper({width:0.5,height:2.0,color:vec4(0.6,0.6,1,1)})
            }, null, null);
            
            break;
        }
    }

}

var textureURL = "";
var myimage;
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0);
    modelViewMatrix = mat4();


    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    lightPositionLoc = gl.getUniformLocation( program, "lightPosition");

    gl.uniform4fv( gl.getUniformLocation(program,"ambientProduct"),flatten(light.ambient) );
    gl.uniform4fv( gl.getUniformLocation(program,"diffuseProduct"),flatten(light.diffuse) );
    gl.uniform4fv( gl.getUniformLocation(program,"specularProduct"),flatten(light.specular) );
    gl.uniform4fv( gl.getUniformLocation(program,"lightPosition"),flatten(light.position) );
    gl.uniform1f( gl.getUniformLocation(program,"shininess"),light.shininess );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    colorLoc = gl.getUniformLocation(program, "color");
    gl.uniform4fv(colorLoc, flatten(torsoColor));

    cube();

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    vBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
  
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    console.log("vNormal = ",vNormal);
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // Texture Configuration
    myimage = new Image();
	myimage.crossOrigin = "anonymous";

    textureURL = getBrickTexture();
	myimage.src = textureURL;
	
    myimage.onload = function() { 
        configureTexture( myimage );
    }

    myimage.onerror = function() {
        alert("Cannot load this texture :(\nPerhaps the source URL is down, the image is not a power of 2 or Chrome CORS policy is blocking the image from loading.")
    }
    
    for (i = 0; i < numNodes; i++)
        initNodes(i);

    render();

    // Allow the user to drag around the canvas
    setupCanvasDrag();
}

function setNewTex(url) {
    myimage.src = url;
}

var runAnimation = true;
var moveCamera = true;
var render = function () {
    gl.clearColor(0.2, 0.2, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewMatrix = lookAt(viewer.eye, viewer.at , viewer.up);
    projectionMatrix = perspective(persp.fov, persp.aspect, persp.near, persp.far);

    // Update animation
    animationData.forEach( (item,index) => {
        item();
    });

    // Update light position
    let pos = vec4(Math.sin(frameDown / 5) * 20,light.position[1],Math.cos(frameDown / 5) * 20,-5.0);
    light.position = pos;

    gl.uniform1i(gl.getUniformLocation(program,"colorFlag"), 0);
    gl.uniform1i(gl.getUniformLocation(program,"textureFlag"), 0);
    renderLight();

    gl.uniform1i(gl.getUniformLocation(program,"colorFlag"), 1);
    gl.uniform1i(gl.getUniformLocation(program,"textureFlag"), 1);
    renderGround();

    traverse(torsoId);
    requestAnimFrame(render);

    gl.uniform4fv(lightPositionLoc, flatten(light.position));

    if (runAnimation) {
        frame++;
        frameDown = frame / 10;

        var mouseDown = typeof mouse == "undefined" || mouse.leftDown;
        // Rotate Camera
        if (moveCamera && !mouseDown) {
            viewer.theta += Math.sin(frameDown / 15).map(-1,1,0.006,-0.006);
            viewer.phi += Math.sin(frameDown / 10).map(-1,1,0.002,-0.002);
            recomputeViews();
        }
    }
}