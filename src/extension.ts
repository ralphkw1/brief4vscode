
import * as vscode from 'vscode';

import { Local_storage } from './Local_storage';
import { Commands } from "./Commands";
import { Scrap_manager } from './Scrap_manager';
import { Status_bar } from "./Status_bar";
import { Bookmarks_manager } from './Bookmarks_manager';

export interface Configuration
{
	default_cursor_style: vscode.TextEditorCursorStyle | undefined;
	use_brief_home: boolean | undefined;
	paste_lines_at_home: boolean | undefined;
	use_relative_bookmarks: boolean | undefined;
};

let s_local_storage: Local_storage | null;
let s_commands: Commands | null = null;
let s_status_bar: Status_bar | null = null;
let s_scrap_manager: Scrap_manager | null = null;
let s_bookmarks_manager: Bookmarks_manager | null = null;

export function activate( context: vscode.ExtensionContext )
{
	context.subscriptions.push( vscode.workspace.onDidChangeConfiguration(
		( e: vscode.ConfigurationChangeEvent ) => { configuration_changed( e ); },
		null, context.subscriptions ) );

	vscode.commands.executeCommand( "setContext", "brief4vscode_enabled", true );

	s_local_storage = new Local_storage( context );
	s_status_bar = new Status_bar();
	s_scrap_manager = new Scrap_manager( s_local_storage );
	s_bookmarks_manager = new Bookmarks_manager( s_local_storage );

	let configuration = get_configuration();
	s_scrap_manager?.on_configuration_changed( configuration );
	s_bookmarks_manager?.on_configuration_changed( configuration );

	s_scrap_manager.initialize();
	s_bookmarks_manager.initialize();

	s_commands = new Commands( context,
		s_status_bar,
		s_scrap_manager,
		s_bookmarks_manager );

	s_commands?.on_configuration_changed( configuration );
	s_commands.set_overstrike_mode( false );

	context.subscriptions.push(
		s_commands,
		s_bookmarks_manager,
		s_scrap_manager,
		s_status_bar,
		s_local_storage );

	console.log( 'Extension "brief4vscode" is now active!' );
}

export function deactivate() {}

function get_configuration(): Configuration
{
	let editor_configuration = vscode.workspace.getConfiguration( "editor" );
	let brief4vscode_configuration = vscode.workspace.getConfiguration( "brief4vscode" );

	let cursor_style: vscode.TextEditorCursorStyle = vscode.TextEditorCursorStyle.Line;
	switch( editor_configuration.get<string>( "cursorStyle" ) )
	{
		case "line": cursor_style = vscode.TextEditorCursorStyle.Line; break;
		case "block": cursor_style = vscode.TextEditorCursorStyle.Block; break;
		case "underline": cursor_style = vscode.TextEditorCursorStyle.Underline; break;
		default: cursor_style = vscode.TextEditorCursorStyle.Line; break;
	}

	return {
		default_cursor_style: cursor_style,
		use_brief_home: brief4vscode_configuration.get<boolean>( "use_brief_home" ),
		paste_lines_at_home: brief4vscode_configuration.get<boolean>( "paste_lines_at_home" ),
		use_relative_bookmarks: brief4vscode_configuration.get<boolean>( "use_relative_bookmarks" )
	};
}

function configuration_changed( e: vscode.ConfigurationChangeEvent ): any
{
	let configuration = get_configuration();

	if( e.affectsConfiguration( "brief4vscode.use_brief_home" ) ||
		e.affectsConfiguration( "brief4vscode.paste_lines_at_home" ) )
	{
		s_commands?.on_configuration_changed( configuration );
		s_scrap_manager?.on_configuration_changed( configuration );
	}

	if( e.affectsConfiguration( "brief4vscode.use_relative_bookmarks" ) )
	{
		s_bookmarks_manager?.on_configuration_changed( configuration );
	}
}
