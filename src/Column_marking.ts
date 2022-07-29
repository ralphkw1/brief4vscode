import { table } from 'console';
import * as vscode from 'vscode';
import { Scrap_manager } from './Scrap_manager';

export class Column_marking
{
    static readonly COLUMN_DECORATION_TYPE: vscode.TextEditorDecorationType = 
        vscode.window.createTextEditorDecorationType( { backgroundColor: new vscode.ThemeColor("editor.selectionBackground") } );

    static s_is_marking_mode: boolean = false;
    private static s_selection_start: vscode.Position | null = null;
    
    static s_decorations_array: vscode.DecorationOptions[] | null = null;

    static enable_marking_mode = (): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            this.s_selection_start = editor.selection.active;
            this.s_decorations_array = [];

            let move = editor.document.validatePosition( new vscode.Position( this.s_selection_start.line,
                                                        this.s_selection_start.character + 1 ) );
            editor.selection = new vscode.Selection( move, move );

            this.caret_change_handler();
        }
    };

    static stop_marking_mode = ( remove_selection?: boolean ): void =>
    {
        this.s_is_marking_mode = false;
        this.s_selection_start = null;
        this.s_decorations_array = null;
        
        if( remove_selection )
        {
            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                this.remove_all_highlighters( editor );
            }
        }
    };

    static on_did_change_text_editor_selection = ( editor: vscode.TextEditor ): void =>
    {
        if( this.s_is_marking_mode && ( this.s_selection_start !== null ) )
        {
            this.caret_change_handler();
            return;
        }
    };

    static caret_change_handler = (): void =>
    {
        if( this.s_is_marking_mode && ( this.s_selection_start !== null ) )
        {
            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                let caret_logical_position = editor.selection.active;

                if( caret_logical_position.line > this.s_selection_start.line )
                {
                    if( caret_logical_position.character > this.s_selection_start.character )
                    {
                        let start = this.s_selection_start;
                        let end = caret_logical_position;

                        this.set_column_selection( editor,
                                                            start,
                                                            end );
                        return;
                    }
                    else if( caret_logical_position.character < this.s_selection_start.character )
                    {
                        let start = new vscode.Position( this.s_selection_start.line,
                                                        caret_logical_position.character );
                        let end = new vscode.Position( caret_logical_position.line,
                                                    this.s_selection_start.character );

                        this.set_column_selection( editor,
                                                            start,
                                                            end );
                        return;
                    }
                    else // if( caret_logical_position.character == s_column_selection_origin.character )
                    {
                        this.remove_all_highlighters( editor );
                        return;
                    }
                }
                else if( caret_logical_position.line < this.s_selection_start.line )
                {
                    if( caret_logical_position.character > this.s_selection_start.character )
                    {
                        let start = new vscode.Position( caret_logical_position.line,
                                                                    this.s_selection_start.character );
                        let end = new vscode.Position( this.s_selection_start.line,
                                                                caret_logical_position.character );

                        this.set_column_selection( editor,
                                                            start,
                                                            end );
                        return;
                    }
                    else if( caret_logical_position.character < this.s_selection_start.character )
                    {
                        let start = caret_logical_position;
                        let end = this.s_selection_start;

                        this.set_column_selection( editor,
                                                            start,
                                                            end );
                        return;
                    }
                    else // if( caret_logical_position.character == this.s_column_selection_origin.character )
                    {
                        this.remove_all_highlighters( editor );
                        return;
                    }
                }
                else // if( caret_logical_position.line == this.s_column_selection_origin.line )
                {
                    if( caret_logical_position.character > this.s_selection_start.character )
                    {
                        let start = this.s_selection_start;
                        let end = caret_logical_position;

                        this.set_column_selection( editor,
                                                            start,
                                                            end );
                        return;
                    }
                    else if( caret_logical_position.character < this.s_selection_start.character )
                    {
                        let start = caret_logical_position;
                        let end = this.s_selection_start;

                        this.set_column_selection( editor,
                                                            start,
                                                            end );
                        return;
                    }
                    else // if( caret_logical_position.character == this.s_column_selection_origin.character )
                    {
                        this.remove_all_highlighters( editor );
                        return;
                    }
                }
            }
        }
    };

    private static set_column_selection = ( editor: vscode.TextEditor,
                                    start: vscode.Position,
                                    end: vscode.Position ): void =>
    {
        
        let width = end.character - start.character;
        if( width > 0 )
        {
            this.s_decorations_array = [];

            for( let line = start.line; line <= end.line; line++ )
            {
                let range = new vscode.Range( new vscode.Position( line, start.character),
                                            new vscode.Position( line, end.character) );
                let decoration: vscode.DecorationOptions = { range };
                this.s_decorations_array.push(decoration);
            }

            editor.setDecorations( this.COLUMN_DECORATION_TYPE,
                                   this.s_decorations_array );
        }
    };

    private static remove_all_highlighters = ( editor: vscode.TextEditor ): void =>
    {
        this.s_decorations_array = [];
        editor.setDecorations( this.COLUMN_DECORATION_TYPE,
                               this.s_decorations_array );
        this.s_decorations_array = null;
    };

    static delete_selection = ( editor: vscode.TextEditor ): Thenable<boolean> =>
    {
        if( this.s_decorations_array &&
            ( this.s_decorations_array.length > 0 ) )
        {
            return editor.edit( editBuilder =>
            {
                if( this.s_decorations_array )
                {
                    this.s_decorations_array.forEach( ( element ) =>
                    {
                        editBuilder.delete( element.range );
                    });
                }
            });
        }

        return new Promise((resolve, reject) => { reject(); });
    };

    private static get_selection = ( editor: vscode.TextEditor ): Column_mode_block_data | null =>
    {
        if( this.s_decorations_array &&
            ( this.s_decorations_array.length > 0 ) )
        {
            let size = this.s_decorations_array.length;
            if( size > 0 )
            {
                this.s_decorations_array.
                    sort((a, b) => (a.range.start.line < b.range.start.line) ? -1 : 1);

                let block_text_array: string[] = [];
                this.s_decorations_array.forEach( ( element ) =>
                {
                    let row_text = editor.document.getText( element.range );
                    block_text_array.push( row_text.replace("\r", "").replace("\n", "") );
                });

                if( block_text_array.length > 0 )
                {
                    return new Column_mode_block_data( block_text_array );
                }
            }
        }

        return null;
    };

    static copy_to_history = ( editor: vscode.TextEditor, scrap_manager: Scrap_manager ): void =>
    {
        let selection = this.get_selection( editor );
        if( selection !== null )
        {
            scrap_manager.copy( selection.serialize_to_JSON() );
        }
    };

    static paste( editor: vscode.TextEditor, block_JSON: string ): Thenable<unknown> | null
    {
        return editor.edit( ( editBuilder: vscode.TextEditorEdit ) =>
        {
            let current_cursor_position = editor.selection.active;
            let block_data = Column_mode_block_data.deserialize_from_JSON( block_JSON );
            if( block_data !== null )
            {
                block_data.rows.forEach( ( element ) =>
                {
                    editBuilder.insert( current_cursor_position, element );
                    current_cursor_position = current_cursor_position.with( current_cursor_position.line + 1, current_cursor_position.character );
                });
            }

            // Not sure why this works...
            editor.selection = new vscode.Selection( current_cursor_position, current_cursor_position );
        });
    }
};

export const Column_mode_block_data_mime_type: string = "text/brief-column-mode-block; class=net.ddns.rkdawenterprises.brief4vscode.Column_mode_block_data";

export class Column_mode_block_data
{
    public readonly mime: string = Column_mode_block_data_mime_type;
    public readonly width: number;
    public readonly rows: string[];

    public constructor( rows: string[] )
    {
        this.rows = rows;

        let maximum_width = 0;
        rows.forEach( ( element ) =>
        {
            if( element.length > maximum_width )
            {
                maximum_width = element.length;
            }
        });

        this.width = maximum_width;

        for( var i=0; i < rows.length; i++)
        {
            rows[i] = rows[i].padEnd( this.width, " " );
        }
    }

    public static deserialize_from_JSON = ( block_JSON: string ): Column_mode_block_data =>
    {
        let object: Column_mode_block_data = JSON.parse( block_JSON );
        return object;
    };
    
    public static serialize_to_JSON = ( block_data: Column_mode_block_data ): string =>
    {
        return JSON.stringify( block_data, null, 4 );
    };
    
    public serialize_to_JSON = (): string =>
    {
        return JSON.stringify( this, null, 4 );
    };
}