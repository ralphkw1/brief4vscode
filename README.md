<div>
<img src="media/brief4vscode_128.png" width="80" height="80" alt="icon" align="left" title="Brief Emulator for Visual Studio Code"/>
<h1 style="color:#0000AA;padding-left:100px">Brief Emulator for Visual Studio Code</h1>
<br/>
</div>

---
## Brief Text Editor Emulation and Keymap for Visual Studio Code
This extension adds key bindings and functionality that attempts to emulate many features of the original BRIEF MS-DOS application. Adds it's numbered bookmarks, overtype mode, home-home-home and end-end-end, line marking modes, single key cut copy and paste, clipboard swap, and clipboard history commands, as well as most of the original keybindings.

Some history. BRIEF (Basic Re-configurable Interactive Editing Facility) was a popular programmer's text editor in the late 1980s and early 1990s. Developed by UnderWare Inc, it was quite powerful and feature rich for its time. See the Wikipedia page &quot;<a href="https://en.wikipedia.org/wiki/Brief_(text_editor)" target="_blank">Brief (text editor)</a>&quot; for more information.

---
## Installation
This extension has been tested on Linux and limited testing on Windows. I don't have a Mac. After you install the extension, it should just start working.

There are a few ways to install an extension in Visual Studio Code. You can...

1. Show the EXTENSIONS Sidebar by either pressing (ctrl+shift+x), or click on the "Extensions" icon in the "Activity Bar", or open the command palette (ctrl+shift+p) select "Extensions: Install Extension", or click on the "Manage" icon in the "Activity Bar" and select "Extensions". Then click in the "Search Extensions in Marketplace" box and enter "brief4vscode" to find the extension. Then click the install button.
2. Launch VS Code Quick Open (ctrl+p), type the command "ext install rkdawenterprises.brief4vscode", and press enter.

---
## Commands
The following are the key bindings and commands implemented by the plugin.

Some Brief functionality is currently the Visual Studio Code default, or close enough.

No intentional changes to mouse functionality.

None of the commands should work unless the cursor is in an active "TextDocument". So the extension shouldn't interfere with existing functionality.

Multi-root workspaces are not supported and not tested, but should only affect the relative bookmark feature; It should default to global bookmarks.

<div>
<table style="background-color:#F5FFFF">
    <caption style="color:#0000AA; background-color:#F5FFFF">Help and Undo/Redo</caption>
    <tr><th width="15%">Key Binding</th><th width="20%">Command</th><th width="65%">Description</th></tr>
    <tr><td>Alt + H</td><td>Help</td><td>Show the contextual help window.</td></tr>
    <tr><td>Alt + U, Keypad Multiply</td><td>Undo</td><td>Undo the last command.</td></tr>
    <tr><td>Ctrl + U</td><td>Redo</td><td>Redoes the commands that have been previously undone.</td></tr>
</table>
<table style="background-color:#F5FFFF">
    <caption style="color:#0000AA; background-color:#F5FFFF">Saving and Exiting</caption>
    <tr><th width="15%">Key Binding</th><th width="20%">Command</th><th width="65%">Description</th></tr>
    <tr><td>Alt + O</td><td>Change output file name</td><td>Change the file name of the current editor. This not only changes the output file name, but also commits the change to file storage.</td></tr>
    <tr><td>Alt + X</td><td>Exit</td><td>Exits the IDE.</td></tr>
    <tr><td>Alt + W</td><td>Write</td><td>Writes the current editor's file to storage.</td></tr>
    <tr><td>Ctrl + X</td><td>Write all and exit</td><td>Writes all unsaved content to storage and exits the IDE.</td></tr>
</table>
<table style="background-color:#F5FFFF">
    <caption style="color:#0000AA; background-color:#F5FFFF">Cursor Movement</caption>
    <tr><th width="15%">Key Binding</th><th width="20%">Command</th><th width="65%">Description</th></tr>
    <tr><td>Home</td><td>Beginning of line or window or file</td><td>Moves the cursor to the beginning of the line or the window or the file depending on whether it is already there. Pressing &lt;Home&gt; will move the cursor/caret to the beginning of the current line if it is not already there. If the cursor/caret is already at the beginning of the line, pressing &lt;Home&gt; will move the cursor/caret to the beginning of the window. If the cursor/caret is already at the beginning of the window, pressing &lt;Home&gt; will move the cursor/caret to the beginning of the buffer/file.</td></tr>
    <tr><td>End</td><td>End of line or window or file</td><td>Moves the cursor to the end of the line or the window or the file depending on whether it is already there. Pressing &lt;End&gt; will move the cursor/caret to the end of the current line if it is not already there. If the cursor/caret is already at the end of the line, pressing &lt;End&gt; will move the cursor/caret to the end of the window. If the cursor/caret is already at the end of the window, pressing &lt;End&gt; will move the cursor/caret to the end of the buffer/file.</td></tr>
    <tr><td>Ctrl + Home</td><td>Top of window</td><td>Moves the cursor to the top fully visible line of the window.</td></tr>
    <tr><td>Ctrl + End</td><td>End of window</td><td>Moves the cursor  to the bottom fully visible line of the window.</td></tr>
    <tr><td>Ctrl + PgUp</td><td>Top of buffer/file</td><td>Moves the cursor to the first character position of the editor. Hitting the &lt;Home&gt; key up to 3 times will also do this.</td></tr>
    <tr><td>Ctrl + PgDn</td><td>End of buffer/file</td><td>Moves the cursor to the last character position of the editor. Hitting the &lt;End&gt; key up to 3 times will also do this.</td></tr>
    <tr><td>Ctrl + &rarr;</td><td>Next word</td><td>Moves the cursor to the last character of the next word.</td></tr>
    <tr><td>Ctrl + &larr;</td><td>Previous word</td><td>Moves the cursor to the first character of the previous word.</td></tr>
    <tr><td>Alt + G</td><td>Go to line</td><td>Opens the "Goto Dialog" and moves the cursor to the requested line number.</td></tr>
