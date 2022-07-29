
import * as vscode from 'vscode';
import * as utility from './utility';
import { KeyEvent } from './utility';

export class Line_marking
{
    static s_is_marking_mode: boolean = false;
    private static s_selection_start_line: number | null = null;

    static enable_marking_mode = (): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if( editor )
        {
            this.s_is_marking_mode = true;
            this.s_selection_start_line = editor.selection.active.line;
            this.select( editor );
        }
    };

    static stop_marking_mode = ( remove_selection?: boolean ): void =>
    {
        this.s_is_marking_mode = false;
        this.s_selection_start_line = null;

        if( remove_selection )
        {
            utility.remove_selection();
        }
    };

    static on_did_change_text_editor_selection( editor: vscode.TextEditor )
    {
        if( this.s_is_marking_mode && ( this.s_selection_start_line !== null ) )
        {
            this.select( editor, editor.selection.active.line );
            return;
        }
    }

    private static select = ( editor: vscode.TextEditor,
                      selection_end_line?: number ): void =>
    {
        if( this.s_selection_start_line !== null )
        {
            selection_end_line = selection_end_line ?? this.s_selection_start_line;

            let selection_start: vscode.Position;
            let selection_end: vscode.Position;

            let selection_end_line_validated = editor.document.validatePosition( new vscode.Position( selection_end_line, 0 ) );
            
            if( this.s_selection_start_line >= selection_end_line )
            {
                selection_end = selection_end_line_validated;
                selection_start = editor.document.lineAt( new vscode.Position( this.s_selection_start_line, 0 ) ).rangeIncludingLineBreak.end;
            }
            else
            {
                selection_start = new vscode.Position( this.s_selection_start_line, 0 );
                selection_end = editor.document.lineAt( selection_end_line_validated ).rangeIncludingLineBreak.end;
            }

            editor.selection = new vscode.Selection( selection_start, selection_end );
            editor.revealRange( new vscode.Range( selection_end, selection_end ) );
        }
    };

    static caret_change_handler = ( key_code: number ): void =>
    {
        if( this.s_selection_start_line !== null )
        {
            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                let current = editor.selection.active;

                if( key_code === KeyEvent.VK_DOWN )
                {
                    if( current.line <= this.s_selection_start_line )
                    {
                        Line_marking.select( editor, editor.selection.active.line + 1 );
                        return;
                    }

                    if( current.line > this.s_selection_start_line )
                    {
                        Line_marking.select( editor, editor.selection.active.line );
                        return;
                    }
                }

                if( key_code === KeyEvent.VK_UP )
                {
                    if( current.line > this.s_selection_start_line )
                    {
                        Line_marking.select( editor, editor.selection.active.line - 2 );
                        return;
                    }

                    Line_marking.select( editor, editor.selection.active.line - 1 );
                    return;
                }

                if( key_code === KeyEvent.VK_PAGE_UP )
                {
                    let lines_in_view = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;
                    let end_line = editor.selection.active.line - lines_in_view;
                    this.select( editor, end_line );
                }

                if( key_code === KeyEvent.VK_PAGE_DOWN )
                {
                    let lines_in_view = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;
                    let end_line = editor.selection.active.line + lines_in_view;
                    this.select( editor, end_line );
                }
            }
        }
    };
}