/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var fractalOption = {
    MANDELBROT: 1,
    T: 2
};
var mandelbrotDefault = {
    CANVAS_X: 2.44,
    CANVAS_Y: 1.033,
    ZOOM: 97
};

var canvasX = mandelbrotDefault.CANVAS_X;
var canvasY = mandelbrotDefault.CANVAS_Y;
var zoom = mandelbrotDefault.ZOOM;

var iterations = 100;
var validityThreshold = 5;
var color1 = "#990000";
var color2 = "#ffffff";
var color3 = "#000000";

var canvas = document.getElementById("fractal-canvas");
var context = canvas.getContext("2d");
var para = document.getElementById("testoutput");

var clickX = 0;
var clickY = 0;
var mouseXDiff = 0;
var mouseYDiff = 0;
var mouseDown = false;
var fractalOpt = fractalOption.MANDELBROT;

function clearCanvas() {
    context.clearRect(0,0,canvas.width, canvas.height);
}

function printVars(e) {
    para.innerHTML = 
            "canvasX: " + canvasX + ", " +
            "canvasY: " + canvasY + ", " +
            "clickX: " + clickX + ", " + 
            "clickY: " + clickY + ", " +
            "currX: " + e.clientX + ", " +
            "currY: " + e.clientY + ", " +
            "xDiff: " + mouseXDiff / zoom + ", " + 
            "yDiff: " + mouseYDiff / zoom + ", " + 
            "wheel delta: " + e.wheelDelta + ", " + 
            "zoom: " + zoom + ", ";  
}

function moveCanvas(e) {
    mouseXDiff = e.clientX - clickX;
    mouseYDiff = e.clientY - clickY;
    moveCoef = 1/zoom;
    
    canvasX += moveCoef*mouseXDiff;
    canvasY += moveCoef*mouseYDiff;    
    clickX = e.clientX;
    clickY = e.clientY;
}

function zoomCanvas(zoomDirection) {
    var zoomDelta = Math.sqrt(zoom);
    
    switch(fractalOpt){
        case fractalOption.MANDELBROT:
            zoomDelta = 10 + 0.058827625*zoom + .0925943e-9*zoom*zoom;
            break;
        default:
            zoomDelta = Math.sqrt(zoom);
    }
    zoom += zoomDelta*zoomDirection;
}

function generateFractal() {
    switch(fractalOpt){
        case fractalOption.MANDELBROT:
            generateMandelbrotSet();
            break;
        default:
            generateMandelbrotSet();
    }
}

function checkInMandelbrotSet(x, y) {
    var realComponent = x;
    var imaginaryComponent = y;
    for (var i = 0; i < iterations; i++) {
        var tempRealComponent = realComponent * realComponent
                - imaginaryComponent * imaginaryComponent + x;
        var tempImaginaryComponent = 2 * realComponent * imaginaryComponent + y;
        realComponent = tempRealComponent;
        imaginaryComponent = tempImaginaryComponent;
        if (realComponent * imaginaryComponent > 5)
            return (i / iterations * 100);
    }
    return 0;
}

function generateMandelbrotSet() {
    clearCanvas();
    context.fillStyle = color3;
    
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {  
            var result = checkInMandelbrotSet(x / zoom - canvasX, y / zoom - canvasY);
            if (result == 0) {
                context.fillStyle = color1;
                context.fillRect(x, y, 1, 1);
            } else if(result < .99) {
                context.fillStyle = color2;
                context.fillRect(x, y, 1, 1);  
            }
            else {
                context.fillStyle = color3;
                context.fillRect(x, y, 1, 1);  
            }
        }
    }
}

(function () {
    canvas.addEventListener("mousedown", function(e) {
        if(e.button == 0) {
            mouseDown = true;
        }
    });
    canvas.addEventListener("mouseup", function(e) {
        if(e.button == 0) {
            mouseDown = false;
        }
    });
    canvas.addEventListener("mousemove", function(e) {
        if(mouseDown) {
            moveCanvas(e);
        }
        else {
            clickX = e.clientX;
            clickY = e.clientY;
        }
        generateFractal(fractalOpt);
        //printVars(e);
    });
    canvas.addEventListener("mousewheel", function(e) {
        zoomCanvas(e);
        generateFractal(fractalOpt);
    });
    canvas.addEventListener("DOMMouseScroll", function(e) {
        e.wheelDelta = -e.detail;
        zoomCanvas(e.wheelDelta >= 0 ? 1 : -1);
        generateFractal();
    });
    generateFractal();
})();