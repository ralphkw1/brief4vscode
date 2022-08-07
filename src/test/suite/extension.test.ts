import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import { join } from 'path';
import { promisify } from 'util';
import * as path from 'path';
import * as child_process from 'child_process';
import * as vscode_extension_tester from 'vscode-extension-tester'; 

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { move_cursor, remove_range } from '../../utility';
// import * as myExtension from '../../extension';
suite('Extension Tests for brief4vscode', () =>
{
    console.log('Start all tests.');

    let test_dir: string | null = null;
    let test_file: string | null = null;

    let create_test_file = (dir?: string | null): Promise<string> =>
    {
        if((dir === undefined) || (dir === null))
        {
            dir = "/tmp";
        }

        return new Promise((resolve, reject) =>
        {
            child_process.exec(`mktemp ${dir}/XXXXXX.java`, (error, stdout, stderr) =>
            {
                if (error) {
                    console.log(`error: ${error.message}`);
                    reject(null);
                }

                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    reject(null);
                }

                let path: string = stdout.replace("\r", "").replace("\n", "");
                console.log(`Created ${path} for testing...`);
                resolve(path);
            });
        });
    };

    let create_test_dir = (): Promise<string> =>
    {
        return new Promise((resolve, reject) =>
        {
            child_process.exec("mktemp -d -t brief4vscode_test_XXXXXXXXXX", (error, stdout, stderr) =>
            {
                if (error) {
                    console.log(`error: ${error.message}`);
                    reject(null);
                }

                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    reject(null);
                }

                let path: string = stdout.replace("\r", "").replace("\n", "");
                console.log(`Created ${path} for testing...`);
                resolve(path);
            });
        });
    };

    let delete_test_dir = (path?: string | null): Promise<string> =>
    {
        return new Promise((resolve, reject) =>
        {
            if((test_dir !== undefined ) && (test_dir !== null)) {
                fs.access(test_dir, fs.constants.F_OK, (err) =>
                {
                    if (err === null) {
                        console.log(`Removing ${test_dir}...`);
                        if (test_dir !== null) {
                            child_process.exec(`rm -rf ${path}`, (error, stdout, stderr) =>
                            {
                                if (error) {
                                    console.log(`error: ${error.message}`);
                                    reject(null);
                                }
                
                                if (stderr) {
                                    console.log(`stderr: ${stderr}`);
                                    reject(null);
                                }
                
                                resolve(stdout.replace("\r", "").replace("\n", ""));
                            });
                        }
                    }
                });
            }

            reject(null);
        });
    };

    suiteSetup(async () =>
    {
        test_dir = await create_test_dir();
        test_file = await create_test_file(test_dir);

        if(test_file !== null)
        {
            await promisify(fs.writeFile)(test_file, test_data);
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(test_file));
            await vscode.window.showTextDocument(document);

            let ex_tester = new vscode_extension_tester.ExTester(test_dir);
            ex_tester.downloadChromeDriver();


        }
    });

    suiteTeardown(async () =>
    {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        delete_test_dir(test_dir);
    });

    test("Command: Undo. Description: Reverses the effect of any typing or commands that modified an open file.", async () =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {






            // const line_number = 49;
            // const index = 17;

            // let string_at_line_modified = "";

            // let start_location = new vscode.Position(line_number, index);
            // move_cursor(editor, start_location);

            // let cursor_position = editor.selection.active;
            // let current_line_range = editor.document.lineAt(cursor_position).range;
            // let string_at_line = editor.document.getText(current_line_range);
            // console.log(string_at_line);

            // await vscode.commands.executeCommand("brief4vscode.delete");
            // await vscode.commands.executeCommand("brief4vscode.delete");
            // string_at_line_modified = editor.document.getText(current_line_range);
            // console.log(string_at_line_modified);
            // assert(string_at_line_modified === remove_range(string_at_line, index, index + 2));
        }
    });
});

