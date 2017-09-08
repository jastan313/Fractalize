/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var fractalOption = {
    MANDELBROT_SET: "1",
    BURNING_SHIP: "2",
    JULIET_SET: "3",
    LYAPUNOV: "4",
    NEWTON: "5"
};
var mandelbrotSetDefault = {
    CANVAS_X: 2.2,
    CANVAS_Y: 1.5,
    ZOOM: 129.3,
    ITERATIONS: 15
};

var burningShipDefault = {
    CANVAS_X: 2.1,
    CANVAS_Y: 2.1,
    ZOOM: 120,
    ITERATIONS: 15
    
};

var julietSetDefault = {
    CANVAS_X: 1.35,
    CANVAS_Y: 1.35,
    ZOOM: 150,
    ITERATIONS: 25
};

var lyapunovDefault = {
    CANVAS_X: -1,
    CANVAS_Y: -1,
    ZOOM: 149.6,
    ITERATIONS: 25
};

var newtonDefault = {
    CANVAS_X: 6.7,
    CANVAS_Y: 6.7,
    ZOOM: 30,
    ITERATIONS: 5
};

var canvasX = 0;
var canvasY = 0;
var zoom = 0;

var canvas = document.getElementById("fractal_canvas");
var context = canvas.getContext("2d");
var para = document.getElementById("testoutput");
var type_opt = document.getElementById("type_opt");
var iterations_opt = document.getElementById("iterations_opt");
var validity_threshold_opt_container = document.getElementById("validity_threshold_opt_container");
var validity_threshold_opt = document.getElementById("validity_threshold_opt");
var juliet_x_opt_container = document.getElementById("juliet_x_opt_container");
var juliet_y_opt_container = document.getElementById("juliet_y_opt_container");
var juliet_x_opt = document.getElementById("juliet_x_opt");
var juliet_y_opt = document.getElementById("juliet_y_opt");
var lyapunov_sequence_opt_container = document.getElementById("lyapunov_sequence_opt_container");
var lyapunov_sequence_opt = document.getElementById("lyapunov_sequence_opt");
var newton_term1_opt_container = document.getElementById("newton_term1_opt_container");
var newton_term2_opt_container = document.getElementById("newton_term2_opt_container");
var newton_term3_opt_container = document.getElementById("newton_term3_opt_container");
var newton_term1_coef_opt = document.getElementById("newton_term1_coef_opt");
var newton_term2_coef_opt = document.getElementById("newton_term2_coef_opt");
var newton_term3_coef_opt = document.getElementById("newton_term3_coef_opt");
var newton_term1_pow_opt = document.getElementById("newton_term1_pow_opt");
var newton_term2_pow_opt = document.getElementById("newton_term2_pow_opt");
var newton_term3_pow_opt = document.getElementById("newton_term3_pow_opt");
var color1_opt = document.getElementById("color1_opt");
var color2_opt = document.getElementById("color2_opt");
var color3_opt = document.getElementById("color3_opt");
var color4_opt = document.getElementById("color4_opt");
var color5_opt = document.getElementById("color5_opt");
var save_name = document.getElementById("save_name");
var save_button = document.getElementById("save_button");
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
            "color3: " + color3_opt.value +
            "color4: " + color4_opt.value + ", " +
            "color5: " + color5_opt.value;
}

class Complex {
    constructor(real, imaginary) {
        this.real = real;
        this.imaginary = imaginary;
        this.str = '' + real;
        this.str += (imaginary < 0) ?
             " - " + Math.abs(imaginary) + "i" :
               " + " + imaginary + "i";
    }

    add(c) {
        return new Complex(this.real + c.real, this.imaginary + c.imaginary);
    }

    subtract(c) {
        return new Complex(this.real - c.real, this.imaginary - c.imaginary);
    }

    multiply(c) {
        return new Complex(this.real * c.real - this.imaginary * c.imaginary,
                this.real * c.imaginary + this.imaginary * c.real);
    }

