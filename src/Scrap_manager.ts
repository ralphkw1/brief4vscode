
import * as vscode from 'vscode';

import * as utility from './utility';
import { Local_storage } from './Local_storage';

export class Scrap_manager
{
    private scrap_buffer: Scrap_buffer;

    private current: vscode.QuickInput | null = null;

    private storage: Local_storage;

    public constructor( storage: Local_storage )
    {
        this.storage = storage;

        this.current = null;

        this.scrap_buffer = new Scrap_buffer();
    }

    public initialize = (): void =>
    {
        this.get_stored_scrap();
    };

    public destroy = (): void =>
    {
        this.store_scrap_items();

        this.current?.dispose();

        this.scrap_buffer.destroy();
    };

    private get_item_count = (): number =>
    {
        return this.scrap_buffer.length();
    };

    private get_stored_scrap = (): void =>
    {
        let item_list_as_string = this.storage.get_global_value( "scrap_buffer" );
        if( item_list_as_string )
        {
            this.scrap_buffer.deserialize_item_list( item_list_as_string );
        }
    };

    private store_scrap_items = (): Thenable<void> =>
    {
        let item_list_as_string = this.scrap_buffer.serialize_item_list();
        if( item_list_as_string )
        {
            return this.storage.set_global_value( "scrap_buffer", item_list_as_string );
        }

        return this.storage.delete_global_value( "scrap_buffer" );
    };

    public add_from_system_clipboard = ( move_to_front?: boolean ): void =>
    {
        vscode.env.clipboard.readText().then( ( text: string ) =>
        {
            if( text )
            {
                if( move_to_front )
                {
                    this.scrap_buffer.add_exclusive( text );
                }
                else
                {
                    this.scrap_buffer.add_if_missing( text );
                }
            }

            this.store_scrap_items();
        } );
    };

    public push_to_system_clipboard = ( item: string ): void =>
    {
        vscode.env.clipboard.writeText( item );
    };

    public copy = ( item: string ): void =>
    {
        this.scrap_buffer.add_exclusive( item );
        this.store_scrap_items();
        this.push_to_system_clipboard( item );
    };

    public paste = async ( item: string ): Promise<void> =>
    {
        return await new Promise( ( resolve, reject ) =>
        {
            let editor = vscode.window.activeTextEditor;
            if( editor )
            {
                editor.edit( ( editBuilder: vscode.TextEditorEdit ) =>
                {
                    let editor = vscode.window.activeTextEditor;
                    if( editor )
                    {
                        let is_selection = !editor.selection.isEmpty;
                        if( is_selection )
                        {
                            editBuilder.delete( editor.selection );
                            editBuilder.insert( editor.selection.active, item );
                        }
                        else
                        {
                            const os = require( 'os' );
                            if( item.endsWith( os.EOL ) )
                            {
                                utility.move_cursor( editor, new vscode.Position( editor.selection.active.line, 0 ) );
                            }

                            editBuilder.insert( editor.selection.active, item );
                        }
                    }
                } ).then( () =>
                {
                    this.push_to_system_clipboard( item );
                    this.scrap_buffer.add_exclusive( item );
                    this.store_scrap_items();
                    resolve();
                } );
            }

            reject();
        } );
    };

    public open_scrap_dialog = async (): Promise<void> =>
    {
        return await new Promise( ( resolve, reject ) =>
        {
            this.show_scrap_dialog().then( async ( item: string ) =>
            {
                await this.paste( item );
                resolve();
            } ).
            catch( ( error: string ) =>
            {
                reject( error );
            } );
        } );
    };

    private last_active: string = "";
    private last_selected: string = "";

