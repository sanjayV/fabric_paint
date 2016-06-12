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

	console.log(canvas)

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


	/* events */
	$('#rect').click(function() {
		createRectangle();
	});

	$('#circle').click(function() {
		createCircle();
	});

	$('#oval').click(function() {
		createOval();
	});

	$('#line').click(function() {
		createLine();
	});

	$('#pencil').click(function() {
		createPencil();
	});

	$("#selection").click(function() {
		currentObj= {};
	});
});