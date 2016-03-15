/**
 * Created by Aleksandr Volkov on 13/03/16.
 */
function Segments(ctx, config) {
	config = config || {};
	this.angleInc = Math.PI / 6;
	//this.angleIncDegree = this.angleInc * 57.295779513082;
	this.startAngle = 0;//Math.PI;
	this.startX = config.startX || 200;
	this.startY = config.startY || 200;
	this.startRadius = config.startRadius || 100;
	this.bgc = '#eee';
	this.segmentsColors = [];
	this.maxIteration = 50;
	this.startColor = 90;
	this.segmentsCoords = [];
	this.openedSectors = {};
	this.sectorIntervals = {};
	this.onCircleDrawSubs = [];
	this.textLinesArr = config.textLinesArr || 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim est excepturi tempora?'.split(' ');

	// defining coordinates and colors of the sector
	Segments.prototype.defineCoordsNColors = function () {
		var currentStartAngle = this.startAngle;
		this.segmentsCoords = [];
		this.segmentsColors = [];
		for (var cnt = 0; cnt < 12; cnt++) {
			//this.segmentsColors.push(this.startColor + cnt * 9);
			this.segmentsColors.push(this.getSegmentColor(null, 0, cnt));
			this.segmentsCoords.push({
				x1: parseInt((this.startRadius + this.maxIteration ) * Math.cos(currentStartAngle) + this.startX),
				y1: parseInt((this.startRadius + this.maxIteration ) * Math.sin(currentStartAngle) + this.startY),
				x2: parseInt((this.startRadius + this.maxIteration ) * Math.cos(currentStartAngle + this.angleInc) + this.startX),
				y2: parseInt((this.startRadius + this.maxIteration ) * Math.sin(currentStartAngle + this.angleInc) + this.startY)
			});
			currentStartAngle += this.angleInc;
		}
	};
	// subscriber procedure for end drawing circle event
	Segments.prototype.subscribe = function (fn) {
		this.onCircleDrawSubs.push(fn);
	};
	// getting sector number by the coordinates of the point
	Segments.prototype.findSector = function (coords) {
		var cnt = 0;
		var res;
		var sectorNumber = null;
		this.segmentsCoords.forEach(function (elem) {
			res = segments.isPointInTriangle(
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
	Segments.prototype.getSegmentColor = function (startColor, increment, segmentNumber) {
		//console.log(increment);
		var colorStr = '';
		var alfa = 1;
		//console.log((segmentNumber * 8.33) / 100,1, 1);
		var saturation = .4 + increment / 200;
		saturation = saturation > 1 ? 1 : saturation;
		var rgb = Helpers.HSVtoRGB(Math.floor(segmentNumber * 8.33) / 100, saturation, 1);
		//for (var cnt = 0; cnt < 12; cnt++) {
		colorStr = 'rgba(' + rgb.r + ', ' + rgb.g + ',' + rgb.b + ', ' + alfa + ')';
		//console.log(colorStr);
		//return 'rgba(' + (startColor + increment) + ', ' + (startColor - 200 + increment) + ', 48, 1)'
		//return 'rgba(' + (0) + ', ' + (200 + increment) + ', 0, 1)';
		//return 'rgba(' + (0) + ', 0' + ', 255, 1)';
		//console.log(segmentNumber % 6, colorStr, segmentNumber, Math.floor(segmentNumber * 8.33));
		return colorStr;
	};
	Segments.prototype.drawAllTextLines = function () {
		var startAngle = this.startAngle;
		for (var i = 0; i < this.textLinesArr.length; i++) {
			startAngle += this.angleInc;
			this.writeText(startAngle, this.textLinesArr[i]);
		}
	};
	Segments.prototype.writeText = function (angle, text) {
		ctx.save();
		ctx.font = config.font || '16px sans-serif';
		ctx.fillStyle = config.textColor || '#000';
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
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.arc(this.startX, this.startY, this.startRadius + inc / 2, startAngle, startAngle + angleInc, false);
		ctx.lineTo(this.startX, this.startY);
		ctx.fill();
		ctx.closePath();
		//ctx.restore();
		//ctx.stroke();


	};
	Segments.prototype.takeOneOut = function (sectorNumber) {
		var inc = 100;
		var maxVal = 150;
		//console.log(this.segmentsColors);
		if (typeof this.sectorIntervals[sectorNumber] == 'undefined' &&
			typeof this.openedSectors[sectorNumber] == 'undefined') {
			this.sectorIntervals[sectorNumber] = setInterval(function () {
				if (inc > maxVal) {
					clearInterval(this.sectorIntervals[sectorNumber]);
					delete this.sectorIntervals[sectorNumber];
					this.openedSectors[sectorNumber] = inc;
				} else {
					inc++;
					//console.log(this.segmentsColors[sectorNumber]);
					this.drawSegment(this.startAngle + this.angleInc * sectorNumber,
						this.segmentsColors[sectorNumber],
						this.angleInc, inc, sectorNumber);
					this.writeText(this.startAngle + this.angleInc * (sectorNumber + 1), this.textLinesArr[sectorNumber]);
				}
			}.bind(this), 10);
		}


	};

	Segments.prototype.putOneBack = function (sectorNumber) {
		var inc = 150;
		//this.clearField();

		//return false;
		//	redraw circle with one segment filled with background color
		var myInterval = setInterval(function () {
			if (inc < this.maxIteration) {
				clearInterval(myInterval);
				delete this.openedSectors[sectorNumber];
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
				this.drawAllTextLines();
				//this.writeText(this.startAngle + this.angleInc * (sectorNumber + 1), this.textLinesArr[sectorNumber]);
			}
		}.bind(this), 10);
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
	Segments.prototype.drawCircle = function (incValue, doNotClear) {
		if (typeof doNotClear == 'undefined') {
			this.clearField();
		}
		var inc = incValue || 0;
		var drawCircleInterval = setInterval(function () {
				if (inc > this.maxIteration) {
					clearInterval(drawCircleInterval);
					this.onCircleDrawSubs.forEach(function (fn) {
						fn();
					})
				} else {
					inc++;
					this.drawCircleOnce(inc);

				}
			}.bind(this),
			10);
	};
	Segments.prototype.drawExpandedCircle = function (segmentNumber) {
		var startAngle = this.startAngle;
		for (var sectorNumber in this.openedSectors) {
			if (segmentNumber != sectorNumber) {
				console.log(this.segmentsColors[sectorNumber], sectorNumber);
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
			this.writeText(startAngle, this.textLinesArr[segmentNumber]);
		}
	};
	// rotates circle
	Segments.prototype.rotateCircle = function (withExpansion) {
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
				//this.startAngle = savedStartAngle;
			}
			this.startAngle += .05;

			this.drawCircle(!!withExpansion ? cnt : 50, true);
			cnt++;

		}.bind(this), 16.6);

	};
	// finding is the point inside of the triangle
	Segments.prototype.isPointInTriangle = function (pt, v1, v2, v3) {
		var area1 = this.calcTriArea(pt, v1, v2) < 0;
		var area2 = this.calcTriArea(pt, v2, v3) < 0;
		var area3 = this.calcTriArea(pt, v3, v1) < 0;
		return area1 == area2 && area2 == area3;
	};
	// getting square of the triangle
	Segments.prototype.calcTriArea = function (v1, v2, v3) {
		var det = (v1.x - v3.x) * (v2.y - v3.y) - (v2.x - v3.x) * (v1.y - v3.y);
		return det;
	};

	this.defineCoordsNColors();

}
