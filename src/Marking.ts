
import * as vscode from 'vscode';
import * as utility from './utility';

export class Marking
{
    private m_is_marking_mode: boolean;
    public get is_marking_mode(): boolean { return this.m_is_marking_mode; }
    private m_is_marking_mode_noninclusive: boolean;
    public get is_marking_mode_noninclusive(): boolean { return this.m_is_marking_mode_noninclusive; }

    private m_selection_start: vscode.Position | null;

    public constructor()
    {
        this.m_is_marking_mode = false;
        this.m_is_marking_mode_noninclusive = false;
        this.m_selection_start = null;
    }

    public enable_marking_mode = (is_noninclusive: boolean = false): void =>
    {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            this.m_is_marking_mode = true;
            this.m_is_marking_mode_noninclusive = is_noninclusive;
            this.m_selection_start = editor.selection.active;
            if(!is_noninclusive)
            {
                vscode.commands.executeCommand("cursorRightSelect");
            }
        }
    };

    public stop_marking_mode = (remove_selection?: boolean): void =>
    {
        this.m_is_marking_mode = false;
        this.m_is_marking_mode_noninclusive = false;
        this.m_selection_start = null;

        if (remove_selection) {
            utility.remove_selection();
        }
    };


    public on_did_change_text_editor_selection(editor: vscode.TextEditor)
    {
        if (this.m_is_marking_mode && (this.m_selection_start !== null)) {
            this.select(editor, editor.selection.active);
            return;
        }
    }

    public select = (editor: vscode.TextEditor,
        selection_end?: vscode.Position): void =>
    {
        if (this.m_selection_start !== null) {
            selection_end = selection_end ?? this.m_selection_start;

            this.m_selection_start = editor.document.validatePosition(this.m_selection_start);
            selection_end = editor.document.validatePosition(selection_end);

            editor.selection = new vscode.Selection(this.m_selection_start, selection_end);
            editor.revealRange(new vscode.Range(selection_end, selection_end));
        }
    };
}
