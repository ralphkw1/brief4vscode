
import * as vscode from 'vscode';

import { Commands } from "./Commands";
import { Scrap_manager } from './Scrap_manager';
import { Status_bar } from "./Status_bar";

export interface Configuration
{
	default_cursor_style: vscode.TextEditorCursorStyle | undefined;
};

let commands: Commands | null = null;
let status_bar: Status_bar | null = null;
let scrap_manager: Scrap_manager | null = null;

export function activate( context: vscode.ExtensionContext )
{
	vscode.commands.executeCommand( "setContext", "brief4vscode_enabled", true );

	status_bar = new Status_bar();
	scrap_manager = new Scrap_manager( status_bar );
	commands = new Commands( context,
		status_bar,
		scrap_manager );

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

	let cursor_style: vscode.TextEditorCursorStyle = vscode.TextEditorCursorStyle.Line;
	switch( editor_configuration.get<string>( "cursorStyle" ) )
	{
		case "line": cursor_style = vscode.TextEditorCursorStyle.Line;
		case "block": cursor_style = vscode.TextEditorCursorStyle.Block;
		case "underline": cursor_style = vscode.TextEditorCursorStyle.Underline;
	}

	return {
		default_cursor_style: cursor_style
	};
}
