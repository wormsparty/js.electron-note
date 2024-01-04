import { Grid, State, Layer, Mode } from './types';
import { colors, tiles, walkable, textRegexp } from './consts';
import font from '../assets/Inconsolata.ttf';

let grid = {} as Grid;

let globalMap = new Map<string, [number, number]>();

const state: State = {
	itemIndex: 0,
	layer: 'map',
	mode: 'play',
	question: '',
	answer: '',
	answered: undefined,
	currentX: 0,
	currentY: 0,
};

const switchToMode = (newMode: Mode) => {
  state.mode = newMode;
  draw(`Mode: ${state.mode}`);
}

const flushLine = (text: string, posx: number, posy: number, ctx: CanvasRenderingContext2D) => {
  if (text.length === 0) {
    return;
  }

  let color = grid.palette.get(text[0]);

  if (!color) {
    color = grid.palette.get('t') ?? 0;
  }

  ctx.fillStyle = colors[color];
  ctx.fillText(text, posx, posy);

  console.log(text + ' @ ' + posx + ', ' + posy);
};

const drawMap = (mapName: Layer, ctx: CanvasRenderingContext2D) => {
  let posx = 0;
  const map = grid.map.get(mapName);

  for (let j = 0; j < grid.height; j++) {
    let line = map[j];
    let text = '';
    const posy = j * 32 + 16;
    for (let i = 0; i < grid.width; i++) {
      const chr = line[i];

      if (chr === ' ') {
        flushLine(text, posx, posy, ctx);
	posx += (text.length  + 1) * 16;
	text = '';
      } else if (text.length === 0 || chr[0] === text[0]) {
        text += chr;
      } else {
        flushLine(text, posx, posy, ctx);
	posx += text.length * 16;
        text = chr;
      }
    }

    flushLine(text, posx, posy, ctx);
    posx = 0;
  }
};

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

  drawMap('map', ctx);
  drawMap('item', ctx);
  drawMap('mob', ctx);

  if (state.mode !== 'play') {
    ctx.fillStyle = colors[0];
    ctx.fillRect(state.currentX * 16, state.currentY * 32, 16, 32);
  
    if (state.mode === 'item') {
      const layers = Array.from(tiles.keys());
      const availableChars = tiles.get(state.layer);
      
      let px = 16;
      let py = 80;
  
      if (state.currentY < grid.height - 4) {
          py = grid.height * 32 - 80;
      }

      let totalLength = 0;
      layers.forEach(t => totalLength += t.length + 1);
      
      const typeChangeMsg = ` (q-w to change)`;
      const symbolsMsg = `${availableChars} (a-s to change)`;

      ctx.fillStyle = '#000000';
      ctx.fillRect(px, py - 16, (totalLength + typeChangeMsg.length) * 16, 32);
      ctx.fillRect(px, py + 16, symbolsMsg.length * 16, 32);

      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];

        if (layer === state.layer) {
          ctx.fillStyle = colors[0];
        } else {
          ctx.fillStyle = colors[1];
	}

        ctx.fillText(layer, px, py);
        px += (layers[i].length + 1) * 16;
      }
       
      ctx.fillStyle = colors[0];
      ctx.fillText(typeChangeMsg, px, py);
      ctx.fillText(symbolsMsg, 16, py + 32);

      ctx.fillStyle = colors[8];
      ctx.fillText(availableChars[state.itemIndex], state.currentX * 16, state.currentY * 32 + 16);
    }
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(state.currentX * 16, state.currentY * 32, 16, 32);
    
    ctx.fillStyle = colors[2];
    ctx.fillText('@', state.currentX * 16, state.currentY * 32 + 16);
  }

  let px = 16;
  let py = 48;
 
  if (state.currentY < grid.height - 4) {
	  py = grid.height * 32 - 112;
  }

  if (singleMessage !== undefined) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(px, py - 16, singleMessage.length * 16, 32);
  
    ctx.fillStyle = colors[0];
    ctx.fillText(singleMessage, px, py);	
  } else if (state.question) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(px, py - 16, (state.question.length + state.answer.length) * 16, 32);
    
    ctx.fillStyle = colors[0];
    ctx.fillText(state.question + state.answer, px, py);
  } 
}

document.addEventListener('DOMContentLoaded', () => {
	const consoleFont = new FontFace('Inconsolata', `url(${font})`);

	consoleFont.load().then(async (font) => {
		(<any>document).fonts.add(font);

		globalMap = await (<any>window).api.loadGlobal('global.json');
		grid = await (<any>window).api.loadMap('default.json');

		if (globalMap === null) {
			globalMap = new Map<string, [number, number]>();
		}

		if (grid === null) {
			grid = newMap('default.json');
			globalMap.set('default.json', [0, 0]);
			await (<any>window).api.saveGlobal(globalMap);
			await (<any>window).api.saveMap(grid);
		}

		state.currentX = grid.startX;
		state.currentY = grid.startY;
		state.layer = tiles.keys().next().value;
		draw();
	});
});

