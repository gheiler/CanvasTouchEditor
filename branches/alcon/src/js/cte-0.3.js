/* Author: Gabriel Heiler 
   Version: 0.3
   Code: https://github.com/gheiler/CanvasTouchEditor
   License: Everyone, to do whatever they want.
*/
/*global document: false, window: false, console: false */



var ctEditor = {
    settings: { canvasHeight: 100, canvasWidth: 100, toolBoxHeight: 20, toolBoxWidth: 100, toolBoxRealHeight: null, containerSelector: null, selectedShape: null, foregroundColor: { r: 0, g: 0, b: 0 }, unDoneStrokes: null, lineWidth: 1, fontSize: 30, whomColor: null, drawingName: null },
    shapeType: { cirlce: "circle", rect: "rect", line: "line", stroke: "stroke", img: "img", text: "text" },
    initWithContainer: function (selector) {
        "use strict";
        document.ontouchmove = function (e) { e.preventDefault() };
        this.settings.containerSelector = selector;
        this.createToolBox();
        this.createCanvas();
    },
    createCanvas: function () {
        "use strict";
        // declare scope Vars
        var realHeight, realWidth, canvas, container, s;
        container = document.getElementById(this.settings.containerSelector);
        if (container) {
            // set height and width of the container I received to maximun
            container.style.width = "100%";
            container.style.height = "100%";
            container.style.overflow = "hidden";
            // then get the real height and width of the container
            realHeight = parseInt(window.getComputedStyle(container, null).getPropertyValue("height").split("px").join(""), 10);
            realWidth = parseInt(window.getComputedStyle(container, null).getPropertyValue("width").split("px").join(""), 10);
            // create the canvas with the values
            canvas = document.createElement("canvas");
            canvas.setAttribute("width", (realWidth * this.settings.canvasWidth) / 100 + "px");
            canvas.setAttribute("height", ((realHeight * this.settings.canvasHeight) / 100) - this.toolBoxRealHeight + "px");
            //canvas.style.backgroundImage = "url(../img/bg/noise.png)";

            canvas.setAttribute("id", "te_canvas");
            container.appendChild(canvas);
            s = new CanvasState(document.getElementById('te_canvas')); // Create the state object of the canvas

        } else {
            console.log("Could not find the canvas container");
        }
    },
    createToolBox: function () {
        "use strict";
        // declare scope Vars
        var realHeight, realWidth, toolBox, container, buttonPadTop = 10, buttonPadLeft = 10, buttonSizeHeight = 20, buttonSizeWidth;
        container = document.getElementById(this.settings.containerSelector);
        if (container) {
            // set height and width of the container I received to maximun
            container.style.width = "100%";
            container.style.height = "100%";

            // then get the real height and width of the container
            realHeight = parseInt(window.getComputedStyle(container, null).getPropertyValue("height"), 10);
            realWidth = parseInt(window.getComputedStyle(container, null).getPropertyValue("width"), 10);
            var calcHeight = (realHeight * this.settings.toolBoxHeight) / 100;
            if (calcHeight > 65) { calcHeight = 65; }
            this.toolBoxRealHeight = calcHeight;

            // create a div container
            toolBox = document.createElement("div");
            toolBox.setAttribute("width", (realWidth * this.settings.toolBoxWidth) / 100 + "px");
            toolBox.setAttribute("height", calcHeight + "px");
            toolBox.style.height = calcHeight + "px";
            toolBox.setAttribute("id", "te_toolbox");
            toolBox.setAttribute("class", "te-toolbox");
            container.appendChild(toolBox);

            //draw selectable shapes
            this.drawToolBoxShape("circle", toolBox);
            this.drawToolBoxShape("rect", toolBox);
            this.drawToolBoxShape("line", toolBox);
            this.drawToolBoxShape("text", toolBox);
            this.drawToolBoxShape("stroke", toolBox);
            this.drawToolBoxShape("img", toolBox);
            //this.drawToolBoxShape("cuca", toolBox);


            // draw more stuff
            // text input
            var textInputCont = document.createElement("div");
            textInputCont.setAttribute("class", "ct-text-input");
            textInputCont.innerHTML = "<input id='cte-txtText' type='text' placeholder='escribe aqui tu texto' /><div class='btn-ok' onclick='ctEditor.drawText();'>";
            container.appendChild(textInputCont);
            // file upload input
            var fileInputCont = document.createElement("div");
            fileInputCont.style.display = "none";
            fileInputCont.innerHTML = "<input type='file' id='cte-fileUpload' multiple accept='image/*' style='display:none' onchange='ctEditor.handleFiles(this.files)'>";
            container.appendChild(fileInputCont);
            // Shape Actions
            this.createShapeActions(container);
            // TODO: draw fill color picker, rubber, clear all, save
            // Actions
            this.drawToolBoxActions(toolBox);

        } else {
            console.log("Could not find the canvas container");
        }
    },
    drawToolBoxShape: function (type, toolBox) {
        "use strict";
        // create a div button container
        var btnCont = document.createElement("div");
        btnCont.setAttribute("class", "btn-container");
        btnCont.setAttribute("onclick", "ctEditor.setShape(this, '" + type + "');");
        //draw a shape
        var shape = document.createElement("div");
        shape.setAttribute("class", type);
        if (type == "text") {
            shape.innerHTML = "texto";
        }
        btnCont.appendChild(shape);
        toolBox.appendChild(btnCont);
    },
    drawToolBoxActions: function (toolBox) {
        "use strict";
        // create a div button container
        var btnCont = document.createElement("div");
        btnCont.setAttribute("class", "btn-container actions");

        //draw actions

        var plusLineWidth = document.createElement("div");
        plusLineWidth.setAttribute("class", "plus-line-width");
        plusLineWidth.setAttribute("onclick", "ctEditor.plusLineWidth()");
        btnCont.appendChild(plusLineWidth);

        var lineWidthCont = document.createElement("div");
        var lineWidth = document.createElement("div");
        lineWidth.setAttribute("class", "line-width");
        lineWidthCont.appendChild(lineWidth);
        btnCont.appendChild(lineWidthCont);

        var minusLineWidth = document.createElement("div");
        minusLineWidth.setAttribute("class", "minus-line-width");
        minusLineWidth.setAttribute("onclick", "ctEditor.minusLineWidth()");
        btnCont.appendChild(minusLineWidth);

        var colorPicker = document.createElement("div");
        colorPicker.setAttribute("class", "color-picker");
        colorPicker.setAttribute("onclick", "ctEditor.toggleColorPicker(this, 'newShapeBkg')");
        var palette = new Palette();
        foregroundColorSelector = new ColorSelector(palette);
        foregroundColorSelector.container.addEventListener('mousedown', onForegroundColorSelectorMouseDown, false);
        foregroundColorSelector.container.addEventListener('touchstart', onForegroundColorSelectorTouchStart, false);
        colorPicker.appendChild(foregroundColorSelector.container);
        colorPicker.style.backgroundColor = "rgb(" + this.settings.foregroundColor.r + "," + this.settings.foregroundColor.g + "," + this.settings.foregroundColor.b + ")";
        btnCont.appendChild(colorPicker);

        var undo = document.createElement("div");
        undo.setAttribute("class", "undo");
        undo.setAttribute("onclick", "ctEditor.undo()");
        btnCont.appendChild(undo);

        var redo = document.createElement("div");
        redo.setAttribute("class", "redo");
        redo.setAttribute("onclick", "ctEditor.redo()");
        btnCont.appendChild(redo);

        var save = document.createElement("div");
        save.setAttribute("class", "save");
        save.setAttribute("onclick", "ctEditor.save()");
        btnCont.appendChild(save);

        var load = document.createElement("div");
        load.setAttribute("class", "load");
        load.setAttribute("onclick", "ctEditor.load()");
        btnCont.appendChild(load);

        var erase = document.createElement("div");
        erase.setAttribute("class", "erase");
        erase.setAttribute("onclick", "ctEditor.erase()");
        btnCont.appendChild(erase);

        var getImage = document.createElement("div");
        getImage.setAttribute("class", "get-image");
        getImage.setAttribute("onclick", "ctEditor.getImage()");
        btnCont.appendChild(getImage);

        toolBox.appendChild(btnCont);
    },
    setShape: function (el, type) {
        "use strict";
        this.settings.selectedShape = type;
        var divShape = document.getElementById(this.settings.containerSelector);
        this.deSelectAllShapes();
        el.style.border = "2px " + this.getForegroundColorString() + " solid";
        if (type === this.shapeType.stroke) {
            myState.stroke = true;
            myState.addShape(new Stroke(null, null, 0, null)); //this is to aviod clonflicts into strokings
        } else {
            myState.stroke = false;
        }
    },
    deSelectAllShapes: function () {
        "use strict";
        var shapesContainers, i, total;
        shapesContainers = document.getElementsByClassName("btn-container"); // TODO: use the canvas container as a first filter
        total = shapesContainers.length;
        for (i = 0; i < total; i++) {
            shapesContainers[i].style.border = "none";
        }
    },
    undo: function () {
        "use strict";
        if (this.settings.unDoneStrokes === null) {
            this.settings.unDoneStrokes = new Array();
        }
        this.settings.unDoneStrokes.push(myState.shapes.pop());
        myState.valid = false;
    },
    redo: function () {
        "use strict";
        if (this.settings.unDoneStrokes !== null && this.settings.unDoneStrokes.length > 0 && myState.shapes.length > 0) {
            myState.shapes.push(this.settings.unDoneStrokes.pop());
        }
        myState.valid = false;
    },
    plusLineWidth: function () {
        "use strict";
        this.settings.lineWidth += 1;
        document.getElementsByClassName("line-width")[0].style.height = this.settings.lineWidth + "px";
    },
    minusLineWidth: function () {
        "use strict";
        if (this.settings.lineWidth > 1) {
            this.settings.lineWidth -= 1;
            document.getElementsByClassName("line-width")[0].style.height = this.settings.lineWidth + "px";
        }
    },
    save: function () {
        var projects = localStorage.getItem("projects");
        if (projects === null) {
            projects = new Array();
        } else {
            projects = JSON.parse(projects);
        }
        var project = {
            name: ctEditor.settings.drawingName,
            data: myState.shapes,
            date: new Date().getTime()
        }
        projects.push(project);
        localStorage.setItem("projects", JSON.stringify(projects));
    },
    load: function () {
        var sProjects = localStorage.getItem("projects");
        if (sProjects !== null) {
            var projects = JSON.parse(sProjects);
            // show projects list and load on click
            var projsCont = document.createElement("div");
            projsCont.setAttribute("class", "ct-projects");
            projsCont.setAttribute("id", "ctProjects");
            var title = document.createElement("h3");
            title.innerHTML = "Projects";
            var i;
            var pLength = projects.length;
            var list = document.createElement("ul");
            var cancel = document.createElement("li");
            cancel.setAttribute("onclick", "ctEditor.loadProject(null)");
            cancel.setAttribute("class", "cancel");
            cancel.innerHTML = "Cancel";
            list.appendChild(cancel)
            for (i = 0; i < pLength; i++) {
                var item = document.createElement("li");
                item.setAttribute("onclick", "ctEditor.loadProject(" + i + ")");
                item.innerHTML = projects[i].name + " - " + projects[i].date.toString();
                list.appendChild(item);
            }
            projsCont.appendChild(title);
            projsCont.appendChild(list);
            document.body.appendChild(projsCont);
        }
    },
    loadProject: function (index) {
        if (index !== null) {
            var projects = JSON.parse(localStorage.getItem("projects"));
            var genericShapes = projects[index].data;
            this.settings.drawingName = projects[index].name;
            myState.shapes = [];
            var genericShapesLength = genericShapes.length;
            var i;
            for (i = 0; i < genericShapesLength; i++) {
                var gShape = genericShapes[i];
                switch (gShape.type) {
                    case "stroke":
                        myState.shapes.push(new Stroke(gShape.x, gShape.y, gShape.w, gShape.strokeStyle));
                        break;
                    default:
                        myState.shapes.push(new Shape(gShape.type, gShape.x, gShape.y, gShape.w, gShape.h, gShape.strokeStyle, gShape.fillStyle, gShape.r, gShape.text, gShape.url, gShape.angle));
                        break;
                }
            }
            myState.valid = false;
        }
        document.body.removeChild(document.getElementById("ctProjects"));
    },
    erase: function () {
        myState.shapes = [];
        myState.valid = false;
        this.deSelectAllShapes();
    },
    getImage: function () {
        window.open(myState.canvas.toDataURL("image/png"), 'image of:' + this.settings.drawingName);
    },
    getForegroundColorString: function () {
        "use strict";
        return "rgb(" + this.settings.foregroundColor.r + "," + this.settings.foregroundColor.g + "," + this.settings.foregroundColor.b + ")";
    },
    toggleColorPicker: function (el, whomColor) {
        "use strict";
        //el.childNodes[0].toggle();
        document.getElementById("cteColorSelector").toggle();
        this.settings.whomColor = whomColor;
    },
    toggleTextInput: function () {
        "use strict";
        var el = document.getElementsByClassName("ct-text-input")[0];
        el.toggle();
        el.childNodes[0].value = "";
        el.childNodes[0].focus()
    },
    showShapeActionBar: function () {
        document.getElementsByClassName("ct-shape-actions")[0].show();
    },
    hideShapeActionBar: function () {
        document.getElementsByClassName("ct-shape-actions")[0].hide();
    },
    drawText: function () {
        "use strict";
        var text = document.getElementById("cte-txtText").value;
        myState.addShape(new Shape(ctEditor.settings.selectedShape, myState.textLocation.x, myState.textLocation.y, this.settings.fontSize, this.settings.fontSize, ctEditor.getForegroundColorString(), null, null, text));
        this.toggleTextInput();
        this.settings.selectedShape = null;
        this.deSelectAllShapes();
    },
    handleFiles: function (files) {
        if (files.length > 0) {
            var file = files[0];
            var imageType = /image.*/;
            if (!file.type.match(imageType)) {
                return;
            }
            var img = document.createElement("img");
            img.setAttribute("id", "ctUploadedImg");
            img.style.display = "none";
            img.file = file;
            document.body.appendChild(img);
            var reader = new FileReader();
            reader.onload = (function (aImg) {
                return function (e) {
                    //aImg.src = e.target.result;
                    myState.addShape(new Shape(ctEditor.shapeType.img, myState.textLocation.x, myState.textLocation.y, 0, 0, null, null, null, null, e.target.result));
                    document.body.removeChild(document.getElementById("ctUploadedImg"));
                };
            })(img);
            reader.readAsDataURL(file);
        }
    },
    createShapeActions: function (container) {
        "use strict";
        var btnCont = document.createElement("div");
        btnCont.setAttribute("class", "ct-shape-actions");

        //draw actions

        var rotateLeft = document.createElement("div");
        rotateLeft.setAttribute("class", "rotate-left");
        rotateLeft.setAttribute("onclick", "ctEditor.rotateLeft()");
        btnCont.appendChild(rotateLeft);

        var rotateRight = document.createElement("div");
        rotateRight.setAttribute("class", "rotate-right");
        rotateRight.setAttribute("onclick", "ctEditor.rotateRight()");
        btnCont.appendChild(rotateRight);

        var colorPicker = document.createElement("div");
        colorPicker.id = "shapeColor";
        colorPicker.setAttribute("class", "color-picker");
        colorPicker.setAttribute("onclick", "ctEditor.toggleColorPicker(this, 'selectedShapeBkg')");
        colorPicker.style.backgroundColor = "rgb(" + this.settings.foregroundColor.r + "," + this.settings.foregroundColor.g + "," + this.settings.foregroundColor.b + ")";
        btnCont.appendChild(colorPicker);

        var plusWidth = document.createElement("div");
        plusWidth.setAttribute("class", "plus-width");
        plusWidth.setAttribute("onclick", "ctEditor.plusWidth()");
        btnCont.appendChild(plusWidth);

        var minusWidth = document.createElement("div");
        minusWidth.setAttribute("class", "minus-width");
        minusWidth.setAttribute("onclick", "ctEditor.minusWidth()");
        btnCont.appendChild(minusWidth);

        var plusHeight = document.createElement("div");
        plusHeight.setAttribute("class", "plus-height");
        plusHeight.setAttribute("onclick", "ctEditor.plusHeight()");
        btnCont.appendChild(plusHeight);

        var minusHeight = document.createElement("div");
        minusHeight.setAttribute("class", "minus-height");
        minusHeight.setAttribute("onclick", "ctEditor.minusHeight()");
        btnCont.appendChild(minusHeight);

        var minusZIndex = document.createElement("div");
        minusZIndex.setAttribute("class", "minus-z-index");
        minusZIndex.setAttribute("onclick", "ctEditor.minusZIndex()");
        btnCont.appendChild(minusZIndex);

        var plusZIndex = document.createElement("div");
        plusZIndex.setAttribute("class", "plus-z-index");
        plusZIndex.setAttribute("onclick", "ctEditor.plusZIndex()");
        btnCont.appendChild(plusZIndex);

        var remove = document.createElement("div");
        remove.setAttribute("class", "remove");
        remove.setAttribute("onclick", "ctEditor.remove()");
        btnCont.appendChild(remove);

        container.appendChild(btnCont);
    },
    rotateLeft: function () {
        myState.shapes[myState.selectionIndex].angle += 10;
        myState.valid = false;
    },
    rotateRight: function () {
        myState.shapes[myState.selectionIndex].angle -= 10;
        myState.valid = false;
    },
    plusWidth: function () {
        if (myState.shapes[myState.selectionIndex].type !== ctEditor.shapeType.cirlce) {
            myState.shapes[myState.selectionIndex].w += 5;
        } else {
            myState.shapes[myState.selectionIndex].w += 5;
            myState.shapes[myState.selectionIndex].h += 5;
            myState.shapes[myState.selectionIndex].r += 2.5;
        }
        myState.valid = false;
    },
    minusWidth: function () {
        if (myState.shapes[myState.selectionIndex].w > 5) {
            if (myState.shapes[myState.selectionIndex].type !== ctEditor.shapeType.cirlce) {
                myState.shapes[myState.selectionIndex].w -= 5;
            } else {
                myState.shapes[myState.selectionIndex].w -= 5;
                myState.shapes[myState.selectionIndex].h -= 5;
                myState.shapes[myState.selectionIndex].r -= 2.5;
            }
            myState.valid = false;
        }
    },
    plusHeight: function () {
        if (myState.shapes[myState.selectionIndex].type !== ctEditor.shapeType.cirlce) {
            myState.shapes[myState.selectionIndex].h += 5;
        } else {
            myState.shapes[myState.selectionIndex].w += 5;
            myState.shapes[myState.selectionIndex].h += 5;
            myState.shapes[myState.selectionIndex].r += 2.5;
        }
        myState.valid = false;
    },
    minusHeight: function () {
        if (myState.shapes[myState.selectionIndex].h > 5) {
            if (myState.shapes[myState.selectionIndex].type !== ctEditor.shapeType.cirlce) {
                myState.shapes[myState.selectionIndex].h -= 5;
            } else {
                myState.shapes[myState.selectionIndex].w -= 5;
                myState.shapes[myState.selectionIndex].h -= 5;
                myState.shapes[myState.selectionIndex].r -= 2.5;
            }
            myState.valid = false;
        }
    },
    minusZIndex: function () {
        if (myState.selectionIndex > 0) {
            myState.shapes.move(myState.selectionIndex, myState.selectionIndex - 1);
            myState.selectionIndex = myState.selectionIndex - 1;
            myState.valid = false;
        }
    },
    plusZIndex: function () {
        if (myState.selectionIndex < myState.shapes.length - 1) {
            myState.shapes.move(myState.selectionIndex, myState.selectionIndex + 1);
            myState.selectionIndex = myState.selectionIndex + 1;
            myState.valid = false;
        }
    },
    remove: function () {
        myState.shapes.splice(myState.selectionIndex, 1);
        myState.selection = null;
        myState.selectionIndex = null;
        ctEditor.hideShapeActionBar();
        myState.valid = false;
    }
};