</table>
<table style="background-color:#F5FFFF">
    <caption style="color:#0000AA; background-color:#F5FFFF">Windows</caption>
    <tr><th width="15%">Key Binding</th><th width="20%">Command</th><th width="65%">Description</th></tr>
    <tr><td>Ctrl + T</td><td>Line to top of window</td><td>Moves the line, that the cursor is currently on, to the top of the current window.</td></tr>
    <tr><td>Ctrl + C</td><td>Center line in window</td><td>Moves the current line to the center of the current window.</td></tr>
    <tr><td>Ctrl + B</td><td>Line to bottom of window</td><td>Moves the current line to the bottom of the current window.</td></tr>
</table>
<table style="background-color:#F5FFFF">
    <caption style="color:#0000AA; background-color:#F5FFFF">Editing Text</caption>
    <tr><th width="15%">Key Binding</th><th width="20%">Command</th><th width="65%">Description</th></tr>
    <tr><td>Alt + D</td><td>Delete line</td><td>Deletes the current line.</td></tr>
    <tr><td>Alt + Backspace</td><td>Delete next word</td><td>Deletes from the current cursor position to the end of the current word.</td></tr>
    <tr><td>Ctrl + Backspace</td><td>Delete previous word</td><td>Deletes from the current cursor position the be beginning of the current word.</td></tr>
    <tr><td>Ctrl + K</td><td>Delete to beginning of line</td><td>Deletes from the current cursor position to the beginning of the line.</td></tr>
    <tr><td>Alt + K</td><td>Delete to end of line</td><td>Deletes from the current cursor position to the end of the line.</td></tr>
    <tr><td>Alt + I</td><td>Insert mode toggle</td><td>Toggles between the insert and overstrike modes.</td></tr>
    <tr><td>Ctrl + Enter</td><td>Open line</td><td>Insert a blank line after the current line.</td></tr>
</table>
<table style="background-color:#F5FFFF">
    <caption style="color:#0000AA; background-color:#F5FFFF">Blocks and Marks</caption>
    <tr><th width="15%">Key Binding</th><th width="20%">Command</th><th width="65%">Description</th></tr>
    <tr><td>Alt + M</td><td>Mark toggle</td><td>Toggle normal marking mode. Use cursor or single click mouse to move cursor and expand selection.</td></tr>
    <tr><td>Alt + L</td><td>Line Mark toggle</td><td>Toggle line marking mode. Use cursor or single click mouse to move cursor and expand selection.</td></tr>
    <tr><td>Alt + C</td><td>Column Mark toggle<sup>*</sup></td><td>Toggle column marking mode. Use cursor or single click mouse to move cursor and expand selection.</td></tr>
    <tr><td>Alt + A</td><td>Noninclusive Mark toggle</td><td>Equivalent to Mark, except that the marked area does not include the character at the end of the block. Essentially begins the marking mode with no visible selection, unlike Mark which automatically selects the first character.</td></tr>
    <tr><td>Alt + <i>[1-10]</i></td><td>Drop bookmark</td><td>Inserts a numbered (1-10) bookmark into the editor and the current cursor posiotion. Bookmark 10 is dropped using the 0 key.</td></tr>
    <tr><td>Alt + J</td><td>Jump to bookmark</td><td>Waits for a bookmark number, <i>[1-10]</i> then jumps to that number. Bookmark 10 is the 0 key.</td></tr>
    <tr><td>Alt + B</td><td>Bookmark List</td><td>Open bookmark list dialog. Scroll and select a bookmark to jump to. Can also delete bookmarks. This is a new command and the key assignment was taken from the "buffer list" command, which is not implemented.</td></tr>
