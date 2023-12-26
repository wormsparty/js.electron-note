const grid = { 
	width: 64, 
	height: 24,
	map: [],
	charSize: [ 0, 0 ],
	currentX: 32,
	currentY: 12,
};

grid.map = Array.from('.'.repeat(grid.width * grid.height));

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
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  let scaleX;
  let scaleY;

  if (window.innerWidth < 1024) {
    scaleX = window.innerWidth / 1024;
  } else {
    scaleX = 1;
  }

  if (window.innerHeight < 768) {
    scaleY = window.innerHeight / 768;
  } else {
    scaleY = 1;
  }
  
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

window.addEventListener("keydown", (event) => {
	if (event.key === 'ArrowUp') {
		if (grid.currentY > 0) {
			grid.currentY--;
		}
	} else if (event.key === 'ArrowDown') {
		if (grid.currentY < grid.height - 1) {
			grid.currentY++;
		}
	} else if (event.key === 'ArrowLeft') {
		if (grid.currentX > 0) {
			grid.currentX--;
		}
	} else if (event.key === 'ArrowRight') {
		if (grid.currentX < grid.width - 1) {
			grid.currentX++;
		}
	} else {
		if (event.key.length === 1 && grid.currentX >= 0 && grid.currentX < grid.width && grid.currentY >= 0 && grid.currentY < grid.height) {
			grid.map[grid.currentX + grid.currentY * grid.width] = event.key;
			if (grid.currentX < grid.width - 1) {
				grid.currentX++;
			} else {
				grid.currentX = 0;

				if (grid.currentY < grid.height - 1) {
					grid.currentY++;
				}
			}
		}
	}

	onresize();
});

window.addEventListener("keyup", (event) => {
});
