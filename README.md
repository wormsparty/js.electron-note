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
- 'a' and 's' to change item to place. 'Space' to place.
- TODO: Change item type
- TODO: Place mob

Text mode:
- Type text to place on map. Text color is one single palette element.

In both Item and Text modes:
- 1-9 to change the color palette of the selected character.
  Text only has one color palette slot.
- Move to the desired screen border to create a map.
  Type in the map name, the file will be placed in `map/${name}.json`.
- Press Ctrl+S to save map changes. Changing to a different room without
  saving discards all changes.