</table>
<table style="background-color:#F5FFFF">
    <caption style="color:#0000AA; background-color:#F5FFFF">Scrap</caption>
    <tr><th width="15%">Key Binding</th><th width="20%">Command</th><th width="65%">Description</th></tr>
    <tr><td>Keypad Plus</td><td>Copy to scrap</td><td>Copies the marked selection to the scrap buffer (the clipboard).</td></tr>
    <tr><td>Keypad Minus</td><td>Cut to scrap</td><td>Cuts the marked selection to the scrap buffer.</td></tr>
    <tr><td>Ins</td><td>Paste from scrap</td><td>Pastes the latest scrap buffer item into the current editor.</td></tr>
    <tr><td>Shift + Ins</td><td>Paste from history</td><td>Opens the &quot;Paste from clipboard History Dialog&quot; and pastes the selected scrap item into the current editor. This is a new command.</td></tr>
    <tr><td>Alt + Ins</td><td>Swap selection and scrap</td><td>Exchanges the current selection with the latest scrap buffer item, i.e. cuts the current selection, and in it's place, pastes the current scrap. New command. Comes in handy when you want to extract some existing code from a complex statement and make it a new variable. First create the new variable then copy it. Then select the code statement and swap &lt;Alt+Ins&gt;. Then paste the code after the new variable.</td></tr>
</table>
<table style="background-color:#F5FFFF">
    <caption style="color:#0000AA; background-color:#F5FFFF">Search and Translate (replace)</caption>
    <tr><th width="15%">Key Binding</th><th width="20%">Command</th><th width="65%">Description</th></tr>
    <tr><td>Alt + S</td><td>Search forward</td><td>Opens <i>Find/Replace</i> dialog which facilitates both search/replace forward and backward.</td></tr>
    <tr><td>Alt + T</td><td>Translate forward</td><td>Also opens <i>Find/Replace</i> dialog.</td></tr>
    <tr><td>Shift + F5</td><td>Search again</td><td>Searches forwards using previous search parameters.</td></tr>
    <tr><td>Alt + F5</td><td>Search backward</td><td>Searches backwards using previous search parameters.</td></tr>
    <tr><td>Shift + F6</td><td>Translate again</td><td>Translates (replaces) forwards using previous search/replace parameters. Only works if the search dialog is open.</td></tr>
    <tr><td>Ctrl + R</td><td>Repeat</td><td>Opens the &quot;Repeat Dialog&quot;, then repeats the requested command, or inserts the requested char/string into the editor, the requested number of times. Not all commands are supported or work well. Actually accepts any &quot;non-printable&quot; key sequence, so not sure what works actually.</td></tr>
</table>
<div style="background-color:#F5FFFF">
<h4 style="color:#0000AA">Notes<sup>*</sup></h3>
    <ul>
    <li>Really can't properly implement Brief's "Column Marking Mode" until Visual Studio Code supports "virtual space".</li>
    <li>The extension may not currently work very well with line/code folding (not tested). So best to unfold the area of the file you are working on if you want the commands to work as expected.</li>
    <li>I can only account for Brief defined keystrokes in the marking modes. Turn off an active marking mode to use other commands. I couldn't find a way to generally monitor all keystrokes to disable an active marking mode.</li>
    </ul>
</div>
</div>

---
## Contact/Bugs
Enter bugs at &quot;<a href=https://github.com/ralphkw1/brief4vscode/issues target="_blank">Brief for VS Code Issues</a>&quot;.

<p>You can email me at <a href="mailto:&#109;&#97;&#105;&#108;&#116;&#111;&#58;rkdawenterprises&#64;gmail&#46;com&#46;no!spam?subject=Brief Editor Emulation for Visual Studio Code">rkdawenterprises&#64;gmail&#46;com&#46;no!spam</a>. I don't look at this very often so it may take a while to hear back.</p>

I started using Brief in the early 1990s when I was at Compaq Computer Corporation working on printers.
I thought at the time that it was way superior to any editor I had used to date. I've used it for so long,
the key bindings and particular functionality has just stuck with me.

I created this project as an exercise for me to learn Visual Studio Code extension development; Just having fun. I don't think that there is a high demand for Brief emulation anywhere. Also, I have always really liked the Brief key assignments and feature set and I try and set it up in any editor I use. So if you are/were also into Brief, I hope you enjoy using this.

One of the goals of this project was to have minimal functional effect on the Visual Studio Code &quot;TextDocument&quot; editor. So this is by no means a perfect example of the Brief editor, and it's a little quirky at times, mainly because it is limited by the API and architecture of the existing editor. I try to note any deviations in the command descriptions, at least, deviations from the limited documentation and knowledge I have. I have also added some commands as documented below. You can, of course, disable any key bindings and/or set them back to default in the &quot;settings-&gt;keyboard shortcuts.

BTW, I don't have a working example of Brief, just the old documentation. Feel free to let me know if I have implemented something improperly. Also, I did not try to emulate all of Brief's functionality. This is most certainly a subset.

---
## License
Copyright 2019-2024 RKDAW Enterprises and Ralph Williamson

Licensed under the Apache License, Version 2.0 (the "License"); You may not use this file except in compliance with the License.

You may obtain a copy of the License at [Apache License Verson 2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and
limitations under the License.
