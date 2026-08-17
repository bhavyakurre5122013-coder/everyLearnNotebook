# everyLearn Beta — modular build

## Important: do not double-click `index.html`

This build uses native JavaScript ES modules. Browsers block imported
ES modules for a page opened directly from `file://`.

Use one of these:

- `run-everyLearn.bat` — double-click it.
- `run-everyLearn.ps1` — run it from PowerShell.

The app will open at:

`http://127.0.0.1:8000/`

## Fixed in this build

1. Home now explicitly renders its dynamic subject/notebook cards.
2. Real SVG icons are included at:
   - `assets/icons/ui/`
   - `assets/icons/subjects/`
3. `index.html` now detects a direct `file://` launch and gives a clear
   explanation rather than appearing partially blank.
4. All current JavaScript imports were checked for missing local modules.
5. The project keeps the modular multi-file structure.

## Runtime

Open `index.html` directly in Chrome/Edge/Firefox. No BAT file, PowerShell file,
Python server, localhost server, or ES-module mode is required.

The JavaScript is still split across the project's `js/` folders. `js/app.js`
is a small classic-script loader that loads the modular files in dependency
order and starts `js/app-main.js` after they are available.