    divide(c) {
        var denominator = c.real * c.real + c.imaginary * c.imaginary;
        var real = (this.real * c.real + this.imaginary * c.imaginary) / denominator;
        var imaginary = (this.imaginary * c.real - this.real * c.imaginary) / denominator;
        return new Complex(real, imaginary);
    }

    absMultiply(c) {
        var iTemp = Math.abs(this.real * c.imaginary);
        var iTemp2 = Math.abs(c.real * this.imaginary);
        return new Complex(this.real * c.real - this.imaginary * c.imaginary,
                iTemp + iTemp2);
    }

    abs() {
        return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
    }
}

class Polynomial {
    constructor(nTerms, coefs, pows) {
        this.nTerms = nTerms;
        this.coef = new Array(nTerms);
        this.pow = new Array(nTerms);
        for(var i = 0; i < nTerms; i++) {
            this.coef[i] = coefs[i];
            this.pow[i] = pows[i];
        }
        var s = "";
        for (var i = 0; i < nTerms - 1; i++) {
            s += this.coef[i] + "x^" + this.pow[i] + " + ";
        }
        if (this.pow[nTerms - 1] == 0) {
            s += this.coef[nTerms - 1];
        } else if(this.pow[nTerms - 1] == 1) {
            s += this.coef[i] + "x";
        }
        else {
            s += this.coef[i] + "x^" + this.pow[i]
        }
        this.str = s;
    }

    derivative() {
        var d_nTerms = 0;
        var d_Coef = [];
        var d_Pow = [];
        for (var i = 0; i < this.nTerms; i++) {
            var tempPow = this.pow[i] - 1;
            if (tempPow < 0)
                continue;
            d_Coef.push(this.coef[i] * this.pow[i]);
            d_Pow.push(tempPow);
            d_nTerms++;
        }
        return new Polynomial(d_nTerms, d_Coef, d_Pow);
    }

    solve(x) {
        var value = 0;
        for (var i = 0; i < this.nTerms; i++) {
            value += this.coef[i] * Math.pow(x, this.pow[i]);
        }
        return value;
    }
    
    complexSolve(c) {
        var complexTerms = [];
        for (var i = 0; i < this.nTerms; i++) {
            var tempComplex = new Complex(1,0);
            for(var j = 0; j < this.pow[i]; j++) {
                tempComplex = tempComplex.multiply(c);
            }
            tempComplex = tempComplex.multiply(new Complex(this.coef[i],0));
            complexTerms.push(tempComplex);
        }
        var resultComplex = complexTerms[0];
        for(var i = 1; i < complexTerms.length; i++) {
            resultComplex = resultComplex.add(complexTerms[i]);
        }
        return resultComplex;
    }
}

function fractalLoading(s) {
    create_link_button_text.innerHTML = s;
    create_link_button_text.classList.add("div_disabled");
    create_link_button.classList.add("div_disabled");
}

function fractalUnload(s) {
    create_link_button_text.innerHTML = s;
    create_link_button_text.classList.remove("div_disabled");
    create_link_button.classList.remove("div_disabled");
}

function fractalLoaded(s) {
    create_link_button_text.style.opacity = 0;
    setTimeout(function () {
        create_link_button_text.style.color = "#990000";
        fractalUnload(s);
        create_link_button_text.style.opacity = 100;
    }, 550);
}

function debounce(delay, callback, accumulateData) {
    var timeout = null;
    var theData = [];
    return function () {
        fractalLoading("LOADING...");
        if (accumulateData) {
            var arr = [];
            for (var i = 0; i < arguments.length; ++i)
                arr.push(arguments[i]);
            theData.push(arr);
        }
        if (timeout) {
            clearTimeout(timeout);
        }
        var args = arguments;
        timeout = setTimeout(function () {
            callback.apply((accumulateData) ? { data: theData } : null, args);
            theData = []; // clear the data array
            timeout = null;
        }, delay);
    };
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

// !important maybe add other zoom scales for each type
function zoomCanvas(zoomInput) {
    var zoomCoefficient = zoomCoefficient = 10 + 0.058827625*zoom + .0925943e-9*zoom*zoom;
    zoom = parseFloat(zoom) + parseFloat(zoomCoefficient*zoomInput);
    zoom.toFixed(5);
    if(zoom <= 5) zoom = 5;
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
            parseInt(c1RGB.r + redDiff * percentage),
            parseInt(c1RGB.g + greenDiff * percentage),
            parseInt(c1RGB.b + blueDiff * percentage));

}