    public show_scrap_dialog = async (): Promise<string> =>
    {
        const disposables: vscode.Disposable[] = [];
        try
        {
            return await new Promise( ( resolve, reject ) =>
            {
                this.last_active = "";
                this.last_selected = "";

                let input = vscode.window.createQuickPick<vscode.QuickPickItem>();

                input.title = "Scrap History";
                input.placeholder = "Scroll to item to paste then <enter>, or click on item to paste...";

                let delete_all: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon( 'clear-all' ), tooltip: "Delete all items" };
                let cancel: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon( 'close' ), tooltip: "Cancel" };
                input.buttons = [delete_all, cancel];

                let items: vscode.QuickPickItem[] | null = this.scrap_buffer.get_quick_pick_items();
                if( !items )
                {
                    reject( "empty" );
                    input.dispose();
                    this.current = null;
                }
                else
                {
                    input.items = items;
                    input.activeItems = [items[0]];
                }

                disposables.push(
                    input.onDidTriggerButton( async ( e: vscode.QuickInputButton ) =>
                    {
                        let id = ( <vscode.ThemeIcon>( e.iconPath ) ).id;
                        if( id === "clear-all" )
                        {
                            this.scrap_buffer.remove_all();
                            this.store_scrap_items();
                            reject( "empty" );
                            input.hide();
                        }
                        else if( id === "close" )
                        {
                            reject( "close" );
                            input.hide();
                        }
                        else
                        {
                            reject( ( <vscode.ThemeIcon>( e.iconPath ) ).id );
                            input.hide();
                        }
                    } ),

                    input.onDidHide( async () =>
                    {
                        reject( "hide" );
                        input.dispose();
                        this.current = null;
                    } ),

                    input.onDidChangeSelection( async ( e: vscode.QuickPickItem[] ) =>
                    {
                        if( e.length > 0 )
                        {
                            let index = parseInt( e[0].label ) - 1;
                            let item = this.scrap_buffer.get_item( index );
                            if( item )
                            {
                                resolve( item );
                                input.hide();
                            }
                        }
                    } ),

                    input.onDidChangeValue( async ( e: string ) =>
                    {
                        /**
                         * TODO: This is to disable the filter since it is superfluous for this application.
                         * Wish the API supported disable filtering and disable sorting...
                         */
                        input.value = "";
                        if( items )
                        {
                            input.items = items;
                            input.activeItems = [items[0]];
                        }
                    } )
                );

                if( this.current )
                {
                    this.current.dispose();
                }

                this.current = input;

                input.show();
            } );
        }
        finally
        {
            disposables.forEach( d => d.dispose() );
        }
    };
}

class Scrap_buffer
{
    private readonly MAX_ITEMS: number = 16;

    private item_list: Array<string>;

    public constructor()
    {
        this.item_list = new Array<string>();
    }

    public destroy = (): void =>
    {
    };

    public serialize_item_list = (): string | null =>
    {
        if( this.item_list.length > 0 )
        {
            return Buffer.from( JSON.stringify( this.item_list ), "utf8" ).toString( "base64" );
        }

        return null;
    };

    public deserialize_item_list = ( items: string ): void =>
    {
        this.item_list = JSON.parse( Buffer.from( items, "base64" ).toString( "utf8" ) );
    };

    public get_quick_pick_items = (): vscode.QuickPickItem[] | null =>
    {
        let items: vscode.QuickPickItem[] | null = null;

        if( !this.is_empty() )
        {
            items = new Array<vscode.QuickPickItem>();
            this.item_list.forEach( ( value: string, i: number ) =>
            {
                items?.push( { label: `${i + 1}: `, description: `"${value}"` } );
            } );
        }

        return items;
    };

    public get_item = ( index: number ): string | null =>
    {
        if( index >= 0 && index < this.length() )
        {
            return this.item_list[index];
        }

        return null;
    };

    public is_empty = (): boolean =>
    {
        return this.item_list.length === 0;
    };

    public length = (): number =>
    {
        return this.item_list.length;
    };

    private add = ( item: string ): number =>
    {
        let length = this.item_list.unshift( item );
        while( length > this.MAX_ITEMS )
        {
            this.item_list.pop();
            length = this.length();
        }

        return this.length();
    };

    private find_index = ( item: string ): number =>
    {
        return this.item_list.findIndex( ( value: string ) =>
            {
                return value === item ;
            } );
    };

    private remove = ( item: string ): string | null =>
    {
        let index = this.find_index( item );
        if( index >= 0 )
        {
            let removed: string = this.item_list.splice( index, 1 )[0];
            return removed;
        }

        return null;
    };

    public remove_all = (): void =>
    {
        this.item_list.length = 0;
    };

    private move_to_front = ( item: string ): boolean =>
    {
        let index = this.find_index( item );
        if( index === 0 )
        {
            return false;
        }

        let removed = this.remove( item );
        if( removed )
        {
            this.add( removed );
            return false;
        }

        return true;
    };

    public add_exclusive = ( item: string ): void =>
    {
        if( this.is_empty() )
        {
            this.add( item );
        }

        if( this.move_to_front( item ) )
        {
            this.add( item );
        }
    };

    public add_if_missing = ( item: string ): void =>
    {
        if( this.is_empty() || this.find_index( item ) === -1 )
        {
            this.add( item );
        }
    };
}
