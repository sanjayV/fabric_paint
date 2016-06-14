$(function() {

    var canvas = new fabric.Canvas('canvas'),
        mouseDown = false,
        isFirst = true,
        addTextFlag = false,
        //itext = "",
        objectNotSelected = true,
        startPoints = {},
        movingPoints = {},
        iTextHeight = 0,
        iTextWidth = 0,
        endPoints = {};

    canvas.on('object:selected', function () {
        objectNotSelected = false;
    });

    canvas.on('selection:cleared', function () {
        objectNotSelected = true;
    });

    // custom input area
    var $itext = $('<textarea/>')
        .addClass('itext')
        /*.css({ 'width': '200px', 'height': '300px' })*/
    ;


    canvas
        .on('mouse:down', function(o) {
            if (!objectNotSelected) return false;
            mouseDown = true;
            startPoints = canvas.getPointer(o.e);


        })
        .on('mouse:move', function(o) {
            if (!mouseDown || !objectNotSelected) return false;

            movingPoints = canvas.getPointer(o.e);

            iTextHeight = Math.abs(movingPoints.y - startPoints.y);
            iTextWidth = Math.abs(movingPoints.x - startPoints.x);
            //canvas.renderAll();
        })
        .on('mouse:up', function(o) {
            endPoints = canvas.getPointer(o.e);
            mouseDown = false;

            if (addTextFlag) {
                isFirst = true;
                var itext = new fabric.IText('text', {
                        left: startPoints.x,
                        top: startPoints.y,
                        fontSize: 20,
                        fill: '#000'
                    })
                    .on('added', function(e) {
                        if (addTextFlag) {
                            this.enterEditing();
                            isFirst = false;
                        }
                    })
                    .on('editing:entered', function(e) {
                        var obj = this;
                        console.log(obj)
                        canvas.remove(obj);

                        // show input area
                        $itext.css({
                                left: obj.left,
                                top: obj.top,
                                /*'width': Math.abs(endPoints.x - startPoints.x),
                                'height': Math.abs(endPoints.y - startPoints.y),*/
                                'width': iTextWidth+'px',
                                'height': iTextHeight+'px',
                                'line-height': obj.lineHeight,
                                'font-family': obj.fontFamily,
                                'font-size': Math.floor(obj.fontSize * Math.min(obj.scaleX, obj.scaleY)) + 'px',
                                'font-weight': obj.fontWeight,
                                'font-style': obj.fontStyle,
                                color: obj.fill
                            })
                            .val(obj.text)
                            .appendTo($(canvas.wrapperEl).closest('.canvas-wrapper'));
                        // submit text by focusout
                        $itext.on('focusout', function(e) {
                            obj.exitEditing();
                            obj.set('text', $(this).val());
                            $(this).remove();
                            canvas.add(obj);
                            canvas.renderAll();
                        });

                        // focus on text
                        setTimeout(function() {
                            $itext.select();
                        }, 1);
                    });

                canvas.add(itext);
                canvas.renderAll();
                canvas.setActiveObject(itext);
            }

            addTextFlag = false;
        });

    function addText() {
        addTextFlag = true;

        //canvas.add(itext);
        //canvas.setActiveObject(itext);
    }

    $("#text").click(function() {
        addText();
    });
});
//itext.selectAll();
//itext.enterEditing();