function chooseColor(percentage) {
    if (percentage == 0)
        return color1_opt.value;
    else if (percentage <= .25) {
        return gradientColorConversion(color1_opt.value,
                color2_opt.value, 4 * percentage);
    } else if (percentage <= .5) {
        return gradientColorConversion(color2_opt.value,
                color3_opt.value,  4 * (percentage - 0.25));
    } else if (percentage <= .75) {
        return gradientColorConversion(color3_opt.value,
                color4_opt.value, 4 * (percentage - 0.50));
    } else {
        return gradientColorConversion(color4_opt.value,
                color5_opt.value, 4 * (percentage - 0.75));
    }
}

function selectDefaults() {
    switch (type_opt.value) {
        case fractalOption.MANDELBROT_SET:
            canvasX = mandelbrotSetDefault.CANVAS_X;
            canvasY = mandelbrotSetDefault.CANVAS_Y;
            zoom = mandelbrotSetDefault.ZOOM;
            iterations_opt.value = mandelbrotSetDefault.ITERATIONS;
            break;
        case fractalOption.BURNING_SHIP:
            canvasX = burningShipDefault.CANVAS_X;
            canvasY = burningShipDefault.CANVAS_Y;
            zoom = burningShipDefault.ZOOM;
            iterations_opt.value = burningShipDefault.ITERATIONS;
            break;
        case fractalOption.JULIET_SET:
            canvasX = julietSetDefault.CANVAS_X;
            canvasY = julietSetDefault.CANVAS_Y;
            zoom = julietSetDefault.ZOOM;
            iterations_opt.value = julietSetDefault.ITERATIONS;
            break;
        case fractalOption.LYAPUNOV:
            canvasX = lyapunovDefault.CANVAS_X;
            canvasY = lyapunovDefault.CANVAS_Y;
            zoom = lyapunovDefault.ZOOM;
            iterations_opt.value = lyapunovDefault.ITERATIONS;
            break;
        case fractalOption.NEWTON:
            canvasX = newtonDefault.CANVAS_X;
            canvasY = newtonDefault.CANVAS_Y;
            zoom = newtonDefault.ZOOM;
            iterations_opt.value = newtonDefault.ITERATIONS;
            break;
        default:
            canvasX = mandelbrotSetDefault.CANVAS_X;
            canvasY = mandelbrotSetDefault.CANVAS_Y;
            zoom = mandelbrotSetDefault.ZOOM;
            iterations_opt.value = mandelbrotSetDefault.ITERATIONS;
            break;
    }
}

function changeTypeOptions() {
    juliet_x_opt_container.classList.add("opt_hidden");
    juliet_y_opt_container.classList.add("opt_hidden");
    newton_term1_opt_container.classList.add("opt_hidden");
    newton_term2_opt_container.classList.add("opt_hidden");
    newton_term3_opt_container.classList.add("opt_hidden");
    lyapunov_sequence_opt_container.classList.add("opt_hidden");
    validity_threshold_opt_container.classList.add("opt_hidden");
    switch (type_opt.value) {
        case fractalOption.JULIET_SET:
            canvasX = julietSetDefault.CANVAS_X;
            canvasY = julietSetDefault.CANVAS_Y;
            zoom = julietSetDefault.ZOOM;
            validity_threshold_opt_container.classList.remove("opt_hidden");
            juliet_x_opt_container.classList.remove("opt_hidden");
            juliet_y_opt_container.classList.remove("opt_hidden");
            break;
        case fractalOption.LYAPUNOV:
            canvasX = lyapunovDefault.CANVAS_X;
            canvasY = lyapunovDefault.CANVAS_Y;
            zoom = lyapunovDefault.ZOOM;
            lyapunov_sequence_opt_container.classList.remove("opt_hidden");
            break;
        case fractalOption.NEWTON:
            canvasX = newtonDefault.CANVAS_X;
            canvasY = newtonDefault.CANVAS_Y;
            zoom = newtonDefault.ZOOM;
            validity_threshold_opt_container.classList.remove("opt_hidden");
            newton_term1_opt_container.classList.remove("opt_hidden");
            newton_term2_opt_container.classList.remove("opt_hidden");
            newton_term3_opt_container.classList.remove("opt_hidden");
            break;
        default:
            validity_threshold_opt_container.classList.remove("opt_hidden");
            break;
    }
}

