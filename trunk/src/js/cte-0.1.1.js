/* Author: Gabriel Heiler

*/
/*global document: false, window: false, console: false */

var touchEditor = {
    CanvasSettings: { canvasHeight: 80, canvasWidth: 100, toolBoxHeight: 20, toolBoxWidth: 100, toolBoxRealWidth: null, containerSelector: null, selectedShape: null },
    InitWithContainer: function(selector) {
        "use strict";
        this.CanvasSettings.containerSelector = selector;
        this.CreateToolBox();
        this.CreatePaintCanvas();
    },
    CreatePaintCanvas: function() {
        "use strict";
        // declare scope Vars
        var realHeight, realWidth, canvas, container;
        container = document.getElementById(this.CanvasSettings.containerSelector);
        if(container) {
            // set height and width of the container I received to maximun
            container.style.width = "100%";
            container.style.height = "100%";
            // then get the real height and width of the container
            realHeight = parseInt(window.getComputedStyle(container, null).getPropertyValue("height").split("px").join(""), 10); //* 1.075
            realWidth = parseInt(window.getComputedStyle(container, null).getPropertyValue("width").split("px").join(""), 10);
            // create the canvas with the values
            canvas = document.createElement("canvas");
            canvas.setAttribute("width", (realWidth * this.CanvasSettings.canvasWidth) / 100 + "px");
            canvas.setAttribute("height", (realHeight * this.CanvasSettings.canvasHeight) / 100 + "px");
            canvas.style.backgroundImage = "url(../img/bg/noise.png)";

            canvas.setAttribute("id", "te_canvas");
            container.appendChild(canvas);
            var s = new CanvasState(document.getElementById('te_canvas'));

        } else {
            console.log("Could not find the canvas container");
        }
    },
    CreateToolBox: function() {
        "use strict";
        // declare scope Vars
        var realHeight, realWidth, toolBox, container, buttonPadTop = 10, buttonPadLeft = 10, buttonSizeHeight = 20, buttonSizeWidth;
        container = document.getElementById(this.CanvasSettings.containerSelector);
        if(container) {
            // set height and width of the container I received to maximun
            container.style.width = "100%";
            container.style.height = "100%";
            // then get the real height and width of the container
            realHeight = parseInt(window.getComputedStyle(container, null).getPropertyValue("height"), 10);
            realWidth = parseInt(window.getComputedStyle(container, null).getPropertyValue("width"), 10);
            var calcHeight = (realHeight * this.CanvasSettings.toolBoxHeight) / 100;
            if(calcHeight > 95) { calcHeight = 95; }
            this.toolBoxRealWidth = calcHeight;
            // create the canvas with the values
            toolBox = document.createElement("div");
            toolBox.setAttribute("width", (realWidth * this.CanvasSettings.toolBoxWidth) / 100 + "px");
            toolBox.setAttribute("height", calcHeight + "px");
            toolBox.style.height = calcHeight + "px";
            toolBox.setAttribute("id", "te_toolbox");
            toolBox.setAttribute("class", "te-toolbox");
            container.appendChild(toolBox);

            // create a div button container

            //draw a circle
            this.DrawToolBoxShape("circle", toolBox);
            this.DrawToolBoxShape("rect", toolBox);
            this.DrawToolBoxShape("line", toolBox);
            this.DrawToolBoxShape("text", toolBox);
            this.DrawToolBoxShape("stroke", toolBox);
            this.DrawToolBoxShape("img", toolBox);
            //this.DrawToolBoxShape("cuca", toolBox);

            // draw more stuff
            // TODO: draw stroke and fill color picker, stroke wide, undo, redo, rubber, clear all, save

        } else {
            console.log("Could not find the canvas container");
        }
    },
    DrawToolBoxShape: function(type, toolBox) {
        // create a div button container
        var btnCont = document.createElement("div");
        btnCont.setAttribute("class", "btn-container");
        btnCont.setAttribute("onclick", "touchEditor.SetShape(this, '" + type + "');");
        //draw a shape
        var shape = document.createElement("div");
        shape.setAttribute("class", type);
        if(type == "text") {
            shape.innerHTML = "texto";
        }
        btnCont.appendChild(shape);
        toolBox.appendChild(btnCont);
    },
    SetShape: function(el, type) {
        this.CanvasSettings.selectedShape = type;
        var divShape = document.getElementById(this.CanvasSettings.containerSelector);
        this.DeSelectAllShapes();
        el.style.border = "1px #CCC   solid";
        if(type === "stroke") {
            myState.stroke = true;
            myState.addShape(new Shape("stroke", null, null, 0, 0, null, null));
        } else {
            myState.stroke = false;
        }
    },
    DeSelectAllShapes: function() {
        var shapesContainers = document.getElementsByClassName("btn-container");
        var i;
        var total = shapesContainers.length;
        for(i = 0; i < total; i++) {
            shapesContainers[i].style.border = "none";
        }
    }
};


