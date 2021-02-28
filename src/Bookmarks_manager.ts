
import * as vscode from 'vscode';

import * as utility from './utility';
import { Local_storage } from './Local_storage';

export class Bookmarks_manager
{
    public readonly MIN_BOOKMARK_NUMBER: number = 0;
    public readonly MAX_BOOKMARK_NUMBER: number = 9;

    private bookmarks: Array<Bookmark_item>;

    private current: vscode.QuickInput | null = null;

    private storage: Local_storage;

    private pending_bookmark: number;

    public constructor( storage: Local_storage )
    {
        this.storage = storage;

        this.current = null;

        this.bookmarks = new Array<Bookmark_item>();

        this.pending_bookmark = -1;
    }

    public initialize = (): void =>
    {
        this.get_stored_bookmarks();
    };

    public destroy = (): void =>
    {
        this.store_bookmarks();

        this.current?.dispose();

        this.bookmarks.forEach( ( value: Bookmark_item ) => { value.destroy(); } );
    };

    private get_stored_bookmarks = (): void =>
    {
        let bookmarks_as_string = this.storage.get_global_value( "bookmarks_buffer" );
        if( bookmarks_as_string )
        {
            this.deserialize_bookmarks( bookmarks_as_string );
        }
    };

    private store_bookmarks = (): Thenable<void> =>
    {
        let bookmarks_as_string = this.serialize_bookmarks();
        if( bookmarks_as_string )
        {
            return this.storage.set_global_value( "bookmarks_buffer", bookmarks_as_string );
        }

        return this.storage.delete_global_value( "bookmarks_buffer" );
    };

    public serialize_bookmarks = (): string | null =>
    {
        if( this.bookmarks.length > 0 )
        {
            return Buffer.from( JSON.stringify( this.bookmarks ), "utf8" ).toString( "base64" );
        }

        return null;
    };

    public deserialize_bookmarks = ( bookmarks: string ): void =>
    {
        this.bookmarks = JSON.parse( Buffer.from( bookmarks, "base64" ).toString( "utf8" ) );
    };

    private find_index = ( bookmark_number: number ): number =>
    {
        return this.bookmarks.findIndex( ( value: Bookmark_item ) =>
        {
            return value.bookmark_number === bookmark_number;
        } );
    };

    private remove = ( bookmark_number: number ): Bookmark_item | null =>
    {
        let index = this.find_index( bookmark_number );
        if( index >= 0 )
        {
            let removed: Bookmark_item = this.bookmarks.splice( index, 1 )[0];
            return removed;
        }

        return null;
    };

    public on_did_rename_files = ( e: vscode.FileRenameEvent ): any =>
    {
        for( let i = 0; i < e.files.length; i++ )
        {
            let old_URI: vscode.Uri = e.files[i].newUri;
            let new_URI: vscode.Uri = e.files[i].newUri;

            vscode.workspace.fs.stat( new_URI ).then( ( value: vscode.FileStat ) =>
            {
                let new_URI_is_directory = ( value.type === vscode.FileType.Directory );

                vscode.workspace.fs.stat( old_URI ).then( ( value: vscode.FileStat ) =>
                {
                    let old_URI_is_directory = ( value.type === vscode.FileType.Directory );

                    console.log( `old: ${e.files[i].oldUri}, ${old_URI_is_directory} new: ${e.files[i].newUri}, ${new_URI_is_directory}` );




/// TODO:


                } );
            } );
        }
    };

    private get_bookmark = ( bookmark_number: number ): Bookmark_item | null =>
    {
        if( ( bookmark_number < this.MIN_BOOKMARK_NUMBER ) || ( bookmark_number > this.MAX_BOOKMARK_NUMBER ) ) { return null; };

        for( let i = 0; i < this.bookmarks.length; i++ )
        {
            let bookmark = this.bookmarks[i];
            if( bookmark.bookmark_number === bookmark_number ) { return bookmark; }
        }

        return null;
    };

    private store_bookmark = ( path: string, bookmark_number: number, line: number, character: number ): void =>
    {
        let bookmark_item = this.get_bookmark( bookmark_number );
        if( bookmark_item )
        {
            bookmark_item.file_URI = path;
            bookmark_item.bookmark_number = bookmark_number;
            bookmark_item.line = line;
            bookmark_item.character = character;

            return;
        }

        bookmark_item = new Bookmark_item( path, bookmark_number, line, character );
        this.bookmarks.push( bookmark_item );
    };

    public remove_all = (): void =>
    {
        this.bookmarks.length = 0;
    };

