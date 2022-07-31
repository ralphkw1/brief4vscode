
import * as vscode from 'vscode';
import * as utility from './utility';
import { KeyEvent } from './utility';

export class Line_marking
{
    private m_is_marking_mode: boolean;

    public get is_marking_mode(): boolean
    {
        return this.m_is_marking_mode;
    }

    private m_selection_start: vscode.Position | null;
    private m_selection_end: vscode.Position | null;

    public constructor()
    {
        this.m_is_marking_mode = false;
        this.m_selection_start = null;
        this.m_selection_end = null;
    }

    public get_at_window_start(visible_top_position: vscode.Position): boolean
    {
        if (this.m_is_marking_mode && (this.m_selection_start !== null) && (this.m_selection_end !== null)) {
            return (this.m_selection_end.line <= visible_top_position.line);
        }
        else {
            return false;
        }
    }

    public enable_marking_mode = (): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            this.m_is_marking_mode = true;
            this.m_selection_start = editor.selection.active;
            this.select(editor);
        }
    };

    public stop_marking_mode = (remove_selection?: boolean): void =>
    {
        this.m_is_marking_mode = false;
        this.m_selection_start = null;
        this.m_selection_end = null;

        if (remove_selection) {
            utility.remove_selection();
        }
    };

    public on_did_change_text_editor_selection(editor: vscode.TextEditor)
    {
        if (this.m_is_marking_mode && (this.m_selection_start !== null)) {
            this.select_with_position(editor, this.m_selection_start, editor.selection.active);
            return;
        }
    }

    private select = (editor: vscode.TextEditor,
        selection_start_line?: number,
        selection_end_line?: number): vscode.Selection =>
    {
        selection_start_line = selection_start_line ?? editor.selection.active.line;
        selection_end_line = selection_end_line ?? selection_start_line;

        if (selection_start_line < 0) {
            selection_start_line = 0;
        }
        if (selection_end_line < 0) {
            selection_end_line = 0;
        }

        return this.select_with_position(editor, new vscode.Position(selection_start_line, 0), new vscode.Position(selection_end_line, 0));
    };

    public select_with_position = (editor: vscode.TextEditor,
        selection_start: vscode.Position,
        selection_end: vscode.Position): vscode.Selection =>
    {
        selection_start = selection_start ?? editor.selection.active;
        selection_end = selection_end ?? selection_start;

        this.m_selection_start = editor.document.validatePosition(new vscode.Position(selection_start.line, 0));
        let end_line_range = editor.document.lineAt(editor.document.validatePosition(selection_end)).range;
        this.m_selection_end = end_line_range.end;

        let start_position = this.m_selection_start;
        let next_line_position;
        if (selection_end.line >= selection_start.line) {
            next_line_position = editor.document.validatePosition(new vscode.Position(this.m_selection_end.line + 1, 0));
        }
        else {
            let start_line_range = editor.document.lineAt(start_position).rangeIncludingLineBreak;
            start_position = start_line_range.end;
            next_line_position = end_line_range.start;
        }

        let selection = new vscode.Selection(start_position, next_line_position);
        editor.selection = selection;

        let reveal_position = new vscode.Position(next_line_position.line, 0);
        editor.revealRange(new vscode.Range(reveal_position, reveal_position));

        return selection;
    };

    public caret_change_handler = (key_code: number): void =>
    {
        if (this.m_is_marking_mode && (this.m_selection_start !== null) && (this.m_selection_end !== null)) {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let current = editor.selection.active;

                if (key_code === utility.KeyEvent.VK_UP) {
                    let end_line = this.m_selection_end.line - 1;
                    this.select(editor, this.m_selection_start.line, end_line);
                    return;
                }

                if (key_code === utility.KeyEvent.VK_DOWN) {
                    let end_line = this.m_selection_end.line + 1;
                    this.select(editor, this.m_selection_start.line, end_line);
                    return;
                }

                if (key_code === utility.KeyEvent.VK_PAGE_UP) {
                    let lines_in_view = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;
                    let end_line = this.m_selection_end.line - lines_in_view;
                    this.select(editor, this.m_selection_start.line, end_line);
                    return;
                }

                if (key_code === utility.KeyEvent.VK_PAGE_DOWN) {
                    let lines_in_view = editor.visibleRanges[0].end.line - editor.visibleRanges[0].start.line;
                    let end_line = this.m_selection_end.line + lines_in_view;
                    this.select(editor, this.m_selection_start.line, end_line);
                    return;
                }
            }
        }
    };

    public select_from_start = (editor:vscode.TextEditor, end:number) => {
        if (this.m_selection_start !== null) {
            this.select(editor, this.m_selection_start.line, end);
        }
    };
}