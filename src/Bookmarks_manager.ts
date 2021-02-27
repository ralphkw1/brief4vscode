
import * as vscode from 'vscode';

import { Local_storage } from './Local_storage';

export class Bookmarks_manager
{
    public readonly MIN_BOOKMARK_NUMBER: number = 1;
    public readonly MAX_BOOKMARK_NUMBER: number = 10;

    private bookmarks: Array<Bookmark_item>;

    private current: vscode.QuickInput | null = null;

    private storage: Local_storage;

    public constructor( storage: Local_storage )
    {
        this.storage = storage;

        this.current = null;

        this.bookmarks = new Array<Bookmark_item>();

        this.print_bookmarks();
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

    public on_did_rename_files = ( e: vscode.FileRenameEvent ): any =>
    {
        for( let i = 0; i < e.files.length; i++ )
        {
            console.log( `old: ${e.files[i].oldUri} new: ${e.files[i].newUri}` );
        }
    };

    public drop_bookmark = ( uri: vscode.Uri, bookmark_number: string, position: vscode.Position ): void =>
    {
        console.log( `uri: ${uri} index: ${bookmark_number} line: ${position.line} char: ${position.character}` );

        let uri_as_string = uri.toString();
        if( uri_as_string )
        {
            this.store_bookmark( uri_as_string, parseInt( bookmark_number ), position.line, position.character );
            this.store_bookmarks();
        }
        else
        {
            throw new URIError( "Invalid URI for bookmark" );
        }

        this.print_bookmarks();
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
            bookmark_item.path = path;
            bookmark_item.bookmark_number = bookmark_number;
            bookmark_item.line = line;
            bookmark_item.character = character;

            return;
        }

        bookmark_item = new Bookmark_item( path, bookmark_number, line, character );
        this.bookmarks.push( bookmark_item );
    };

    private print_bookmarks = (): void =>
    {
        let message = "";
        let no_bookmarks = true;
        for( let i = 0; i < this.bookmarks.length; i++ )
        {
            no_bookmarks = false;
            let bookmark = this.bookmarks[i];
            message += "\tBookmark " + bookmark.bookmark_number + " = [" + bookmark.path + ", " + bookmark.line + ":" + bookmark.character + "]\n";
        }

        console.log( `get_stored_bookmarks:\n ${( no_bookmarks ? "\tno stored bookmarks" : message )}` );
    };
}

class Bookmark_item
{
    public path: string | null;
    public bookmark_number: number | null;
    public line: number | null;
    public character: number | null;

    public constructor( path: string, bookmark_number: number, line: number, character: number )
    {
        this.path = path;
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
