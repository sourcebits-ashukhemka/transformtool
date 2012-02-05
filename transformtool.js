TransformTool:(function(){
    
    
        var _transformTool;
        
        function transformTool(){
        
            var xthis;
            
            var _target;
            var _container;
            
            var _tool;
            var _targetProxy;
            var _controls;
            var _move;
            var _resize;
            
            var _action;
                    
            var _updateTarget;
            
            /********************************************** Tool Creation **************************/
            
            this.create = function(){
            
                _action = {};
                
                _controls = {};
                
                _tool = $('<div></div>');
                _tool.css({position:'relative', width:1, height:1, "z-index":1});
                
                listeners(_tool, {drag:onDrag, mouseup:onMouseUp});
                
                createTargetProxy();
                
                createControls();
                
            }
            
                    
            function createTargetProxy(){
                _targetProxy = $('<div></div>');
                _targetProxy.css({border:'1px dashed #000', position:'absolute', cursor:'hand'});
                _targetProxy.appendTo(_tool);
            }
            
            function createControls(){
                _controls.resizeSide = 10;
                _controls.rotateSide = 6;
                
                _controls.rb = {nw:null, ne:null, sw:null, se:null};
                var rszr = resizer();
                for(var rb in _controls.rb){
                    _controls.rb[rb] = createBox(rb, _controls.resizeSide, rb + "-resize");
                    _controls.rb[rb].appendTo(_tool);
                    _controls["resize" + rb] = rszr["resize" + rb];
                }
                
                _controls.rot = createBox("rot", _controls.rotateSide, "n-resize");
                _controls.rot.appendTo(_tool);
            }
            
            
            function createBox(pos, side, cursor){
                
                var boxCover = $('<div id="' + pos + '"></div>');
                boxCover.css({position:'relative'});
                
                var box = $('<div></div>');
                box.css({border:'1px solid #000', 'background-color':'#fff', position:'absolute', 'z-index':99999, width:side, height:side, cursor:cursor, left:-side/2, top:-side/2});
                box.appendTo(boxCover);
                
                return boxCover;
            }
    
            
            
            
            
            
                    
            /************************************ Common : Mouse Listeners ***************************************/
            
            function onContainerClick(event){
                if(event.currentTarget == event.target){
                    xthis.deactivate();
                    event.stopPropagation();
                }
            }
            
            function onDrag(){
                updateOriginalTarget();
            }
            
            function onMouseUp(){
                updateOriginalTarget();
            }
    
            
            
            
            
            
            
            
            
            
            /***************************************** Tool Control **********************************************/
            
            function addToView(){
            
                _tool.appendTo(_container);
                
                var tp = getProperties(_target);
                
                resetTool(_target, true);
                updateTargetProxy(tp.w, tp.h);
                resetTargetProxy();
                resetControls();
                _target.hide();
                updateDraggable();
            }
            
            function updateDraggable(){
            
                _tool.draggable("destroy");
                var tc = getProperties(_container);
                var tzp = _container.offset();
                var tb = getBounds(_tool.rotation());
                _tool.draggable({containment: [tzp.left + (tb.right-tb.left)/2, tzp.top + (tb.bottom-tb.top)/2, tzp.left + tc.w - (tb.right-tb.left)/2, tzp.top + tc.h - (tb.bottom-tb.top)/2], scroll: false});
                
            }
            
            
            function prepareTargetProxy(){
                _targetProxy.css('background-image', 'url(' + _target.attr('src') + ')');
                _targetProxy.css('background-repeat', 'no-repeat');
                _targetProxy.css('background-size', '100%');
            }
            
            function resetTargetProxy(){
                
                var tp = getProperties(_targetProxy);
            
                _targetProxy.css("left",     -tp.w/2);
                _targetProxy.css("top",     -tp.h/2);
            }
            
            function updateTargetProxy(width, height){
                _targetProxy.css("width", width);
                _targetProxy.css("height", height);
            }
            
            function resetControls(){
                
                for(var rb in _controls.rb){
                
                    var resizeBox = _controls.rb[rb];
                    var p = getCorner(rb);
                    resizeBox.css("left", p.x);
                    resizeBox.css("top", p.y);
                    
                    if(!_resize){
                        resizeBox.hide();
                    }else{
                        resizeBox.show();
                    }
                
                }
                
                var rp = getTopCenter();
                _controls.rot.css("left", rp.x);
                _controls.rot.css("top", rp.y);
                
                if(!_resize){
                    _controls.rot.hide();
                }else{
                    _controls.rot.show();
                }
            
            }
            
            
            
            function resetTool(t, add){
            
                var tp = getProperties(t);
                    
                if(add){
                    _tool.rotate(t.rotation());
                    positionTool(tp.x + tp.w/2, tp.y + tp.h/2);
                }else{
                    var tpnow = {x:tp.x, y:tp.y};
                    var twp = getProperties(_tool);
                    var tpafter = {x:-tp.w/2, y:-tp.h/2};
                    var change = {x:(tpafter.x-tpnow.x), y:(tpafter.y-tpnow.y)};
                    adjustForRotation(change);
                    positionTool(twp.x - change.x, twp.y - change.y);
                }
                
                
                    
            }
            
            function positionTool(left, top){
                _tool.css("left", left);    
                _tool.css("top", top);    
            }
            
            
            
            function controls(disable){
                
                for(var rb in _controls.rb){
                    listeners(_controls.rb[rb], {mousedown:onResizeBoxMouseDown}, disable);
                }
                listeners(_controls.rot, {mousedown:onRotateMouseDown}, disable);
                
                if(_container){
                    listeners(_container, {click:onContainerClick}, disable);
                }
            
            }
            
            
            function updateOriginalTarget(){
                if(_target && typeof(_target) == 'object'){
                     
                     
                     var tp = getProperties(_targetProxy);
                     
                     _target.css("width", tp.w);    
                     _target.css("height", tp.h);    
                     
                     var twp = getProperties(_tool);
                     var change = {x:tp.w/2, y:tp.h/2};
                     
                     var position = {x:twp.x - change.x, y:twp.y - change.y};
                     _target.css("left", position.x);    
                     _target.css("top", position.y);    
                     
                     _target.rotate(_tool.rotation());
                     
                     _updateTarget({    id:_target.attr('id'),
                                     type:_target.attr('name'),
                                    title:_target.attr('title'),
                                    src:_target.attr('src'),
                                    x:parseFloat(_target.css("left")), 
                                    y:parseFloat(_target.css("top")), 
                                    w:parseFloat(_target.css("width")), 
                                    h:parseFloat(_target.css("height")),
                                    r:_target.rotation(),
                                    logo_info:_target.data("logo_info")})     
                         
                 }
            }
            
            
            
            
            
            
            
            
            /***************************************** Resize*********************************/
            
            function resizer(){
                return{
                    resizene: function(dims, dx, dy){
                        dims.width = _action.resizeInfo.w + dx;
                        dims.height = _action.resizeInfo.h - dy;
                        adjustAspectRatio(dims);
                        dims.top = _action.resizeInfo.y - (dims.height - _action.resizeInfo.h);
                        if(checkResizeConstrains(dims)){
                            _targetProxy.css('top', dims.top );
                            return true;
                        }
                        return false;
                    },                
                    resizenw: function(dims, dx, dy){
                        dims.width = _action.resizeInfo.w - dx;
                        dims.height = _action.resizeInfo.h - dy;
                        adjustAspectRatio(dims);
                        dims.left = _action.resizeInfo.x - (dims.width - _action.resizeInfo.w);
                        dims.top = _action.resizeInfo.y - (dims.height - _action.resizeInfo.h);
                        if(checkResizeConstrains(dims)){
                            _targetProxy.css('left', dims.left);
                            _targetProxy.css('top', dims.top);
                            return true;
                        }
                        return false;        
                    },                
                    resizese: function(dims, dx, dy){
                        dims.width = _action.resizeInfo.w + dx;
                        dims.height = _action.resizeInfo.h + dy;
                        adjustAspectRatio(dims);
                        return checkResizeConstrains(dims);
                    },                
                    resizesw: function(dims, dx, dy){
                        dims.width = _action.resizeInfo.w - dx;
                        dims.height = _action.resizeInfo.h + dy;
                        adjustAspectRatio(dims);
                        dims.left = _action.resizeInfo.x - (dims.width - _action.resizeInfo.w);
                        if(checkResizeConstrains(dims)){
                            _targetProxy.css('left', dims.left);
                            return true;
                        }
                        return false;
                    }
                }
            }
            
            
            function adjustAspectRatio(dims){
                
                var tp = getProperties(_targetProxy);
                if(tp.w > tp.h){
                    dims.width = (dims.height/tp.h) * tp.w;
                }else{
                    dims.height = (dims.width/tp.w) * tp.h;        
                }
                
            }
            
            function checkResizeConstrains(dims){
                
                var tp = getProperties(_targetProxy);
                
                dims.left = (dims.left)?dims.left:tp.x;
                dims.top = (dims.top)?dims.top:tp.y;
                
                if(dims.width < (_controls.resizeSide * 2) || dims.height < (_controls.resizeSide * 2) ){
                    return false;
                }
                
                return checkToolBounds(_tool.rotation(), {x:dims.left, y:dims.top, w:dims.width, h:dims.height});
                
            }
            
            
            
            
            /************************************ Resize : Mouse Listeners ***************************************/
            
            function onResizeBoxMouseDown(event){
            
                _action.type = "resize";
                _action.resizeCorner  = event.currentTarget.id;
                _action.resizeBox = $(event.currentTarget);
                _action.resizeStartPoint = getInnerMousePoint(event.pageX, event.pageY);
                _action.resizeInfo = getProperties(_targetProxy);
                
                listeners(_container, {mousemove:onResizeMouseMove, mouseup:stopResizing, mousedown:stopResizing, mouseleave:stopResizing});
                listeners(_action.resizeBox, {mouseup:stopResizing});
                
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
            
            }
            
            
            function stopResizing(event){
                
                listeners(_container, {mousemove:onResizeMouseMove, mouseup:stopResizing, mousedown:stopResizing, mouseleave:stopResizing}, true);
                if(_action.resizeBox){
                    listeners(_action.resizeBox, {mouseup:stopResizing}, true);
                }
                
                resetTool(_targetProxy, false);
                resetTargetProxy();
                resetControls();
                updateDraggable();
                
                delete _action.type;
                delete _action.resizeCorner;
                delete _action.resizeBox;
                delete _action.resizeStartPoint;
                delete _action.resizeInfo;
                
                updateOriginalTarget();
                
                if(event){
                    event.stopPropagation();
                }
                
            }
            
            
            function onResizeMouseMove(event){
            
                if(_action.resizeBox){
                    
                    var pp =  getProperties(_container);
                    var pr = getContainerMousePoint(event.pageX, event.pageY);
                    if((pr.x < 0 || pr.y < 0 || pr.x > pp.w || pr.y > pp.h)){
                        stopResizing(null);
                        return;
                    }
                    
                    var relativePoint = getInnerMousePoint(event.pageX, event.pageY);
                    var change = {dw:relativePoint.x - _action.resizeStartPoint.x, dh:relativePoint.y - _action.resizeStartPoint.y};
                    var dims = {width:0, height:0};
                    var resize = false;
                    if(_controls.hasOwnProperty("resize" + _action.resizeCorner)){
                        resize = _controls["resize" + _action.resizeCorner](dims, change.dw, change.dh);
                    }
                    if(resize){
                        updateTargetProxy(dims.width, dims.height);
                        resetControls();
                    }
                    updateDraggable();
                
                }
            }
            
            
            
            
            /***************************************** Rotate *********************************/
            
            
            function checkRotateContstrains(angle){
                return checkToolBounds(angle);
            }
    
            
            
            /************************************ Rotate : Mouse Listeners ***************************************/
            
            function onRotateMouseDown(event){
                
                _action.type = "rotate";
                _action.rotateBox = $(event.currentTarget);
                var tp  = getProperties(_tool);
                _action.rotateStartAngle = angleBetweenPoints({x:tp.x, y:tp.y}, getContainerMousePoint(event.pageX, event.pageY));
                _action.targetInitialAngle = _tool.rotation();
                            
                listeners(_container, {mousemove:onRotateMouseMove, mouseup:stopRotating, mousedown:stopRotating, mouseleave:stopRotating});
                listeners(_action.rotateBox, {mouseup:stopRotating});
                        
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
                
            }
            
            
            function stopRotating(event){
                
                listeners(_container, {mousemove:onRotateMouseMove, mouseup:stopRotating, mousedown:stopRotating, mouseleave:stopRotating}, true);
                if(_action.rotateBox){
                    listeners(_action.rotateBox, {mouseup:stopRotating}, true);
                }
                
                resetTool(_targetProxy, false);
                resetTargetProxy();
                resetControls();
                updateDraggable();
                
                delete _action.type;
                delete _action.rotateBox;
                delete _action.rotateStartAngle;
                delete _action.targetInitialAngle;
                        
                updateOriginalTarget();
                        
                event.stopPropagation();
            }
            
            
            function onRotateMouseMove(event){
            
                if(_action.rotateBox){
                
                    var tp  = getProperties(_tool);
                    var currentAngle = angleBetweenPoints({x:tp.x, y:tp.y}, getContainerMousePoint(event.pageX, event.pageY));
                    
                    var newAngle = _action.targetInitialAngle - _action.rotateStartAngle + currentAngle
                    
                    if(checkRotateContstrains(newAngle)){
                        _tool.rotate(newAngle);
                    }
                    updateDraggable();
                
                }
            }
            
            
            
            /************************************ Utility Functions **********************************************/
            
            
            
            function listeners(element, functions, clear){
                for (event in functions){
                    if(clear){
                        element.unbind(event, functions[event]);
                    }else{
                        element.bind(event, functions[event]);
                    }
                }        
            }
            
            
            function adjustForRotation(v, clear, angle){
                
                var theta = ((angle)?angle:_tool.rotation()) * Math.PI / 180;
                
                var vx = v.x;
                var vy = v.y;
                
                if(clear){
                    
                    v.x = Math.cos(theta) * vx + Math.sin(theta) * vy;
                    v.y = -Math.sin(theta) * vx + Math.cos(theta) * vy;
                    
                }else{
                    
                    v.x = Math.cos(theta) * vx - Math.sin(theta) * vy;
                    v.y = Math.sin(theta) * vx + Math.cos(theta) * vy;
                
                }
                
            }
            
            
            function checkToolBounds(angle, tp){
                
                var twb = getBounds(angle, tp);
                var pp =  getProperties(_container);
                
                var tcb = getBounds();
                return     (tcb.left == twb.left || twb.left >= 0) && 
                        (tcb.top == twb.top || twb.top >= 0) &&  
                        (tcb.right == twb.right || twb.right <= pp.w) && 
                        (tcb.bottom == twb.bottom || twb.bottom <= pp.h);    
                    
            }
            
            
            /*function updateBounds(tb){
            
                if(!_bounds){
                    _bounds = $('<div/>');
                    _bounds.css("background-color", "#000");
                    _bounds.css("position", "absolute");
                    _bounds.css("z-index", "0");
                    _bounds.appendTo(_container);
                }
                
                _bounds.css("left", tb.left);
                _bounds.css("top", tb.top);
                _bounds.css("width", tb.right - tb.left);
                _bounds.css("height", tb.bottom - tb.top);
            
            }*/
            
            
            
            function getBounds(angle, tp){
            
                var twp = getProperties(_tool);
                
                var bounds = {left:twp.x, top:twp.y, right:twp.x, bottom:twp.y};
                
                for(var rb in _controls.rb){
                    
                    var c  = getCorner(rb, tp);
                    adjustForRotation(c, false, angle);
                    c.x = twp.x + c.x;
                    c.y = twp.y + c.y;
                    
                    if(c.x < bounds.left){
                        bounds.left = c.x;
                    }else if(c.x > bounds.right){
                        bounds.right = c.x;
                    }
                    
                    if(c.y < bounds.top){
                        bounds.top = c.y;
                    }else if(c.y > bounds.bottom){
                        bounds.bottom = c.y;
                    }
                    
                }
            
                return bounds;
            
            }
        
        
            function getProperties(element){
                var properties = {x:parseFloat(element.css("left")), y:parseFloat(element.css("top")), w:parseFloat(element.css("width")), h:parseFloat(element.css("height"))};
                properties.x = (properties.x)?properties.x:0;
                properties.y = (properties.y)?properties.y:0;
                properties.w = (properties.w)?properties.w:0;
                properties.h = (properties.h)?properties.h:0;
                return properties;
            }
            
            
            function getContainerMousePoint(px, py){
                var containerOffset = _container.offset();
                return {x:px - containerOffset.left, y:py - containerOffset.top};
            }
            
            
            function getInnerMousePoint(px, py){
                var mousePoint = getContainerMousePoint(px, py);
                var tp  = getProperties(_tool);
                var p = {x:mousePoint.x - tp.x, y:mousePoint.y - tp.y};
                adjustForRotation(p, true);
                return p;
            }
            
            function getTopCenter(){
                var tp = getProperties(_targetProxy);
                return {x:tp.x + tp.w/2, y:tp.y - 15};
            }
            
            function getCorner(c, tp){
                tp = tp?tp:getProperties(_targetProxy); 
                switch(c){
                    case "nw":
                        return {x:tp.x, y:tp.y};
                    case "ne":
                        return {x:tp.x + tp.w, y:tp.y};
                    case "se":
                        return {x:tp.x +  tp.w, y:tp.y +  tp.h};
                    case "sw":
                        return {x:tp.x, y:tp.y +  tp.h};
                } 
                return {x:0, y:0};
            }
            
            function angleBetweenPoints(p1, p2){
                return Math.atan2( (p2.y - p1.y) , (p2.x - p1.x) ) * 180 / Math.PI;
            }
            
            
            
            
            
            
            
            
            
            /************************** Public Methods to activate and deactivate the tool ************************/
                    
            this.activate = function(x, move, resize){
            
            
                if(_target && typeof(_target) == 'object' && typeof(_container) == 'object'){
                    updateOriginalTarget();
                    _target.show();
                }
                
                _target = x.target;
                if(_target && typeof(_target) == 'object' && typeof(_target.parent()) == 'object'){
                     
                     _move = move;
                     _resize = resize;
                    
                    _container = $(_target.parent());
                    addToView();
                    prepareTargetProxy();
                    _updateTarget = x.updateTarget;
                    controls(false);
                }
            }
            
            
            
            this.deactivate = function(){
                
                updateOriginalTarget();
                _tool.remove();
                
                controls(true);
                
                if(_target){
                    _target.show();
                     _target = null;
                }
                if(_container){
                    _container = null;
                }    
            }
            
            
            this.setRotation = function(angle){
                if(_target && typeof(_target) == 'object' && typeof(_container) == 'object'){
                    if(checkRotateContstrains(angle)){
                        _tool.rotate(angle);
                    }
                }
            }
            
            
            this.create();
            xthis = this;
        }
        
        
        
        /********************* Public Static Methods to activate and deactivate the tool ***********************/
        
        transformTool.activate = function(x, move, resize){
            if(!_transformTool){
                _transformTool = new SoSponsored.TransformTool();        
            }
            _transformTool.activate(x, move, resize);
        }
        
        transformTool.deactivate = function(target){
            if(_transformTool){
                _transformTool.deactivate();
            }
        }
        
        
        transformTool.setRotation = function(angle){
            _transformTool.setRotation(angle);
        }
        
        return transformTool;
        
    })()

