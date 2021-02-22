
import * as vscode from 'vscode';

export let remove_selection = (): void =>
{
    let editor = vscode.window.activeTextEditor;
    if( editor )
    {
        let selection = editor.selection;
        if( !selection.isEmpty )
        {
            let postion = editor.selection.end;
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

export let move_cursor = ( position: vscode.Position ): void =>
{
    let editor = vscode.window.activeTextEditor;
    if( editor )
    {
        let validated_postion = editor.document.validatePosition( position );
        editor.selection = new vscode.Selection( validated_postion, validated_postion );
        editor.revealRange( new vscode.Range( validated_postion, validated_postion ) );
    }
};
