<div style="background-color:#F5FFFF">
<h2 style="color:#0000AA">Brief Text Editor Emulation for Visual Studio Code</h2>
<p>This plug-in adds key bindings and functionality that attempts to emulate many features of the original BRIEF MS-DOS application. BRIEF (Basic Re-configurable Interactive Editing Facility) was a popular programmer's text editor in the late 1980s and early 1990s. Developed by UnderWare Inc, it was quite powerful and feature rich for its time. See the Wikipedia page &quot;<a href="https://en.wikipedia.org/wiki/Brief_(text_editor)" target="_blank">Brief (text editor)</a>&quot;.</p>
<h3 style="color:#0000AA">Installation</h3>
<p>After you install the plug-in, it should just start working.</p>
<h3 style="color:#0000AA">Commands</h3>
<p>The following are the key bindings and commands implemented by the plugin. Some Brief functionality is currently the Visual Studio Code default, or close enough. No changes to mouse functionality.</p>
<p>If you are looking for the full Brief command set, try the following link. &quot;<a href="https://christopoulos.users.sourceforge.net/cbrief/brief.php" target="_blank">About BRIEF Text Editor</a>&quot;. Otherwise, search for it with your favorite search engine.</p>
<p>NOTE! The plug-in does not currently work with line/code folding, at least not very well. So best to unfold the area of the file you are working on if you want the commands to work as expected.</p>
</div>
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
    <tr><td>Alt + C</td><td>Column Mark toggle</td><td>Toggle column marking mode. Use cursor or single click mouse to move cursor and expand selection.</td></tr>
    <tr><td>Alt + <i>[1-10]</i></td><td>Drop bookmark</td><td>Inserts a numbered (1-10) bookmark into the editor and the current cursor posiotion. Bookmark 10 is dropped using the 0 key.</td></tr>
    <tr><td>Alt + J</td><td>Jump to bookmark</td><td>Waits for a bookmark number, <i>[1-10]</i> then jumps to that number. Bookmark 10 is the 0 key.</td></tr>
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
<h3 style="color:#0000AA">Contact</h3>
<p>You can email me at <a href="mailto:&#109;&#97;&#105;&#108;&#116;&#111;&#58;rkdawenterprises&#64;gmail&#46;com&#46;no!spam?subject=Brief Editor Emulation for Visual Studio Code">rkdawenterprises&#64;gmail&#46;com&#46;com&#46;no!spam</a>. I don't look at this very often so it may take a while to hear back.</p>
<p>I started using Brief in the early 1990s when I was at Compaq Computer Corporation working on printers. I thought at the time that it was way beyond any editor I had used to date.</p>
<p>I created this project as an exercise for me to learn Visual Studio Code plug-in development; Just having fun. I don't think that there is a high demand for Brief emulation in the Visual Studio Code. Don't get me wrong, there was a lot of effort that went into this plug-in. I have always really liked the Brief key assignments and feature set and I try and set it up in any editor I use. So if you are/were also into Brief, I hope you enjoy using this.</p>
<p>One of the goals of this project was to have minimal effect on the underlying Visual Studio Code &quot;TextDocument&quot; editor. So this is by no means a perfect example of the Brief editor, and it's a little quirky at times, mainly because it is limited by the API and architecture of the existing editor. I try to note any deviations in the command descriptions, at least, deviations from the limited documentation and knowledge I have. I have also added some commands as documented below. You can, of course, disable any key bindings and/or set them back to default in the &quot;settings-&gt;keyboard shortcuts.</p>
<p>BTW, I don't have a working example of Brief, just the old documentation. Feel free to let me know if I have implemented something improperly. Also, I did not try to emulate all of Brief's functionality. This is most certainly a subset.</p>
<h3 style="color:#0000AA">License</h3>
<p>Copyright 2021 RKDAW Enterprises and Ralph Williamson</p>
<p>Licensed under the Apache License, Version 2.0 (the "License"); You may not use this file except in compliance with the License.<br>You may obtain a copy of the License at</p>
<p><a href="https://www.apache.org/licenses/LICENSE-2.0.txt">https://www.apache.org/licenses/LICENSE-2.0.txt</a></p>
<p>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.</p>
</div>
