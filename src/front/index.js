// Contains the map data such as size, object positions, etc.
// See backend folder for its definition.
let grid = {};

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

  for (let j = 0; j < grid.height; j++) {
    for (let i = 0; i < grid.width; i++) {
      let ch = grid.map[i + j * grid.width];

      if (i === grid.currentX && j === grid.currentY) {
        ctx.fillStyle = '#FFFFFF';
      } else {
        ctx.fillStyle = '#646464';
      }

      ctx.fillText(ch, posx, posy);
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
	grid.map[grid.currentX + grid.currentY * grid.width] = chr;
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
		write('.');
	} else if (event.key === 'Delete') {
		write('.');
		moveRight();
	} else {
		if (event.key.length === 1) {
			write(event.key);
			moveRight();
		}
	}

	onresize();
});
