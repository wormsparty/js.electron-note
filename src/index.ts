import { Grid } from './types';
import { colors, obstacles } from './consts';

let grid: Grid = {};

let currentColor = 0;
let mode = 'edit';
let question = '';
let answer = '';
let answered: (a: string) => void = undefined;

const draw = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

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

  const ajustementLeft = window.innerWidth - 1024 * scale - marginLeft * 2;
  const ajustementTop = window.innerHeight - 768 * scale - marginTop * 2;

  ctx.fillStyle = '#050505';
  
  if (marginLeft > 0) {
    ctx.fillRect(0, 0, marginLeft, window.innerHeight);
    ctx.fillRect(window.innerWidth - marginLeft - ajustementLeft, 0, marginLeft, window.innerHeight);
  }

  if (marginTop > 0) {
    ctx.fillRect(0, 0, window.innerWidth, marginTop);
    ctx.fillRect(0, window.innerHeight - marginTop - ajustementTop, window.innerWidth, marginTop);
  }

  ctx.translate(marginLeft, marginTop);
  ctx.scale(scale, scale);

  let posx = 0;
  let posy = 16;

  ctx.fillStyle = colors[currentColor];
  ctx.fillRect(grid.currentX * 16, grid.currentY * 32, 16, 32);

  for (let j = 0; j < grid.height; j++) {
    let text = grid.map[j * grid.width];
    let color = grid.color[j * grid.width];

    for (let i = 1; i < grid.width; i++) {
      const newColor = grid.color[i + j * grid.width];

      if (color == newColor) {
	text += grid.map[i + j * grid.width];
      } else {
        ctx.fillStyle = colors[color];
        ctx.fillText(text, posx, posy);
        posx += text.length * 16;

	color = newColor;
	text = grid.map[i + j * grid.width];
      }
    }

    if (text.length > 0) {
      ctx.fillStyle = colors[color];
      ctx.fillText(text, posx, posy);
    }

    posy += 32;
    posx = 0;
  }

  if (question) {
    ctx.fillStyle = colors[0];
    ctx.fillText(question + answer, 16, 48);
  }
}

document.addEventListener("DOMContentLoaded", () => {
	var consoleFont = new FontFace('Inconsolata', 'url(./fonts/Inconsolata.ttf)');

	consoleFont.load().then(async (font) => {
		(<any>document).fonts.add(font);
		grid = await (<any>window).api.load('default.json');

		if (grid === null) {
			grid = newMap('default.json');
		}

		draw();
	});
});

window.addEventListener("resize", () => {
	draw();
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

const moveDown = () => {
	if (grid.currentY < grid.height - 1) {
		grid.currentY++;
	}
};

const newMap = (name: string) => {
	const mapData: Grid = {
		width: 64, 
		height: 24,
		currentX: 32,
		currentY: 12,
		map: [],
		color: [],
		neighbors: [null, null, null, null],
		name: name,
	}

	for (let i = 0; i < mapData.width * mapData.height; i++) {
		// Put gray dots by default
		mapData.map[i] = '.';
		mapData.color[i] = 1;
	}
	
	console.log('Map ' + name + ' created');
	return mapData;
}

const goTo = async (index: number) => {
	let newGrid;
	const map = grid.neighbors[index];

	if (map === null) {
		question = 'Enter map name: ';
		answer = '';
		answered = (answer: string) => {
			grid.neighbors[index] = answer;
			(<any>window).api.save(grid);

			newGrid = newMap(`${answer}.json`);

			if (index === 0) {
				newGrid.neighbors[3] = grid.name;
			} else if (index === 1) {
				newGrid.neighbors[2] = grid.name;
			} else if (index === 2) {
				newGrid.neighbors[1] = grid.name;
			} else {
				newGrid.neighbors[0] = grid.name;
			}

			(<any>window).api.save(newGrid);

			question = '';
		
			grid = newGrid;
			draw();
		}

		draw();
	} else {
		grid = await (<any>window).api.load(map);
		draw();
		console.log('Loaded ' + map);
	}
};

const write = (chr: string) => {
	grid.map[grid.currentX + grid.currentY * grid.width] = chr;
	grid.color[grid.currentX + grid.currentY * grid.width] = currentColor;
};

window.addEventListener("keydown", async (event: any) => {
	if (question) {
		if (event.key.length === 1) {
			answer += event.key;
		} else if (event.key === 'Backspace') {
			answer = answer.slice(0, -1);
		} else if (event.key === 'Enter') {
			answered(answer);
		} else if (event.key === 'Escape') {
			question = '';
		}

		draw();
		return;
	}

	if (event.ctrlKey && event.key === 's') {
		await (<any>window).api.save(grid);
	} else if (event.key === 'ArrowUp') {
		if (grid.currentY > 0) {
			grid.currentY--;
		}
	} else if (event.key === 'ArrowDown') {
		moveDown();
	} else if (event.key === 'ArrowLeft') {
		moveLeft();
	} else if (event.key === 'ArrowRight') {
		moveRight();
	} else if (event.key === 'Backspace') {	
		moveLeft();	
		const color = currentColor;
		currentColor = 1;
		write(' ');
		currentColor = color;
	} else if (event.key === 'Enter') {
		moveDown();
	} else if (event.key === ' ') {
		const color = currentColor;
		currentColor = 1;
		write(' ');
		currentColor = color;
		moveRight();
	} else if (event.key === 'Delete') {
		goTo(0);
	} else if (event.key === 'Home') {
		goTo(1);
	} else if (event.key === 'End') {
		goTo(2);
	} else if (event.key === 'PageDown') {
		goTo(3);
	} else if (event.key >= '1' && event.key <= '9') {
		const newColor = colors[event.key];

		if (newColor) {
			currentColor = event.key;
		}
	} else if (event.key.length === 1) {
		if (event.key === 'q') {
			write(obstacles[0]);
		} else if (event.key == 'w') {
			write(obstacles[1]);
		} else if (event.key == 'e') {
			write(obstacles[2]);
		} else if (event.key == 'r') {
			write(obstacles[3]);
		}

		moveRight();
	}

	draw();
});