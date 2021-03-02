
import * as vscode from 'vscode';

export class Local_storage
{
    private context: vscode.ExtensionContext;

    private global_storage: vscode.Memento & { setKeysForSync( keys: string[] ): void; };
    private workspace_storage: vscode.Memento;
    private storage_uri: vscode.Uri | undefined;
    private global_storage_uri: vscode.Uri;
    private log_uri: vscode.Uri;

    constructor( context: vscode.ExtensionContext )
    {
        this.context = context;
        this.global_storage = context.globalState;
        this.workspace_storage = context.workspaceState;
        this.storage_uri = context.storageUri;
        this.global_storage_uri = context.globalStorageUri;
        this.log_uri = context.logUri;
    }

    public dispose = (): void =>
    {
    };

    public get_global_value = ( key: string ): string =>
    {
        return this.global_storage.get<string>( key, "" );
    };

    public set_global_value = ( key: string, value: string ): Thenable<void> =>
    {
        return this.global_storage.update( key, value );
    };

    public delete_global_value = ( key: string ): Thenable<void> =>
    {
        return this.global_storage.update( key, undefined );
    };

    public get_workspace_value = ( key: string ): string =>
    {
        return this.workspace_storage.get<string>( key, "" );
    };

    public set_workspace_value = ( key: string, value: string ): Thenable<void> =>
    {
        return this.workspace_storage.update( key, value );
    };

    public delete_workspace_value = ( key: string ): Thenable<void> =>
    {
        return this.workspace_storage.update( key, undefined );
    };
}
