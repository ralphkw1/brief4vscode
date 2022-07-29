
import * as vscode from 'vscode';
import * as utility from './utility';

export class Marking
{
    static s_is_marking_mode: boolean = false;
    private static s_selection_start: vscode.Position | null = null;

    static enable_marking_mode = (): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            this.s_is_marking_mode = true;
            this.s_selection_start = editor.selection.active;
            vscode.commands.executeCommand( "cursorRightSelect" );
        }
    };

    static stop_marking_mode = ( remove_selection?: boolean ): void =>
    {
        this.s_is_marking_mode = false;
        this.s_selection_start = null;

        if( remove_selection )
        {
            utility.remove_selection();
        }
    };


    static on_did_change_text_editor_selection( editor: vscode.TextEditor )
    {
        if( this.s_is_marking_mode && ( this.s_selection_start !== null ) )
        {
            this.select( editor, editor.selection.active );
            return;
        }
    }

    static select = (  editor: vscode.TextEditor,
                       selection_end?: vscode.Position ): void =>
    {
        if( this.s_selection_start !== null )
        {
            selection_end = selection_end ?? this.s_selection_start;

            this.s_selection_start = editor.document.validatePosition( this.s_selection_start );
            selection_end = editor.document.validatePosition( selection_end );

            editor.selection = new vscode.Selection( this.s_selection_start, selection_end );
            editor.revealRange( new vscode.Range( selection_end, selection_end ) );
        }
    };
}
