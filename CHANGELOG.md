# Change Log

All notable changes to the "brief4vscode" extension will be documented in this file.

## [v1.4.0] (2024-02-15)

- Added "Noninclusive mark" mode toggle command (Alt+A). 

## [v1.3.0] (2024-02-14)

- Added configuration option to change behavior of "Exit" and "Write all and exit" commands to keep them from closing the IDE. They will optionally just close the editors. 
- Disabling a marking mode will remove the existing selection.

## [v1.2.0] (2022-07-29)

- Added a functional column marking mode. But vscode has no virtual space support so it's not optimal.
- Reworked other marking modes moving them to separate files.
- A few other functional tweaks. Escape exits marking modes. Comment command moves to beginning of next line so you can hit it multiple times.

## [v1.1.0] (2021-03-06)

- Testing on Windows. Changed reveal for line marking mode cursor movement to be the start of the line.
- Working on adding automated testing.

## [v1.0.10] (2021-03-03)

- Initial release.
