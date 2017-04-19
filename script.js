//Submitters: mor kasus 305633505 xand yossi azoulay 301848289
var canvasElem = document.getElementById('myCanvas');
//canvasElem.width = window.innerWidth;
var ctx = canvasElem.getContext("2d");

var lineMode = document.getElementById('lineMode');
var circleMode = document.getElementById('circleMode');
var shapeMode = document.getElementById('shapeMode');
var curveMode = document.getElementById('curveMode');
var shapeInputBox = document.getElementById('shape_lines');
var curveInputBox = document.getElementById('curve_lines');

/*
    Line = 0
    Circle = 1
    Shape = 2
    Curve = 3
*/
var mode = 0;
var color = "#000000";
var clickCounter = 0;
var coordinates = [];
var shape_lines = 3;    //Default
var curve_lines = 100;  //Defualt
var last_coordinate = [];
var bezierCurveMatrix = [[-1, 3, -3,1],
                         [3, -6, 3, 0],
                         [-3, 3, 0, 0],
                         [1, 0, 0, 0 ]];

function Coordinate(x, y) {
    this.x = x;
    this.y = y;
}

// window.addEventListener('resize', function(event) {
//     canvasElem.width = window.innerWidth;
// });

// Poligon lines amount
shapeInputBox.addEventListener('change', function(event){
    if (this.value >= 3) {
        shape_lines = this.value;
    } else {
        shape_lines = 3;
    }
});

// curve lines amount
curveInputBox.addEventListener('change', function(event){
    var last_curve_lines = curve_lines;
    if (this.value >= 1) {
        curve_lines = this.value;
    } else {
        curve_lines = 1;
    }
    if (last_coordinate.length === 4) {
        var last_color = color;
        changeColor('#c6cdc7');
        myCurve(last_coordinate, 1 / last_curve_lines);
        changeColor(last_color);
        myCurve(last_coordinate, 1 / curve_lines);
    }
});


// Canvas (board) click listener
canvasElem.addEventListener('click', function(event) {
    switch(mode) {
        // Line
        case 0:
            if (clickCounter <= 1) {
                clickInPosition(event.x, event.y);
            }
            if (clickCounter === 2) {
                myLine(coordinates[0].x, coordinates[0].y, coordinates[1].x, coordinates[1].y);
                clear();
            }
            break;
        // Circle
        case 1:
            if (clickCounter <= 1) {
                clickInPosition(event.x, event.y);
            }
            if (clickCounter === 2) {
                myCircle(coordinates[0], coordinates[1]);
                clear();
            }
            break;
        // Shape
        case 2: 
            if (clickCounter <= 1) {
                clickInPosition(event.x, event.y);
            }
            if (clickCounter === 2) {
                if (shape_lines < 3) return;
                myShape(coordinates[0], coordinates[1], shape_lines);
                clear();
            }
            break;
        // Curve
        case 3: 
            if (clickCounter <= 4) {
                clickInPosition(event.x, event.y);
            }
            if (clickCounter === 4) {
                myCurve(coordinates, 1 / curve_lines);
                last_coordinate = coordinates;
                clear();
            }
    }    
});


// Drawing pixel in coordinates
function putPixel(x, y) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

// Drawing Line 
function myLine(x1, y1, x2, y2) {
    var dx = x1 - x2;
    var dy = y1 - y2;
    var steps = Math.max(Math.abs(dx), Math.abs(dy));
    var xIncrement = dx / steps;
    var yIncrement = dy / steps;
    var x = x1, y = y1;
    for (var i = 0; i < steps; i++) {
        x = x - xIncrement;
        y = y - yIncrement;
        putPixel(Math.round(x), Math.round(y));
    }
}

// Drawing circle
function myCircle(centerCoord, radiusCoord) {
    var radius = Math.sqrt(Math.pow(centerCoord.x - radiusCoord.x, 2) + Math.pow(centerCoord.y - radiusCoord.y, 2));
    var y = radius;
    var x = 0;
    var p = 3 - 2 * radius;
    while (x < y) {
        myCircelHelper(centerCoord,x , y);
        if (p < 0) {
            p = p + 4 * x + 6;
        } 
        else {
            p = p + 4 * (x - y) + 10;
            y = y - 1;
        }
        x = x + 1;
    }
    if (x == y) {
        myCircelHelper(centerCoord,x , y);
    }
}