function checkInMandelbrotSet(x, y) {
    var complex = new Complex(x,y);
    for (var i = 0; i < iterations_opt.value; i++) {
        complex = complex.multiply(complex);
        complex.real += x;
        complex.imaginary += y;
        if (complex.imaginary > validity_threshold_opt.value
                || complex.real > validity_threshold_opt.value
                || complex.real * complex.imaginary > validity_threshold_opt.value)
            return (i / iterations_opt.value);
    }
    return 0;
}

function generateMandelbrotSet() {
    var error_percentage = 0;
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            error_percentage = checkInMandelbrotSet(x/zoom - canvasX, y/zoom - canvasY);
            context.fillStyle = chooseColor(error_percentage);
            context.fillRect(x, y, 1, 1);
        }
    }
}

function checkInBurningShip(x,y) {
    var complex = new Complex(x,y);
    var realComponent = x;
    var imaginaryComponent = y;
    for (var i = 0; i < iterations_opt.value; i++) {
        complex = complex.absMultiply(complex);
        complex.real += x;
        complex.imaginary += y;
        if (complex.imaginary > validity_threshold_opt.value
                || complex.real > validity_threshold_opt.value
                || complex.real * complex.imaginary > validity_threshold_opt.value)
            return (i/iterations_opt.value);
    }
    return 0;
}

function generateBurningShip() {
    var error_percentage = 0;
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            error_percentage = checkInBurningShip(x/zoom - canvasX, y/zoom - canvasY);
            context.fillStyle = chooseColor(error_percentage);
            context.fillRect(x, y, 1, 1);
        }
    }
}

function checkInJulietSet(zx, zy, cx, cy) {
    var complex = new Complex(zx, zy);
    for (var i = 0; i < iterations_opt.value; i++) {
        if (complex.real*complex.real + complex.imaginary*complex.imaginary
                > validity_threshold_opt.value) {
            return (i / iterations_opt.value);
        }
        complex = complex.multiply(complex);
        complex.real += cx;
        complex.imaginary += cy;
    }
    return 0;
}

function generateJulietSet() {
    var error_percentage = 0;
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            error_percentage = checkInJulietSet(x / zoom - canvasX, y / zoom - canvasY,
                    parseFloat(juliet_x_opt.value),
                    parseFloat(juliet_y_opt.value));
            context.fillStyle = chooseColor(error_percentage);
            context.fillRect(x, y, 1, 1);
        }
    }
}

function lyapunovRFunction(a, b, S) {
    var r = [];
    r.push(0);
    for(var i = 0; i < iterations_opt.value; i++) {
        r.push(S.charAt(i) === 'A' ? a : b);
    }
    return r;
}

function lyapunovXFunction(S, r) {
    var x = [];
    x[0] = 0.5;
    for (var i = 1; i < iterations_opt.value; i++) {
        if (x[i - 1] === Infinity || x[i - 1] === -Infinity) {
            x.push(r[i] > 0 ? -x[i-1] : x[i-1]);
        } else {
            x.push(r[i] * x[i-1] * (1 - x[i-1]));
        }
    }
    return x;
}

function calculateLyapunovExponent(x, y, S) {
    var r = lyapunovRFunction(x, y, S);
    var x = lyapunovXFunction(S, r);
    var sum = 0;
    for (var i = 1; i < iterations_opt.value; i++) {
        sum += Math.log(Math.abs(r[i] - 2*r[i]*x[i]))/Math.log(2);
        if(sum === Infinity || sum === -Infinity) {
            return sum;
        }
    }
    return sum/iterations_opt.value;
}

