# Rogue-like in JS

## Build

To run: 
- npm install
- npm run start

Reloads automatically on change.

To package:
- npm run make

## Controls

Modes:
- Play mode: by default, enabled with 'Escape'.
- Item placement mode: enabled with 'F1'.
- Text writing mode: enabled with 'F2'.

Play mode:
- Arrows or numpad to move character around.
- If you do not have a numpad, use shift + arrows to move diagonally.
- TODO: Pickup items

Item mode:
- 'q' and 'w' to change the item type.
- 'a' and 's' to change item to place. 
- 'Space' to place the selected item.
- 1-9 to change the color palette of the selected character.
- Move to the desired screen border to create a map.
  Type in the map name, the file will be placed in `map/${name}.json`.
- Press Ctrl+S to save map changes. Changing to a different room without
  saving discards all changes.
- TODO: Place mob

Text mode:
- It is the same as 'Item' mode, except instead of placing items,
  we can type text instead. Text color is one single palette element.

