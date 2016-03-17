/**
 * Created by Aleksandr Volkov on 13/03/16.
 */
// TODO
// 1. it should return object with url, text and id on click +
// 1a. i need to transform array to the object with text and Urls +
// 2. it should return correct index of clicked item +
// 3. it should rotate the wheel before expand if clicked point is on the left side of X coordinate of center +
// 4. it should return correct item if clicked menu does not have subitems +
// 5. need to add callback to rotate function +
// 6. i need to add a list of data which return after click
function Segments(ctx, config) {
	config = config || {};
	this.angleInc = Math.PI / 6;
	//this.angleIncDegree = this.angleInc * 57.295779513082;
	this.startAngle = 0;//Math.PI;
	this.startX = config.startX || 200;
	this.startY = config.startY || 200;
	this.startRadius = config.startRadius || 100;
	this.segmentsColors = [];
	this.maxIteration = 30;
	this.segmentsCoords = [];
	this.openedSectors = {};
	this.openedSubSectorsSector = null;
	this.sectorIntervals = {};
	this.subSectorIntervals = {};
	this.onCircleDrawSubs = [];
	this.testData = {menu: [], subMenu: {}};
	this.data = config.data || {};
	this.subMenu = {};

	// defining coordinates and colors of the sector
	Segments.prototype.defineCoordsNColors = function () {
		var currentStartAngle = this.startAngle;
		this.segmentsCoords = [];
		this.segmentsColors = [];
		for (var cnt = 0; cnt < 12; cnt++) {
			//this.segmentsColors.push(this.startColor + cnt * 9);
			this.segmentsColors.push({
				colorStr: this.getSegmentColor(null, 0, cnt),
				rgb: this.getSegmentColor(null, 0, cnt, true)
			});
			this.segmentsCoords.push({
				x1: parseInt((this.startRadius + this.maxIteration ) * Math.cos(currentStartAngle) + this.startX),
				y1: parseInt((this.startRadius + this.maxIteration ) * Math.sin(currentStartAngle) + this.startY),
				x2: parseInt((this.startRadius + this.maxIteration ) * Math.cos(currentStartAngle + this.angleInc) + this.startX),
				y2: parseInt((this.startRadius + this.maxIteration ) * Math.sin(currentStartAngle + this.angleInc) + this.startY)
			});
			currentStartAngle += this.angleInc;
		}
	};
	// subscriber procedure for on end drawing circle event
	Segments.prototype.onCircleDrawComplete = function (fn) {
		this.onCircleDrawSubs.push(fn);
	};
	// getting sector number by the coordinates of the point
	Segments.prototype.findSector = function (coords) {
		var cnt = 0;
		var res;
		var sectorNumber = null;
		this.segmentsCoords.forEach(function (elem) {
			res = Helpers.isPointInTriangle(
				{x: coords.x, y: coords.y},
				{x: this.startX, y: this.startY},
				{x: elem.x1, y: elem.y1},
				{x: elem.x2, y: elem.y2}
			);
			if (!!res) {
				sectorNumber = cnt;
			}
			cnt++;
		}.bind(this));
		return sectorNumber;
	};
	Segments.prototype.isSegmentExpanded = function (segmentNumber) {
		return typeof this.openedSectors[segmentNumber] != 'undefined';
	};
	Segments.prototype.getSegmentColor = function (startColor, increment, segmentNumber, returnColorObject) {
		var alfa = 1;
		var saturation = .5 + increment / 200;
		saturation = saturation > 1 ? 1 : saturation;
		var rgb = Helpers.HSVtoRGB(Math.floor(segmentNumber * 8.33) / 100, saturation, 1);
		//for (var cnt = 0; cnt < 12; cnt++) {
		colorStr = 'rgba(' + rgb.r + ', ' + rgb.g + ',' + rgb.b + ', ' + alfa + ')';
		//console.log(colorStr);
		//return 'rgba(' + (startColor + increment) + ', ' + (startColor - 200 + increment) + ', 48, 1)'
		//return 'rgba(' + (0) + ', ' + (200 + increment) + ', 0, 1)';
		//return 'rgba(' + (0) + ', 0' + ', 255, 1)';
		//console.log(segmentNumber % 6, colorStr, segmentNumber, Math.floor(segmentNumber * 8.33));
		//console.log(this.segmentsColors, segmentNumber);
		if (typeof this.segmentsColors[segmentNumber] != 'undefined') {
			this.segmentsColors[segmentNumber].textBGcolor = rgb;

		}
		return typeof returnColorObject == 'undefined' ? colorStr : rgb;
	};
	Segments.prototype.drawAllTextLines = function () {
		var startAngle = this.startAngle;
		for (var i = 0; i < this.data.menu.length; i++) {
			startAngle += this.angleInc;
			this.writeText(startAngle, this.data.menu[i].text, i);
		}
	};
	Segments.prototype.writeText = function (angle, text, segmentNumber) {
		ctx.save();
		ctx.font = config.font || '16px sans-serif';
		//console.log(Helpers.getContrastYIQ(this.segmentsColors[segmentNumber].rgb));
		//ctx.fillStyle = config.textColor || '#fff';
		ctx.fillStyle = Helpers.getContrastYIQ(this.segmentsColors[segmentNumber].textBGcolor);
		//console.log(angle );
		//ctx.setTransform(1,0, 0, 1.2, 0,0 );
		ctx.translate(this.startX, this.startY);
		ctx.rotate(angle - this.angleInc / 2);
		ctx.fillText(text, 35, 5);
		//ctx.setTransform (1, 0, 0, 1, 0, 0);
		ctx.restore();
	};

	Segments.prototype.drawSegment = function (startAngle, startColor, angleInc, inc, segmentNumber) {
		//ctx.save();
		ctx.beginPath();
		var color = this.getSegmentColor(startColor, inc, segmentNumber);
		//console.log(color, inc, segmentNumber);
		ctx.fillStyle = color;
		//console.log(ctx.fillStyle);
		//ctx.strokeStyle = this.getSegmentColor(startColor, inc);
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 1;
		ctx.arc(this.startX, this.startY, this.startRadius + inc / 2, startAngle, startAngle + angleInc, false);
		ctx.lineTo(this.startX, this.startY);
		ctx.fill();
		ctx.closePath();
		//ctx.restore();
		ctx.stroke();


	};
	Segments.prototype.takeOneOut = function (sectorNumber, cb) {
		var inc = this.startRadius;
		//var maxVal = 130;
		//console.log(this.segmentsColors);
		if (typeof this.sectorIntervals[sectorNumber] == 'undefined' &&
			typeof this.openedSectors[sectorNumber] == 'undefined') {
			this.sectorIntervals[sectorNumber] = setInterval(function () {
				if (inc > (this.startRadius + this.maxIteration)) {
					// console.log(inc, this.startRadius, this.maxIteration);
					clearInterval(this.sectorIntervals[sectorNumber]);
					delete this.sectorIntervals[sectorNumber];
					this.openedSectors[sectorNumber] = inc;
					if(cb) cb();
				} else {
					inc++;
					//console.log(this.segmentsColors[sectorNumber]);
					this.drawSegment(this.startAngle + this.angleInc * sectorNumber,
						this.segmentsColors[sectorNumber],
						this.angleInc, inc, sectorNumber);
					this.writeText(this.startAngle + this.angleInc * (sectorNumber + 1), this.data.menu[sectorNumber].text, sectorNumber);
				}
			}.bind(this), 10);
		}


	};

	Segments.prototype.putOneBack = function (sectorNumber, cb) {
		sectorNumber = parseInt(sectorNumber);
		var inc = this.startRadius + this.maxIteration;
		//	redraw circle with one segment filled with background color
		var myInterval = setInterval(function () {
			if (inc < this.maxIteration) {
				clearInterval(myInterval);
				delete this.openedSectors[sectorNumber];
				if(cb) cb(this.data.menu[sectorNumber]);
			} else {
				inc--;
				// clears view
				this.clearField();
				// draws init circle
				this.drawCircleOnce(this.maxIteration);
				// draws expanded segments
				this.drawExpandedCircle(sectorNumber);
				// draws segment which is decreased
				this.drawSegment(this.startAngle + this.angleInc * sectorNumber, this.segmentsColors[sectorNumber], this.angleInc, inc, sectorNumber);
				// adding text
				this.writeText(this.startAngle + (sectorNumber + 1) * this.angleInc, this.data.menu[sectorNumber].text, sectorNumber - 1);
				// this.drawAllTextLines();
			}
		}.bind(this), 5);
	};

	// clearing the square with a circle
	Segments.prototype.clearField = function () {
		var threshold = 100;
		ctx.clearRect(this.startX - this.startRadius - threshold,
			this.startY - this.startRadius - threshold,
			this.startX + this.startRadius + threshold,
			this.startX + this.startRadius + threshold);
	};
	// drawing single circle
	Segments.prototype.drawCircle = function (incValue, doNotClear, cb) {
		if (typeof doNotClear == 'undefined' || doNotClear == null) {
			this.clearField();
		}
		var inc = incValue || 0;
		var drawCircleInterval = setInterval(function () {
				if (inc > this.maxIteration) {
					clearInterval(drawCircleInterval);
					if (!!cb) {
						cb()
					}
					this.onCircleDrawSubs.forEach(function (fn) {
						fn();
					})
				} else {
					inc++;
					this.drawCircleOnce(inc);

				}
			}.bind(this),
			16.6);
	};
	Segments.prototype.drawExpandedCircle = function (segmentNumber) {
		var startAngle = this.startAngle;
		for (var sectorNumber in this.openedSectors) {
			if (segmentNumber != sectorNumber) {
				this.drawSegment(startAngle + sectorNumber * this.angleInc,
					this.segmentsColors[sectorNumber],
					this.angleInc,
					this.startRadius + this.maxIteration,
					sectorNumber);
			}
		}
	};
	// expanding even segments of the circle
	Segments.prototype.expandSegments = function () {
		for (var i = 0; i < 12; i++) {
			if (i % 2 == 0) {
				(function (i) {
					setTimeout(function () {
						this.takeOneOut(i)
					}.bind(this), 100 + i * 100)

				}.bind(this))(i)
			}

		}
	};
	// draws circle once
	Segments.prototype.drawCircleOnce = function (inc) {
		var startAngle = this.startAngle;
		for (var segmentNumber = 0; segmentNumber < 12; segmentNumber++) {

			this.drawSegment(startAngle, this.segmentsColors[segmentNumber], this.angleInc, inc, segmentNumber);
			startAngle += this.angleInc;
			this.writeText(startAngle, this.data.menu[segmentNumber].text, segmentNumber);
		}
	};
	// rotates circle
	Segments.prototype.rotateCircle = function (withExpansion, angleInc, cb) {
		var angleInc = angleInc || 0.05;
		console.log(angleInc);
		//var savedStartAngle = this.startAngle;
		this.openedSectors = {};
		if (!!withExpansion) {
			this.clearField();
		}
		var cnt = 20;
		var drawInterval = setInterval(function () {
			if (cnt == this.maxIteration) {
				clearInterval(drawInterval);
				this.defineCoordsNColors();
				if (cb) cb();
				//this.startAngle = savedStartAngle;
			}
			//this.startAngle += .05;
			this.startAngle += angleInc;
			this.drawCircle(!!withExpansion ? cnt : this.maxIteration, true);
			cnt++;
		}.bind(this), 10);
	};
	// draws expanded submenu
	Segments.prototype.onClick = function (coords, cb) {
		// console.log(coords);
		var sectorNumber = this.findSector(coords);
		var processClickBind = processClick.bind(this);
		if (sectorNumber !== null) {
			// defining side of a circle
			if (coords.x < this.startX && this.openedSubSectorsSector == null && JSON.stringify(this.openedSectors) == '{}') {
				this.rotateCircle(false, .2, function () {
					processClickBind();
				})
			} else {
				processClickBind();
			}

		}
		function processClick() {
			if ((!!this.data.subMenu[sectorNumber] || this.openedSubSectorsSector != null) && JSON.stringify(this.openedSectors) == '{}') {
				if (this.openedSubSectorsSector != null) {
					// closing submenus
					var res = this.data.subMenu[this.openedSubSectorsSector][sectorNumber - this.openedSubSectorsSector];
					this.hideSubmenu(this.openedSubSectorsSector, function (){
							// should return submenu item in callback
							if (cb) {
								cb(res)
							}
						})
				} else {
					// opening submenus
					this.drawSubmenu(sectorNumber, cb);

				}
			} else {
				// something is opened and it's not current sector
				if (JSON.stringify(this.openedSectors) != '{}' && typeof this.openedSectors[sectorNumber] == 'undefined') {
					for (var sector in this.openedSectors) {
						this.putOneBack(sector, cb);
					}
				} else {
					// we don't have submenu, we can return item in callback
					// for a single menu items
					if (segments.isSegmentExpanded(sectorNumber)) {
						console.log('segment back');
						this.putOneBack(sectorNumber);
						if (cb) {
							cb(this.data.menu[sectorNumber])
						}

					} else {
						this.takeOneOut(sectorNumber, cb)
					}
				}
			}
		}
	};
	// will draw submenu if it's items exist
	Segments.prototype.drawSubmenu = function (segmentNumber, cb) {
		if (!this.data.subMenu[segmentNumber]) {
			return false;
		}
		for (var subSectorNumber = 0; subSectorNumber < this.data.subMenu[segmentNumber].length; subSectorNumber++) {
			(function (subSectorNumber) {
				setTimeout(function () {
					if(!!cb && subSectorNumber == this.data.subMenu[segmentNumber].length - 1){
						cb()
					}
					var text = this.data.subMenu[segmentNumber][subSectorNumber].text;
					this.drawSubmenuSegment(segmentNumber, segmentNumber + subSectorNumber, text);
				}.bind(this), 100 + subSectorNumber * 100)

			}.bind(this))(subSectorNumber);
		}
	};
	Segments.prototype.drawSubmenuSegment = function (sectorNumber, subSectorNumber, text) {
		var inc = this.startRadius;
		var maxVal = inc + this.maxIteration;
		//if (typeof this.sectorIntervals[sectorNumber] == 'undefined' &&
		//	typeof this.openedSectors[sectorNumber] == 'undefined') {
		this.subSectorIntervals[subSectorNumber] = setInterval(function () {
			if (inc > maxVal) {
				clearInterval(this.subSectorIntervals[subSectorNumber]);
				delete this.subSectorIntervals[subSectorNumber];
				this.openedSubSectorsSector = sectorNumber;
			} else {
				inc++;
				this.drawSegment(this.startAngle + this.angleInc * subSectorNumber,
					this.segmentsColors[sectorNumber],
					this.angleInc, inc, sectorNumber);
				this.writeText(this.startAngle + this.angleInc * (subSectorNumber + 1), text, sectorNumber);
			}
		}.bind(this), 16.6);
		//}


	};
	Segments.prototype.hideSubmenu = function (sectorNumber, cb) {
		var inc = this.startRadius + this.maxIteration;
		//	redraw circle with one segment filled with background color
		var myInterval = setInterval(function () {
			if (inc < this.maxIteration) {
				clearInterval(myInterval);
				this.openedSubSectorsSector = null;
				if(!!cb) cb();
			} else {
				inc--;
				// clears view
				this.clearField();
				// draws init circle
				this.drawCircleOnce(this.maxIteration);
				// draws expanded segments
				//this.drawExpandedCircle(sectorNumber);
				// draws segment which is decreased
				for (var submenuNumber = 0; submenuNumber < this.data.subMenu[sectorNumber].length; submenuNumber++) {
					this.drawSegment(this.startAngle + this.angleInc * (sectorNumber + submenuNumber),
						this.segmentsColors[sectorNumber + submenuNumber],
						this.angleInc, inc, sectorNumber + submenuNumber);
				}
				// adding text
				this.drawAllTextLines();
			}
		}.bind(this), 10);

		//}
	};
	// test data for menu and submenu
	Segments.prototype.setTestData = function () {
		var testUrls = ['http://google.com', 'http://engadget.com', 'http://twitter.com', 'http://instagram.com'];
		var menuDummyArray = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim est excepturi tempora?'.split(' ');
		for (var i = 0; i < menuDummyArray.length; i++) {
			this.testData.menu.push({text: menuDummyArray[i], url: testUrls[Math.floor(Math.random() * 4)], id: i});
		}
		if (JSON.stringify(this.data == '{}')) {
			this.data.menu = this.testData.menu;
		}
		var dummies = 'lorem ipsum dolor omen sit'.split(' ');
		for (var i = 0; i < this.data.menu.length; i++) {
			if (i % 2 == 0) {
				for (var cnt = 0; cnt < 5; cnt++) {
					if (!this.testData.subMenu[i]) {
						this.testData.subMenu[i] = [];
					}
					this.testData.subMenu[i][cnt] = {
						text: dummies[Math.floor(Math.random() * 5)],
						url: testUrls[Math.floor(Math.random() * 4)],
						menuId: i,
						id: cnt
					};
				}
			}
		}
		this.data.subMenu = this.testData.subMenu;
	};
	this.setTestData();
	this.defineCoordsNColors();
	this.drawCircle(0, null, config.afterInit || null);
}