//http://charles.vassallo.pagesperso-orange.fr/en/lyap_art/lyapdoc.html#exposant
function generateLyapunov() {
    var sequence = lyapunov_sequence_opt.value.repeat(iterations_opt.value);
    var lyapunov_exponents = new Array(canvas.width);
    var min = 0, max = 0;
    for(var i = 0; i < canvas.width; i++) {
        lyapunov_exponents[i] = new Array(canvas.height);
    }
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
    /*var xStep = 4/canvas.width;
    var yStep = 4/canvas.height;
    for (var x = 0; x < 4; x = Math.round(100*(x + xStep))/100) {
        for (var y = 0; y < 4; y = Math.round(100*(y + yStep))/100) {
            var xScaled = Math.round(x/xStep);
            var yScaled = Math.round(y/yStep);
            lyapunov_exponents[xScaled][yScaled] = calculateLyapunovExponent(x, y, sequence);*/

            lyapunov_exponents[x][y] = calculateLyapunovExponent(x / zoom - canvasX,
                    y / zoom - canvasY, sequence);
            if(lyapunov_exponents[x][y] !== Infinity && lyapunov_exponents[x][y] !== -Infinity) {
                if(lyapunov_exponents[x][y] < min) {
                    min = lyapunov_exponents[x][y];
                }
                else if(lyapunov_exponents[x][y] > max) {
                    max = lyapunov_exponents[x][y];
                }
            }
            /*
            if(lyapunov_exponents[xScaled][yScaled] !== Infinity && lyapunov_exponents[xScaled][yScaled] !== -Infinity) {
                if(lyapunov_exponents[xScaled][yScaled] < min) {
                    min = lyapunov_exponents[xScaled][yScaled];
                }
                else if(lyapunov_exponents[xScaled][yScaled] > max) {
                    max = lyapunov_exponents[xScaled][yScaled];
                }
            }*/
        }
    }

    var range = max - min;
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
    /*for (var x = 0; x < 4; x = Math.round(100*(x + xStep))/100) {
        for (var y = 0; y < 4; y = Math.round(100*(y + yStep))/100) {
            var xScaled = Math.round(x/xStep);
            var yScaled = Math.round(y/yStep);
            var error_percentage = 0;
            if(lyapunov_exponents[xScaled][yScaled] === -Infinity) {
                error_percentage = 0;
            }
            else if(lyapunov_exponents[xScaled][yScaled] === Infinity) {
                error_percentage = 1;
            }
            else {
                error_percentage = (lyapunov_exponents[xScaled][yScaled] - min)/range;
            }*/

            if (lyapunov_exponents[x][y] === -Infinity) {
                error_percentage = 0;
            } else if (lyapunov_exponents[x][y] === Infinity) {
                error_percentage = 1;
            } else {
                error_percentage = (lyapunov_exponents[x][y] - min) / range;
            }
            context.fillStyle = chooseColor(error_percentage);
            //context.fillRect(xScaled, yScaled, 1, 1);
            context.fillRect(x, y, 1, 1);
        }
    }
}


function combineNewtonTerms() {
    var dict = {};
    dict[newton_term1_pow_opt.value] = parseFloat(newton_term1_coef_opt.value);
    if (dict[newton_term2_pow_opt.value]) {
        dict[newton_term2_pow_opt.value] = dict[newton_term2_pow_opt.value]
                + parseFloat(newton_term2_coef_opt.value);
    } else {
        dict[newton_term2_pow_opt.value] = parseFloat(newton_term2_coef_opt.value);
    }
    if (dict[newton_term3_pow_opt.value]) {
        dict[newton_term3_pow_opt.value] = dict[newton_term3_pow_opt.value]
                + parseFloat(newton_term3_coef_opt.value);
    } else {
        dict[newton_term3_pow_opt.value] = parseFloat(newton_term3_coef_opt.value);
    }
    var terms = [];
    for (key in dict) {
        terms.push({coef: dict[key], pow: parseInt(key)});
    }
    terms.sort(function (a, b) {
        return ((a.pow < b.pow) ? 1 : ((a.pow == b.pow) ? 0 : -1));
    });
    while(terms.length < 3) {
        terms.splice(0, 0, {coef: 0, pow: terms[0].pow + 1});
    }
    newton_term1_coef_opt.value = terms[0].coef;
    newton_term1_pow_opt.value = terms[0].pow;
    newton_term2_coef_opt.value = terms[1].coef;
    newton_term2_pow_opt.value = terms[1].pow;
    newton_term3_coef_opt.value = terms[2].coef;
    newton_term3_pow_opt.value = terms[2].pow;
}

