/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var fractalOption = {
    MANDELBROT: "1",
    T: "2"
};
var mandelbrotDefault = {
    CANVAS_X: 2.44,
    CANVAS_Y: 1.033,
    ZOOM: 97
};

var canvasX = 0;
var canvasY = 0;
var zoom = 0;

var canvas = document.getElementById("fractal-canvas");
var context = canvas.getContext("2d");
var para = document.getElementById("testoutput");
var type_opt = document.getElementById("type_opt");
var iterations_opt = document.getElementById("iterations_opt");
var validity_threshold_opt = document.getElementById("validity_threshold_opt");
var color1_opt = document.getElementById("color1_opt");
var color2_opt = document.getElementById("color2_opt");
var color3_opt = document.getElementById("color3_opt");
var create_link_button = document.getElementById("create_link_button");
var create_link_button_text = document.getElementById("create_link_button_text");
var link_text = document.getElementById("link_text");

var clickX = 0;
var clickY = 0;
var mouseDown = false;

function printVars(e) {
    para.innerHTML = 
            "canvasX: " + canvasX + ", " +
            "canvasY: " + canvasY + ", " +
            "clickX: " + clickX + ", " + 
            "clickY: " + clickY + ", " +
            "currX: " + e.clientX + ", " +
            "currY: " + e.clientY + ", " +
            "zoom: " + zoom + ", " +
            "type_opt: " + type_opt.value + ", " +
            "iterations_opt: " + iterations_opt.value + ", " +
            "validity_threshold_opt: " + validity_threshold_opt.value + ", " +
            "color1: " + color1_opt.value + ", " +
            "color2: " + color2_opt.value + ", " +
            "color3: " + color3_opt.value;  
}

function getURLParameter(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function moveCanvas(e) {
    var mouseXDiff = parseFloat(e.clientX) - parseFloat(clickX);
    var mouseYDiff = parseFloat(e.clientY) - parseFloat(clickY);
    var moveCoef = parseFloat(1/zoom);

    canvasX =  parseFloat(canvasX) + parseFloat(moveCoef*mouseXDiff);
    canvasY = parseFloat(canvasY) + parseFloat(moveCoef*mouseYDiff);
    
    canvasX.toFixed(10);
    canvasY.toFixed(10);
    clickX = parseFloat(e.clientX);
    clickY = parseFloat(e.clientY);
}

function zoomCanvas(zoomDirection) {
    var zoomDelta = Math.sqrt(zoom);
    
    switch(type_opt.value){
        case fractalOption.MANDELBROT:
            zoomDelta = 10 + 0.058827625*zoom + .0925943e-9*zoom*zoom;
            break;
        default:
            zoomDelta = Math.sqrt(zoom);
    }
    zoom = parseFloat(zoom) + parseFloat(zoomDelta*zoomDirection);
    zoom.toFixed(5);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function gradientColorConversion(c1, c2, percentage) {
    var c1RGB = hexToRGB(c1);
    var c2RGB = hexToRGB(c2);
    var redDiff = c2RGB.r - c1RGB.r;
    var greenDiff = c2RGB.g - c1RGB.g;
    var blueDiff = c2RGB.b - c1RGB.b;
    return rgbToHex(
            parseInt(c1RGB.r + redDiff*percentage),
            parseInt(c1RGB.g + greenDiff*percentage),
            parseInt(c1RGB.b + blueDiff * percentage));
 
}

function chooseColor(percentage) {
    if(percentage == 0) return color1_opt.value;
    else if(percentage <= .5) {
        return gradientColorConversion(color1_opt.value,
            color2_opt.value, 2*percentage);
    }
    else {
        return gradientColorConversion(color2_opt.value,
            color3_opt.value, 2*percentage-1);
    }
}

function checkInMandelbrotSet(x, y) {
    var realComponent = x;
    var imaginaryComponent = y;
    for (var i = 0; i < iterations_opt.value; i++) {
        var tempRealComponent = realComponent * realComponent
                - imaginaryComponent * imaginaryComponent + x;
        var tempImaginaryComponent = 2 * realComponent * imaginaryComponent + y;
        realComponent = tempRealComponent;
        imaginaryComponent = tempImaginaryComponent;
        if (realComponent * imaginaryComponent > validity_threshold_opt.value)
            return (i / iterations_opt.value);
    }
    return 0;
}

function generateFractal() {
    create_link_button_text.style.color = "#444444";
    create_link_button_text.innerHTML = "LOADING...";
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    var error_percentage = 0;
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            switch (type_opt.value) {
                case fractalOption.MANDELBROT:
                    error_percentage = checkInMandelbrotSet(x/zoom - canvasX, 
                        y/zoom - canvasY);
                    break;
                default:
                    error_percentage = checkInMandelbrotSet(x / zoom - canvasX,
                            y / zoom - canvasY);
                    break;
            }
            context.fillStyle = chooseColor(error_percentage);
            context.fillRect(x, y, 1, 1);
        }
    }

    create_link_button_text.classList.add('pre-animation');
    setTimeout(function () {
        create_link_button_text.style.color = "#990000";
        create_link_button_text.innerHTML = "GENERATE AND COPY LINK";
        create_link_button_text.classList.remove('pre-animation');
    }, 550);
}
    