window.addEventListener('resize', () => {
	draw();
});

const move = (diffX: number, diffY: number): void => {
	let x = Math.max(Math.min(state.currentX + diffX, grid.width  - 1), 0);
	let y = Math.max(Math.min(state.currentY + diffY, grid.height - 1), 0);
	
	if (state.mode !== 'play') {
		state.currentX = x;
		state.currentY = y;
		return;
	}

	const map = grid.map.get('map');

	if (walkable.indexOf(map[y][x]) > -1) {
		state.currentX = x;
		state.currentY = y;
    		return;
	}

	if (state.currentY !== y) {
		if (walkable.indexOf(map[y][state.currentX]) > -1) {
			state.currentY = y;
			return;
		} 
	}

       	if (state.currentX !== x) {
		if (walkable.indexOf(map[state.currentY][x]) > -1) {
			state.currentX = x;
			return;
		}
	}
}

const moveLeft = async () => {
	if (state.currentX === 0) {
		await goTo(0);
	} else {
		move(-1, 0);
		draw();
	}
};

const moveRight = async (allowScreenChange: boolean) => {
	if (state.currentX === grid.width - 1 && allowScreenChange) {
		await goTo(3);
	} else {
		move(1, 0);
		draw();
	}
};

const moveDown = async () => {
	if (state.currentY === grid.height - 1) {
		await goTo(2);
	} else {
		move(0, 1);
		draw();
	}
};

const moveUp = async () => {
	if (state.currentY === 0) {
		await goTo(1);
	} else {
		move(0, -1);
		draw();
	}
}

const moveUpLeft = async () => {
	if (state.currentY === 0) {
		if (await goTo(1)) {
			return;
		}
	}

	if (state.currentX === 0) {
		if (await goTo(0)) {
			return;
		}
	}

	move(-1, -1);
	draw();
};

const moveUpRight = async () => {
	if (state.currentY === 0) {
		if (await goTo(1)) {
			return;
		}
	}

	if (state.currentX === grid.width - 1) {
		if (await goTo(3)) {
			return;
		}
	}

	move(1, -1);
	draw();
};

const moveDownLeft = async () => {
	if (state.currentY === grid.height - 1) {
		if (await goTo(2)) {
			return;
		}
	}

	if (state.currentX === 0) {
		if (await goTo(0)) {
			return;
		}
	}
	
	move(-1, 1);
	draw();
};

const moveDownRight = async () => {
	if (state.currentY === grid.height - 1) {
		if (await goTo(2)) {
			return;
		}
	}

	if (state.currentX === grid.width - 1) {
		if (await goTo(3)) {
			return;
		}
	}

	move(1, 1);
	draw();
};

const newMap = (name: string) => {
	const newGrid: Grid = {
		name: name,
		width: 64, 
		height: 24,
		startX: 32,
		startY: 12,
		map: new Map<Layer, Array<string>>(),
		neighbors: [null, null, null, null],
		palette: new Map<string, number>([
			[ '.', 1 ],
		]),
	}

	const mapData = [];
	const itemData = [];
	const mobData = [];

	for (let i = 0; i < newGrid.height; i++) {
		mapData.push('.'.repeat(newGrid.width));
		itemData.push(' '.repeat(newGrid.width));
		mobData.push(' '.repeat(newGrid.width));
	}
	
	newGrid.map.set('map', mapData);
	newGrid.map.set('item', itemData);
	newGrid.map.set('mob', mobData);
	
	return newGrid;
}

const goTo = async (index: number): Promise<boolean> => {
	let newGrid: Grid;
	const map = grid.neighbors[index];

	if (map !== null) {
		const lastX = state.currentX;
		const lastY = state.currentY;

		grid = await (<any>window).api.loadMap(map);
		
		if (index === 0) {
			state.currentX = grid.width - 1;
			state.currentY = lastY;
		} else if (index === 1) {
			state.currentX = lastX;
			state.currentY = grid.height - 1;
		} else if (index === 2) {
			state.currentX = lastX;
			state.currentY = 0; 
		} else {
			state.currentX = 0;
			state.currentY = lastY;
		}

		draw();
		return true;
	}
	
	if (state.mode === 'play') {
		draw();
		return false;
	}

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

		newGrid = newMap(newMapName);
		
		let [newX, newY] = globalMap.get(grid.name);

		if (index === 0) {
			newX--;
		} else if (index === 1) {
			newY--;
		} else if (index === 2) {
			newY++;
		} else {
			newX++;
		}
	
		// Update the map with all known neighbors
		for (const [mapName, position] of globalMap.entries()) {
			if (position[0] === newX - 1 && position[1] === newY) {
				const map = await (<any>window).api.loadMap(mapName);
				map.neighbors[3] = newMapName;
				newGrid.neighbors[0] = map.name;
				await (<any>window).api.saveMap(map);
			} else if (position[0] === newX + 1 && position[1] === newY) {
				const map = await (<any>window).api.loadMap(mapName);
				map.neighbors[0] = newMapName;
				newGrid.neighbors[3] = map.name;
				await (<any>window).api.saveMap(map);
			} else if (position[0] === newX && position[1] === newY - 1) {
				const map = await (<any>window).api.loadMap(mapName);
				map.neighbors[2] = newMapName;
				newGrid.neighbors[1] = map.name;
				await (<any>window).api.saveMap(map);
			} else if (position[0] === newX && position[1] === newY + 1) {
				const map = await (<any>window).api.loadMap(mapName);
				map.neighbors[1] = newMapName;
				newGrid.neighbors[2] = map.name;
				await (<any>window).api.saveMap(map);
			}
		}
		
		globalMap.set(newMapName, [newX, newY]);
		await (<any>window).api.saveGlobal(globalMap);

		await (<any>window).api.saveMap(newGrid);

		state.question = '';

		if (index === 0) {
			state.currentX = newGrid.width - 1;
		} else if (index === 1) {
			state.currentY = newGrid.height - 1;
		} else if (index === 2) {
			state.currentY = 0;
		} else {
			state.currentX = 0;
		}

		grid = newGrid;
		draw(`Map ${newMapName} created`);
	}

	draw();
	return true;
};

