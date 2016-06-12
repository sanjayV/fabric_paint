$(function() {
	var canvas = new fabric.Canvas('canvas', 
			{ 
				'selectionColor': 'rgba(100, 100, 255, 0.1)', 
				'selectionLineWidth': 0.5,
				'isDrawingMode': false
			}
		),
		color1 = '#FF00FF',
		color2 = '#FFFFFF',
		strokeWidth = 2,
		objectNotSelected = true,
		mouseDown = false,
		currentObj = {},
		startPoints = {},
		movingPoints = {},
		endPoints = {},
		rect;

	canvas.on('object:selected', function () {
		objectNotSelected = false;
	});

	canvas.on('selection:cleared', function () {
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
				} else {
					canvas.isDrawingMode = false;
					if (currentObj['type'] === 'line') {
						currentObj['obj'].set({ x1 : startPoints.x, y1: startPoints.y });
					} else {
						currentObj['obj'].set({ left : startPoints.x, top: startPoints.y });
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
					currentObj['obj'].set({ width : Math.abs(movingPoints.x - startPoints.x), height: Math.abs(movingPoints.y - startPoints.y) });
					currentObj['obj'].setCoords();
				} else if (currentObj['type'] === 'circle') {
					currentObj['obj'].set({ radius: Math.abs(movingPoints.x - startPoints.x)/2 });
					currentObj['obj'].setCoords();
				} else if (currentObj['type'] === 'oval') {
					currentObj['obj'].set({ rx: Math.abs(movingPoints.x - startPoints.x)/2, ry: Math.abs(movingPoints.y - startPoints.y)/2 });
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
			mouseDown = false;

			if (Object.keys(currentObj).length && currentObj['type'] && currentObj['type'] !== 'pencil') {
				currentObj['fun']();
			}
		});
	}

	getCoordinates();

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

	var updateColor = function(colorType, selectedColor) {
		var activeObj = canvas.getActiveObject();
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

	var makeActive = function (parentObj, currentObj) {
		$(parentObj).find('input[type="button"]').removeClass('active');
		$(currentObj).addClass('active');
	}

	//default function
	createPencil();

	//set selected color
	$('.selectedColor1').css('background-color', color1);
	$('.selectedColor2').css('background-color', color2);


	/* events */
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
		currentObj= {};
		canvas.isDrawingMode = false;
	});
});