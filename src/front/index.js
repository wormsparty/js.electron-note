// Contains the map data such as size, object positions, etc.
// See backend folder for its definition.
let grid = {};

const colors = [
  '#FFFFFF', /* white */
  '#646464', /* gray */
  '#EF2929', /* red */
  '#8AE234', /* green */
  '#FCE94F', /* yellow */
  '#32AFFF', /* blue */
  '#AD7fA8', /* magenta */
  '#34E2E2', /* cyan */
  '#050505', /* black */
];

let currentColor = 0;

function draw() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  ctx.imageSmoothingEnabled = false;
  ctx.font = '32px Inconsolata';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const scaleX = window.innerWidth / 1024;
  const scaleY = window.innerHeight / 768;
  
  const scale = Math.min(scaleX, scaleY);

  const marginLeft = (window.innerWidth - 1024 * scale) / 2;
  const marginTop = (window.innerHeight - 768 * scale) / 2;

  ctx.fillStyle = '#050505';
  
  if (marginLeft > 0) {
    ctx.fillRect(0, 0, marginLeft, window.innerHeight);
    ctx.fillRect(window.innerWidth - marginLeft, 0, marginLeft, window.innerHeight);
  }

  if (marginTop > 0) {
    ctx.fillRect(0, 0, window.innerWidth, marginTop);
    ctx.fillRect(0, window.innerHeight - marginTop, window.innerWidth, marginTop);
  }

  ctx.translate(marginLeft, marginTop);
  ctx.scale(scale, scale);
	
  let posx = 0;
  let posy = 16;

  // TODO: Optimize for less calls if the color is the same on the same line
  for (let j = 0; j < grid.height; j++) {
    for (let i = 0; i < grid.width; i++) {
      const point = grid.map[i + j * grid.width];

      if (i === grid.currentX && j === grid.currentY) {
        ctx.fillStyle = '#FFFFFF';
      } else {
        ctx.fillStyle = colors[point.c];
      }

      ctx.fillText(point.t, posx, posy);
      posx += 16;
    }

    posy += 32;
    posx = 0;
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
		menu.style.display = 'none';
	});
	
	document.getElementById('open').addEventListener('click', () => {
		menu.style.display = 'block';
	});
	
	var consoleFont = new FontFace('Inconsolata', 'url(../../data/Inconsolata.ttf)');

	consoleFont.load().then(async (font) => {
		document.fonts.add(font);
		grid = await window.api.load();
		onresize();
	});
});

window.addEventListener("resize", (event) => {
	onresize();
});

const moveLeft = () => {
	if (grid.currentX > 0) {
		grid.currentX--;
	} else {
		grid.currentX = grid.width - 1;

		if (grid.currentY > 0) {
			grid.currentY--;
		}
	}
};

const moveRight = () => {
	if (grid.currentX < grid.width - 1) {
		grid.currentX++;
	} else {
		grid.currentX = 0;

		if (grid.currentY < grid.height - 1) {
			grid.currentY++;
		}
	}
};

const write = (chr) => {
	grid.map[grid.currentX + grid.currentY * grid.width] = {
		t: chr,
		c: currentColor
	}
};

window.addEventListener("keydown", async (event) => {
	if (event.ctrlKey && event.key === 's') {
		await window.api.save(grid);
	} else if (event.key === 'ArrowUp') {
		if (grid.currentY > 0) {
			grid.currentY--;
		}
	} else if (event.key === 'ArrowDown') {
		if (grid.currentY < grid.height - 1) {
			grid.currentY++;
		}
	} else if (event.key === 'ArrowLeft') {
		moveLeft();
	} else if (event.key === 'ArrowRight') {
		moveRight();
	} else if (event.key === 'Backspace') {	
		moveLeft();	
		const color = currentColor;
		currentColor = 1;
		write('.');
		currentColor = color;
	} else if (event.key === 'Delete') {
		const color = currentColor;
		currentColor = 1;
		write('.');
		currentColor = color;
		moveRight();
	} else if (event.key >= '1' && event.key <= '9') {
		const newColor = colors[event.key];

		if (newColor) {
			currentColor = event.key;
		}
	} else {
		if (event.key.length === 1) {
			write(event.key);
			moveRight();
		}
	}

	onresize();
});
