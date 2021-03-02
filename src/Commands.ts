
import * as vscode from 'vscode';

import * as utility from './utility';
import { Status_bar } from "./Status_bar";
import { Configuration } from "./extension";
import { Scrap_manager } from './Scrap_manager';
import { Bookmarks_manager } from './Bookmarks_manager';

export class Commands
{
    private status_bar: Status_bar;
    private scrap_manager: Scrap_manager;
    private bookmarks_manager: Bookmarks_manager;

    private is_overstrike_mode: boolean;

    private is_marking_mode: boolean;
    private is_line_marking_mode: boolean;
    private is_column_marking_mode: boolean;

    private selection_start: vscode.Position | null;
    private selection_end: vscode.Position | null;

    private line_selection_start: vscode.Position | null;
    private line_selection_end: vscode.Position | null;

    private column_selection_start: vscode.Position | null;
    private column_selection_end: vscode.Position | null;

    private configuration: Configuration | null;

    public constructor( context: vscode.ExtensionContext,
        status_bar: Status_bar,
        scrap_manager: Scrap_manager,
        bookmarks_manager: Bookmarks_manager )
    {
        this.status_bar = status_bar;
        this.scrap_manager = scrap_manager;
        this.bookmarks_manager = bookmarks_manager;

        this.scrap_manager.add_from_system_clipboard();

        this.is_overstrike_mode = false;

        this.is_marking_mode = false;
        this.is_line_marking_mode = false;
        this.is_column_marking_mode = false;

        this.selection_start = null;
        this.selection_end = null;

        this.line_selection_start = null;
        this.line_selection_end = null;

        this.column_selection_start = null;
        this.column_selection_end = null;

        context.subscriptions.push(
            vscode.commands.registerCommand( "type", this.type_command ),
            vscode.commands.registerCommand( "brief4vscode.enable_brief4vscode", this.enable_brief4vscode ),
            vscode.commands.registerCommand( "brief4vscode.disable_brief4vscode", this.disable_brief4vscode ),
            vscode.commands.registerCommand( "brief4vscode.overstrike_toggle", this.overstrike_toggle ),
            vscode.commands.registerCommand( "brief4vscode.up", this.up ),
            vscode.commands.registerCommand( "brief4vscode.down", this.down ),
            vscode.commands.registerCommand( "brief4vscode.left", this.left ),
            vscode.commands.registerCommand( "brief4vscode.right", this.right ),
            vscode.commands.registerCommand( "brief4vscode.page_down", this.page_down ),
            vscode.commands.registerCommand( "brief4vscode.page_up", this.page_up ),
            vscode.commands.registerCommand( "brief4vscode.end", this.end ),
            vscode.commands.registerCommand( "brief4vscode.home", this.home ),
            vscode.commands.registerCommand( "brief4vscode.delete", this.delete ),
            vscode.commands.registerCommand( "brief4vscode.backspace", this.backspace ),
            vscode.commands.registerCommand( "brief4vscode.tab", this.tab ),
            vscode.commands.registerCommand( "brief4vscode.outdent", this.outdent ),
            vscode.commands.registerCommand( "brief4vscode.marking_mode_toggle", this.marking_mode_toggle ),
            vscode.commands.registerCommand( "brief4vscode.line_marking_mode_toggle", this.line_marking_mode_toggle ),
            vscode.commands.registerCommand( "brief4vscode.column_marking_mode_toggle", this.column_marking_mode_toggle ),
            vscode.commands.registerCommand( "brief4vscode.copy", this.copy ),
            vscode.commands.registerCommand( "brief4vscode.cut", this.cut ),
            vscode.commands.registerCommand( "brief4vscode.paste", this.paste ),
            vscode.commands.registerCommand( "brief4vscode.swap", this.swap ),
            vscode.commands.registerCommand( "brief4vscode.open_scrap_dialog", this.open_scrap_dialog ),
            vscode.commands.registerCommand( "brief4vscode.save_and_exit", this.save_and_exit ),
            vscode.commands.registerCommand( "brief4vscode.top_of_window", this.top_of_window ),
            vscode.commands.registerCommand( "brief4vscode.end_of_window", this.end_of_window ),
            vscode.commands.registerCommand( "brief4vscode.line_to_top_of_window", this.line_to_top_of_window ),
            vscode.commands.registerCommand( "brief4vscode.center_line_in_window", this.center_line_in_window ),
            vscode.commands.registerCommand( "brief4vscode.line_to_bottom_of_window", this.line_to_bottom_of_window ),
            vscode.commands.registerCommand( "brief4vscode.comment_line", this.comment_line ),
            vscode.commands.registerCommand( "brief4vscode.drop_bookmark", this.drop_bookmark ),
            vscode.commands.registerCommand( "brief4vscode.open_bookmarks_dialog", this.open_bookmarks_dialog ),
            vscode.commands.registerCommand( "brief4vscode.jump_bookmark", this.jump_bookmark ) );

        context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor( this.on_did_change_active_text_editor ),
            vscode.window.onDidChangeWindowState( this.on_did_change_window_state ),
            vscode.window.onDidChangeTextEditorSelection( this.on_did_change_text_editor_selection ),
            vscode.workspace.onDidRenameFiles( this.bookmarks_manager.on_did_rename_files ) );

