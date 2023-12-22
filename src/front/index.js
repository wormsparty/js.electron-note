async function clic() {
	const files = await window.api.getFiles();
	console.log('Files = ');
	console.log(files);
}

function draw() {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.moveTo(75, 50);
  ctx.lineTo(100, 75);
  ctx.lineTo(100, 25);
  ctx.fill();
}

document.addEventListener("DOMContentLoaded", (event) => {
	draw();
});
