$(function() {
    var canvas = new fabric.Canvas('canvas', {
            'selectionColor': 'rgba(100, 100, 255, 0)',
            'selectionLineWidth': 1,
            'selectionBorderColor': 'rgba(100, 100, 255, 1)',
            'selectionDashArray': [5, 5],
            'isDrawingMode': false,
            'backgroundColor': 'rgb(255,255,255)'
        }),
        copiedObject,
        copiedObjects = new Array(),
        color1 = '#FF00FF',
        color2 = '#FFFFFF',
        fontSize = parseInt($('#fontSize').val(), 10),
        defaultText = "Add your font here",
        strokeWidth = 2,
        objectNotSelected = true,
        fontWeight = 'normal',
        textDecoration = '',
        fontStyle = 'normal',
        mouseDown = false,
        currentObj = {},
        startPoints = {},
        movingPoints = {},
        endPoints = {},
        rect;

    canvas.on('object:selected', function() {
        objectNotSelected = false;
    });

    canvas.on('selection:cleared', function() {
        objectNotSelected = true;
    });

    function getCoordinates() {
        canvas
            .on('mouse:down', function(o) {
                if (!objectNotSelected) return false;

                mouseDown = true;
                startPoints = canvas.getPointer(o.e);

                if (Object.keys(currentObj).length) {
                    if (currentObj['type'] === 'pencil') {
                        canvas.isDrawingMode = true;
                    } else if (currentObj['type'] === 'text') {
                        currentObj['obj'].set({ left: startPoints.x, top: startPoints.y });
                    } else {
                        canvas.isDrawingMode = false;
                        if (currentObj['type'] === 'line') {
                            currentObj['obj'].set({ x1: startPoints.x, y1: startPoints.y });
                        } else {
                            currentObj['obj'].set({ left: startPoints.x, top: startPoints.y });
                        }
                        currentObj['obj'].setCoords();
                        canvas.add(currentObj['obj']);
                        canvas.renderAll();
                    }
                }
            })
            .on('mouse:move', function(o) {
                if (!mouseDown || !objectNotSelected) return false;

                if (Object.keys(currentObj).length && currentObj['type'] && currentObj['type'] !== 'pencil') {
                    canvas.isDrawingMode = false;
                    movingPoints = canvas.getPointer(o.e);

                    if (currentObj['type'] === 'rect') {
                        currentObj['obj'].set({ width: Math.abs(movingPoints.x - startPoints.x), height: Math.abs(movingPoints.y - startPoints.y) });
                        currentObj['obj'].setCoords();
                    } else if (currentObj['type'] === 'circle') {
                        currentObj['obj'].set({ radius: Math.abs(movingPoints.x - startPoints.x) / 2 });
                        currentObj['obj'].setCoords();
                    } else if (currentObj['type'] === 'oval') {
                        currentObj['obj'].set({ rx: Math.abs(movingPoints.x - startPoints.x) / 2, ry: Math.abs(movingPoints.y - startPoints.y) / 2 });
                        currentObj['obj'].setCoords();
                    } else if (currentObj['type'] === 'line') {
                        currentObj['obj'].set({ x2: movingPoints.x, y2: movingPoints.y });
                        currentObj['obj'].setCoords();
                    }

                    canvas.renderAll();
                }
            })
            .on('mouse:up', function(o) {
                endPoints = o.e;

                if (Object.keys(currentObj).length && currentObj['type'] && currentObj['type'] !== 'pencil') {
                    if (currentObj['type'] === 'text' && mouseDown && objectNotSelected) {
                        canvas.add(currentObj['obj']);
                        canvas.renderAll();
                    }

                    currentObj['fun']();
                }

                mouseDown = false;
            });
    }

    getCoordinates();
    document.onkeydown = onKeyDownHandler;

    /* image upload */
    var imageUpload = function(obj) {
    	var reader = new FileReader();
        reader.onload = function(event) {
            var imgObj = new Image();
            imgObj.src = event.target.result;
            imgObj.onload = function() {
                var image = new fabric.Image(imgObj);
                image.set({
                    angle: 0,
                    //padding: 10,
                    //cornersize:10,
                    //height:110,
                    //width:110,
                    left: 10,
                    top: 10
                });
                canvas.centerObject(image);
                canvas.add(image);
                canvas.renderAll();
            }
        }

        reader.readAsDataURL(obj.target.files[0]);
    }

    function ableToShortcut() {
        /*
        TODO check all cases for this
	    
        if($("textarea").is(":focus")){
            return false;
        }
        if($(":text").is(":focus")){
            return false;
        }
        */
        return true;
    }

    function onKeyDownHandler(event) {
        var key;
        if (window.event) {
            key = window.event.keyCode;
        } else {
            key = event.keyCode;
        }

        switch (key) {
            case 46: // Ctrl+C
                if (ableToShortcut()) {
                    event.preventDefault();
                    deleteObj(false);
                }
                break;
            case 67: // Ctrl+C
                if (ableToShortcut()) {
                    if (event.ctrlKey) {
                        event.preventDefault();
                        copyCut();
                    }
                }
                break;
            case 86: // Ctrl+V
                if (ableToShortcut()) {
                    if (event.ctrlKey) {
                        event.preventDefault();
                        paste();
                    }
                }
                break;
            case 88: // Ctrl+X
                if (ableToShortcut()) {
                    if (event.ctrlKey) {
                        event.preventDefault();
                        copyCut(true);
                    }
                }
                break;
            default:
                // TODO
                break;
        }
    }

    var copyCut = function(isCut) {
        if (canvas.getActiveGroup()) {
            for (var i in canvas.getActiveGroup().objects) {
                var object = fabric.util.object.clone(canvas.getActiveGroup().objects[i]);
                object.set("top", object.top + 5);
                object.set("left", object.left + 5);
                copiedObjects[i] = object;
            }
        } else if (canvas.getActiveObject()) {
            var object = fabric.util.object.clone(canvas.getActiveObject());
            //object.set("top", object.top + 5);
            //object.set("left", object.left + 5);
            copiedObject = object;
            copiedObjects = new Array();
        }

        if (isCut !== undefined && isCut) {
            deleteObj(true);
        }
    }

    var paste = function() {
        if (copiedObjects.length > 0) {
            for (var i in copiedObjects) {
                canvas.add(copiedObjects[i]);
            }
        } else if (copiedObject) {
            var tempObj = copiedObject.clone();
            tempObj.set({ 'top': 10, 'left': 10 })
            canvas.add(tempObj);
        }
        canvas.renderAll();
    }

    var confirmation = function(isDirect) {
        if (isDirect !== undefined && isDirect === true) {
            return true;
        } else {
            return confirm('Are you sure want to delete?');
        }
    }

    var deleteObj = function(directDelete) {
        var activeObject = canvas.getActiveObject(),
            activeGroup = canvas.getActiveGroup();

        if (activeObject) {
            if (confirmation(directDelete)) {
                canvas.remove(activeObject);
            }
        } else if (activeGroup) {
            if (confirmation(directDelete)) {
                var objectsInGroup = activeGroup.getObjects();
                canvas.discardActiveGroup();
                objectsInGroup.forEach(function(object) {
                    canvas.remove(object);
                });
            }
        }
    }

    var bringToFrontBack = function(isFront) {
        var activeObject = canvas.getActiveObject(),
            activeGroup = canvas.getActiveGroup();

        if (activeObject) {
            if (isFront !== undefined && isFront == true) {
                canvas.bringToFront(activeObject);
            } else {
                canvas.sendToBack(activeObject);
            }
        } else if (activeGroup) {
            var objectsInGroup = activeGroup.getObjects();
            //canvas.discardActiveGroup();
            objectsInGroup.forEach(function(object) {
                if (isFront !== undefined && isFront == true) {
                    canvas.bringToFront(object);
                } else {
                    canvas.sendToBack(object);
                }
            });
        }
    }

    var createRectangle = function() {
        canvas.isDrawingMode = false;
        currentObj['type'] = 'rect';
        currentObj['fun'] = createRectangle;
        currentObj['obj'] = new fabric.Rect({
            stroke: color1,
            fill: color2,
            strokeWidth: strokeWidth
        });
    }

    var createCircle = function() {
        canvas.isDrawingMode = false;
        currentObj['type'] = 'circle';
        currentObj['fun'] = createCircle;
        currentObj['obj'] = new fabric.Circle({
            stroke: color1,
            fill: color2,
            strokeWidth: strokeWidth
        });
    }

    var createOval = function() {
        canvas.isDrawingMode = false;
        currentObj['type'] = 'oval';
        currentObj['fun'] = createOval;
        currentObj['obj'] = new fabric.Ellipse({
            stroke: color1,
            fill: color2,
            strokeWidth: strokeWidth
        });
    }

    var createLine = function() {
        canvas.isDrawingMode = false;
        var points = [];
        currentObj['type'] = 'line';
        currentObj['fun'] = createLine;
        currentObj['obj'] = new fabric.Line(points, {
            stroke: color1,
            fill: color2,
            strokeWidth: strokeWidth
        });
    }

    var createPencil = function() {
        canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas);
        canvas.freeDrawingBrush.color = color1;
        canvas.freeDrawingBrush.width = strokeWidth;
        currentObj['type'] = 'pencil';
        canvas.isDrawingMode = true;
    }

    var updateStroke = function(obj) {
        var activeObj = canvas.getActiveObject();

        if (!obj) {
            obj = 1;
        }

        strokeWidth = parseInt(obj, 10);

        if (activeObj) {
            activeObj.set({ strokeWidth: strokeWidth });
        }

        canvas.renderAll();
    }

    var addText = function() {
        canvas.isDrawingMode = false;
        currentObj['type'] = 'text';
        currentObj['fun'] = addText;
        currentObj['obj'] = new fabric.IText(defaultText, {
            stroke: color1,
            fill: color2,
            fontWeight: fontWeight,
            textDecoration: textDecoration,
            fontStyle: fontStyle,
            //strokeWidth: strokeWidth,
            fontSize: fontSize
        });
    }

    var updateFontSize = function(val) {
        var activeObj = getSelectedObj();
        fontSize = parseInt(val, 10);

        if (activeObj && activeObj.get('type') === 'i-text') {
            activeObj.set({ 'fontSize': fontSize });
        }

        canvas.renderAll();
    }

    var updateFontWeight = function(styleObj) {
        var activeObj = getSelectedObj();
        var style = styleObj.attr('data-activeType');

        if (!styleObj.hasClass('active')) {
            style = styleObj.attr('data-inActiveType');
        }

        if (activeObj && activeObj.get('type') === 'i-text') {
            fontWeight = style;
            activeObj.set({ 'fontWeight': style });
        }

        canvas.renderAll();
    }

    var updateFontStyle = function(styleObj) {
        var activeObj = getSelectedObj();
        var style = styleObj.attr('data-activeType');

        if (!styleObj.hasClass('active')) {
            style = styleObj.attr('data-inActiveType');
        }

        if (activeObj && activeObj.get('type') === 'i-text') {
            fontStyle = style;
            activeObj.set({ 'fontStyle': style });
        }

        canvas.renderAll();
    }

    var updateTextDecoration = function(styleObj) {
        var activeObj = getSelectedObj();
        var style = styleObj.attr('data-activeType');

        if (!styleObj.hasClass('active')) {
            style = styleObj.attr('data-inActiveType');
        }

        if (activeObj && activeObj.get('type') === 'i-text') {
            textDecoration = style;
            activeObj.set({ 'textDecoration': style });
        }

        canvas.renderAll();
    }

    var updateColor = function(colorType, selectedColor) {
        var activeObj = getSelectedObj();
        if (colorType === 'color2') {
            //change background color
            color2 = selectedColor;
            $('.selectedColor2').css('background-color', color2);

            if (activeObj) {
                activeObj.set({ fill: color2 });
            }
        } else {
            //change stroke color
            color1 = selectedColor;
            $('.selectedColor1').css('background-color', color1);

            if (activeObj) {
                activeObj.set({ stroke: color1 });
            }
        }

        canvas.renderAll();
    }

    var getSelectedObj = function() {
        return canvas.getActiveObject();
    }

    var makeActive = function(parentObj, currentObj, inActiveFlag) {
        if (parentObj) {
            $(parentObj).find('input[type="button"]').removeClass('active');
        }

        if (inActiveFlag !== undefined && $(currentObj).hasClass('active')) {
            $(currentObj).removeClass('active');
        } else {
            $(currentObj).addClass('active');
        }
    }

    var saveImage = function (e) {
        e.href = canvas.toDataURL({
            format: 'jpg',
            quality: 1
        });
        e.download = 'canvas.jpg'
    }

    //default function
    createPencil();

    //set selected color
    $('.selectedColor1').css('background-color', color1);
    $('.selectedColor2').css('background-color', color2);


    /* events */
    $('#imageUpload').change(function(e) {
    	imageUpload(e);
    	currentObj = {};
        canvas.isDrawingMode = false;
    })

    $('#cut').click(function() {
        copyCut(true);
    });

    $('#copy').click(function() {
        copyCut();
    });

    $('#paste').click(function() {
        paste();
    });

    $('#delete').click(function() {
        deleteObj(false);
    });

    $('#seToFront').click(function() {
        bringToFrontBack(true);
    });

    $('#seToBack').click(function() {
        bringToFrontBack(false);
    });

    $('#save').click(function() {
        saveImage(this);
    });

    $('#rect').click(function() {
        createRectangle();
        makeActive('.shaps', this);
    });

    $('#circle').click(function() {
        createCircle();
        makeActive('.shaps', this);
    });

    $('#oval').click(function() {
        createOval();
        makeActive('.shaps', this);
    });

    $('#line').click(function() {
        createLine();
        makeActive('.shaps', this);
    });

    $('#pencil').click(function() {
        createPencil();
        makeActive('.shaps', this);
    });

    $("#fontSize").bind('keyup blur', function(e) {
        if (e.keyCode == 13 || e.type == 'blur') {
            if (!isNaN($(this).val())) {
                updateFontSize($(this).val());
            }
        }
    });

    $('#addText').click(function() {
        addText();
        makeActive('.text-add', this);
    });

    $("#bold").click(function() {
        makeActive('', this, true);
        updateFontWeight($(this));
    });

    $("#italic").click(function() {
        makeActive('', this, true);
        updateFontStyle($(this));
    });

    $("#underLine").click(function() {
        makeActive('', this, true);
        updateTextDecoration($(this));
    });

    $('.strokeWidth').unbind('click').click(function() {
        updateStroke($(this).attr('data-sw'));
        makeActive('.stroke', this);
    });

    $('.colorBtn').unbind('click').click(function() {
        makeActive('.ColorBox', this);
    });

    $('.color').unbind('click').click(function() {
        updateColor($('.colorBtn.active').attr('data-type'), $(this).attr('data-color'));
    });

    $("#selection").click(function() {
        currentObj = {};
        canvas.isDrawingMode = false;
    });
});
