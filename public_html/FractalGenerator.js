/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var fractalOption = {
    MANDELBROT: "1",
    SIERPINSKI_CARPET: "2"
};
var mandelbrotDefault = {
    CANVAS_X: 2.44,
    CANVAS_Y: 1.98,
    ZOOM: 97
};

var sierpinskiCarpetDefault = {
    CANVAS_X: 20,
    CANVAS_Y: 20,
    ZOOM: 1
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
var copy_button = document.getElementById("copy_button");

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
    if (percentage == 0)
        return color1_opt.value;
    else if (percentage <= .5) {
        return gradientColorConversion(color1_opt.value,
                color2_opt.value, 2 * percentage);
    } else {
        return gradientColorConversion(color2_opt.value,
                color3_opt.value, 2 * percentage - 1);
    }
}

function checkInMandelbrot(x, y) {
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

function generateMandelbrot() {
    var error_percentage = 0;
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            error_percentage = checkInMandelbrot(x/zoom - canvasX, y/zoom - canvasY);
            context.fillStyle = chooseColor(error_percentage);
            context.fillRect(x, y, 1, 1);
        }
    }
}

/*function generateSierpinskiCarpet(x, y, length, iterations) {
    var percentage = iterations/iterations_opt.value;
    context.fillStyle = chooseColor(percentage);
    console.log((canvas.width/iterations_opt.value));
    var subLength = length / (canvas.width/iterations_opt.value);
    context.fillRect(x + subLength, y + subLength, subLength - 1, subLength - 1);
    if (subLength > (canvas.width/iterations_opt.value)) {
        generateSierpinskiCarpet(x, y, subLength, iterations-1);
        generateSierpinskiCarpet(x + subLength, y, subLength, iterations-1);
        generateSierpinskiCarpet(x + 2 * subLength, y, subLength, iterations-1);
        generateSierpinskiCarpet(x, y + subLength, subLength, iterations-1);
        generateSierpinskiCarpet(x + 2 * subLength, y + subLength, subLength, iterations-1);
        generateSierpinskiCarpet(x, y + 2 * subLength, subLength, iterations-1);
        generateSierpinskiCarpet(x + subLength, y + 2 * subLength, subLength, iterations-1);
        generateSierpinskiCarpet(x + 2 * subLength, y + 2 * subLength, subLength, iterations-1);
    }
}*/

