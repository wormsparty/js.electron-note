const grid = { 
	width: 20, 
	height: 20,
	map: [],
	charSize: [ 0, 0 ],
};

grid.map = Array.from('@'.repeat(grid.width * grid.height));

async function clic() {
	const files = await window.api.getFiles();
	console.log('Files = ');
	console.log(files);
}

function draw() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;
  ctx.font = '32px Inconsolata';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const startx = 100;
  let posx = startx;
  let posy = 100;

  for (let i = 0; i < grid.width; i++) {
    for (let j = 0; j < grid.height; j++) {
      ctx.fillText(grid.map[i + j], posx, posy);
      posx += 16;
    }

    posy += 32;
    posx = startx;
  }
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
	
	var consoleFont = new FontFace('Inconsolata', 'url(../../data/Inconsolata.ttf)');

	consoleFont.load().then((font) => {
		document.fonts.add(font);
		onresize();
	});
});

window.addEventListener("resize", (event) => {
	onresize();
});