export const test_data: string = `
import * as vscode from 'vscode';

import * as utility from './utility';
import { Status_bar } from "./Status_bar";
import { Configuration } from "./extension";
import { Scrap_manager } from './Scrap_manager';
import { Bookmarks_manager } from './Bookmarks_manager';
import { Marking } from './Marking';
import { Column_marking, Column_mode_block_data_mime_type } from './Column_marking';
import { Line_marking } from './Line_marking';

export class Commands
{
    private m_status_bar: Status_bar;
    private m_scrap_manager: Scrap_manager;
    private m_bookmarks_manager: Bookmarks_manager;

    private m_marking: Marking;
    private m_line_marking: Line_marking;
    private m_column_marking: Column_marking;

    private m_configuration: Configuration | null;

    private m_is_overstrike_mode: boolean;

    public constructor(context: vscode.ExtensionContext,
        status_bar: Status_bar,
        scrap_manager: Scrap_manager,
        bookmarks_manager: Bookmarks_manager)
    {
        this.m_status_bar = status_bar;
        this.m_scrap_manager = scrap_manager;
        this.m_bookmarks_manager = bookmarks_manager;

        this.m_scrap_manager.add_from_system_clipboard();

        this.m_marking = new Marking();
        this.m_line_marking = new Line_marking();
        this.m_column_marking = new Column_marking();
        
        this.m_scrap_manager.column_marking = this.m_column_marking;

        this.m_is_overstrike_mode = false;

        context.subscriptions.push(
            vscode.commands.registerCommand("type", this.type_command),
            vscode.commands.registerCommand("brief4vscode.enable_brief4vscode", this.enable_brief4vscode),
            vscode.commands.registerCommand("brief4vscode.disable_brief4vscode", this.disable_brief4vscode),
            vscode.commands.registerCommand("brief4vscode.overstrike_toggle", this.overstrike_toggle),
            vscode.commands.registerCommand("brief4vscode.up", this.up),
            vscode.commands.registerCommand("brief4vscode.down", this.down),
            vscode.commands.registerCommand("brief4vscode.left", this.left),
            vscode.commands.registerCommand("brief4vscode.right", this.right),
            vscode.commands.registerCommand("brief4vscode.page_down", this.page_down),
            vscode.commands.registerCommand("brief4vscode.page_up", this.page_up),
            vscode.commands.registerCommand("brief4vscode.end", this.end),
            vscode.commands.registerCommand("brief4vscode.home", this.home),
            vscode.commands.registerCommand("brief4vscode.delete", this.delete),
            vscode.commands.registerCommand("brief4vscode.backspace", this.backspace),
            vscode.commands.registerCommand("brief4vscode.tab", this.tab),
            vscode.commands.registerCommand("brief4vscode.outdent", this.outdent),
            vscode.commands.registerCommand("brief4vscode.marking_mode_toggle", this.marking_mode_toggle),
            vscode.commands.registerCommand("brief4vscode.line_marking_mode_toggle", this.line_marking_mode_toggle),
            vscode.commands.registerCommand("brief4vscode.column_marking_mode_toggle", this.column_marking_mode_toggle),
            vscode.commands.registerCommand("brief4vscode.copy", this.copy),
            vscode.commands.registerCommand("brief4vscode.cut", this.cut),
            vscode.commands.registerCommand("brief4vscode.paste", this.paste),
            vscode.commands.registerCommand("brief4vscode.swap", this.swap),
            vscode.commands.registerCommand("brief4vscode.open_scrap_dialog", this.open_scrap_dialog),
            vscode.commands.registerCommand("brief4vscode.save_and_exit", this.save_and_exit),
            vscode.commands.registerCommand("brief4vscode.top_of_window", this.top_of_window),
            vscode.commands.registerCommand("brief4vscode.end_of_window", this.end_of_window),
            vscode.commands.registerCommand("brief4vscode.line_to_top_of_window", this.line_to_top_of_window),
            vscode.commands.registerCommand("brief4vscode.center_line_in_window", this.center_line_in_window),
            vscode.commands.registerCommand("brief4vscode.line_to_bottom_of_window", this.line_to_bottom_of_window),
            vscode.commands.registerCommand("brief4vscode.comment_line", this.comment_line),
            vscode.commands.registerCommand("brief4vscode.drop_bookmark", this.drop_bookmark),
            vscode.commands.registerCommand("brief4vscode.open_bookmarks_dialog", this.open_bookmarks_dialog),
            vscode.commands.registerCommand("brief4vscode.jump_bookmark", this.jump_bookmark),
            vscode.commands.registerCommand("brief4vscode.escape", this.escape));

        context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor(this.on_did_change_active_text_editor),
            vscode.window.onDidChangeWindowState(this.on_did_change_window_state),
            vscode.window.onDidChangeTextEditorSelection(this.on_did_change_text_editor_selection),
            vscode.workspace.onDidRenameFiles(this.m_bookmarks_manager.on_did_rename_files));

        this.m_configuration = null;
    }

    public dispose = (): void => { };

    public enable_brief4vscode = (args: any[]): void =>
    {
        console.log("Brief for VSCode enabled...");

        vscode.commands.executeCommand("setContext", "brief4vscode_enabled", true);
    };

    public disable_brief4vscode = (args: any[]): void =>
    {
        this.set_overstrike_mode(false);

        vscode.commands.executeCommand("setContext", "brief4vscode_enabled", false);

        console.log("Brief for VSCode disabled...");
    };

    public on_configuration_changed = (configuration: Configuration): void =>
    {
        this.m_configuration = configuration;
    };

    public overstrike_toggle = (args: any[]): void =>
    {
        this.m_is_overstrike_mode = !this.m_is_overstrike_mode;
        this.set_overstrike_mode(this.m_is_overstrike_mode);
    };

    public set_overstrike_mode = (is_overstrike_mode: boolean): void =>
    {
        this.m_is_overstrike_mode = is_overstrike_mode;
        this.m_status_bar?.set_overstrike_mode(is_overstrike_mode);

        let editor = vscode.window.activeTextEditor;
        if (editor) {
            if (is_overstrike_mode) {
                editor.options.cursorStyle = vscode.TextEditorCursorStyle.Block;
            }
            else {
                editor.options.cursorStyle = this.m_configuration?.default_cursor_style;
            }
        }
    };

    public on_did_change_active_text_editor = (editor: vscode.TextEditor | undefined): void =>
    {
        if (!editor) {
            editor = vscode.window.activeTextEditor;
        }

        this.set_overstrike_mode(this.m_is_overstrike_mode);
        this.stop_all_marking_modes();
        this.m_scrap_manager.add_from_system_clipboard();
    };

    public on_did_change_window_state = (e: vscode.WindowState): void =>
    {
        this.m_scrap_manager.add_from_system_clipboard();
    };

    public on_did_change_text_editor_selection = (e: vscode.TextEditorSelectionChangeEvent): void =>
    {
        if (e.kind === vscode.TextEditorSelectionChangeKind.Mouse) {
            this.m_marking.on_did_change_text_editor_selection(e.textEditor);
            this.m_line_marking.on_did_change_text_editor_selection(e.textEditor);
            this.m_column_marking.on_did_change_text_editor_selection(e.textEditor);
        }
    };

    public type_command = (args: { text: string }): void =>
    {
        if (this.m_is_overstrike_mode) {
            const os = require('os');
            if (args.text !== os.EOL) {
                let editor = vscode.window.activeTextEditor;
                if (editor) {
                    let selection = editor.selection;
                    if (selection.isEmpty) {
                        let current_cursor_position = selection.active;
                        let current_line_end_position = editor.document.lineAt(current_cursor_position).range.end;
                        if (current_cursor_position !== current_line_end_position) {
                            let range = new vscode.Range(current_cursor_position.line, current_cursor_position.character,
                                current_cursor_position.line, current_cursor_position.character + 1);
                            editor.edit(editBuilder =>
                            {
                                editBuilder.delete(range);
                            });
                        }
                    }
                }
            }
        }

        if (this.m_column_marking.is_marking_mode) {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                this.m_column_marking.delete_selection(editor).then((value: boolean) =>
                {
                    this.stop_all_marking_modes(true);
                });
            }
        }

        this.stop_all_marking_modes();

        vscode.commands.executeCommand("default:type", args);
    };

    private stop_all_marking_modes = (remove_selection?: boolean): void =>
    {
        this.m_marking.stop_marking_mode(remove_selection);
        this.m_line_marking.stop_marking_mode(remove_selection);
        this.m_column_marking.stop_marking_mode(true);

        vscode.commands.executeCommand("setContext", "brief4vscode_marking_mode", false);
        this.m_status_bar?.clear_all();

        if (remove_selection) {
            utility.remove_selection();
        }
    };

    public marking_mode_toggle = (args: any[] | null): void =>
    {
        this.set_marking_mode(!this.m_marking.is_marking_mode);
    };

    public line_marking_mode_toggle = (args: any[] | null): void =>
    {
        this.set_line_marking_mode(!this.m_line_marking.is_marking_mode);
    };

    public column_marking_mode_toggle = (args: any[] | null): void =>
    {
        this.set_column_marking_mode(!this.m_column_marking.is_marking_mode);
    };

    private set_marking_mode = (is_marking_mode: boolean): void =>
    {
        this.stop_all_marking_modes();

        if (is_marking_mode) {
            this.set_overstrike_mode(false);
        }

        this.m_status_bar?.set_marking_mode(is_marking_mode);
        vscode.commands.executeCommand("setContext", "brief4vscode_marking_mode", is_marking_mode);

        if (!is_marking_mode) {
            this.stop_all_marking_modes();
        }
        else {
            this.m_marking.enable_marking_mode();
        }
    };

    private set_line_marking_mode = (is_line_marking_mode: boolean): void =>
    {
        this.stop_all_marking_modes();

        if (is_line_marking_mode) {
            this.set_overstrike_mode(false);
        }

        this.m_status_bar?.set_marking_mode(is_line_marking_mode, "LINE");
        vscode.commands.executeCommand("setContext", "brief4vscode_marking_mode", is_line_marking_mode);

        if (!is_line_marking_mode) {
            this.stop_all_marking_modes();
        }
        else {
            this.m_line_marking.enable_marking_mode();
        }
    };

    private set_column_marking_mode = (is_column_marking_mode: boolean): void =>
    {
        this.stop_all_marking_modes();

        if (is_column_marking_mode) {
            this.set_overstrike_mode(false);
        }

        this.m_status_bar?.set_marking_mode(is_column_marking_mode, "COLUMN");
        vscode.commands.executeCommand("setContext", "brief4vscode_marking_mode", is_column_marking_mode);

        if (!is_column_marking_mode) {
            this.stop_all_marking_modes();
        }
        else {
            this.m_column_marking.enable_marking_mode();
        }
    };

    public up = (args: any[] | null): void =>
    {
        if (this.m_marking.is_marking_mode) {
            vscode.commands.executeCommand("cursorUpSelect", args).then(() =>
            {
                return;
            });

            return;
        }

        if (this.m_line_marking.is_marking_mode) {
            this.m_line_marking.caret_change_handler(utility.KeyEvent.VK_UP);
            return;
        }

        vscode.commands.executeCommand("cursorUp", args).then(() =>
        {
            if (this.m_column_marking.is_marking_mode) {
                this.m_column_marking.caret_change_handler();
                return;
            }
        });
    };

    public down = (args: any[] | null): void =>
    {
        if (this.m_marking.is_marking_mode) {
            vscode.commands.executeCommand("cursorDownSelect", args).then(() =>
            {
                return;
            });

            return;
        }

        if (this.m_line_marking.is_marking_mode) {
            this.m_line_marking.caret_change_handler(utility.KeyEvent.VK_DOWN);
            return;
        }

        vscode.commands.executeCommand("cursorDown", args).then(() =>
        {
            if (this.m_column_marking.is_marking_mode) {
                this.m_column_marking.caret_change_handler();
                return;
            }
        });
    };

    public left = (args: any[] | null): void =>
    {
        if (this.m_marking.is_marking_mode) {
            vscode.commands.executeCommand("cursorLeftSelect", args).then(() =>
            {
                return;
            });

            return;
        }

        if (this.m_line_marking.is_marking_mode) {
            this.up(null);
            return;
        }

        vscode.commands.executeCommand("cursorLeft", args).then(() =>
        {
            if (this.m_column_marking.is_marking_mode) {
                this.m_column_marking.caret_change_handler();
                return;
            }
        });
    };

    public right = (args: any[] | null): void =>
    {
        if (this.m_marking.is_marking_mode) {
            vscode.commands.executeCommand("cursorRightSelect", args).then(() =>
            {
                return;
            });

            return;
        }

        if (this.m_line_marking.is_marking_mode) {
            this.down(null);
            return;
        }

        vscode.commands.executeCommand("cursorRight", args).then(() =>
        {
            if (this.m_column_marking.is_marking_mode) {
                this.m_column_marking.caret_change_handler();
                return;
            }
        });
    };

    public page_up = (args: any[] | null): void =>
    {
        if (this.m_marking.is_marking_mode) {
            vscode.commands.executeCommand("cursorPageUpSelect", args).then(() =>
            {
                return;
            });

            return;
        }

        if (this.m_line_marking.is_marking_mode) {
            this.m_line_marking.caret_change_handler(utility.KeyEvent.VK_PAGE_UP);
            return;
        }

        vscode.commands.executeCommand("cursorPageUp", args).then(() =>
        {
            if (this.m_column_marking.is_marking_mode) {
                this.m_column_marking.caret_change_handler();
                return;
            }
        });
    };

    public page_down = (args: any[] | null): void =>
    {
        if (this.m_marking.is_marking_mode) {
            vscode.commands.executeCommand("cursorPageDownSelect", args).then(() =>
            {
                return;
            });

            return;
        }

        if (this.m_line_marking.is_marking_mode) {
            this.m_line_marking.caret_change_handler(utility.KeyEvent.VK_PAGE_DOWN);
            return;
        }

        vscode.commands.executeCommand("cursorPageDown", args).then(() =>
        {
            if (this.m_column_marking.is_marking_mode) {
                this.m_column_marking.caret_change_handler();
                return;
            }
        });
    };

    public home = (args: any[] | null): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let cursor_position = editor.selection.active;
            let visible_top_position = editor.visibleRanges[0].start;

            let at_file_start = ((cursor_position.line === 0) && (cursor_position.character === 0));
            let at_window_start = ((cursor_position.line <= visible_top_position.line) && (cursor_position.character === 0)) ||
                this.m_line_marking.get_at_window_start(visible_top_position);
            let at_line_start = (cursor_position.character === 0) || this.m_line_marking.is_marking_mode;

            if (at_file_start) { return; }

            if (at_window_start) {
                if (this.m_marking.is_marking_mode) {
                    vscode.commands.executeCommand("cursorTopSelect", args).then(() =>
                    {
                        return;
                    });

                    return;
                }

                if (this.m_line_marking.is_marking_mode) {
                    this.m_line_marking.select_from_start(editor, 0);
                    return;
                }

                vscode.commands.executeCommand("cursorTop", args).then(() =>
                {
                    if (this.m_column_marking.is_marking_mode) {
                        this.m_column_marking.caret_change_handler();
                        return;
                    }
                });

                return;
            }

            if (at_line_start) {
                if (this.m_marking.is_marking_mode) {
                    this.m_marking.select(editor, visible_top_position);
                    return;
                }

                if (this.m_line_marking.is_marking_mode) {
                    this.m_line_marking.select_from_start(editor, visible_top_position.line);
                    return;
                }

                if (this.m_column_marking.is_marking_mode) {
                    this.m_column_marking.caret_change_handler();
                    return;
                }

                utility.move_cursor(editor, visible_top_position);

                return;
            }

            if (this.m_configuration?.use_brief_home) {
                let home_position = new vscode.Position(cursor_position.line, 0);

                if (this.m_marking.is_marking_mode) {
                    this.m_marking.select(editor, home_position);
                    return;
                }

                if (this.m_column_marking.is_marking_mode) {
                    this.m_column_marking.caret_change_handler();
                    return;
                }

                utility.move_cursor(editor, home_position);

                return;
            }
            else {
                if (this.m_marking.is_marking_mode) {
                    vscode.commands.executeCommand("cursorHomeSelect", args).then(() =>
                    {
                        return;
                    });

                    return;
                }
            }
        }

        vscode.commands.executeCommand("cursorHome", args).then(() =>
        {
            if (this.m_column_marking.is_marking_mode) {
                this.m_column_marking.caret_change_handler();
                return;
            }
        });
    };

    public end = (args: any[] | null): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let cursor_position = editor.selection.active;
            let visible_bottom_position = editor.visibleRanges[0].end;

            let on_first_line = cursor_position.line === 0;

            let file_end_line_range = editor.document.lineAt(editor.document.lineCount - 1).range;
            let window_end_line_range = editor.document.lineAt(visible_bottom_position).range;
            let current_line_range = editor.document.lineAt(cursor_position).range;

            let at_file_end = ((cursor_position.line === file_end_line_range.end.line) &&
                (cursor_position.character === file_end_line_range.end.character));

            let at_window_end: boolean = false;
            at_window_end ||= ((cursor_position.line >= window_end_line_range.end.line) &&
                (cursor_position.character === window_end_line_range.end.character));

            if (!on_first_line) {
                let window_second_to_end_line_range = editor.document.lineAt(visible_bottom_position.line - 1).range;
                at_window_end ||= ((cursor_position.line >= window_second_to_end_line_range.end.line) &&
                    (cursor_position.character === window_second_to_end_line_range.end.character));
                if (this.m_line_marking.is_marking_mode) {
                    at_window_end ||= (cursor_position.line >= window_second_to_end_line_range.end.line);
                }
            }

            if (this.m_line_marking.is_marking_mode) {
                at_window_end ||= cursor_position.line >= window_end_line_range.end.line;
            }

            let at_line_end = (cursor_position.character === current_line_range.end.character) ||
                this.m_line_marking.is_marking_mode;

            if (at_file_end) { return; }

            if (at_window_end) {
                if (this.m_marking.is_marking_mode) {
                    vscode.commands.executeCommand("cursorBottomSelect", args).then(() =>
                    {
                        return;
                    });

                    return;
                }

                if (this.m_line_marking.is_marking_mode) {
                    this.m_line_marking.select_from_start(editor, file_end_line_range.end.line);
                    return;
                }

                vscode.commands.executeCommand("cursorBottom", args).then(() =>
                {
                    if (this.m_column_marking.is_marking_mode) {
                        this.m_column_marking.caret_change_handler();
                        return;
                    }
                });

                return;
            }

            if (at_line_end) {
                if (this.m_marking.is_marking_mode) {
                    this.m_marking.select(editor, visible_bottom_position);
                    return;
                }

                if (this.m_line_marking.is_marking_mode) {
                    this.m_line_marking.select_from_start(editor, window_end_line_range.end.line);
                    return;
                }

                if (this.m_column_marking.is_marking_mode) {
                    this.m_column_marking.caret_change_handler();
                    return;
                }

                utility.move_cursor(editor, visible_bottom_position);

                return;
            }

            if (this.m_marking.is_marking_mode) {
                vscode.commands.executeCommand("cursorEndSelect", args).then(() =>
                {
                    return;
                });

                return;
            }
        }

        vscode.commands.executeCommand("cursorEnd", args).then(() =>
        {
            if (this.m_column_marking.is_marking_mode) {
                this.m_column_marking.caret_change_handler();
                return;
            }
        });
    };

    public delete = (args: any[] | null): void =>
    {
        if (this.m_column_marking.is_marking_mode) {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                this.m_column_marking.delete_selection(editor).then(() =>
                {
                    this.stop_all_marking_modes(true);
                });
            }

            return;
        }

        vscode.commands.executeCommand("deleteRight", args).then(() => { this.stop_all_marking_modes(); });
    };

    public backspace = (args: any[] | null): void =>
    {
        if (this.m_column_marking.is_marking_mode) {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                this.m_column_marking.delete_selection(editor).then((value: boolean) =>
                {
                    this.stop_all_marking_modes(true);
                });
            }

            return;
        }

        vscode.commands.executeCommand("deleteLeft", args).then(() => { this.stop_all_marking_modes(); });
    };

    public tab = (args: any[] | null): void =>
    {
        vscode.commands.executeCommand("tab", args).then(() => { this.stop_all_marking_modes(); });
    };

    public outdent = (args: any[] | null): void =>
    {
        vscode.commands.executeCommand("outdent", args).then(() => { this.stop_all_marking_modes(); });
    };

    private copy_to_history = (): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            if (this.m_column_marking.is_marking_mode) {
                this.m_column_marking.copy_to_history(editor, this.m_scrap_manager);
                return;
            }

            let selection: vscode.Selection | null = editor.selection;
            if (selection.isEmpty) {
                selection = this.m_line_marking.select(editor);
            }

            if (selection) {
                let text = editor.document.getText(new vscode.Range(selection.start, selection.end));
                this.m_scrap_manager.copy(text);
                return;
            }
        }
    };

    public copy = (args: any[] | null): void =>
    {
        this.copy_to_history();
        this.stop_all_marking_modes(true);
    };

    public cut = (args: any[] | null): void =>
    {
        this.cut_selection();
    };

    public cut_selection = async (): Promise<void> =>
    {
        return await new Promise((resolve, reject) =>
        {
            this.copy_to_history();

            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let result: Thenable<boolean>;

                if (this.m_column_marking.is_marking_mode) {
                    result = this.m_column_marking.delete_selection(editor);
                }
                else {
                    let selection = editor.selection;
                    result = editor.edit((editBuilder: vscode.TextEditorEdit) =>
                    {
                        editBuilder.delete(selection);
                    });
                }

                result.then(() =>
                {
                    this.stop_all_marking_modes();
                    utility.reveal_current_cursor_position();
                    resolve();
                });
            }
        });
    };

    public paste = (args: any[] | null): void =>
    {
        vscode.env.clipboard.readText().then((text: string) =>
        {
            if (text) {
                let editor = vscode.window.activeTextEditor;
                if (editor) {
                    let result: Thenable<unknown> | null = null;

                    if (text.includes(Column_mode_block_data_mime_type)) {
                        result = this.m_column_marking.paste(editor, text);
                    }
                    else {
                        if (!this.m_configuration?.paste_lines_at_home || !editor.selection.isEmpty) {
                            result = vscode.commands.executeCommand("editor.action.clipboardPasteAction", args);
                        }
                        else {
                            vscode.env.clipboard.readText().then((text: string) =>
                            {
                                if (text) {
                                    const os = require('os');
                                    if (text.endsWith(os.EOL)) {
                                        let editor = vscode.window.activeTextEditor;
                                        if (editor) {
                                            utility.move_cursor(editor, new vscode.Position(editor.selection.active.line, 0));
                                        }
                                    }

                                    result = vscode.commands.executeCommand("editor.action.clipboardPasteAction", args);
                                }
                            });
                        }
                    }

                    result?.then(() =>
                    {
                        this.m_scrap_manager.add_from_system_clipboard(true);
                        this.stop_all_marking_modes();
                    });
                }
            }
        });
    };

    public open_scrap_dialog = (args: any[] | null): void =>
    {
        this.m_scrap_manager.open_scrap_dialog().
            catch((error: string) =>
            {
                if (error === "empty") {
                    this.m_status_bar.set_temporary_message_fix("No Scrap History");
                }
            }).
            finally(() =>
            {
                this.stop_all_marking_modes();
            });
    };

    public save_and_exit = (args: any[] | null): void =>
    {
        vscode.commands.executeCommand("workbench.action.files.saveAll", args).then(() =>
        {
            vscode.commands.executeCommand("workbench.action.quit", args);
        });
    };

    public swap = (args: any[] | null): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let selection = editor.selection;
            if (selection.isEmpty) {
                return;
            }

            vscode.env.clipboard.readText().then((text: string) =>
            {
                if (text) {
                    this.cut_selection().then(() =>
                    {
                        let editor = vscode.window.activeTextEditor;
                        if (editor) {
                            editor.edit((editBuilder: vscode.TextEditorEdit) =>
                            {
                                let editor = vscode.window.activeTextEditor;
                                if (editor) {
                                    editBuilder.insert(editor.selection.active, text);
                                }
                            });
                        }
                    });
                }
            });
        }
    };

    public top_of_window = (args: any[] | null): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            utility.move_cursor(editor, new vscode.Position(editor.visibleRanges[0].start.line, editor.selection.active.character));
        }
    };

    public end_of_window = (args: any[] | null): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            utility.move_cursor(editor, new vscode.Position(editor.visibleRanges[0].end.line, editor.selection.active.character));
        }
    };

    public line_to_top_of_window = (args: any[] | null): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.revealRange(new vscode.Range(editor.selection.active, editor.selection.active),
                vscode.TextEditorRevealType.AtTop);
        }
    };

    public center_line_in_window = (args: any[] | null): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.revealRange(new vscode.Range(editor.selection.active, editor.selection.active),
                vscode.TextEditorRevealType.InCenter);
        }
    };

    public line_to_bottom_of_window = (args: any[] | null): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let viewport_length = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;
            let start_position = editor.document.validatePosition(
                new vscode.Position(editor.selection.active.line - viewport_length, editor.selection.active.character));
            editor.revealRange(new vscode.Range(start_position, editor.selection.active));
        }
    };

    public comment_line = (args: any[] | null): void =>
    {
        vscode.commands.executeCommand("editor.action.commentLine", args).then(() =>
        {
            this.stop_all_marking_modes();
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                if (editor.selection.isEmpty) {
                    let current = editor.selection.active;
                    utility.move_cursor(editor, new vscode.Position(current.line + 1, 0));
                }
            }
        });
    };

    public drop_bookmark = (index: string | null): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor && index) {
            let position = editor.selection.active;
            this.m_bookmarks_manager.drop_bookmark(editor.document.uri, index, position);
        }
    };

    public open_bookmarks_dialog = (args: any[] | null): void =>
    {
        this.m_bookmarks_manager.open_bookmarks_dialog().
            catch((error: string) =>
            {
                if (error === "empty") {
                    this.m_status_bar.set_temporary_message_fix("No Dropped Bookmarks");
                    return;
                }

                if (error === "invalid") {
                    this.m_status_bar.set_temporary_message_fix("Bookmark Number Not Dropped");
                    return;
                }

                if (error === "file") {
                    this.m_status_bar.set_temporary_message_fix("Bookmark File Open Failed");
                    return;
                }

                if (error === "location") {
                    this.m_status_bar.set_temporary_message_fix("Bookmark Show Failed");
                    return;
                }

                if (error === "gear") {
                    this.m_bookmarks_manager.open_bookmarks_manage_dialog().catch(() => { });
                    return;
                }
            }).
            finally(() =>
            {
                this.stop_all_marking_modes();
            });
    };

    public jump_bookmark = (args: any[] | null): void =>
    {
        this.m_bookmarks_manager.jump_bookmark().
            catch((error: string) =>
            {
                if (error === "empty") {
                    this.m_status_bar.set_temporary_message_fix("No Dropped Bookmarks");
                    return;
                }

                if (error === "invalid") {
                    this.m_status_bar.set_temporary_message_fix("Bookmark Number Not Dropped");
                    return;
                }

                if (error === "file") {
                    this.m_status_bar.set_temporary_message_fix("Bookmark File Open Failed");
                    return;
                }

                if (error === "location") {
                    this.m_status_bar.set_temporary_message_fix("Bookmark Show Failed");
                    return;
                }
            }).
            finally(() =>
            {
                this.stop_all_marking_modes();
            });
    };

    public escape = async (args: any[] | null): Promise<void> =>
    {
        /**
         * This is a shotgun approach since we are conditionally capturing <ESC>.
         * Call all the known relevant commands escape would have called otherwise.
         */
        await Promise.allSettled([
            // vscode.commands.executeCommand('workbench.action.exitZenMode'),
            vscode.commands.executeCommand('closeReferenceSearch'),
            vscode.commands.executeCommand('editor.closeTestPeek'),
            vscode.commands.executeCommand('cancelSelection'),
            vscode.commands.executeCommand('removeSecondaryCursors'),
            // vscode.commands.executeCommand('notebook.cell.quitEdit'),
            vscode.commands.executeCommand('closeBreakpointWidget'),
            vscode.commands.executeCommand('editor.action.cancelSelectionAnchor'),
            vscode.commands.executeCommand('editor.action.inlineSuggest.hide'),
            vscode.commands.executeCommand('editor.action.webvieweditor.hideFind'),
            vscode.commands.executeCommand('editor.cancelOperation'),
            vscode.commands.executeCommand('editor.debug.action.closeExceptionWidget'),
            vscode.commands.executeCommand('editor.gotoNextSymbolFromResult.cancel'),
            vscode.commands.executeCommand('inlayHints.stopReadingLineWithHint'),
            vscode.commands.executeCommand('search.action.focusQueryEditorWidget'),
            vscode.commands.executeCommand('settings.action.clearSearchResults'),
            // vscode.commands.executeCommand('welcome.goBack'),
            // vscode.commands.executeCommand('workbench.action.hideComment'),
            vscode.commands.executeCommand('closeFindWidget'),
            vscode.commands.executeCommand('leaveEditorMessage'),
            vscode.commands.executeCommand('leaveSnippet'),
            vscode.commands.executeCommand('closeDirtyDiff'),
            vscode.commands.executeCommand('closeMarkersNavigation'),
            // vscode.commands.executeCommand('notifications.hideToasts'),
            vscode.commands.executeCommand('closeParameterHints'),
            vscode.commands.executeCommand('hideSuggestWidget'),
            vscode.commands.executeCommand('cancelLinkedEditingInput'),
            vscode.commands.executeCommand('cancelRenameInput'),
            // vscode.commands.executeCommand('closeAccessibilityHelp'),
            vscode.commands.executeCommand('closeReplaceInFilesWidget'),
            vscode.commands.executeCommand('keybindings.editor.clearSearchResults'),
            vscode.commands.executeCommand('list.clear'),
            // vscode.commands.executeCommand('notebook.hideFind'),
            vscode.commands.executeCommand('problems.action.clearFilterText'),
            vscode.commands.executeCommand('search.action.cancel'),
            // vscode.commands.executeCommand('settings.action.focusLevelUp'),
            // vscode.commands.executeCommand('workbench.action.closeQuickOpen'),
            // vscode.commands.executeCommand('workbench.action.hideInterfaceOverview'),
            // vscode.commands.executeCommand('workbench.action.terminal.clearSelection'),
            // vscode.commands.executeCommand('workbench.action.terminal.hideFind'),
            // vscode.commands.executeCommand('workbench.action.terminal.navigationModeExit'),
            // vscode.commands.executeCommand('workbench.banner.focusBanner'),
            // vscode.commands.executeCommand('workbench.statusBar.clearFocus'),
            // vscode.commands.executeCommand('breadcrumbs.selectEditor'),
            vscode.commands.executeCommand('editor.closeCallHierarchy'),
            vscode.commands.executeCommand('editor.closeTypeHierarchy'),
            vscode.commands.executeCommand('filesExplorer.cancelCut'),
            vscode.commands.executeCommand('closeReferenceSearch'),
            vscode.commands.executeCommand('notifications.hideList'),
            vscode.commands.executeCommand('notifications.hideToasts')]).then(() =>
            {
                this.stop_all_marking_modes(true);
            });
    };
}
`;
