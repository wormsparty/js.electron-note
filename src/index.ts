import { Grid, State } from './types';
import { colors, obstacles } from './consts';
import font from '../assets/Inconsolata.ttf';

let grid: Grid = {} as Grid;
let state: State = {
	itemIndex: 0,
	mode: 'play',
	layer: 'map',
	question: '',
	answer: '',
	answered: undefined,
	currentX: 0,
	currentY: 0,
};

const switchToMode = (newMode: 'play' | 'text' | 'item') => {
  state.mode = newMode;
  draw(`Mode: ${state.mode}`);
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

  for (let j = 0; j < grid.height; j++) {
    let line = grid.map[j];
    let text = line[0];

    for (let i = 1; i < grid.width; i++) {
      const chr = line[i];

      if (chr == text[0]) {
        text += chr;
      } else {
        // TODO: Use grid.palette
        ctx.fillStyle = colors[0];
        ctx.fillText(text, posx, posy);
        posx += text.length * 16;

	text = chr;
      }
    }

    if (text.length > 0) {
      // TODO: Use grid.palette
      ctx.fillStyle = colors[0];
      ctx.fillText(text, posx, posy);
    }

    posy += 32;
    posx = 0;
  }
 
  if (state.mode !== 'play') {
    ctx.fillStyle = colors[0];
    ctx.fillRect(state.currentX * 16, state.currentY * 32, 16, 32);
  
    if (state.mode === 'item') {
      ctx.fillStyle = colors[8];
      ctx.fillText(obstacles[state.itemIndex], state.currentX * 16, state.currentY * 32 + 16);
    }
  } else {
    ctx.fillStyle = colors[8];
    ctx.fillRect(state.currentX * 16, state.currentY * 32, 16, 32);
    
    ctx.fillStyle = colors[2];
    ctx.fillText('@', state.currentX * 16, state.currentY * 32 + 16);
  }

  ctx.fillStyle = colors[0];
  
  if (singleMessage !== undefined) {
    ctx.fillText(singleMessage, 16, 48);	
  } else if (state.question) {
    ctx.fillText(state.question + state.answer, 16, 48);
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

		state.currentX = grid.startX;
		state.currentY = grid.startY;

		draw();
	});
});

window.addEventListener("resize", () => {
	draw();
});

const moveLeft = () => {
	if (state.currentX > 0) {
		state.currentX--;
		draw();
	} else {
		goTo(0);
	}
	
};

const moveRight = () => {
	if (state.currentX < grid.width - 1) {
		state.currentX++;
		draw();
	} else {
		goTo(3);
	}
};

const moveDown = () => {
	if (state.currentY < grid.height - 1) {
		state.currentY++;
		draw();
	} else {
		goTo(2);
	}
};

const moveUp = () => {
	if (state.currentY > 0) {
		state.currentY--;
		draw();
	} else {
		goTo(1);
	}
}

const newMap = (name: string) => {
	const mapData: Grid = {
		name: name,
		width: 64, 
		height: 24,
		startX: 32,
		startY: 12,
		map: [],
		neighbors: [null, null, null, null],
		palette: new Map<string, string>(),
	}

	for (let i = 0; i < mapData.height; i++) {
		// Put gray dots by default
		mapData.map[i] = '.'.repeat(mapData.width);
	}
	
	console.log('Map ' + name + ' created');
	return mapData;
}

const goTo = async (index: number) => {
	let newGrid;
	const map = grid.neighbors[index];

	if (map !== null) {
		const lastX = state.currentX;
		const lastY = state.currentY;

		grid = await (<any>window).api.load(map);
		
		if (index === 0) {
			state.currentX = grid.width - 1;
			state.currentY = lastY;
		} else if (index === 1) {
			state.currentX = lastX;
			state.currentY = 0;
		} else if (index === 2) {
			state.currentX = lastX;
			state.currentY = grid.height - 1; 
		} else {
			state.currentX = 0;
			state.currentY = lastY;
		}

		draw();
		return;
	}
	
	if (state.mode === 'play') {
		draw();
		return;
	}

	// TODO: Ask for new / link to existing / delete
	state.question = 'Enter new map name (or esc): ';
	state.answer = '';
	state.answered = async (answer: string) => {
		const newMapName = `${answer}.json`;
		const fileExists = await (<any>window).api.fileExists(newMapName);

		if (fileExists) {
			state.question = '';
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

		state.question = '';
		grid = newGrid;
		draw(`Map ${newMapName} created`);
	}

	draw();
};

const write = (chr: string) => {
	const line = grid.map[state.currentY];
	grid.map[state.currentY] = line.substring(0, state.currentX) + chr + line.substring(state.currentX + 1);
};

window.addEventListener("keydown", async (event: any) => {
	if (event.ctrlKey && event.key === 's') {
		await (<any>window).api.save(grid);
		draw(`Saved successfully.`);
		return;
	}
	
	if (state.question) {
		if (event.key.length === 1) {
			state.answer += event.key;
		} else if (event.key === 'Backspace') {
			state.answer = state.answer.slice(0, -1);
		} else if (event.key === 'Enter') {
			state.answered(state.answer);
		} else if (event.key === 'Escape') {
			state.question = '';
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


	if (state.mode !== 'play') {
		if (event.key === 'Escape') {
			switchToMode('play');
			return;
		} else if (event.key === 'Backspace') {	
			moveLeft();
			write(' ');
			return;
		} else if (event.key === 'Delete') {	
			write(' ');
			moveRight();	
			return;
		} else if (event.key === 'Enter') {
			moveDown();
			return;
		} else if (event.key === ' ') {
			if (state.mode == 'item') {
				write(obstacles[state.itemIndex]);
				moveRight();
				return;
			}
		}

		if (state.mode === 'text') {
			if (event.key.length === 1) {
				write(event.key);
				moveRight();
			}
		} else {
			if (event.key === 'a') {
				if (state.itemIndex > 0) {
					state.itemIndex--;
				} else {
					state.itemIndex = obstacles.length - 1;
				}
			} else if (event.key == 's') {
				if (state.itemIndex < obstacles.length - 1) {
					state.itemIndex++;
				} else {
					state.itemIndex = 0;
				}
			}
		}

		draw();
		return;
	}

	if (state.mode === 'play') {
		draw();
		return;
	}

	console.log(`Unknown mode: ${state.mode}`);
});
