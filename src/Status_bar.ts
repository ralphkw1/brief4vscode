
import { time } from 'console';
import * as vscode from 'vscode';

export class Status_bar
{
    private overstrike_mode_message: vscode.Disposable | null = null;
    private line_marking_mode_message: vscode.Disposable | null = null;
    private temporary_message: vscode.Disposable | null = null;

    public constructor()
    {
        this.overstrike_mode_message = null;
    }

    public destroy = (): void =>
    {
        this.clear_all();
    };

    public clear_all = (): void =>
    {
        if( this.overstrike_mode_message )
        {
            this.overstrike_mode_message.dispose();
            this.overstrike_mode_message = null;
        }

        if( this.line_marking_mode_message )
        {
            this.line_marking_mode_message.dispose();
            this.line_marking_mode_message = null;
        }

        if( this.temporary_message )
        {
            this.temporary_message.dispose();
            this.temporary_message = null;
        }
    };

    public set_overstrike_mode = ( is_overstrike_mode: boolean ): void =>
    {
        if( this.overstrike_mode_message )
        {
            this.overstrike_mode_message.dispose();
            this.overstrike_mode_message = null;
        }

        if( is_overstrike_mode )
        {
            this.overstrike_mode_message =
                vscode.window.setStatusBarMessage( `$(alert)<OVERSTRIKE>` );
        }
    };

    public set_line_marking_mode = ( is_line_marking_mode: boolean ): void =>
    {
        if( this.line_marking_mode_message )
        {
            this.line_marking_mode_message.dispose();
            this.line_marking_mode_message = null;
        }

        if( is_line_marking_mode )
        {
            this.line_marking_mode_message =
                vscode.window.setStatusBarMessage( `$(alert)<LINE-MARKING-MODE>` );
        }
    };

    public set_temporary_message = ( message: string | null, timeout_in_ms?: number ): void =>
    {
        if( this.temporary_message )
        {
            this.temporary_message.dispose();
            this.temporary_message = null;
        }

        if( message )
        {
            let timeout = 3000;
            if( timeout_in_ms ) { timeout = timeout_in_ms; }
            let full_message = `$(alert)<${message}>`;
            this.temporary_message =
                vscode.window.setStatusBarMessage( full_message, timeout );
        }
    };

    public set_temporary_message_fix = ( message: string | null, timeout_in_ms?: number ): void =>
    {
        setTimeout( () =>
            {
                this.set_temporary_message( message, timeout_in_ms );
            }, 10 );
    };
}
