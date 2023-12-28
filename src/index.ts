import { Grid } from './types';
import { colors, obstacles } from './consts';
import font from '../assets/Inconsolata.ttf';

let grid: Grid = {} as Grid;

let currentColor = 0;
let mode = 'play'; // item, text, play
let layer = 'map'; // map, item, mob
let question = '';
let answer = '';
let answered: (a: string) => void = undefined;

const switchToMode = (newMode: string) => {
  mode = newMode;
  draw(`Mode: ${mode}`);
}

const draw = (singleMessage?: string) => {
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

  ctx.fillStyle = colors[0];
  
  if (singleMessage !== undefined) {
    ctx.fillText(singleMessage, 16, 48);	
  } else if (question) {
    ctx.fillText(question + answer, 16, 48);
  } 
}

document.addEventListener("DOMContentLoaded", () => {
	var consoleFont = new FontFace('Inconsolata', `url(${font})`);

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
	
	draw();
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
	
	draw();
};

const moveDown = () => {
	if (grid.currentY < grid.height - 1) {
		grid.currentY++;
	}
	
	draw();
};

const moveUp = () => {
	if (grid.currentY > 0) {
		grid.currentY--;
	}
	
	draw();
}

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
		question = 'Enter new map name: ';
		answer = '';
		answered = async (answer: string) => {
			const newMapName = `${answer}.json`;
			const fileExists = await (<any>window).api.fileExists(newMapName);

			if (fileExists) {
				question = '';
				draw('File already exists.');
				return;
			}

			grid.neighbors[index] = newMapName;
			await (<any>window).api.save(grid);

			newGrid = newMap(newMapName);

			if (index === 0) {
				newGrid.neighbors[3] = grid.name;
			} else if (index === 1) {
				newGrid.neighbors[2] = grid.name;
			} else if (index === 2) {
				newGrid.neighbors[1] = grid.name;
			} else {
				newGrid.neighbors[0] = grid.name;
			}

			await (<any>window).api.save(newGrid);

			question = '';
		
			grid = newGrid;
			draw(`Map ${newMapName} created`);
		}

		draw();
	} else {
		grid = await (<any>window).api.load(map);
		draw(`Loaded ${map}`);
	}
};

const write = (chr: string) => {
	grid.map[grid.currentX + grid.currentY * grid.width] = chr;
	grid.color[grid.currentX + grid.currentY * grid.width] = currentColor;
};

window.addEventListener("keydown", async (event: any) => {
	if (event.ctrlKey && event.key === 's') {
		await (<any>window).api.save(grid);
		draw(`Saved successfully.`);
		return;
	}
	
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
	
	if (event.key === 'F1') {
		switchToMode('item');
		return;
	} else if (event.key === 'F2') { 
		switchToMode('text');
		return;
	} else if (event.key === 'Delete') {
		goTo(0);
		return;
	} else if (event.key === 'Home') {
		goTo(1);
		return;
	} else if (event.key === 'End') {
		goTo(2);
		return;
	} else if (event.key === 'PageDown') {
		goTo(3);
		return;
	} else if (event.key === 'ArrowUp') {
		moveUp();
		return;
	} else if (event.key === 'ArrowDown') {
		moveDown();
		return;
	} else if (event.key === 'ArrowLeft') {
		moveLeft();
		return;
	} else if (event.key === 'ArrowRight') {
		moveRight();
		return;
	}


	if (mode !== 'play') {
		if (event.key === 'Escape') {
			switchToMode('play');
			return;
		} else if (event.key >= '1' && event.key <= '9') {
			const newColor = colors[event.key];

			if (newColor) {
				currentColor = event.key;
			}

			return;
		} else if (event.key === 'Backspace') {	
			moveLeft();	
			const color = currentColor;
			currentColor = 1;
			write(' ');
			currentColor = color;
			return;
		} else if (event.key === 'Enter') {
			moveDown();
			return;
		} else if (event.key === ' ') {
			const color = currentColor;
			currentColor = 1;
			write(' ');
			currentColor = color;
			moveRight();
			return;
		}

		if (mode === 'text') {
			if (event.key.length === 1) {
				write(event.key);
				moveRight();
			}
		} else {
			if (event.key === 'q') {
				write(obstacles[0]);
				moveRight();
			} else if (event.key == 'w') {
				write(obstacles[1]);
				moveRight();
			} else if (event.key == 'e') {
				write(obstacles[2]);
				moveRight();
			} else if (event.key == 'r') {
				write(obstacles[3]);
				moveRight();
			}	
		}

		draw();
		return;
	}

	if (mode === 'play') {
		draw();
		return;
	}

	console.log(`Unknown mode: ${mode}`);
});
