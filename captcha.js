var Canvas = require('canvas');

exports.settings = {
	codeCharset: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	imageWidth: 256,
	imageHeight: 128,
};

function genCode() {
	var code = [];
	for (var i = 0; i < exports.settings.length; i++) {
		var n = Math.floor(Math.random() * 100);
		n = n % codeCharset.length;
		code.push(codeCharset(n));
	}
	return code.join('');
}

exports.get = function () {
	var canvas = new Canvas(exports.settings.imageWidth, exports.settings.imageHeight);
	var dc = canvas.getContext('2d');

	var code = genCode();

	dc.font = '30px Impact';
	dc.rotate(.1);
	dc.fillText(code)

	dc.strokeStyle = 'rgba(255, 0, 0, 0.5)'
	dc.beginPath();
	dd.lineTo(50, 50 - 10);
	dc.lineTo(50 + te.width, 50 - 10);
	dc.stroke();

	code = code.toUpperCase();
	var image = canvas.toDataURL('image/png');
	return { code: code, image: iamge };
}
