
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

suite('Extension Test Suite', () =>
{
	let extension_development_path = path.resolve( __dirname, '../../../' );

	let doc1: vscode.TextDocument;
	let doc2;

	setup( async () =>
	{
		vscode.window.showInformationMessage( `Start all tests...` );

		doc1 = await vscode.workspace.openTextDocument( vscode.Uri.file( `${extension_development_path}/test_files/dummy1.ts` ) );
		doc2 = await vscode.workspace.openTextDocument( vscode.Uri.file( `${extension_development_path}/test_files/dummy2.ts` ) );
	} );

	test( 'Overstrike toggle command test', async () =>
	{
		await vscode.window.showTextDocument( doc1 );
		let editor = vscode.window.activeTextEditor;
		utility.move_cursor( editor!, new vscode.Position( 70, 40 ) );
		await vscode.commands.executeCommand( "brief4vscode.overstrike_toggle" );


		// TODO: User input...


		await vscode.commands.executeCommand( "brief4vscode.overstrike_toggle" );


		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));

		await sleep( 10000 );
	});

});