/* CODE FROM: http://simonsarris.com*/

// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Holds the state of the canvas context
var myState;

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(type, x, y, w, h, stroke, fill, radius, text, url) {
  // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  // But we aren't checking anything else! We could put "Lalala" for the value of x 
  this.type = type || "line";
  this.x = x || null;
  this.y = y || null;
  this.w = w || 1;
  this.h = h || 1;
  this.r = radius || null;
  this.text = text || null;
  this.url = url || null;
  this.strokeStyle = stroke || "#000000";
  this.fillStyle = fill || null;  
}

// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = this.strokeStyle;

    switch(this.type) {
        case "rect":
            ctx.rect(this.x, this.y, this.w, this.h);
            break;
        case "circle":
            ctx.arc(this.x + this.r, this.y + this.r, this.r, 0, Math.PI * 2, true);
            break;
        case "line":
            /*tx.moveTo(this.x, this.y);
            ctx.lineTo(this.w, this.h);*/
            ctx.rect(this.x, this.y, this.w, this.h); // if not this way height is always 1px
            break;
        case "stroke":
            if(myState.lastStrokeCoords.x !== null && this.x !== null) {
                ctx.moveTo(myState.lastStrokeCoords.x, myState.lastStrokeCoords.y);
                ctx.lineTo(this.x, this.y);
                //console.log("me movi aca: " + myState.lastStrokeCoords.x + "," +  myState.lastStrokeCoords.y + " y dibuje una linea desde ahi hasta aca: " + this.x + "," + this.y);
            } else {
                myState.lastStrokeCoords.x = this.x;
                myState.lastStrokeCoords.y = this.y;
                return;
            }
            myState.lastStrokeCoords.x = this.x;
            myState.lastStrokeCoords.y = this.y;
            break;
        case "text":
            // TODO: Implement
            context.font = 'italic 30px sans-serif';
            context.textBaseline = 'top';
            context.fillText(this.text, 0, 0);
            return;
            break;
        case "image":
            var img = new Image();
            img.onload = function() {
                ctx.drawImage(img, buttonPadLeft * 9, buttonPadTop);
            };
            img.src = this.url;
            return;
            break;
        default:
            break;
    }

    if(this.fillStyle !== null) {
        ctx.fillStyle = this.fillStyle;
        ctx.fill();
    } else {
        ctx.stroke();
    }

}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {
  // All we have to do is make sure the Mouse X,Y fall in the area between
  // the shape's X and (X + Height) and its Y and (Y + Height)
  return  (this.x <= mx) && (this.x + this.w >= mx) &&
          (this.y <= my) && (this.y + this.h >= my);
}

