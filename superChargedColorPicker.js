var superChargedColorPicker = function(options) {
	var div = document.createElement('div');

	var html = `<div class="circleWrapper">
					<div class="circle">
						<canvas class="circleCanvas" height="200" width="200"></canvas>
						<div class="circlePicker"></div>
					</div>
					<div class="center">
						<div class="topArc">
							<canvas class="topArcCanvas" height="100" width="100"></canvas>' +
							<div class="topArcPicker"></div>
						</div>
						<div class="botArc">
							<canvas class="botArcCanvas" height="100" width="100"></canvas>
							<div class="botArcPicker"></div>
						</div>
					</div>
					<div class="colorPicked"></div>
				</div>`;
	div.innerHTML = html;
	this.options = options;
	options.container.appendChild(div);
	var dom = options.container;
	this.colorPicked = dom.getElementsByClassName('colorPicked')[0];
	var circleCanvas = dom.getElementsByClassName('circleCanvas')[0];
	var circleContext = circleCanvas.getContext('2d');
	var topArcCanvas = dom.getElementsByClassName('topArcCanvas')[0];
	var topArcContext = topArcCanvas.getContext('2d');
	var botArcCanvas = dom.getElementsByClassName('botArcCanvas')[0];
	var botArcContext = botArcCanvas.getContext('2d');
	var wheelDiameter = 200;
	var wheelThickness = 20;
	var smallWheelDiameter = 50;
	var smallWheelThickness = 12;
	var hsv = [ 0, 100, 100 ];
	var topHandleCordinates;
	var botHandleCordinates;
	var topArcColor;
	var pickedColor;
	var _this = this;
	this.myOnchange = function(callback) {
		if (pickedColor !== undefined) {
			callback([ pickedColor[0], pickedColor[1], pickedColor[2] ]);
		}
	};

	hsv2rgb = function(hsv) {
		var h = hsv[0] / 60;
		var s = hsv[1] / 100;
		var v = hsv[2] / 100;
		var c = v * s;
		var x = c * (1 - Math.abs(h % 2 - 1));
		var m = v - c;
		var _x = ((x + m) * 255 + 0.5) | 0;
		var _c = ((c + m) * 255 + 0.5) | 0;
		var _0 = (m * 255 + 0.5) | 0;
		var _h = h | 0;
		return _h === 1
			? [ _x, _c, _0 ]
			: _h === 2
				? [ _0, _c, _x ]
				: _h === 3 ? [ _0, _x, _c ] : _h === 4 ? [ _x, _0, _c ] : _h === 5 ? [ _c, _0, _x ] : [ _c, _x, _0 ];
	};

	var getColor = function(p) {
		var hex = '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6);
		return hex;
	};

	var rgbToHex = function(r, g, b) {
		if (r > 255 || g > 255 || b > 255) throw 'Invalid color component';
		return ((r << 16) | (g << 8) | b).toString(16);
	};

	var applyAngle = function(point, angle, distance) {
		return {
			x: point.x + Math.cos(angle) * distance,
			y: point.y + Math.sin(angle) * distance
		};
	};

	this.drawWheel = function(context) {
		var center = wheelDiameter / 2;
		var radius = center - wheelThickness / 2;
		var TO_RAD = Math.PI / 180;
		var ctx = context;
		ctx.clearRect(0, 0, wheelDiameter, wheelDiameter);
		ctx.lineWidth = wheelThickness;
		for (var i = 0; i < 372; i++) {
			ctx.beginPath();
			ctx.arc(center, center, radius, (i - 90.7) * TO_RAD, (i - 89.3) * TO_RAD);
			ctx.strokeStyle = 'hsl(' + i + ',100%,50%)';
			ctx.stroke();
		}
	};

	this.drawTopArc = function(context) {
		var center = smallWheelDiameter;
		var radius = center - smallWheelThickness;
		var TO_RAD = Math.PI / 180;
		var ctx = context;
		var gradient = ctx.createLinearGradient(0, 100, 100, 100);
		gradient.addColorStop(0, '#FFFFFF');
		gradient.addColorStop(0.1, '#FFFFFF');
		gradient.addColorStop(0.9, 'hsl(' + hsv[0] + ', 100%, 50%)');
		gradient.addColorStop(1, 'hsl(' + hsv[0] + ', 100%, 50%)');
		ctx.lineWidth = smallWheelThickness;
		ctx.beginPath();
		ctx.arc(center, center, radius, Math.PI, 0);
		ctx.strokeStyle = gradient;
		ctx.stroke();
	};

	this.drawBotArc = function(context) {
		var center = smallWheelDiameter;
		var radius = center - smallWheelThickness;
		var TO_RAD = Math.PI / 180;
		var ctx = context;
		var gradient = ctx.createLinearGradient(100, 100, 0, 100);
		gradient.addColorStop(0, '#000000');
		gradient.addColorStop(0.2, '#000000');
		gradient.addColorStop(0.9, 'hsl(' + hsv[0] + ', 100%, 50%)');
		gradient.addColorStop(1, 'hsl(' + hsv[0] + ', 100%, 50%)');
		ctx.lineWidth = smallWheelThickness;
		ctx.beginPath();
		ctx.arc(center, 50, radius, 0, 1 * Math.PI);
		ctx.strokeStyle = gradient;
		ctx.stroke();
		ctx.beginPath();
	};

	var onDrag =
		// for IE, Edge, Firefox, Chrome
		'PointerEvent' in window
			? function(element, onDragStart, onDragMove) {
					var dragging = false;
					element.addEventListener('pointerdown', function(event) {
						if (event.button === 0 && onDragStart(event) !== false) {
							dragging = true;
							this.setPointerCapture(event.pointerId);
						}
					});
					element.addEventListener('pointermove', function(event) {
						if (dragging) {
							onDragMove(event);
						}
					});
					element.addEventListener('pointerup', function(event) {
						dragging = false;
						this.releasePointerCapture(event.pointerId);
					});
				}
			: // for Mobile Safari
				'ontouchend' in window
				? function(element, onDragStart, onDragMove) {
						var dragging = false;
						element.addEventListener('touchstart', function(event) {
							if (event.touches.length === 1 && onDragStart(event.touches[0]) !== false) {
								dragging = true;
								event.preventDefault();
							}
						});
						element.addEventListener('touchmove', function(event) {
							if (dragging && event.touches.length === 1) {
								event.preventDefault();
								onDragMove(event.touches[0]);
							}
						});
					}
				: // for Safari
					function(element, onDragStart, onDragMove) {
						var onMouseMove = function(event) {
							onDragMove(event);
						};
						var onMouseUp = function(event) {
							removeEventListener('mouseup', onMouseUp);
							removeEventListener('mousemove', onMouseMove);
						};
						element.addEventListener('mousedown', function(event) {
							if (event.button === 0 && onDragStart(event) !== false) {
								addEventListener('mousemove', onMouseMove);
								addEventListener('mouseup', onMouseUp);
							}
						});
					};

	this.onMoveCircleHandle = function(event) {
		var hueWheelRect = circleCanvas.getBoundingClientRect();
		var center = wheelDiameter / 2;
		var x = event.clientX - hueWheelRect.left - center;
		var y = event.clientY - hueWheelRect.top - center;
		var angle = Math.atan2(y, x);
		var arcPoint = angle * 180 / Math.PI + 90;
		if (arcPoint) {
			hsv = [ arcPoint, hsv[1], hsv[2] ];
			_this.pointColorCircle(event);
		}

		_this.redraw();

		if (topHandleCordinates) {
			_this.onMoveTopHandle(topHandleCordinates);
		}

		if (botHandleCordinates) {
			_this.onMoveBotHandle(botHandleCordinates);
		}
	};

	this.onMoveTopHandle = function(event) {
		var hueWheelRect = topArcCanvas.getBoundingClientRect();
		var center = smallWheelDiameter;
		var x = event.clientX - hueWheelRect.left - center;
		var y = event.clientY - hueWheelRect.top - center;
		var angle = Math.atan2(y, x);
		var arcPoint = angle * 180 / Math.PI + 90;
		if (arcPoint) {
			hsv = [ arcPoint, hsv[1], hsv[2] ];
			topHandleCordinates = event;
			_this.pointColorTopArcCircle(event);
		}
	};

	this.onMoveBotHandle = function(event) {
		var hueWheelRect = botArcCanvas.getBoundingClientRect();
		var center = smallWheelDiameter;
		var x = event.clientX - hueWheelRect.left - center;
		var y = event.clientY - hueWheelRect.top - center;
		var angle = Math.atan2(y, x);
		var arcPoint = angle * 180 / Math.PI + 90;
		if (arcPoint) {
			hsv = [ arcPoint, hsv[1], hsv[2] ];
			botHandleCordinates = event;
			_this.pointColorBotArcCircle(event);
		}
	};

	this.pointColorCircle = function(event) {
		var circlePicker = dom.getElementsByClassName('circlePicker')[0];
		var center = wheelDiameter / 2;
		var wheelRadius = center - wheelThickness / 2;
		var angle = (hsv[0] - 90) * Math.PI / 180;
		var hueHandleStyle = circlePicker.style;
		hueHandleStyle.display = 'block';
		hueHandleStyle.left = wheelRadius * Math.cos(angle) + (center - 9) + 'px';
		hueHandleStyle.top = wheelRadius * Math.sin(angle) + (center - 9) + 'px';

		var circleColor = circleContext.getImageData(
			wheelRadius * Math.cos(angle) + center,
			wheelRadius * Math.sin(angle) + center,
			1,
			1
		).data;
		if (circleColor[3]) {
			_this.myOnchange(_this.options.onChange);
			pickedColor = circleColor;
			_this.colorPicked.style.backgroundColor = getColor(pickedColor);
		}
	};

	this.pointColorTopArcCircle = function(event) {
		var circlePicker = dom.getElementsByClassName('topArcPicker')[0];
		var center = smallWheelDiameter;
		var wheelRadius = center - smallWheelThickness;
		var angle = (hsv[0] - 90) * Math.PI / 180;
		var hueHandleStyle = circlePicker.style;
		hueHandleStyle.display = 'block';
		var topValue = wheelRadius * Math.sin(angle) + (center - 6);
		var leftValue = wheelRadius * Math.cos(angle) + (center - 6);
		if (topValue < 38) {
			hueHandleStyle.top = topValue + 'px';
			hueHandleStyle.left = leftValue + 'px';
		} else {
			hueHandleStyle.top = '38px';
			if (leftValue > 40) {
				hueHandleStyle.left = '81px';
			}
			if (leftValue < 40) {
				hueHandleStyle.left = '6.5px';
			}
		}
		var topArcColor = topArcContext.getImageData(
			wheelRadius * Math.cos(angle) + (center - 3),
			wheelRadius * Math.sin(angle) + (center - 3),
			1,
			1
		).data;
		if (topArcColor[3]) {
			_this.myOnchange(_this.options.onChange);
			pickedColor = topArcColor;
			_this.colorPicked.style.backgroundColor = getColor(pickedColor);
		}
	};

	this.pointColorBotArcCircle = function(event) {
		var circlePicker = dom.getElementsByClassName('botArcPicker')[0];
		var center = smallWheelDiameter;
		var wheelRadius = center - smallWheelThickness;
		var angle = (hsv[0] - 90) * Math.PI / 180;
		var hueHandleStyle = circlePicker.style;
		hueHandleStyle.display = 'block';
		var topValue = wheelRadius * Math.sin(angle) + (center - 46);
		var leftValue = wheelRadius * Math.cos(angle) + (center - 6);
		if (topValue > 9) {
			hueHandleStyle.top = topValue + 'px';
			hueHandleStyle.left = leftValue + 'px';
		} else {
			hueHandleStyle.top = '9px';
			if (leftValue > 40) {
				hueHandleStyle.left = '81px';
			}
			if (leftValue < 40) {
				hueHandleStyle.left = '6.5px';
			}
		}
		var botArcColor = botArcContext.getImageData(
			wheelRadius * Math.cos(angle) + (center - 3),
			wheelRadius * Math.sin(angle) + (center - 3),
			1,
			1
		).data;
		if (botArcColor[3]) {
			_this.myOnchange(_this.options.onChange);
			pickedColor = botArcColor;
			_this.colorPicked.style.backgroundColor = getColor(botArcColor);
		}
	};

	onDrag(
		circleCanvas,
		function(event) {
			var rect = circleCanvas.getBoundingClientRect();
			if (circleContext.getImageData(event.clientX - rect.left, event.clientY - rect.top, 1, 1).data[3]) {
				_this.onMoveCircleHandle(event);
			} else {
				return false;
			}
		},
		this.onMoveCircleHandle
	);

	onDrag(
		topArcCanvas,
		function(event) {
			var rect = topArcCanvas.getBoundingClientRect();
			if (topArcContext.getImageData(event.clientX - rect.left, event.clientY - rect.top, 1, 1).data[3]) {
				_this.onMoveTopHandle(event);
			} else {
				return false;
			}
		},
		this.onMoveTopHandle
	);

	onDrag(
		botArcCanvas,
		function(event) {
			var rect = botArcCanvas.getBoundingClientRect();
			if (botArcContext.getImageData(event.clientX - rect.left, event.clientY - rect.top, 1, 1).data[3]) {
				_this.onMoveBotHandle(event);
			} else {
				return false;
			}
		},
		this.onMoveBotHandle
	);

	this.redraw = function() {
		_this.drawWheel(circleContext);

		_this.drawTopArc(topArcContext);

		_this.drawBotArc(botArcContext);
	};

	this.redraw();
};

exports.superChargedColorPicker = superChargedColorPicker;