const write = (chr: string) => {
	const map = grid.map.get(state.layer);
	const line = map[state.currentY];
	map[state.currentY] = line.substring(0, state.currentX) + chr + line.substring(state.currentX + 1);
};

window.addEventListener('keydown', async (event: any) => {
	if (event.ctrlKey && event.key === 's') {
		await (<any>window).api.saveMap(grid);
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
		if (event.shiftKey) {
			await moveUpRight();
		} else {
			await moveUp();
		}
		return;
	} else if (event.key === 'ArrowDown') {
		if (event.shiftKey) {
			await moveDownLeft();
		} else {
			await moveDown();
		}
		return;
	} else if (event.key === 'ArrowLeft') {
		if (event.shiftKey) {
			await moveUpLeft();
		} else {
			await moveLeft();
		}
		return;
	} else if (event.key === 'ArrowRight') {
		if (event.shiftKey) {
			await moveDownRight();		
		} else {
			await moveRight(true);
		}
		return;
	} else if (event.code === 'Numpad1') {
		await moveDownLeft();
		return;
	} else if (event.code === 'Numpad2') {
		await moveDown();
		return;
	} else if (event.code === 'Numpad3') {
		await moveDownRight();
		return;
	} else if (event.code === 'Numpad4') {
		await moveLeft();
		return;
	} else if (event.code === 'Numpad5') {
		draw();
		return;
	} else if (event.code === 'Numpad6') {
		await moveRight(true);
		return;
	} else if (event.code === 'Numpad7') {
		await moveUpLeft();
		return;
	} else if (event.code === 'Numpad8') {
		await moveUp();
		return;
	} else if(event.code === 'Numpad9') {
		await moveUpRight();
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
			moveRight(false);
			return;
		} else if (event.key === 'Enter') {
			moveDown();
			return;
		} else if (event.key === ' ') {
			if (state.mode == 'item') {
				write(tiles.get(state.layer)[state.itemIndex]);
				moveRight(false);
				return;
			}
		}

		if (state.mode === 'text') {
			// Remove accents in regexp test.
			const norm = event.key.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

			if (textRegexp.test(norm)) {
				write(event.key);
				moveRight(false);
			}
		} else {
			if (event.key === 'q') {
				const layers = Array.from(tiles.keys());
				const currentIndex = layers.indexOf(state.layer);

				if (currentIndex > 0) {
					state.layer = layers[currentIndex - 1];
				} else {
					state.layer = layers[layers.length - 1];
				}

				state.itemIndex = 0;
			} else if (event.key === 'w') {
				const layers = Array.from(tiles.keys());
				const currentIndex = layers.indexOf(state.layer);

				if (currentIndex < layers.length - 1) {
					state.layer = layers[currentIndex + 1];
				} else {
					state.layer = layers[0];
				}

				state.itemIndex = 0;
			} else if (event.key === 'a') {
				if (state.itemIndex > 0) {
					state.itemIndex--;
				} else {
					state.itemIndex = tiles.get(state.layer).length - 1;
				}
			} else if (event.key === 's') {
				if (state.itemIndex < tiles.get(state.layer).length - 1) {
					state.itemIndex++;
				} else {
					state.itemIndex = 0;
				}
			} else {
				const number = Number(event.key);
		
				if (!Number.isNaN(number)) {
					const chr = grid.map.get('map')[state.currentY][state.currentX];

					// We use one single palette value 't' for all text.
					if (textRegexp.test(chr) && chr !== '.') {
						grid.palette.set('t', number);
					} else {
						grid.palette.set(chr, number);
					}
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