//http://code.activestate.com/recipes/577166-newton-fractals/
function checkInNewton(x, y, polynomial) {
    var z = new Complex(x, y);
    var stepSize = 1e-2;
    var deltaComplex = new Complex(stepSize, stepSize);
    var lowerThreshold = validity_threshold_opt.value / 100;
    var higherThreshold = validity_threshold_opt.value;
    for (var i = 0; i < iterations_opt.value; i++) {
        var polyZ = polynomial.complexSolve(z);
        var dz = (polynomial.complexSolve(z.add(deltaComplex))
                .subtract(polyZ))
                .divide(deltaComplex);
        var z0 = z.subtract(polyZ.divide(dz));
        var diff = z0.subtract(z).abs();
        if (diff < lowerThreshold || diff > higherThreshold) {
            return (i / iterations_opt.value);
        }
        z = z0;
    }
    return 1;
}

function generateNewton() {
    var error_percentage = 0;
    var p = new Polynomial(3,
            [newton_term1_coef_opt.value, newton_term2_coef_opt.value, newton_term3_coef_opt.value],
            [newton_term1_pow_opt.value, newton_term2_pow_opt.value, newton_term3_pow_opt.value]);
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            error_percentage = checkInNewton(x / zoom - canvasX, y / zoom - canvasY, p);
            context.fillStyle = chooseColor(error_percentage);
            context.fillRect(x, y, 1, 1);
        }
    }
}

function generateFractal() {   
    fractalLoading("LOADING...");
    context.clearRect(0, 0, canvas.width, canvas.height);
    switch (type_opt.value) {
        case fractalOption.MANDELBROT_SET:
            generateMandelbrotSet();
            break;
        case fractalOption.BURNING_SHIP:
            generateBurningShip();
            break;
        case fractalOption.JULIET_SET:
            generateJulietSet();
            break;
        case fractalOption.LYAPUNOV:
            generateLyapunov();
            break;
        case fractalOption.NEWTON:
            generateNewton();
            break;
        default:
            break;
    }
    fractalLoaded("GENERATE AND COPY LINK");
}