    private print_bookmarks = (): void =>
    {
        let message = "";
        let no_bookmarks = true;
        for( let i = 0; i < this.bookmarks.length; i++ )
        {
            no_bookmarks = false;
            let bookmark = this.bookmarks[i];
            message = "\tBookmark " + bookmark.bookmark_number + " = [" + bookmark.file_URI + ", " + bookmark.line + ":" + bookmark.character + "]\n";
        }

        console.log( `get_stored_bookmarks:\n ${( no_bookmarks ? "\tno stored bookmarks" : message )}` );
    };

    public drop_bookmark = ( uri: vscode.Uri, bookmark_number: string, position: vscode.Position ): void =>
    {
        let uri_as_string = uri.toString();
        if( uri_as_string )
        {
            let bookmark = parseInt( bookmark_number );
            this.store_bookmark( uri_as_string, bookmark, position.line, position.character );
            this.store_bookmarks();
        }
        else
        {
            throw new URIError( "Invalid URI for bookmark" );
        }
    };

    public jump_bookmark = async (): Promise<void> =>
    {
        return await new Promise( ( resolve, reject ) =>
        {
            this.show_bookmark_number_dialog().then( async ( item: Bookmark_item ) =>
                {
                    if( item )
                    {
                        let file_URI = vscode.Uri.parse( item.file_URI );
                        vscode.workspace.openTextDocument( file_URI ).then( ( value: vscode.TextDocument ): void =>
                        {
                            vscode.window.showTextDocument( value ).then( ( value: vscode.TextEditor ) =>
                            {
                                let position = new vscode.Position( item.line, item.character );
                                utility.move_cursor( value, position );
                                resolve();
                            },
                            ( reason: any ): void =>
                            {
                                reject( "location" );
                            } );
                        },
                        ( reason: any ): void =>
                        {
                            reject( "file" );
                        } );
                    }
                } ).
                catch( ( error: string ) =>
                {
                    reject( error );
                } );
        } );
    };

    public open_bookmarks_dialog = async (): Promise<void> =>
    {
        return await new Promise( ( resolve, reject ) =>
        {
            this.show_bookmark_list_dialog().then( async ( item: Bookmark_item ) =>
            {
                if( item )
                {
                    let file_URI = vscode.Uri.parse( item.file_URI );
                    vscode.workspace.openTextDocument( file_URI ).then( ( value: vscode.TextDocument ): void =>
                    {
                        vscode.window.showTextDocument( value ).then( ( value: vscode.TextEditor ) =>
                        {
                            let position = new vscode.Position( item.line, item.character );
                            utility.move_cursor( value, position );
                            resolve();
                        },
                            ( reason: any ): void =>
                            {
                                reject( "location" );
                            } );
                    },
                        ( reason: any ): void =>
                        {
                            reject( "file" );
                        } );
                }
            } ).
                catch( ( error: string ) =>
                {
                    reject( error );
                } );
        } );
    };

    public get_quick_pick_items = (): vscode.QuickPickItem[] | null =>
    {
        let items: vscode.QuickPickItem[] | null = null;

        if( this.bookmarks.length > 0 )
        {
            items = new Array<vscode.QuickPickItem>();
            for( let i = 0; i < this.bookmarks.length; i++ )
            {
                let bookmark = this.bookmarks[i];
                let bookmark_number = bookmark.bookmark_number;
                if( bookmark_number === 0 ) { bookmark_number = 10; }
                items?.unshift( { label: `${bookmark_number}: `, description: `${bookmark.file_URI} <${bookmark.line}:${bookmark.character}>` } );
            }
        }

        return items;
    };

