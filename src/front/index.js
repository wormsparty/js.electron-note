async function clic() {
	const files = await window.api.getFiles();
	console.log('Files = ');
	console.log(files);
}

function draw() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;

  ctx.fillRect(300, 300, 40, 60);

  ctx.beginPath();
  ctx.moveTo(75, 50);
  ctx.lineTo(100, 75);
  ctx.lineTo(100, 25);
  ctx.fill();

  ctx.fillText("coucou", 100, 100);
}

function onresize() {
	const canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	draw();
}

document.addEventListener("DOMContentLoaded", (event) => {
	const menu = document.getElementById('menu');
	menu.style.display = 'none';

	document.getElementById('close').addEventListener('click', () => {
console.log('close');
		menu.style.display = 'none';
	});
	
	document.getElementById('open').addEventListener('click', () => {
console.log('display');
		menu.style.display = 'block';
	});
	
	onresize();
});

window.addEventListener("resize", (event) => {
	onresize();
});