function CanvasState(canvas) {
    // **** First some setup! ****

    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    // This complicates things a little but but fixes mouse co-ordinate problems
    // when there's a border or padding. See getPosition for more detail
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if(document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
        this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
        this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
        this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
    }
    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;

    // **** Keep track of state! ****

    this.valid = false; // when set to false, the canvas will redraw everything
    this.shapes = [];  // the collection of things to be drawn
    this.dragging = false; // Keep track of when we are dragging
    // the current selected object. In the future we could turn this into an array for multiple selection
    this.selection = null;
    this.dragoffx = 0; // See mousedown and mousemove events for explanation
    this.dragoffy = 0;
    this.startCords = null;
    this.startTime = null;
    this.endCords = null;
    this.endTime = null;
    this.stroke = false;
    this.stroking = false;
    this.lastStrokeCoords = { x: null, y: null};

    // **** Then events! ****

    // This is an example of a closure!
    // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
    // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
    // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
    // This is our reference!
    myState = this;

    //fixes a problem where double clicking causes text to get selected on the canvas
    canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
    // Up, down, and move are for dragging
    canvas.addEventListener('mousedown', function(e) {
        myState.startTime = new Date().getTime();
        myState.startCords = myState.getPosition(e);
        shapeStartsMoving(myState.startCords);
    }, true);
    canvas.addEventListener('mousemove', function(e) {
        var cords = myState.getPosition(e);
        shapeMoving(cords);
    }, true);
    canvas.addEventListener('mouseup', function(e) {
        myState.endTime = new Date().getTime();
        myState.endCords = myState.getPosition(e);
        shapeEndMoving(myState.endCords);
        myState.checkTouchClick();
    }, true);
    canvas.addEventListener("touchstart",  function(e) {
        myState.startTime = new Date().getTime();
        myState.startCords = myState.getPosition(e.targetTouches[0]);
        shapeStartsMoving(myState.startCords);
        //alert("start touch");
    }, true);
    canvas.addEventListener("touchmove", function(e) {
        //alert("touch move");
        var cords = myState.getPosition(e.targetTouches[0]);
        shapeMoving(cords);
    }, true);
    canvas.addEventListener("touchend", function(e) {
        myState.endTime = new Date().getTime();
        if(e.targetTouches[0] !== undefined) {
            myState.endCords = myState.getPosition(e.targetTouches[0]);
        }
        shapeEndMoving(myState.endCords);
        myState.checkTouchClick();
    }, true);
    
    function mouseXY(e) {
        // TODO: Compare with CanvasState.prototype.getMouse and look one is better
        var can = document.getElementById(touchEditor.CanvasSettings.containerSelector);
        if(!e) e = event;
        return {
            x: e.pageX - can.offsetLeft,
            y: e.pageY - can.offsetTop
        };
    }
    function touchXY(e) {
        // TODO: Compare with CanvasState.prototype.getMouse and look one is better
        var can = document.getElementById(touchEditor.CanvasSettings.containerSelector);
        if(!e) e = event;
        e.preventDefault();
        return { 
            x: e.targetTouches[0].pageX - can.offsetLeft,
            y: e.targetTouches[0].pageY - can.offsetTop
        };
    }

    function shapeMoving(cords) {
        if(myState.dragging) {
            // We don't want to drag the object by its top-left corner, we want to drag it
            // from where we clicked. Thats why we saved the offset and use it here
            myState.selection.x = cords.x - myState.dragoffx;
            myState.selection.y = cords.y - myState.dragoffy;
            myState.valid = false; // Something's dragging so we must redraw
        } else if(myState.stroking) {
            myState.addShape(new Shape("stroke", cords.x, cords.y, 0, 0, null, null));
        }
    }
    function shapeStartsMoving(cords) {
        var shapes = myState.shapes;
        var l = shapes.length;
        for(var i = l - 1; i >= 0; i--) {
            if(shapes[i].contains(cords.x, cords.y) && shapes[i].type !== "stroke") {
                var mySel = shapes[i];
                // Keep track of where in the object we clicked
                // so we can move it smoothly (see mousemove)
                myState.dragoffx = cords.x - mySel.x;
                myState.dragoffy = cords.y - mySel.y;
                myState.dragging = true;
                myState.selection = mySel;
                myState.valid = false;
                return;
            }
        }
        // havent returned means we have failed to select anything.
        // If there was an object selected, we deselect it
        if(myState.selection) {
            myState.selection = null;
            myState.valid = false; // Need to clear the old selection border
        }

        if(myState.stroke) {
            myState.stroking = true;
        }
    }
    function shapeEndMoving(cords) {
        if(myState.stroking) {
            myState.addShape(new Shape("stroke", null, null, 0, 0, null, null));
        }
        myState.dragging = false;
        myState.stroking = false;
        myState.lastStrokeCoords.x = null;
        myState.lastStrokeCoords.y = null;
    }


    // double click for making new shapes
    canvas.addEventListener('dblclick', function(e) {
        var mouse = myState.getPosition(e);
        myState.addShape(new Shape("rect", mouse.x - 10, mouse.y - 10, 20, 20, null,"rgba(0,255,0,.6)"));
    }, true);

    // **** Options! ****

    this.selectionColor = '#CC0000';
    this.selectionWidth = 2;
    this.interval = 30;
    setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addShape = function(shape) {
  // Add the shape to the array then CanvasState.prototype.draw will draw on interval
  this.shapes.push(shape);
  this.valid = false;
}

CanvasState.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);
}

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
  // if our state is invalid, redraw and validate!
  if (!this.valid) {
    var ctx = this.ctx;
    var shapes = this.shapes;
    this.clear();
    
    // ** Add stuff you want drawn in the background all the time here **
    
    // draw all shapes
    var l = shapes.length;
    for (var i = 0; i < l; i++) {
      var shape = shapes[i];
      // We can skip the drawing of elements that have moved off the screen:
      if (shape.x > this.width || shape.y > this.height ||
          shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
      shapes[i].draw(ctx);
    }
    
    // draw selection
    // right now this is just a stroke along the edge of the selected Shape
    if (this.selection != null) {
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = this.selectionWidth;
      var mySel = this.selection;
      ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
    }
    
    // ** Add stuff you want drawn on top all the time here **
    
    this.valid = true;
  }
}

// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getPosition = function(e) {
    var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

    // Compute the total offset
    if(element.offsetParent !== undefined) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while((element == element.offsetParent));
    }

    // Add padding and border style widths to offset
    // Also add the <html> offsets in case there's a position:fixed bar
    offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;
    // We return a simple javascript object (a hash) with x and y defined
    return { x: mx, y: my };
}

CanvasState.prototype.checkTouchClick = function() {
    // TODO: move to add default/userdefined shape function
    if(this.endTime - this.startTime < 200 && (this.startCords.x === this.endCords.x && this.startCords.y === this.endCords.y) && touchEditor.CanvasSettings.selectedShape !== null) {
        if(touchEditor.CanvasSettings.selectedShape === "circle") {
            this.addShape(new Shape(touchEditor.CanvasSettings.selectedShape, this.startCords.x - 30, this.startCords.y - 30, 60, 60, null, "black)", 30));
        } else if(touchEditor.CanvasSettings.selectedShape === "rect") {
            this.addShape(new Shape(touchEditor.CanvasSettings.selectedShape, this.startCords.x - 15, this.startCords.y - 15, 30, 30, null, "rgba(0,255,0,.6)"));
        } else if(touchEditor.CanvasSettings.selectedShape === "line") {
            this.addShape(new Shape(touchEditor.CanvasSettings.selectedShape, this.startCords.x - 25, this.startCords.y - 2, 60, 5, null, "#CCCCCC"));
        } else if(touchEditor.CanvasSettings.selectedShape === "text") {
            // TODO: Do Stuff related to text
        } else if(touchEditor.CanvasSettings.selectedShape === "stroke") {

        }
        touchEditor.CanvasSettings.selectedShape = null;
        touchEditor.DeSelectAllShapes();
    }
}

function roundedRect(ctx,x,y,width,height,radius){
  ctx.beginPath();
  ctx.moveTo(x,y+radius);
  ctx.lineTo(x,y+height-radius);
  ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
  ctx.lineTo(x+width-radius,y+height);
  ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
  ctx.lineTo(x+width,y+radius);
  ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
  ctx.lineTo(x+radius,y);
  ctx.quadraticCurveTo(x,y,x,y+radius);
  ctx.stroke();
}