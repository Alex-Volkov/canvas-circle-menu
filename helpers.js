/**
 * Created by Aleksandr Volkov on 15/03/16.
 */
var Helpers = (function () {
	var module = {
		HSVtoRGB: HSVtoRGB,
		RGBtoHSV: RGBtoHSV,
		isPointInTriangle: isPointInTriangle,
		calcTriArea: calcTriArea,
		getContrast50: getContrast50,
		getContrastYIQ: getContrastYIQ
	};

	function rgbToHex(R, G, B) {
		return toHex(R) + toHex(G) + toHex(B)
	}
	function getContrast50(color){
		var hexcolor = rgbToHex(color.r, color.g, color.b);
		console.log(hexcolor);
		return (parseInt(hexcolor, 16) > 0xffffff/2) ? 'black':'white';
	}
	function toHex(n) {
		n = parseInt(n, 10);
		if (isNaN(n)) return "00";
		n = Math.max(0, Math.min(n, 255));
		return "0123456789ABCDEF".charAt((n - n % 16) / 16)
			+ "0123456789ABCDEF".charAt(n % 16);
	}
	function getContrastYIQ(color){
		var hexcolor = rgbToHex(color.r, color.g, color.b);
		var r = parseInt(hexcolor.substr(0,2),16);
		var g = parseInt(hexcolor.substr(2,2),16);
		var b = parseInt(hexcolor.substr(4,2),16);
		var yiq = ((r*299)+(g*587)+(b*114))/1000;
		return (yiq >= 128) ? 'black' : 'white';
	}
	function HSVtoRGB(h, s, v) {
		var r, g, b, i, f, p, q, t;
		if (arguments.length === 1) {
			s = h.s, v = h.v, h = h.h;
		}
		i = Math.floor(h * 6);
		f = h * 6 - i;
		p = v * (1 - s);
		q = v * (1 - f * s);
		t = v * (1 - (1 - f) * s);
		switch (i % 6) {
			case 0:
				r = v, g = t, b = p;
				break;
			case 1:
				r = q, g = v, b = p;
				break;
			case 2:
				r = p, g = v, b = t;
				break;
			case 3:
				r = p, g = q, b = v;
				break;
			case 4:
				r = t, g = p, b = v;
				break;
			case 5:
				r = v, g = p, b = q;
				break;
		}
		return {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255)
		};
	}

	function RGBtoHSV(r, g, b) {
		if (arguments.length === 1) {
			g = r.g, b = r.b, r = r.r;
		}
		var max = Math.max(r, g, b), min = Math.min(r, g, b),
			d = max - min,
			h,
			s = (max === 0 ? 0 : d / max),
			v = max / 255;

		switch (max) {
			case min:
				h = 0;
				break;
			case r:
				h = (g - b) + d * (g < b ? 6 : 0);
				h /= 6 * d;
				break;
			case g:
				h = (b - r) + d * 2;
				h /= 6 * d;
				break;
			case b:
				h = (r - g) + d * 4;
				h /= 6 * d;
				break;
		}

		return {
			h: h,
			s: s,
			v: v
		};
	}

	// finding is the point inside of the triangle
	function isPointInTriangle(pt, v1, v2, v3) {
		var area1 = calcTriArea(pt, v1, v2) < 0;
		var area2 = calcTriArea(pt, v2, v3) < 0;
		var area3 = calcTriArea(pt, v3, v1) < 0;
		return area1 == area2 && area2 == area3;
	}

	// getting square of the triangle
	function calcTriArea(v1, v2, v3) {
		var det = (v1.x - v3.x) * (v2.y - v3.y) - (v2.x - v3.x) * (v1.y - v3.y);
		return det;
	}

	return module;
})();