var foregroundColorSelector;
function setForegroundColor(x, y) {
	foregroundColorSelector.update( x, y );
	COLOR = foregroundColorSelector.getColor();
	ctEditor.settings.foregroundColor = COLOR;
	document.getElementsByClassName("color-picker")[0].style.backgroundColor = ctEditor.getForegroundColorString();
    document.getElementsByClassName("line-width")[0].style.backgroundColor = ctEditor.getForegroundColorString();
    if (ctEditor.settings.whomColor === "selectedShapeBkg") {
        myState.shapes[myState.selectionIndex].fillStyle = ctEditor.getForegroundColorString();
        myState.valid = false;
    }
}
function onForegroundColorSelectorMouseDown(event) {
	window.addEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
	window.addEventListener('mouseup', onForegroundColorSelectorMouseUp, false);
	setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );	
}
function onForegroundColorSelectorMouseMove(event) {
	setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
}
function onForegroundColorSelectorMouseUp(event) {
	window.removeEventListener('mousemove', onForegroundColorSelectorMouseMove, false);
	window.removeEventListener('mouseup', onForegroundColorSelectorMouseUp, false);
	setForegroundColor( event.clientX - foregroundColorSelector.container.offsetLeft, event.clientY - foregroundColorSelector.container.offsetTop );
}
function onForegroundColorSelectorTouchStart(event) {
	if(event.touches.length == 1) {
		event.preventDefault();
		setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
		window.addEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
		window.addEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
	}
}
function onForegroundColorSelectorTouchMove(event) {
	if(event.touches.length == 1) {
		event.preventDefault();
		setForegroundColor( event.touches[0].pageX - foregroundColorSelector.container.offsetLeft, event.touches[0].pageY - foregroundColorSelector.container.offsetTop );
	}
}
function onForegroundColorSelectorTouchEnd(event) {
    if (event.touches.length == 0) {
        event.preventDefault();
        window.removeEventListener('touchmove', onForegroundColorSelectorTouchMove, false);
        window.removeEventListener('touchend', onForegroundColorSelectorTouchEnd, false);
    }
}