function generateFractal() {
    create_link_button_text.style.color = "#444444";
    create_link_button_text.innerHTML = "LOADING...";
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    switch (type_opt.value) {
        case fractalOption.MANDELBROT:
            generateMandelbrot();
            break;
        case fractalOption.SIERPINSKI_CARPET:
            generateSierpinskiCarpet(0,0, canvas.width, iterations_opt.value);
            break;
        default:
            break;
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

function generateRandomName(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

// Cross-platform canvas toBlob function
!function(t){"use strict";var o,e=t.Uint8Array,n=t.HTMLCanvasElement,s=n&&n.prototype,i=/\s*;\s*base64\s*(?:;|$)/i,a="toDataURL",l=function(t){for(var n,s,i=t.length,a=new e(i/4*3|0),l=0,b=0,r=[0,0],f=0,B=0;i--;)s=t.charCodeAt(l++),255!==(n=o[s-43])&&void 0!==n&&(r[1]=r[0],r[0]=s,B=B<<6|n,4===++f&&(a[b++]=B>>>16,61!==r[1]&&(a[b++]=B>>>8),61!==r[0]&&(a[b++]=B),f=0));return a};e&&(o=new e([62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,0,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51])),!n||s.toBlob&&s.toBlobHD||(s.toBlob||(s.toBlob=function(t,o){if(o||(o="image/png"),this.mozGetAsFile)t(this.mozGetAsFile("canvas",o));else if(this.msToBlob&&/^\s*image\/png\s*(?:$|;)/i.test(o))t(this.msToBlob());else{var n,s=Array.prototype.slice.call(arguments,1),b=this[a].apply(this,s),r=b.indexOf(","),f=b.substring(r+1),B=i.test(b.substring(0,r));Blob.fake?((n=new Blob).encoding=B?"base64":"URI",n.data=f,n.size=f.length):e&&(n=B?new Blob([l(f)],{type:o}):new Blob([decodeURIComponent(f)],{type:o})),t(n)}}),!s.toBlobHD&&s.toDataURLHD?s.toBlobHD=function(){a="toDataURLHD";var t=this.toBlob();return a="toDataURL",t}:s.toBlobHD=s.toBlob)}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content||this);
// Client-side file saver with custom filenames
var saveAs=saveAs||function(e){"use strict";if(typeof e==="undefined"||typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),o="download"in r,a=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},i=/constructor/i.test(e.HTMLElement)||e.safari,f=/CriOS\/[\d]+/.test(navigator.userAgent),u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",d=1e3*40,c=function(e){var t=function(){if(typeof e==="string"){n().revokeObjectURL(e)}else{e.remove()}};setTimeout(t,d)},l=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var o=e["on"+t[r]];if(typeof o==="function"){try{o.call(e,n||e)}catch(a){u(a)}}}},p=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob([String.fromCharCode(65279),e],{type:e.type})}return e},v=function(t,u,d){if(!d){t=p(t)}var v=this,w=t.type,m=w===s,y,h=function(){l(v,"writestart progress write writeend".split(" "))},S=function(){if((f||m&&i)&&e.FileReader){var r=new FileReader;r.onloadend=function(){var t=f?r.result:r.result.replace(/^data:[^;]*;/,"data:attachment/file;");var n=e.open(t,"_blank");if(!n)e.location.href=t;t=undefined;v.readyState=v.DONE;h()};r.readAsDataURL(t);v.readyState=v.INIT;return}if(!y){y=n().createObjectURL(t)}if(m){e.location.href=y}else{var o=e.open(y,"_blank");if(!o){e.location.href=y}}v.readyState=v.DONE;h();c(y)};v.readyState=v.INIT;if(o){y=n().createObjectURL(t);setTimeout(function(){r.href=y;r.download=u;a(r);h();c(y);v.readyState=v.DONE});return}S()},w=v.prototype,m=function(e,t,n){return new v(e,t||e.name||"download",n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){t=t||e.name||"download";if(!n){e=p(e)}return navigator.msSaveOrOpenBlob(e,t)}}w.abort=function(){};w.readyState=w.INIT=0;w.WRITING=1;w.DONE=2;w.error=w.onwritestart=w.onprogress=w.onwrite=w.onabort=w.onerror=w.onwriteend=null;return m}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!==null){define("FileSaver.js",function(){return saveAs})}



(function () {
    type_opt.onchange = function() {
        generateFractal();
    };
    iterations_opt.onchange = function() {
        if(iterations_opt.value < 1) iterations_opt.value = 1;
        if(iterations_opt.value > 2000) iterations_opt.value = 2000;
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
        printVars(e);
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
    create_link_button.onclick = function () {
        createLink();
    };
    copy_button.onclick = function () {
        canvas.toBlob(function (blob) {
            var name = generateRandomName(Math.floor((Math.random()*12)+5));
            saveAs(blob, name + ".png");
        });
    }
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
            case fractalOption.SIERPINSKI_CARPET:
                canvasX = sierpinskiCarpetDefault.CANVAS_X;
                canvasY = sierpinskiCarpetDefault.CANVAS_Y;
                zoom = sierpinskiCarpetDefault.ZOOM;
                break;
            default:
                canvasX = mandelbrotDefault.CANVAS_X;
                canvasY = mandelbrotDefault.CANVAS_Y;
                zoom = mandelbrotDefault.ZOOM;
                break;
        }
    }
    generateFractal();
})();