
import * as vscode from 'vscode';

export let remove_selection = (): void =>
{
    let editor = vscode.window.activeTextEditor;
    if( editor )
    {
        let selection = editor.selection;
        if( !selection.isEmpty )
        {
            let postion = selection.end;
            editor.selection = new vscode.Selection( postion, postion );
        }
    }
};

export let reveal_current_cursor_position = (): void =>
{
    let editor = vscode.window.activeTextEditor;
    if( editor )
    {
        let selection = editor.selection.active;
        editor.revealRange( new vscode.Range( selection, selection ) );
    }
};

export let get_number_of_selected_lines = ( editor: vscode.TextEditor | null ): number =>
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

export let move_cursor = ( editor: vscode.TextEditor, position: vscode.Position ): void =>
{
    let validated_postion = editor.document.validatePosition( position );
    editor.selection = new vscode.Selection( validated_postion, validated_postion );
    editor.revealRange( new vscode.Range( validated_postion, validated_postion ) );
};

export class KeyEvent
{
    public static readonly VK_PAGE_UP = 33;
    public static readonly VK_PAGE_DOWN = 34;
    public static readonly VK_END = 35;
    public static readonly VK_HOME = 36;
    public static readonly VK_LEFT = 37;
    public static readonly VK_UP = 38;
    public static readonly VK_RIGHT = 39;
    public static readonly VK_DOWN = 40;
    
    public static readonly VK_SHIFT = 16;
    public static readonly VK_CONTROL = 17;
    public static readonly VK_META = 157;
    public static readonly VK_ALT = 18;

    public static readonly SHIFT_DOWN_MASK = 64;
    public static readonly CTRL_DOWN_MASK = 128;
    public static readonly META_DOWN_MASK = 256;
    public static readonly ALT_DOWN_MASK = 512;

    public keyCode: number;
    public modifiers: number | null;
 
    public constructor( keyCode: number,
                        modifiers?: number )
    {
        this.keyCode = keyCode;
        this.modifiers = modifiers ?? null;
    }
}

export let select_lines = ( selection_start_line?: number,
                            selection_end_line?: number ): vscode.Selection | null =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            selection_start_line = selection_start_line ?? editor.selection.active.line;
            selection_end_line = selection_end_line ?? selection_start_line;

            if( selection_start_line < 0 ) { selection_start_line = 0; }
            if( selection_end_line < 0 ) { selection_end_line = 0; }
            let max = editor.document.lineCount - 1;
            if( selection_end_line > max ) { selection_end_line = max; }

            let selection_start: vscode.Position;
            let selection_end: vscode.Position;

            let selection_end_line_validated = editor.document.validatePosition( new vscode.Position( selection_end_line, 0 ) );
            
            if( selection_start_line >= selection_end_line )
            {
                selection_end = selection_end_line_validated;
                selection_start = editor.document.lineAt( new vscode.Position( selection_start_line, 0 ) ).rangeIncludingLineBreak.end;
            }
            else
            {
                selection_start = new vscode.Position( selection_start_line, 0 );
                selection_end = editor.document.lineAt( selection_end_line_validated ).rangeIncludingLineBreak.end;
            }

            let selection = editor.selection = new vscode.Selection( selection_start, selection_end );
            editor.revealRange( new vscode.Range( selection_end, selection_end ) );
            return selection;
        }

        return null;
    };