// Thanks to:
// Simon Sarris
// www.simonsarris.com
// sarris@acm.org
// http://simonsarris.com
//
// for: canvasState, shapes and draw.
//
// customized by Gabriel Heiler

// Holds the state of the canvas context
var myState;

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(type, x, y, w, h, stroke, fill, radius, text, url, angle) {
  // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  // But we aren't checking anything else! We could put "Lalala" for the value of x 
  this.type = type || ctEditor.shapeType.line;
  this.x = x || null;
  this.y = y || null;
  this.w = w || 1;
  this.h = h || 1;
  this.r = radius || null;
  this.text = text || null;
  this.url = url || null;
  this.strokeStyle = stroke || "#000000";
  this.fillStyle = fill || null;
  this.angle = angle || 0;
}

function Stroke(x, y, w, stroke) {
    this.type = "stroke";
    this.x = x || null;
    this.y = y || null;
    this.w = w || 1;
    this.h = 1;
    this.strokeStyle = stroke || "#000000";
}
Stroke.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.strokeStyle = this.strokeStyle;
    if (myState.lastStrokeCoords.x !== null && this.x !== null) {
        ctx.moveTo(myState.lastStrokeCoords.x, myState.lastStrokeCoords.y);
        ctx.lineTo(this.x, this.y);
        ctx.lineWidth = this.w;
    } else {
        myState.lastStrokeCoords.x = this.x;
        myState.lastStrokeCoords.y = this.y;
        return;
    }
    ctx.stroke();
    myState.lastStrokeCoords.x = this.x;
    myState.lastStrokeCoords.y = this.y;
}


