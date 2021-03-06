
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import * as utility from '../../utility';

function sleep( ms: number ): Promise<void>
{
	return new Promise( resolve =>
	{
		setTimeout( resolve, ms );
	} );
}

suite( 'Extension Test Suite', () =>
{
	let extension_development_path = path.resolve( __dirname, '../../../' );

	let doc1: vscode.TextDocument;
	let doc2: vscode.TextDocument;
	let editor: vscode.TextEditor;

	const read_line = require( "readline" );

	setup( async () =>
	{
		vscode.window.showInformationMessage( `Start all tests...` );

		doc1 = await vscode.workspace.openTextDocument( vscode.Uri.file( `${extension_development_path}/test_resources/dummy1.ts` ) );
		doc2 = await vscode.workspace.openTextDocument( vscode.Uri.file( `${extension_development_path}/test_resources/dummy2.ts` ) );

		await vscode.window.showTextDocument( doc1 );
		editor = vscode.window.activeTextEditor!;
	} );

	test( 'Overstrike toggle command test', async () =>
	{
		let line_to_modify = 70;
		let character_column_to_modify = 40;
		let simulated_user_typing = "XXXX";

		utility.move_cursor( editor!, new vscode.Position( line_to_modify, character_column_to_modify ) );
		let line = editor!.document.lineAt( line_to_modify ).text;
		line = line.substring( 0, character_column_to_modify ) + simulated_user_typing + line.substring( character_column_to_modify );
		await vscode.commands.executeCommand( "brief4vscode.overstrike_toggle" );
		await vscode.commands.executeCommand( "default:type", { text: `${simulated_user_typing}` } );
		await vscode.commands.executeCommand( "brief4vscode.overstrike_toggle" );
		let modified_line = editor!.document.lineAt( line_to_modify ).text;

		assert.strictEqual( line,  modified_line );
	});

	test( 'Up with marking mode', async () =>
	{
		let editor = vscode.window.activeTextEditor;

		utility.move_cursor( editor!, new vscode.Position( 133, 18 ) );
		await vscode.commands.executeCommand( "brief4vscode.marking_mode_toggle" );

		let done = false;
		vscode.window.showInformationMessage( `Depress <up> arrow key 5 times, then click <Done>`, "Done" ).then( ( e: string | undefined ) =>
		{
			if( e === "Done" ) { done = true; }
		} );

		console.log( `Waiting for user...` );

		let selection = editor!.selection;
		console.log( `${selection.start.line} ${selection.start.character} ${selection.end.line} ${selection.end.character}` );
	} );
});