    public show_bookmark_list_dialog = async (): Promise<Bookmark_item> =>
    {
        const disposables: vscode.Disposable[] = [];
        try
        {
            return await new Promise( ( resolve, reject ) =>
            {
                let input = vscode.window.createQuickPick<vscode.QuickPickItem>();

                input.title = "Dropped Bookmarks";
                input.placeholder = "Scroll to bookmark then <enter> to jump, or click on bookmark to jump, or click manage bookmarks...";

                let gear: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon( 'gear' ), tooltip: "Manage bookmarks" };
                let delete_all: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon( 'clear-all' ), tooltip: "Delete all bookmarks" };
                let cancel: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon( 'close' ), tooltip: "Cancel" };
                input.buttons = [gear, delete_all, cancel];

                let items: vscode.QuickPickItem[] | null = this.get_quick_pick_items();
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
                        if( id === "gear" )
                        {
                            reject( "gear" );
                            input.hide();
                        }
                        else if( id === "clear-all" )
                        {
                            this.remove_all();
                            this.store_bookmarks();
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
                            let index = parseInt( e[0].label );
                            if( index === 10 ) { index = 0; }
                            let item = this.get_bookmark( index );
                            if( item )
                            {
                                resolve( item );
                                input.hide();
                            }
                        }
                    } ),

                    input.onDidChangeValue( async ( e: string ) =>
                    {
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

    public show_bookmark_number_dialog = async (): Promise<Bookmark_item> =>
    {
        const disposables: vscode.Disposable[] = [];
        try
        {
            return await new Promise( ( resolve, reject ) =>
            {
                let input = vscode.window.createInputBox();

                input.title = "Jump to Bookmark";
                input.placeholder = "Push [1-10] key to jump to bookmark (0 key for bookmark 10)...";

                let delete_all: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon( 'clear-all' ), tooltip: "Delete all bookmarks" };
                let cancel: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon( 'close' ), tooltip: "Cancel" };
                input.buttons = [delete_all, cancel];

                if( this.bookmarks.length <= 0 )
                {
                    reject( "empty" );
                    input.dispose();
                    this.current = null;
                }

                disposables.push(
                    input.onDidTriggerButton( async ( e: vscode.QuickInputButton ) =>
                    {
                        let id = ( <vscode.ThemeIcon>( e.iconPath ) ).id;
                        if( id === "clear-all" )
                        {
                            this.remove_all();
                            this.store_bookmarks();
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

                    input.onDidAccept( async () =>
                    {
                        let bookmark_number = parseInt( input.value );
                        let bookmark_item = this.get_bookmark( bookmark_number );
                        if( bookmark_item )
                        {
                            resolve( bookmark_item );
                        }
                        else
                        {
                            reject( "invalid" );
                        }

                        input.hide();
                    } ),

                    input.onDidChangeValue( async ( e: string ) =>
                    {
                        if( !e ) { return; }

                        if( e.length > 1 ) { e = e[e.length - 1]; };

                        let bookmark_number = parseInt( e );
                        let value = bookmark_number.toString();
                        if( value )
                        {
                            input.value = value;
                            let bookmark_item = this.get_bookmark( bookmark_number );
                            if( bookmark_item )
                            {
                                resolve( bookmark_item );
                                input.hide();
                                return;
                            }
                            else
                            {
                                input.validationMessage = `Bookmark not dropped yet. Choose a bookmark that has been dropped...`;
                                return;
                            }
                        }
                        else
                        {
                            input.value = "";
                            return;
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

    public open_bookmarks_manage_dialog = async (): Promise<void> =>
    {
        const disposables: vscode.Disposable[] = [];
        try
        {
            return await new Promise( ( resolve, reject ) =>
            {
                let input = vscode.window.createQuickPick<vscode.QuickPickItem>();

                input.title = "Manage Dropped Bookmarks";
                input.placeholder = "Select dropped bookmarks to delete, then <enter> or \"OK\"";
                input.canSelectMany = true;

                let delete_all: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon( 'clear-all' ), tooltip: "Delete all bookmarks" };
                let cancel: vscode.QuickInputButton = { iconPath: new vscode.ThemeIcon( 'close' ), tooltip: "Cancel" };
                input.buttons = [delete_all, cancel];

                let items: vscode.QuickPickItem[] | null = this.get_quick_pick_items();
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
                            this.remove_all();
                            this.store_bookmarks();
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

                    input.onDidAccept( async ( e: void ) =>
                    {
                        let bookmarks_to_delete = input.selectedItems;
                        for( let i = 0; i < bookmarks_to_delete.length; i++ )
                        {
                            let bookmark_item = bookmarks_to_delete[i];
                            let bookmark_number = parseInt( bookmark_item.label );
                            if( bookmark_number === 10 ) { bookmark_number = 0 };
                            this.remove( bookmark_number );
                        }

                        input.hide();
                    } ),

                    input.onDidChangeValue( async ( e: string ) =>
                    {
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

class Bookmark_item
{
    public file_URI: string;
    public bookmark_number: number;
    public line: number;
    public character: number;

    public constructor( path: string, bookmark_number: number, line: number, character: number )
    {
        this.file_URI = path;
        this.bookmark_number = bookmark_number;
        this.line = line;
        this.character = character;
    }

    public destroy = (): void =>
    {
    };

    public static serialize = ( item: Bookmark_item ): string =>
    {
        return Buffer.from( JSON.stringify( item ), "utf8" ).toString( "base64" );
    };

    public static deserialize = ( item: string ): Bookmark_item =>
    {
        return JSON.parse( Buffer.from( item, "base64" ).toString( "utf8" ) );
    };
}