// Draws this shape to a given context
Shape.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.strokeStyle = this.strokeStyle;
    ctx.save();
    switch (this.type) {
        case ctEditor.shapeType.rect:
            //ctx.rect(this.x, this.y, this.w, this.h);
            if (this.angle !== 0) {
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);
                ctx.rect(0, 0, this.w, this.h);
            } else {
                ctx.rect(this.x, this.y, this.w, this.h);
            }
            break;
        case ctEditor.shapeType.cirlce:
            ctx.arc(this.x + this.r, this.y + this.r, this.r, 0, Math.PI * 2, true);
            break;
        case ctEditor.shapeType.line:
            //ctx.rect(this.x, this.y, this.w, this.h); // if not this way height is always 1px
            if (this.angle !== 0) {
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);
                ctx.rect(0, 0, this.w, this.h);
            } else {
                ctx.rect(this.x, this.y, this.w, this.h);
            }
            break;
        case ctEditor.shapeType.stroke:
            if (myState.lastStrokeCoords.x !== null && this.x !== null) {
                ctx.moveTo(myState.lastStrokeCoords.x, myState.lastStrokeCoords.y);
                ctx.lineTo(this.x, this.y);
                ctx.lineWidth = this.w;
            } else {
                myState.lastStrokeCoords.x = this.x;
                myState.lastStrokeCoords.y = this.y;
                return;
            }
            myState.lastStrokeCoords.x = this.x;
            myState.lastStrokeCoords.y = this.y;
            break;
        case ctEditor.shapeType.text:
            // TODO: Implement
            ctx.font = "italic " + this.w + "px sans-serif";
            ctx.textBaseline = 'top';
            ctx.fillText(this.text, this.x, this.y);
            return;
            break;
        case ctEditor.shapeType.img:
            var img = new Image();
            img.onload = function () {
                ctx.save();
                var shape = myState.shapes[img.getAttribute("data-id")];
                if (shape.w === 1) {
                    shape.w = img.width;
                    shape.h = img.height;
                }
                if (shape.angle !== 0) {
                    ctx.translate(shape.x, shape.y);
                    ctx.rotate(shape.angle * Math.PI / 180);
                    ctx.drawImage(img, 0, 0, shape.w, shape.h);
                } else {
                    ctx.drawImage(img, shape.x, shape.y, shape.w, shape.h);
                }
                ctx.restore();
            };
            img.setAttribute("data-id", myState.drawingIndex);
            img.src = this.url;
            return;
            break;
        default:
            break;
    }

    if (this.fillStyle !== null) {
        ctx.fillStyle = this.fillStyle;
        ctx.fill();
    } else {
        ctx.stroke();
    }
    ctx.restore();
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
    this.selectionIndex = null;
    this.dragoffx = 0; // See mousedown and mousemove events for explanation
    this.dragoffy = 0;
    this.startCords = null;
    this.startTime = null;
    this.endCords = null;
    this.endTime = null;
    this.drawingIndex = null;
    this.stroke = false;
    this.stroking = false;
    this.lastStrokeCoords = { x: null, y: null};
    this.textLocation = { x: null, y: null};

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
    }, true);
    canvas.addEventListener("touchmove", function(e) {
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
        var can = document.getElementById(ctEditor.settings.containerSelector);
        if(!e) e = event;
        return {
            x: e.pageX - can.offsetLeft,
            y: e.pageY - can.offsetTop
        };
    }
    function touchXY(e) {
        // TODO: Compare with CanvasState.prototype.getMouse and look one is better
        var can = document.getElementById(ctEditor.settings.containerSelector);
        if(!e) e = event;
        e.preventDefault();
        return { 
            x: e.targetTouches[0].pageX - can.offsetLeft,
            y: e.targetTouches[0].pageY - can.offsetTop
        };
    }

    function shapeMoving(cords) {
        if(myState.stroking) {
            //myState.addShape(new Shape("stroke", cords.x, cords.y, ctEditor.settings.lineWidth, 0, ctEditor.getForegroundColorString(), null));
            myState.addShape(new Stroke(cords.x, cords.y, ctEditor.settings.lineWidth, ctEditor.getForegroundColorString()));
        } else if(myState.dragging) {
            // We don't want to drag the object by its top-left corner, we want to drag it
            // from where we clicked. Thats why we saved the offset and use it here
            myState.selection.x = cords.x - myState.dragoffx;
            myState.selection.y = cords.y - myState.dragoffy;
            myState.valid = false; // Something's dragging so we must redraw
        }
    }
    function shapeStartsMoving(cords) {
        var shapes = myState.shapes;
        var l = shapes.length;
        for(var i = l - 1; i >= 0; i--) {
            //if(shapes[i].contains(cords.x, cords.y) && shapes[i].type !== "stroke") {
            var asd = shapes[i];
            if(shapes[i].type !== "stroke" && shapes[i].contains(cords.x, cords.y)) {
                var mySel = shapes[i];
                // Keep track of where in the object we clicked
                // so we can move it smoothly (see mousemove)
                myState.dragoffx = cords.x - mySel.x;
                myState.dragoffy = cords.y - mySel.y;
                myState.dragging = true;
                myState.selection = mySel;
                myState.selectionIndex = i;
                ctEditor.showShapeActionBar();
                myState.valid = false;
                return;
            }
        }
        // havent returned means we have failed to select anything.
        // If there was an object selected, we deselect it
        if(myState.selection) {
            myState.selection = null;
            myState.selectionIndex = null; 
            myState.valid = false; // Need to clear the old selection border
            ctEditor.settings.whomColor = null;
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
    canvas.addEventListener('dblclick', function (e) {
        var mouse = myState.getPosition(e);
        if (ctEditor.settings.selectedShape !== null) {
            myState.createDefaultShapeFromType(ctEditor.settings.selectedShape, mouse.x, mouse.y);
        }
    }, true);

    // **** Options! ****

    this.selectionColor = '#CC0000';
    this.selectionWidth = 2;
    this.interval = 66; // 15 fps
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
CanvasState.prototype.draw = function () {
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
            this.drawingIndex = i;
            shapes[i].draw(ctx);
        }
        // draw selection
        // right now this is just a stroke along the edge of the selected Shape
        if (this.selection != null) {
            ctx.strokeStyle = this.selectionColor;
            ctx.lineWidth = this.selectionWidth;
            var mySel = this.selection;
            ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
        } else {
            this.selection = null;
            this.selectionIndex = null;
            ctEditor.hideShapeActionBar();
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

CanvasState.prototype.checkTouchClick = function () {
    // TODO: move to add default/userdefined shape function
    if (this.endTime - this.startTime < 200 && (this.startCords.x === this.endCords.x && this.startCords.y === this.endCords.y) && ctEditor.settings.selectedShape !== null) {
        this.createDefaultShapeFromType(ctEditor.settings.selectedShape, this.endCords.x, this.startCords.y);
    }
}

CanvasState.prototype.createDefaultShapeFromType = function (shapeType, x, y) {
    /*if (ctEditor.settings.selectedShape === "circle") {
    this.addShape(new Shape(ctEditor.settings.selectedShape, x - 30, y - 30, 60, 60, null, ctEditor.getForegroundColorString(), 30));
    } else if (ctEditor.settings.selectedShape === "rect") {
    this.addShape(new Shape(ctEditor.settings.selectedShape, x - 15, y - 15, 30, 30, null, ctEditor.getForegroundColorString()));
    } else if (ctEditor.settings.selectedShape === "line") {
    this.addShape(new Shape(ctEditor.settings.selectedShape, x - 40, y - 1.5, 80, 3, null, ctEditor.getForegroundColorString()));
    } else if (ctEditor.settings.selectedShape === "text") {
    // TODO: Do Stuff related to text
    ctEditor.toggleTextInput();
    this.textLocation.x = x;
    this.textLocation.y = y;
    return;
    } else if (ctEditor.settings.selectedShape === "stroke") {
    // for now just do nothing...
    }*/

    switch (ctEditor.settings.selectedShape) {
        case ctEditor.shapeType.cirlce:
            this.addShape(new Shape(ctEditor.settings.selectedShape, x - 30, y - 30, 60, 60, null, ctEditor.getForegroundColorString(), 30));
            break;
        case ctEditor.shapeType.rect:
            this.addShape(new Shape(ctEditor.settings.selectedShape, x - 15, y - 15, 30, 30, null, ctEditor.getForegroundColorString()));
            break;
        case ctEditor.shapeType.line:
            this.addShape(new Shape(ctEditor.settings.selectedShape, x - 40, y - 1.5, 80, 3, null, ctEditor.getForegroundColorString()));
            break;
        case ctEditor.shapeType.text:
            ctEditor.toggleTextInput();
            this.textLocation.x = x;
            this.textLocation.y = y;
            return;
            break;
        case ctEditor.shapeType.stroke:
            // for now just do nothing...
            break;
        case ctEditor.shapeType.img:
            this.textLocation.x = x;
            this.textLocation.y = y;
            document.getElementById("cte-fileUpload").click();
            break;
        default:
            break;
    }
    ctEditor.settings.selectedShape = null;
    ctEditor.deSelectAllShapes();
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