        this.configuration = null;
    }

    public dispose = (): void => {};

    public enable_brief4vscode = ( args: any[] ): void =>
    {
        console.log( "Brief for VSCode enabled..." );

        vscode.commands.executeCommand( "setContext", "brief4vscode_enabled", true );
    };

    public disable_brief4vscode = ( args: any[] ): void =>
    {
        this.set_overstrike_mode( false );

        vscode.commands.executeCommand( "setContext", "brief4vscode_enabled", false );

        console.log( "Brief for VSCode disabled..." );
    };

    public on_configuration_changed = ( configuration: Configuration ): void =>
    {
        this.configuration = configuration;
    };

    public overstrike_toggle = ( args: any[] ): void =>
    {
        this.is_overstrike_mode = !this.is_overstrike_mode;
        this.set_overstrike_mode( this.is_overstrike_mode );
    };

    public set_overstrike_mode = ( is_overstrike_mode: boolean ): void =>
    {
        this.is_overstrike_mode = is_overstrike_mode;
        this.status_bar?.set_overstrike_mode( is_overstrike_mode );

        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            if( is_overstrike_mode )
            {
                editor.options.cursorStyle = vscode.TextEditorCursorStyle.Block;
            }
            else
            {
                editor.options.cursorStyle = this.configuration?.default_cursor_style;
            }
        }
    };

    public on_did_change_active_text_editor = ( editor: vscode.TextEditor | undefined ): void =>
    {
        if( !editor )
        {
            editor = vscode.window.activeTextEditor;
        }

        this.set_overstrike_mode( this.is_overstrike_mode );
        this.stop_all_marking_modes();
        this.scrap_manager.add_from_system_clipboard();
    };

    public on_did_change_window_state = ( e: vscode.WindowState ): void =>
    {
        this.scrap_manager.add_from_system_clipboard();
    };

    public on_did_change_text_editor_selection = ( e: vscode.TextEditorSelectionChangeEvent ): void =>
    {
        if( e.kind === vscode.TextEditorSelectionChangeKind.Mouse )
        {
            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                let cursor_position = editor.selection.active;

                if( this.is_marking_mode && this.selection_start )
                {
                    this.select( this.selection_start, cursor_position );
                    editor.revealRange( new vscode.Range( cursor_position, cursor_position ) );
                    return;
                }

                if( this.is_line_marking_mode && this.line_selection_start )
                {
                    this.select_lines_with_position( this.line_selection_start, cursor_position );
                    return;
                }
            }
        }
    };

    public type_command = ( args: { text: string } ): void =>
    {
        if( this.is_overstrike_mode )
        {
            const os = require( 'os' );
            if( args.text !== os.EOL )
            {
                let editor = vscode.window.activeTextEditor;
                if( editor )
                {
                    let selection = editor.selection;
                    if( selection.isEmpty )
                    {
                        let current_cursor_position = selection.active;
                        let current_line_end_position = editor.document.lineAt( current_cursor_position ).range.end;
                        if( current_cursor_position !== current_line_end_position )
                        {
                            let range = new vscode.Range( current_cursor_position.line, current_cursor_position.character,
                                current_cursor_position.line, current_cursor_position.character + 1 );
                            editor.edit( editBuilder =>
                            {
                                editBuilder.delete( range );
                            } );
                        }
                    }
                }
            }
        }

        this.stop_all_marking_modes();

        vscode.commands.executeCommand( "default:type", args );
    };

    private stop_all_marking_modes = ( remove_selection?: boolean ): void =>
    {
        vscode.commands.executeCommand( "setContext", "brief4vscode_marking_mode", false );

        this.is_marking_mode = false;
        this.is_line_marking_mode = false;
        this.is_column_marking_mode = false;

        this.selection_start = this.selection_end = null;
        this.line_selection_start = this.line_selection_end = null;
        this.column_selection_start = this.column_selection_end = null;

        this.status_bar?.clear_all();

        if( remove_selection )
        {
            utility.remove_selection();
        }
    };

    public marking_mode_toggle = ( args: any[] | null ): void =>
    {
        this.is_marking_mode = !this.is_marking_mode;
        this.set_marking_mode( this.is_marking_mode );
    };

    public line_marking_mode_toggle = ( args: any[] | null ): void =>
    {
        this.is_line_marking_mode = !this.is_line_marking_mode;
        this.set_line_marking_mode( this.is_line_marking_mode );
    };

    public column_marking_mode_toggle = ( args: any[] | null ): void =>
    {
        this.is_column_marking_mode = !this.is_column_marking_mode;
        this.set_column_marking_mode( this.is_column_marking_mode );
    };

    private set_marking_mode = ( is_marking_mode: boolean ): void =>
    {
        this.stop_all_marking_modes();

        if( is_marking_mode )
        {
            this.set_overstrike_mode( false );
        }

        this.is_marking_mode = is_marking_mode;
        this.status_bar?.set_marking_mode( is_marking_mode );

        vscode.commands.executeCommand( "setContext", "brief4vscode_marking_mode", is_marking_mode );

        if( !is_marking_mode )
        {
            this.stop_all_marking_modes();
        }
        else
        {
            this.select();
        }
    };

    private set_line_marking_mode = ( is_line_marking_mode: boolean ): void =>
    {
        this.stop_all_marking_modes();

        if( is_line_marking_mode )
        {
            this.set_overstrike_mode( false );
        }

        this.is_line_marking_mode = is_line_marking_mode;
        this.status_bar?.set_marking_mode( is_line_marking_mode, "LINE" );

        vscode.commands.executeCommand( "setContext", "brief4vscode_marking_mode", is_line_marking_mode );

        if( !is_line_marking_mode )
        {
            this.stop_all_marking_modes();
        }
        else
        {
            this.select_lines_with_position();
        }
    };

    private set_column_marking_mode = ( is_column_marking_mode: boolean ): void =>
    {
        this.stop_all_marking_modes();

        if( is_column_marking_mode )
        {
            this.set_overstrike_mode( false );
        }

        this.is_column_marking_mode = is_column_marking_mode;
        this.status_bar?.set_marking_mode( is_column_marking_mode, "COLUMN" );

        vscode.commands.executeCommand( "setContext", "brief4vscode_marking_mode", is_column_marking_mode );

        if( !is_column_marking_mode )
        {
            this.stop_all_marking_modes();
        }
        else
        {
            this.select_columns();
        }
    };

    private select = ( start?: vscode.Position, end?: vscode.Position ): vscode.Selection | null =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            start = start ?? editor.selection.active;
            end = end ?? start;

            this.selection_start = editor.document.validatePosition( start );
            this.selection_end = editor.document.validatePosition( end );

            let selection = new vscode.Selection( this.selection_start, this.selection_end );
            editor.selection = selection;

            return selection;
        }

        return null;
    };

    private select_lines = ( start?: number, end?: number ): vscode.Selection | null =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            start = start ?? editor.selection.active.line;
            end = end ?? start;

            if( start < 0 ) { start = 0; }
            if( end < 0 ) { end = 0; }

            return this.select_lines_with_position( new vscode.Position( start, 0 ),
                new vscode.Position( end, 0 ) );
        }

        return null;
    };

    private select_lines_with_position = ( start?: vscode.Position, end?: vscode.Position ): vscode.Selection | null =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            start = start ?? editor.selection.active;
            end = end ?? start;

            this.line_selection_start = editor.document.validatePosition( new vscode.Position( start.line, 0 ) );
            let end_line_range = editor.document.lineAt( editor.document.validatePosition( end ) ).range;
            this.line_selection_end = end_line_range.end;

            let start_position = this.line_selection_start;
            let next_line_position: vscode.Position;
            if( end.line >= start.line )
            {
                next_line_position = editor.document.validatePosition(
                    new vscode.Position( this.line_selection_end.line + 1, 0 ) );
            }
            else
            {
                let start_line_range = editor.document.lineAt( start_position ).rangeIncludingLineBreak;
                start_position = start_line_range.end;
                next_line_position = end_line_range.start;
            }

            let selection = new vscode.Selection( start_position, next_line_position );
            editor.selection = selection;

            return selection;
        }

        return null;
    };

    private select_columns = ( start?: vscode.Position, end?: vscode.Position ): vscode.Selection | null =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            start = start ?? editor.selection.active;
            end = end ?? start;

            // TODO: Not implemented...
            vscode.window.showInformationMessage( `Column marking mode not implemented. Use the existing column mode.` );
            this.stop_all_marking_modes();
            let selection = null;
            // TODO: end.

            return selection;
        }

        return null;
    };

    public up = ( args: any[] | null ): void =>
    {
        if( this.is_marking_mode )
        {
            vscode.commands.executeCommand( "cursorUpSelect", args ).then( () =>
            {
                let editor = vscode.window.activeTextEditor;
                if( editor )
                {
                    this.selection_end = editor.selection.active;
                }
            } );

            return;
        }

        if( this.is_line_marking_mode && this.line_selection_start && this.line_selection_end )
        {
            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                let end_line = this.line_selection_end.line - 1;
                this.select_lines( this.line_selection_start.line, end_line );
                editor.revealRange( new vscode.Range( this.line_selection_end, this.line_selection_end ) );
            }

            return;
        }

        vscode.window.showInformationMessage( `Error in up()` );

        vscode.commands.executeCommand( "cursorUp", args );
    };

    public down = ( args: any[] | null ): void =>
    {
        if( this.is_marking_mode )
        {
            vscode.commands.executeCommand( "cursorDownSelect", args ).then( () =>
            {
                let editor = vscode.window.activeTextEditor;
                if( editor )
                {
                    this.selection_end = editor.selection.active;
                }
            } );

            return;
        }

        if( this.is_line_marking_mode && this.line_selection_start && this.line_selection_end )
        {
            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                let end_line = this.line_selection_end.line + 1;
                this.select_lines( this.line_selection_start.line, end_line );
                editor.revealRange( new vscode.Range( this.line_selection_end, this.line_selection_end ) );
            }

            return;
        }

        vscode.window.showInformationMessage( `Error in down()` );

        vscode.commands.executeCommand( "cursorDown", args );
    };

    public left = ( args: any[] | null ): void =>
    {
        if( this.is_marking_mode )
        {
            vscode.commands.executeCommand( "cursorLeftSelect", args ).then( () =>
            {
                let editor = vscode.window.activeTextEditor;
                if( editor )
                {
                    this.selection_end = editor.selection.active;
                }
            } );

            return;
        }

        if( this.is_line_marking_mode )
        {
            this.up( null );
            return;
        }

        vscode.window.showInformationMessage( `Error in left()` );

        vscode.commands.executeCommand( "cursorLeft", args );
    };

    public right = ( args: any[] | null ): void =>
    {
        if( this.is_marking_mode )
        {
            vscode.commands.executeCommand( "cursorRightSelect", args ).then( () =>
            {
                let editor = vscode.window.activeTextEditor;
                if( editor )
                {
                    this.selection_end = editor.selection.active;
                }
            } );

            return;
        }


        if( this.is_line_marking_mode )
        {
            this.down( null );
            return;
        }

        vscode.window.showInformationMessage( `Error in right()` );

        vscode.commands.executeCommand( "cursorRight", args );
    };

    public page_up = ( args: any[] | null ): void =>
    {
        if( this.is_marking_mode )
        {
            vscode.commands.executeCommand( "cursorPageUpSelect", args ).then( () =>
            {
                let editor = vscode.window.activeTextEditor;
                if( editor )
                {
                    this.selection_end = editor.selection.active;
                }
            } );

            return;
        }

        if( this.is_line_marking_mode && this.line_selection_start && this.line_selection_end )
        {
            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                let lines_in_view = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;
                let end_line = this.line_selection_end.line - lines_in_view;
                this.select_lines( this.line_selection_start.line, end_line );
                editor.revealRange( new vscode.Range( this.line_selection_end, this.line_selection_end ) );
            }

            return;
        }

        vscode.window.showInformationMessage( `Error in page_up()` );

        vscode.commands.executeCommand( "cursorPageUp", args );
    };

    public page_down = ( args: any[] | null ): void =>
    {
        if( this.is_marking_mode )
        {
            vscode.commands.executeCommand( "cursorPageDownSelect", args ).then( () =>
            {
                let editor = vscode.window.activeTextEditor;
                if( editor )
                {
                    this.selection_end = editor.selection.active;
                }
            } );

            return;
        }

        if( this.is_line_marking_mode && this.line_selection_start && this.line_selection_end )
        {
            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                let lines_in_view = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;
                let end_line = this.line_selection_end.line + lines_in_view;
                this.select_lines( this.line_selection_start.line, end_line );
                editor.revealRange( new vscode.Range( this.line_selection_end, this.line_selection_end ) );
            }

            return;
        }

        vscode.window.showInformationMessage( `Error in page_down()` );

        vscode.commands.executeCommand( "cursorPageDown", args );
    };

    public home = ( args: any[] | null ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let cursor_position = editor.selection.active;
            let visible_top_position = editor.visibleRanges[0].start;

            let at_file_start = ( ( cursor_position.line === 0 ) && ( cursor_position.character === 0 ) );
            let at_window_start = ( ( cursor_position.line <= visible_top_position.line ) && ( cursor_position.character === 0 ) ) ||
                ( this.is_line_marking_mode && this.line_selection_end && ( this.line_selection_end.line <= visible_top_position.line ) );
            let at_line_start = ( cursor_position.character === 0 ) || this.is_line_marking_mode;

            if( at_file_start ) { return; }

            if( at_window_start )
            {
                if( this.is_marking_mode )
                {
                    vscode.commands.executeCommand( "cursorTopSelect", args ).then( () =>
                    {
                        let editor = vscode.window.activeTextEditor;
                        if( editor )
                        {
                            this.selection_end = editor.selection.active;
                        }
                    } );

                    return;
                }

                if( this.is_line_marking_mode && this.line_selection_start && this.line_selection_end )
                {
                    let editor = vscode.window.activeTextEditor;
                    if( editor )
                    {
                        this.select_lines( this.line_selection_start.line, 0 );
                        editor.revealRange( new vscode.Range( this.line_selection_end, this.line_selection_end ) );
                    }

                    return;
                }

                vscode.commands.executeCommand( "cursorTop", args );

                return;
            }

            if( at_line_start )
            {
                if( this.is_marking_mode && this.selection_start )
                {
                    this.select( this.selection_start, visible_top_position );

                    return;
                }

                if( this.is_line_marking_mode && this.line_selection_start && this.line_selection_end )
                {
                    this.select_lines_with_position( this.line_selection_start, visible_top_position );

                    return;
                }

                editor.selection = new vscode.Selection( visible_top_position, visible_top_position );

                return;
            }

            if( this.configuration?.use_brief_home )
            {
                let home_position = new vscode.Position( cursor_position.line, 0 );

                if( this.is_marking_mode && this.selection_start )
                {
                    this.select( this.selection_start, home_position );

                    return;
                }

                editor.selection = new vscode.Selection( home_position, home_position );

                return;
            }
            else
            {
                if( this.is_marking_mode )
                {
                    vscode.commands.executeCommand( "cursorHomeSelect", args ).then( () =>
                    {
                        let editor = vscode.window.activeTextEditor;
                        if( editor )
                        {
                            this.selection_end = editor.selection.active;
                        }
                    } );

                    return;
                }
            }
        }

        vscode.commands.executeCommand( "cursorHome", args );
    };

    public end = ( args: any[] | null ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let cursor_position = editor.selection.active;
            let visible_bottom_position = editor.visibleRanges[0].end;

            let on_first_line = cursor_position.line === 0;

            let file_end_line_range = editor.document.lineAt( editor.document.lineCount - 1 ).range;
            let window_end_line_range = editor.document.lineAt( visible_bottom_position ).range;
            let current_line_range = editor.document.lineAt( cursor_position ).range;

            let at_file_end = ( ( cursor_position.line === file_end_line_range.end.line ) &&
                ( cursor_position.character === file_end_line_range.end.character ) );

            let at_window_end : boolean = false;
            at_window_end ||= ( ( cursor_position.line >= window_end_line_range.end.line ) &&
                ( cursor_position.character === window_end_line_range.end.character ) );

            if( !on_first_line )
            {
                let window_second_to_end_line_range = editor.document.lineAt( visible_bottom_position.line - 1 ).range;
                at_window_end ||= ( ( cursor_position.line >= window_second_to_end_line_range.end.line ) &&
                ( cursor_position.character === window_second_to_end_line_range.end.character ) );
            }

            if( this.is_line_marking_mode )
            {
                at_window_end ||= cursor_position.line >= window_end_line_range.end.line;
            }

            let at_line_end = ( cursor_position.character === current_line_range.end.character ) ||
                this.is_line_marking_mode;

            if( at_file_end ) { return; }

            if( at_window_end )
            {
                if( this.is_marking_mode )
                {
                    vscode.commands.executeCommand( "cursorBottomSelect", args ).then( () =>
                    {
                        let editor = vscode.window.activeTextEditor;
                        if( editor )
                        {
                            this.selection_end = editor.selection.active;
                        }
                    } );

                    return;
                }

                if( this.is_line_marking_mode && this.line_selection_start )
                {
                    this.select_lines_with_position( this.line_selection_start, file_end_line_range.end );
                    editor.revealRange( file_end_line_range );

                    return;
                }

                vscode.commands.executeCommand( "cursorBottom", args );

                return;
            }

            if( at_line_end )
            {
                if( this.is_marking_mode && this.selection_start )
                {
                    this.select( this.selection_start, visible_bottom_position );

                    return;
                }

                if( this.is_line_marking_mode && this.line_selection_start )
                {
                    this.select_lines_with_position( this.line_selection_start, window_end_line_range.end );

                    return;
                }

                editor.selection = new vscode.Selection( visible_bottom_position, visible_bottom_position );

                return;
            }

            if( this.is_marking_mode )
            {
                vscode.commands.executeCommand( "cursorEndSelect", args ).then( () =>
                {
                    let editor = vscode.window.activeTextEditor;
                    if( editor )
                    {
                        this.selection_end = editor.selection.active;
                    }
                } );

                return;
            }
        }

        vscode.commands.executeCommand( "cursorEnd", args );
    };

    public delete = ( args: any[] | null ): void =>
    {
        vscode.commands.executeCommand( "deleteRight", args ).then( () => { this.stop_all_marking_modes(); } );
    };

    public backspace = ( args: any[] | null ): void =>
    {
        vscode.commands.executeCommand( "deleteLeft", args ).then( () => { this.stop_all_marking_modes(); } );
    };

    public tab = ( args: any[] | null ): void =>
    {
        vscode.commands.executeCommand( "tab", args ).then( () => { this.stop_all_marking_modes(); } );
    };

    public outdent = ( args: any[] | null ): void =>
    {
        vscode.commands.executeCommand( "outdent", args ).then( () => { this.stop_all_marking_modes(); } );
    };

    private copy_to_history = (): vscode.Position | null =>
    {
        let selection_start: vscode.Position;
        let selection_end: vscode.Position;

        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let selection: vscode.Selection | null = editor.selection;
            if( selection.isEmpty )
            {
                selection = this.select_lines();
            }

            if( selection )
            {
                let text = editor.document.getText( new vscode.Range( selection.start, selection.end ) );
                this.scrap_manager.copy( text );
                selection_start = selection.start;
                selection_end = selection.end;
                return selection_start;
            }
        }

        return null;
    };

    public copy = ( args: any[] | null ): void =>
    {
        this.copy_to_history();
        this.stop_all_marking_modes( true );
    };

    public cut = ( args: any[] | null ): void =>
    {
        this.cut_selection();
    };

    public cut_selection = async (): Promise<void> =>
    {
        return await new Promise( ( resolve, reject ) =>
        {
            let selection_start = this.copy_to_history();

            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                let selection = editor.selection;
                editor.edit( ( editBuilder: vscode.TextEditorEdit ) =>
                {
                    editBuilder.delete( selection );
                } ).then( () =>
                {
                    this.stop_all_marking_modes();
                    utility.reveal_current_cursor_position();
                    resolve();
                } );
            }
        } );
    };

    public paste = ( args: any[] | null ): void =>
    {
        let is_selection = false;
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            is_selection = !editor.selection.isEmpty;
        }

        if( !this.configuration?.paste_lines_at_home || is_selection )
        {
            vscode.commands.executeCommand( "editor.action.clipboardPasteAction", args ).then( () =>
            {
                this.scrap_manager.add_from_system_clipboard( true );
                this.stop_all_marking_modes();
            } );
        }
        else
        {
            vscode.env.clipboard.readText().then( ( text: string ) =>
            {
                if( text )
                {
                    const os = require( 'os' );
                    if( text.endsWith( os.EOL ) )
                    {
                        let editor = vscode.window.activeTextEditor;
                        if( editor )
                        {
                            utility.move_cursor( editor, new vscode.Position( editor.selection.active.line, 0 ) );
                        }
                    }

                    vscode.commands.executeCommand( "editor.action.clipboardPasteAction", args ).then( () =>
                    {
                        this.scrap_manager.add_from_system_clipboard( true );
                        this.stop_all_marking_modes();
                    } );
                }
            } );
        }
    };

    public open_scrap_dialog = ( args: any[] | null ): void =>
    {
        this.scrap_manager.open_scrap_dialog().
        catch( ( error: string ) =>
        {
            if( error === "empty" )
            {
                this.status_bar.set_temporary_message_fix( "No Scrap History" );
            }
        } ).
        finally( () =>
        {
            this.stop_all_marking_modes();
        } );
    };

    public save_and_exit = ( args: any[] | null ): void =>
    {
        vscode.commands.executeCommand( "workbench.action.files.saveAll", args ).then( () =>
        {
            vscode.commands.executeCommand( "workbench.action.quit", args );
        } );
    };

    public swap = ( args: any[] | null ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let selection = editor.selection;
            if( selection.isEmpty )
            {
                return;
            }

            vscode.env.clipboard.readText().then( ( text: string ) =>
            {
                if( text )
                {
                    this.cut_selection().
                    then( () =>
                    {
                        let editor = vscode.window.activeTextEditor;
                        if( editor )
                        {
                            editor.edit( ( editBuilder: vscode.TextEditorEdit ) =>
                            {
                                let editor = vscode.window.activeTextEditor;
                                if( editor )
                                {
                                    editBuilder.insert( editor.selection.active, text );
                                }
                            } );
                        }
                    } );
                }
            } );
        }
    };

    public top_of_window = ( args: any[] | null ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            utility.move_cursor( editor, new vscode.Position( editor.visibleRanges[0].start.line, editor.selection.active.character ) );
        }
    };

    public end_of_window = ( args: any[] | null ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            utility.move_cursor( editor, new vscode.Position( editor.visibleRanges[0].end.line, editor.selection.active.character ) );
        }
    };

    public line_to_top_of_window = ( args: any[] | null ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            editor.revealRange( new vscode.Range( editor.selection.active, editor.selection.active ),
                vscode.TextEditorRevealType.AtTop );
        }
    };

    public center_line_in_window = ( args: any[] | null ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            editor.revealRange( new vscode.Range( editor.selection.active, editor.selection.active ),
                vscode.TextEditorRevealType.InCenter );
        }
    };

    public line_to_bottom_of_window = ( args: any[] | null ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let viewport_length = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;
            let start_position = editor.document.validatePosition(
                new vscode.Position( editor.selection.active.line - viewport_length, editor.selection.active.character ) );
            editor.revealRange( new vscode.Range( start_position, editor.selection.active ) );
        }
    };

    public comment_line = ( args: any[] | null ): void =>
    {
        vscode.commands.executeCommand( "editor.action.commentLine", args ).then( () =>
            {
                this.stop_all_marking_modes();
            } );
    };

    public drop_bookmark = ( index: string | null ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor && index )
        {
            let position = editor.selection.active;
            this.bookmarks_manager.drop_bookmark( editor.document.uri, index, position );
            this.status_bar.set_temporary_message( `Dropped Bookmark ${index}` );
        }
    };

    public open_bookmarks_dialog = ( args: any[] | null ): void =>
    {
        this.bookmarks_manager.open_bookmarks_dialog().
            catch( ( error: string ) =>
            {
                if( error === "empty" )
                {
                    this.status_bar.set_temporary_message_fix( "No Dropped Bookmarks" );
                    return;
                }

                if( error === "invalid" )
                {
                    this.status_bar.set_temporary_message_fix( "Bookmark Number Not Dropped" );
                    return;
                }

                if( error === "file" )
                {
                    this.status_bar.set_temporary_message_fix( "Bookmark File Open Failed" );
                    return;
                }

                if( error === "location" )
                {
                    this.status_bar.set_temporary_message_fix( "Bookmark Show Failed" );
                    return;
                }

                if( error === "gear" )
                {
                    this.bookmarks_manager.open_bookmarks_manage_dialog().catch( () => {} );
                    return;
                }
            } ).
            finally( () =>
            {
                this.stop_all_marking_modes();
            } );
    };

    public jump_bookmark = ( args: any[] | null ): void =>
    {
        this.bookmarks_manager.jump_bookmark().
            catch( ( error: string ) =>
            {
                if( error === "empty" )
                {
                    this.status_bar.set_temporary_message_fix( "No Dropped Bookmarks" );
                    return;
                }

                if( error === "invalid" )
                {
                    this.status_bar.set_temporary_message_fix( "Bookmark Number Not Dropped" );
                    return;
                }

                if( error === "file" )
                {
                    this.status_bar.set_temporary_message_fix( "Bookmark File Open Failed" );
                    return;
                }

                if( error === "location" )
                {
                    this.status_bar.set_temporary_message_fix( "Bookmark Show Failed" );
                    return;
                }
            } ).
            finally( () =>
            {
                this.stop_all_marking_modes();
            } );
    };
}