function createLink() {
    fractalLoading("GENERATING AND COPYING...");
    var juliet_opt = "";
    if (type_opt.value == fractalOption.JULIET_SET) {
        juliet_opt = "&juliet_x=" + juliet_x_opt.value
                + "&juliet_y=" + juliet_y_opt.value;
    }
    var lyapunov_sequence = "";
    if (type_opt.value == fractalOption.LYAPUNOV) {
        lyapunov_sequence = "&lyapunov_sequence=" + lyapunov_sequence_opt.value;
    }
    var newton_opt = "";
    if (type_opt.value == fractalOption.NEWTON) {
        newton_opt = "&newton_term1_coef=" + newton_term1_coef_opt.value
                + "&newton_term1_pow=" + newton_term1_pow_opt.value +
                "&newton_term2_coef=" + newton_term2_coef_opt.value
                + "&newton_term2_pow=" + newton_term2_pow_opt.value +
                "&newton_term3_coef=" + newton_term3_coef_opt.value
                + "&newton_term3_pow=" + newton_term3_pow_opt.value;
    }
    var link = window.location.href.split('?')[0] +
            "?shared=1" +
            "&type=" + type_opt.value +
            "&iterations=" + iterations_opt.value +
            "&validity_threshold=" + validity_threshold_opt.value +
            juliet_opt +
            lyapunov_sequence +
            newton_opt +
            "&color1=" + color1_opt.value.substring(1, color1_opt.value.length) +
            "&color2=" + color2_opt.value.substring(1, color2_opt.value.length) +
            "&color3=" + color3_opt.value.substring(1, color3_opt.value.length) +
            "&color4=" + color4_opt.value.substring(1, color4_opt.value.length) +
            "&color5=" + color5_opt.value.substring(1, color5_opt.value.length) +
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
    fractalLoaded("GENERATE AND COPY LINK");
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
    type_opt.addEventListener("focus", function (e) {
        fractalLoading("LOADING...");
    });
    type_opt.addEventListener("focusout", function (e) {
        fractalUnload("GENERATE AND COPY LINK");
    });
    type_opt.onchange = function () {
        selectDefaults();
        combineNewtonTerms();
        changeTypeOptions();
        generateFractal();
    };
    iterations_opt.onchange = function () {
        if (iterations_opt.value < 1)
            iterations_opt.value = 1;
        if (iterations_opt.value > 2000)
            iterations_opt.value = 2000;
        iterations_opt.value = Math.round(iterations_opt.value);
        generateFractal();
    };
    validity_threshold_opt.onchange = function () {
        if (validity_threshold_opt.value < 1)
            validity_threshold_opt.value = 1;
        if (validity_threshold_opt.value > 1000)
            validity_threshold_opt.value = 1000;
        validity_threshold_opt.value = Math.round(validity_threshold_opt.value);
        generateFractal();
    };
    juliet_x_opt.onchange = function () {
        if (juliet_x_opt.value < -1.7)
            juliet_x_opt.value = -1.7;
        if (juliet_x_opt.value > 0.7)
            juliet_x_opt.value = 0.7;
        juliet_x_opt.value = Math.round(1000 * juliet_x_opt.value) / 1000;
        generateFractal();
    };
    juliet_y_opt.onchange = function () {
        if (juliet_y_opt.value < -1)
            juliet_y_opt.value = -1;
        if (juliet_y_opt.value > 1)
            juliet_y_opt.value = 1;
        juliet_y_opt.value = Math.round(1000 * juliet_y_opt.value) / 1000;
        generateFractal();
    };
    lyapunov_sequence_opt.onchange = function () {
        lyapunov_sequence_opt.value = lyapunov_sequence_opt.value
                .toUpperCase()
                .replace(/[^AB]/g, '');
        if (lyapunov_sequence_opt.value == "") {
            lyapunov_sequence_opt.value = "ABAB";
        }
        generateFractal();
    };
    newton_term1_coef_opt.onchange = function () {
        newton_term1_coef_opt.value = Math.round(1000 * newton_term1_coef_opt.value) / 1000;
        combineNewtonTerms();
        generateFractal();
    };
    newton_term2_coef_opt.onchange = function () {
        newton_term2_coef_opt.value = Math.round(1000 * newton_term2_coef_opt.value) / 1000;
        combineNewtonTerms();
        generateFractal();
    };
    newton_term3_coef_opt.onchange = function () {
        if (newton_term3_coef_opt.value == 0) {
            newton_term3_coef_opt.value = 1;
        }
        newton_term3_coef_opt.value = Math.round(1000 * newton_term3_coef_opt.value) / 1000;
        combineNewtonTerms();
        generateFractal();
    };
    newton_term1_pow_opt.onchange = function () {
        if (newton_term1_pow_opt.value < 0)
            newton_term1_pow_opt.value = 0;
        newton_term1_pow_opt.value = Math.round(newton_term1_pow_opt.value);
        combineNewtonTerms();
        generateFractal();
    };
    newton_term2_pow_opt.onchange = function () {
        if (newton_term2_pow_opt.value < 0)
            newton_term2_pow_opt.value = 0;
        newton_term2_pow_opt.value = Math.round(newton_term2_pow_opt.value);
        combineNewtonTerms();
        generateFractal();
    };
    newton_term3_pow_opt.onchange = function () {
        if (newton_term3_pow_opt.value < 0)
            newton_term3_pow_opt.value = 0;
        newton_term3_pow_opt.value = Math.round(newton_term3_pow_opt.value);
        combineNewtonTerms();
        generateFractal();
    };
    color1_opt.onchange = function () {
        generateFractal();
    };
    color2_opt.onchange = function () {
        generateFractal();
    };
    color3_opt.onchange = function () {
        generateFractal();
    };
    color4_opt.onchange = function () {
        generateFractal();
    };
    color5_opt.onchange = function () {
        generateFractal();
    };
    canvas.addEventListener("mousedown", function (e) {
        if (e.button === 0) {
            fractalLoading("LOADING...");
            mouseDown = true;
        }
    });
    canvas.addEventListener("mouseup", function(e) {
        if(e.button === 0) {
            generateFractal();
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
        printVars(e);
    });
    canvas.addEventListener("mousewheel", debounce(300, function (e) {
        var accumulatedZoom = 0;
        for (var i = 0; i < this.data.length; ++i) {
            accumulatedZoom += this.data[i][0].wheelDelta >= 0 ? 1 : -1;
        }
        zoomCanvas(accumulatedZoom);
        generateFractal();
    }, true));
    canvas.addEventListener("DOMMouseScroll", debounce(200, function (e) {
        var accumulatedZoom = 0;
        for (var i = 0; i < this.data.length; ++i) {
            accumulatedZoom += -this.data[i][0].detail >= 0 ? 1 : -1;
        }
        zoomCanvas(accumulatedZoom);
        generateFractal();
    }, true));
    create_link_button.onclick = function () {
        createLink();
    };
    save_button.onclick = function () {
        var name;
        if (save_name.value.length === 0) {
            name = generateRandomName(Math.floor((Math.random() * 12) + 5));
        } else {
            name = save_name.value.replace(/[^a-z0-9]/gi, '_')
                    .replace(/^_+|\_+$/g, '')
                    .replace(/_{2,}/g, '_').toLowerCase();
            if (name.length === 0) {
                name = generateRandomName(Math.floor((Math.random() * 12) + 5));
            }
        }
        canvas.toBlob(function (blob) {
            saveAs(blob, name + ".png");
        });
    }
    if (getURLParameter("shared")) {
        type_opt.value = getURLParameter("type");
        changeTypeOptions();
        iterations_opt.value = parseInt(getURLParameter("iterations"));
        validity_threshold_opt.value = parseInt(getURLParameter("validity_threshold"));
        if (type_opt.value == fractalOption.JULIET_SET) {
            juliet_x_opt.value = parseFloat(getURLParameter("juliet_x"));
            juliet_y_opt.value = parseFloat(getURLParameter("juliet_y"));
        }
        if (type_opt.value == fractalOption.LYAPUNOV) {
            lyapunov_sequence_opt.value = getURLParameter("lyapunov_sequence");
        }
        if (type_opt.value == fractalOption.NEWTON) {
            newton_term1_coef_opt.value = parseFloat(getURLParameter("newton_term1_coef"));
            newton_term2_coef_opt.value = parseFloat(getURLParameter("newton_term2_coef"));
            newton_term3_coef_opt.value = parseFloat(getURLParameter("newton_term3_coef"));
            newton_term1_pow_opt.value = parseInt(getURLParameter("newton_term1_pow"));
            newton_term2_pow_opt.value = parseInt(getURLParameter("newton_term2_pow"));
            newton_term3_pow_opt.value = parseInt(getURLParameter("newton_term3_pow"));
            combineNewtonTerms();
        }
        color1_opt.value = '#' + getURLParameter("color1");
        color2_opt.value = '#' + getURLParameter("color2");
        color3_opt.value = '#' + getURLParameter("color3");
        color4_opt.value = '#' + getURLParameter("color4");
        color5_opt.value = '#' + getURLParameter("color5");
        canvasX = parseFloat(getURLParameter("x"));
        canvasY = parseFloat(getURLParameter("y"));
        zoom = parseFloat(getURLParameter("zoom"));
    } else
    {
       selectDefaults();
       changeTypeOptions();
    }
    generateFractal();
})();