// Print many pixels - created for circle draw function 
function myCircelHelper(centerCoord,x,y) {
    putPixel(centerCoord.x + x, centerCoord.y + y);
    putPixel(centerCoord.x - x, centerCoord.y + y);
    putPixel(centerCoord.x + x, centerCoord.y - y);
    putPixel(centerCoord.x - x, centerCoord.y - y);
    
    putPixel(centerCoord.x + y, centerCoord.y + x);
    putPixel(centerCoord.x - y, centerCoord.y + x);
    putPixel(centerCoord.x + y, centerCoord.y - x);
    putPixel(centerCoord.x - y, centerCoord.y - x);
}

// Drawing poligon
function myShape(centerCoord, secondCoord, shape_lines) {
    
    var radius = Math.sqrt(Math.pow(centerCoord.x - secondCoord.x, 2) + Math.pow(centerCoord.y - secondCoord.y, 2));
    var angle = ( 2 * Math.PI) / shape_lines;
    var firstAngle = centerCoord.y > secondCoord.y ? 
            2 * Math.PI - Math.acos((secondCoord.x - centerCoord.x)/radius) :
        Math.acos((secondCoord.x - centerCoord.x)/radius);

    for(var i = 0; i < shape_lines; i++){
        drawShapeLine(i, angle, firstAngle, radius, centerCoord, secondCoord);
    }
}

function drawShapeLine(i, angle, firstAngle, radius, centerCoord, secondCoord) {
    var nextAngle = angle * (i+1) + firstAngle;
    var nextX = centerCoord.x + radius * Math.cos(nextAngle);
    var nextY = centerCoord.y + radius * Math.sin(nextAngle);
    myLine(secondCoord.x, secondCoord.y, nextX, nextY);
    secondCoord.x = nextX;
    secondCoord.y = nextY;
}

// Drawing cuerve
function myCurve(points, steps) 
{
    var xCoordinatesArray = bezierMatrixHelper(points[0].x, points[1].x, 
                                    points[2].x, points[3].x);
    var yCoordinatesArray = bezierMatrixHelper(points[0].y, points[1].y, 
                                    points[2].y, points[3].y);

    var x1 = points[0].x,
        y1 = points[0].y,
        tempSteps = steps,
        x2, y2;

    while (tempSteps <= 1) 
    {
        x2 = Math.round(xCoordinatesArray[0] * Math.pow(tempSteps, 3) + 
                            xCoordinatesArray[1] * Math.pow(tempSteps, 2) + 
                            xCoordinatesArray[2] * tempSteps + 
                            xCoordinatesArray[3]);
                            
        y2 = Math.round(yCoordinatesArray[0] * Math.pow(tempSteps, 3) + 
                            yCoordinatesArray[1] * Math.pow(tempSteps, 2) + 
                            yCoordinatesArray[2] * tempSteps + 
                            yCoordinatesArray[3]);

        myLine(x1, y1, x2, y2);
        x1 = x2;
        y1 = y2;
        tempSteps += steps;
    }

}

// change shape mode
function changeMode(m) {
    if (mode === m) {
        return;
    }
    mode = m;
    clear();
}

// change the color
function changeColor(col) {
    color = col;
    clear();
}

// save the click coordinates and increment click counter
function clickInPosition(x, y) {
    //putPixel(x, y);
    var newCoord = new Coordinate(x, y);
    coordinates.push(newCoord);
    clickCounter++;
}

// clear the coordinate array, and click counter
function clear() {
    clickCounter = 0;
    coordinates = [];
}

// Mult between coordiante array and bezier matrix
function bezierMatrixHelper(coord1, coord2, coord3, coord4) {
    var multArray = [0, 0, 0, 0];
    var coordinateArr = [coord1, coord2, coord3, coord4];
    
    for(var i = 0; i < coordinateArr.length; i++) {
        for(var j = 0; j < bezierCurveMatrix[0].length; j++) {
            multArray[i] += bezierCurveMatrix[j][i] * coordinateArr[j];
        }
    }
    return multArray;
}

function clearCanvas () {
    ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
}