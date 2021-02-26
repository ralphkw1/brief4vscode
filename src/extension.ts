
import * as vscode from 'vscode';

import { Commands } from "./Commands";
import { Scrap_manager } from './Scrap_manager';
import { Status_bar } from "./Status_bar";

export interface Configuration
{
	default_cursor_style: vscode.TextEditorCursorStyle | undefined;
	use_brief_home: boolean | undefined;
	paste_lines_at_home: boolean | undefined;
};

let commands: Commands | null = null;
let status_bar: Status_bar | null = null;
let scrap_manager: Scrap_manager | null = null;

export function activate( context: vscode.ExtensionContext )
{
	context.subscriptions.push( vscode.workspace.onDidChangeConfiguration(
		( e: vscode.ConfigurationChangeEvent ) => { configuration_changed( e, context ); },
		null, context.subscriptions ) );

	vscode.commands.executeCommand( "setContext", "brief4vscode_enabled", true );

	status_bar = new Status_bar();

	scrap_manager = new Scrap_manager( context.globalState );

	commands = new Commands( context,
		status_bar,
		scrap_manager );

	commands.set_overstrike_mode( false );

	console.log( 'Extension "brief4vscode" is now active!' );
}

export function deactivate()
{
	commands?.destroy();
	status_bar?.destroy();
	scrap_manager?.destroy();
}

export function get_configuration(): Configuration
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
		paste_lines_at_home: brief4vscode_configuration.get<boolean>( "paste_lines_at_home" )
	};
}

function configuration_changed( e: vscode.ConfigurationChangeEvent, context: vscode.ExtensionContext ): any
{
	let affected = e.affectsConfiguration( "brief4vscode.use_brief_home" );
	if( affected )
	{
		commands?.on_configuration_changed( context, get_configuration() );
	}
}