function createLink() {
    create_link_button_text.classList.add("pre-animation");
    create_link_button_text.style.color = "#444444";
    create_link_button_text.innerHTML = "GENERATING AND COPYING...";
    var link = window.location.href.split('?')[0] +
            "?shared=1" +
            "&type=" + type_opt.value + 
            "&iterations=" + iterations_opt.value +
            "&validity_threshold=" + validity_threshold_opt.value +
            "&color1=" + color1_opt.value.substring(1,color1_opt.value.length) +
            "&color2=" + color2_opt.value.substring(1,color1_opt.value.length) +
            "&color3=" + color3_opt.value.substring(1,color1_opt.value.length) +
            "&x=" + canvasX.toFixed(10) +
            "&y=" + canvasY.toFixed(10) +
            "&zoom=" + zoom.toFixed(5);
    link_text.value = link;
    link_text.select();
    try {
      document.execCommand('copy');
    } catch(err) {
        alert("Use copy-and-paste to share this link");
    }
    setTimeout(function () {
        create_link_button_text.style.color = "#990000";
        create_link_button_text.innerHTML = "GENERATE AND COPY LINK";
        create_link_button_text.classList.remove('pre-animation');
    }, 550);

}

(function () {
    type_opt.onchange = function() {
        generateFractal();
    };
    iterations_opt.onchange = function() {
        if(iterations_opt.value < 10) iterations_opt.value = 10;
        if(iterations_opt.value > 5000) iterations_opt.value = 5000;
        generateFractal();
    };
    validity_threshold_opt.onchange = function() {
        if(validity_threshold_opt.value < 1) validity_threshold_opt.value = 1;
        if(validity_threshold_opt.value > 1000) validity_threshold_opt.value = 1000;
        generateFractal();
    };
    color1_opt.onchange = function() {
        generateFractal();
    };
    color2_opt.onchange = function() {
        generateFractal();
    };
    color3_opt.onchange = function() {
        generateFractal();
    };
    canvas.addEventListener("mousedown", function(e) {
        if(e.button === 0) {
            mouseDown = true;
        }
    });
    canvas.addEventListener("mouseup", function(e) {
        if(e.button === 0) {
            mouseDown = false;
        }
    });
    canvas.addEventListener("mousemove", function(e) {
        if(mouseDown) {
            moveCanvas(e);
            generateFractal();
        }
        else {
            clickX = e.clientX;
            clickY = e.clientY;
        }
        //printVars(e);
    });
    canvas.addEventListener("mousewheel", function(e) {
        zoomCanvas(e);
        generateFractal();
    });
    canvas.addEventListener("DOMMouseScroll", function(e) {
        e.wheelDelta = -e.detail;
        zoomCanvas(e.wheelDelta >= 0 ? 1 : -1);
        generateFractal();
    });
    create_link_button.onclick = function() {
       createLink();
    };
    if (getURLParameter("shared")) {
            type_opt.value = getURLParameter("type");
            iterations_opt.value = parseInt(getURLParameter("iterations"));
            validity_threshold_opt.value = parseInt(getURLParameter("validity_threshold"));
            color1_opt.value = '#' + getURLParameter("color1");
            color2_opt.value = '#' + getURLParameter("color2");
            color3_opt.value = '#' + getURLParameter("color3");
            canvasX = parseFloat(getURLParameter("x"));
            canvasY = parseFloat(getURLParameter("y"));
            zoom = parseFloat(getURLParameter("zoom"));
    }
    else
    {
        switch (type_opt.value) {
            case fractalOption.MANDELBROT:
                canvasX = mandelbrotDefault.CANVAS_X;
                canvasY = mandelbrotDefault.CANVAS_Y;
                zoom = mandelbrotDefault.ZOOM;
                break;
            default:
                generateMandelbrotSet();
        }
    }
    generateFractal();
})();