
import * as vscode from 'vscode';

import { Status_bar } from "./Status_bar";

import { Configuration, get_configuration } from "./extension";

import { Scrap_manager } from './Scrap_manager';

export class Commands
{
    private status_bar: Status_bar;
    private scrap_manager: Scrap_manager;

    private is_overstrike_mode: boolean;

    private is_line_marking_mode: boolean;
    private line_selection_start: number;
    private line_selection_end: number;

    public constructor( context: vscode.ExtensionContext,
        status_bar: Status_bar,
        scrap_manager: Scrap_manager )
    {
        this.status_bar = status_bar;
        this.scrap_manager = scrap_manager;

        this.scrap_manager.add_from_system_clipboard();

        this.is_overstrike_mode = false;
        this.is_line_marking_mode = false;
        this.line_selection_start = -1;
        this.line_selection_end = -1;

        context.subscriptions.push(
            vscode.commands.registerCommand( "type", this.type_command ),
            vscode.commands.registerCommand( "brief4vscode.enable_brief4vscode", this.enable_brief4vscode ),
            vscode.commands.registerCommand( "brief4vscode.disable_brief4vscode", this.disable_brief4vscode ),
            vscode.commands.registerCommand( "brief4vscode.overstrike_toggle", this.overstrike_toggle ),
            vscode.commands.registerCommand( "brief4vscode.down", this.down ),
            vscode.commands.registerCommand( "brief4vscode.up", this.up ),
            vscode.commands.registerCommand( "brief4vscode.page_down", this.page_down ),
            vscode.commands.registerCommand( "brief4vscode.page_up", this.page_up ),
            vscode.commands.registerCommand( "brief4vscode.end", this.end ),
            vscode.commands.registerCommand( "brief4vscode.home", this.home ),
            vscode.commands.registerCommand( "brief4vscode.delete", this.delete ),
            vscode.commands.registerCommand( "brief4vscode.backspace", this.backspace ),
            vscode.commands.registerCommand( "brief4vscode.tab", this.tab ),
            vscode.commands.registerCommand( "brief4vscode.outdent", this.outdent ),
            vscode.commands.registerCommand( "brief4vscode.line_marking_mode_toggle", this.line_marking_mode_toggle ),
            vscode.commands.registerCommand( "brief4vscode.copy", this.copy ),
            vscode.commands.registerCommand( "brief4vscode.cut", this.cut ),
            vscode.commands.registerCommand( "brief4vscode.paste", this.paste ),
            vscode.commands.registerCommand( "brief4vscode.open_scrap_dialog", this.open_scrap_dialog ) );

        context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor( this.on_did_change_active_text_editor ),
            vscode.window.onDidChangeWindowState( this.on_did_change_window_state ),
            vscode.window.onDidChangeTextEditorSelection( this.on_did_change_text_editor_selection ) );
    }

    public destroy = (): void =>
    {
    };

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

    public overstrike_toggle = ( args: any[] ): void =>
    {
        this.is_overstrike_mode = !this.is_overstrike_mode;
        this.set_overstrike_mode( this.is_overstrike_mode );
    };

    private set_overstrike_mode = ( is_overstrike_mode: boolean ): void =>
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
                editor.options.cursorStyle = get_configuration().default_cursor_style;
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
                let position = editor.selection.active;

                if( this.is_line_marking_mode )
                {
                    this.select_lines( this.line_selection_start, position.line );
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
        this.is_line_marking_mode = false;
        this.line_selection_start = this.line_selection_end = -1;

        this.status_bar?.clear_all();

        if( remove_selection )
        {
            this.remove_selection();
        }
    };

    public line_marking_mode_toggle = ( args: any[] ): void =>
    {
        this.is_line_marking_mode = !this.is_line_marking_mode;
        this.set_line_marking_mode( this.is_line_marking_mode );
    };

    private set_line_marking_mode = ( is_line_marking_mode: boolean ): void =>
    {
        if( is_line_marking_mode )
        {
            this.set_overstrike_mode( false );
        }

        this.is_line_marking_mode = is_line_marking_mode;
        this.status_bar?.set_line_marking_mode( is_line_marking_mode );

        vscode.commands.executeCommand( "setContext", "brief4vscode_line_marking_mode", is_line_marking_mode );

        if( !is_line_marking_mode )
        {
            this.stop_all_marking_modes();
        }
        else
        {
            this.select_line();
        }
    };

    private remove_selection = (): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let selection = editor.selection;
            if( !selection.isEmpty )
            {
                var postion = editor.selection.end;
                editor.selection = new vscode.Selection( postion, postion );
            }
        }
    };

    private select_lines = ( start: number, end: number ): vscode.Selection | null =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            if( start < 0 ) { start = 0; }
            if( end >= editor.document.lineCount ) { end = editor.document.lineCount - 1; }
            if( end < 0 ) { end = 0; }

            if( end >= start )
            {
                let start_position = editor.document.validatePosition( new vscode.Position( start, 0 ) );
                this.line_selection_start = start_position.line;
                let end_position = editor.document.validatePosition( new vscode.Position( end, editor.document.lineAt( end ).text.length ) );
                this.line_selection_end = end_position.line;
                let next_line_position = editor.document.validatePosition( new vscode.Position( this.line_selection_end + 1, 0 ) );
                let selection = new vscode.Selection( start_position, next_line_position );
                editor.selection = selection;
                return selection;
            }
            else
            {
                let start_position = editor.document.validatePosition( new vscode.Position( start, editor.document.lineAt( start ).text.length ) );
                this.line_selection_start = start_position.line;
                let end_position = editor.document.validatePosition( new vscode.Position( end, 0 ) );
                this.line_selection_end = end_position.line;
                let selection = new vscode.Selection( start_position, end_position );
                editor.selection = selection;
                return selection;
            }
        }

        return null;
    };

    private select_line = ( start?: number ): vscode.Selection | null =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let start_line = start ? start : editor.selection.active.line;
            return this.select_lines( start_line, start_line );
        }

        return null;
    };

    public up = ( args: any[] ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            if( this.is_line_marking_mode )
            {
                let end = this.line_selection_end - 1;
                this.select_lines( this.line_selection_start, end );
                end -= 2;
                let reveal_line = ( end > 0 ) ? end : 0;
                let reveal_position = editor.document.validatePosition( new vscode.Position( reveal_line, 0 ) );
                editor.revealRange( new vscode.Range( reveal_position, reveal_position ) );

                return;
            }
        }

        vscode.commands.executeCommand( "cursorUp", args );
    };

    public down = ( args: any[] ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            if( this.is_line_marking_mode )
            {
                this.select_lines( this.line_selection_start, this.line_selection_end + 1 );
                let next_end_line_position =
                    editor.document.validatePosition( new vscode.Position( this.line_selection_end + 1, 0 ) );
                editor.revealRange( new vscode.Range( next_end_line_position, next_end_line_position ) );

                return;
            }
        }

        vscode.commands.executeCommand( "cursorDown", args );
    };

    public page_up = ( args: any[] ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            if( this.is_line_marking_mode )
            {
                let lines_in_view = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;

                let end = this.line_selection_end - lines_in_view;
                this.select_lines( this.line_selection_start, end );
                end -= 2;
                let reveal_line = ( end > 0 ) ? end : 0;
                let reveal_position = editor.document.validatePosition( new vscode.Position( reveal_line, 0 ) );
                editor.revealRange( new vscode.Range( reveal_position, reveal_position ) );

                return;
            }
        }

        vscode.commands.executeCommand( "cursorPageUp", args );
    };

    public page_down = ( args: any[] ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            if( this.is_line_marking_mode )
            {
                let lines_in_view = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;

                this.select_lines( this.line_selection_start, this.line_selection_end + lines_in_view );
                let next_end_line_position =
                    editor.document.validatePosition( new vscode.Position( this.line_selection_end + 1, 0 ) );
                editor.revealRange( new vscode.Range( next_end_line_position, next_end_line_position ) );

                return;
            }
        }

        vscode.commands.executeCommand( "cursorPageDown", args );
    };

    public home = ( args: any[] ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let position = editor.selection.active;

            let character = position.character;
            let line = position.line;

            let visible_top_line = editor.visibleRanges[0].start.line;

            let at_file_start = ( ( line === 0 ) && ( character === 0 ) );
            let at_window_start_normal_mode = ( ( line === visible_top_line ) && ( character === 0 ) );
            let at_window_start_line_marking_mode = this.is_line_marking_mode && ( ( line === visible_top_line + 1 ) && ( character === 0 ) );
            let at_window_start = at_window_start_normal_mode || at_window_start_line_marking_mode;
            let at_line_start = ( character === 0 );

            if( at_file_start )
            {
                return;
            }

            if( at_window_start )
            {
                let new_position = new vscode.Position( 0, 0 );
                if( this.is_line_marking_mode )
                {
                    this.select_lines( this.line_selection_start, new_position.line );
                }
                else
                {
                    editor.selection = new vscode.Selection( new_position, new_position );
                }
                editor.revealRange( new vscode.Range( new_position, new_position ) );
                return;
            }

            if( at_line_start )
            {
                let new_position = new vscode.Position( visible_top_line, 0 );
                if( this.is_line_marking_mode )
                {
                    this.select_lines( this.line_selection_start, new_position.line );
                }
                else
                {
                    editor.selection = new vscode.Selection( new_position, new_position );
                }
                return;
            }

            let new_position = new vscode.Position( line, 0 );
            if( this.is_line_marking_mode )
            {
                this.select_lines( this.line_selection_start, new_position.line );
            }
            else
            {
                editor.selection = new vscode.Selection( new_position, new_position );
            }

            return;
        }

        vscode.commands.executeCommand( "cursorHome", args );
    };

    public end = ( args: any[] ): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let position = editor.selection.active;

            let character = position.character;
            let line = position.line;

            let line_end = editor.document.validatePosition(
                new vscode.Position( line, editor.document.lineAt( line ).text.length ) );
            let visible_end_line = editor.visibleRanges[0].end.line;
            let visible_end_position = editor.document.validatePosition(
                new vscode.Position( visible_end_line, editor.document.lineAt( visible_end_line ).text.length ) );
            let visible_end_minus_1_position = editor.document.validatePosition(
                new vscode.Position( visible_end_line - 1, editor.document.lineAt( visible_end_line - 1 ).text.length ) );
            let file_end_line = editor.document.lineCount - 1;
            let file_end_position = editor.document.validatePosition(
                new vscode.Position( file_end_line, editor.document.lineAt( file_end_line ).text.length ) );

            let at_file_end = ( ( line === file_end_line ) && ( character === file_end_position.character ) );
            let at_window_end_normal_mode = ( ( ( line === visible_end_line ) && ( character === visible_end_position.character ) ) ||
                ( ( line === visible_end_line - 1 ) && ( character === visible_end_minus_1_position.character ) ) );
            let at_window_end_line_marking_mode = ( ( line === visible_end_line ) || ( line === visible_end_line - 1 ) );
            let at_window_end = at_window_end_normal_mode || at_window_end_line_marking_mode;
            let at_line_end = ( ( character === line_end.character ) || ( this.is_line_marking_mode ) );

            if( at_file_end )
            {
                return;
            }

            if( at_window_end )
            {
                if( this.is_line_marking_mode )
                {
                    this.select_lines( this.line_selection_start, file_end_position.line );
                }
                else
                {
                    editor.selection = new vscode.Selection( file_end_position, file_end_position );
                }

                editor.revealRange( new vscode.Range( file_end_position, file_end_position ) );

                return;
            }

            if( at_line_end )
            {
                if( this.is_line_marking_mode )
                {
                    this.select_lines( this.line_selection_start, visible_end_position.line - 1 );
                }
                else
                {
                    editor.selection = new vscode.Selection( visible_end_position, visible_end_position );
                }

                return;
            }

            if( this.is_line_marking_mode )
            {
                this.select_lines( this.line_selection_start, line_end.line );
            }
            else
            {
                editor.selection = new vscode.Selection( line_end, line_end );
            }

            return;
        }

        vscode.commands.executeCommand( "cursorEnd", args );
    };

    public delete = ( args: any[] ): void =>
    {
        vscode.commands.executeCommand( "deleteRight", args ).
        then( () => { this.stop_all_marking_modes(); } );
    };

    public backspace = ( args: any[] ): void =>
    {
        vscode.commands.executeCommand( "deleteLeft", args ).
        then( () => { this.stop_all_marking_modes(); } );
    };

    public tab = ( args: any[] ): void =>
    {
        vscode.commands.executeCommand( "tab", args ).
        then( () => { this.stop_all_marking_modes(); } );
    };

    public outdent = ( args: any[] ): void =>
    {
        vscode.commands.executeCommand( "outdent", args ).
        then( () => { this.stop_all_marking_modes(); } );
    };

    public is_any_marking_mode = (): boolean =>
    {
        return this.is_line_marking_mode;
    };

    private copy_or_cut_to_history = (): vscode.Position | null =>
    {
        let selection_start: vscode.Position;
        let selection_end: vscode.Position;

        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let selection: vscode.Selection | null = editor.selection;
            if( selection.isEmpty )
            {
                selection = this.select_line();
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

    public copy = ( args: any[] ): void =>
    {
        this.copy_or_cut_to_history();
        this.stop_all_marking_modes( true );
    };

    public cut = async ( args: any[] ): Promise<void> =>
    {
        let selection_start = this.copy_or_cut_to_history();

        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            let selection = editor.selection;
            editor.edit( builder =>
                {
                    builder.delete( selection );
                } ).
                then( () =>
                {
                    this.stop_all_marking_modes();
                } );
        }
    };

    public paste = ( args: any[] ): void =>
    {
        vscode.commands.executeCommand( "editor.action.clipboardPasteAction", args ).
        then( () =>
        {
            this.scrap_manager.add_from_system_clipboard( true );
            this.stop_all_marking_modes();
        } );
    };

    public open_scrap_dialog = ( args: any[] ): void =>
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

    public get_number_of_selected_lines( editor: vscode.TextEditor | null ): number
    {
        if( editor )
        {
            if( !editor.selection.isEmpty )
            {
                return editor.selections.reduce( ( previous_value, current_value ) =>
                    previous_value + ( current_value.end.line - current_value.start.line ), 0 );
            }
        }

        return -1;
    };
}
