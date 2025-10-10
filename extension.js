const vscode = require("vscode");
const { execSync } = require("child_process");

let modalShown = false;

function activate(context) {
	if (!modalShown) {
		showBranchModal(context);
	}
}

function showBranchModal(context) {
	if (modalShown) return;
	modalShown = true;

	try {
		const workspace = vscode.workspace.workspaceFolders?.[0];
		if (!workspace) return;

		const cwd = workspace.uri.fsPath;
		const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd })
			.toString()
			.trim();

		const panel = vscode.window.createWebviewPanel(
			"branchAlert",
			`Branch: ${branch}`,
			vscode.ViewColumn.Active,
			{
				enableScripts: true,
				retainContextWhenHidden: false,
			}
		);

		const style = `
			<style>
				body {
					background: rgba(20, 20, 20, 0.95);
					color: white;
					font-family: 'Segoe UI', sans-serif;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					height: 100vh;
					margin: 0;
				}
				.container {
					background: #1e1e1e;
					border-radius: 12px;
					padding: 40px;
					text-align: center;
					box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
					max-width: 400px;
				}
				img {
					width: 64px;
					height: 64px;
					margin-bottom: 20px;
				}
				h1 {
					font-size: 22px;
					margin-bottom: 10px;
				}
				.branch {
					color: #4ade80;
					font-weight: bold;
					font-size: 24px;
					margin-bottom: 20px;
				}
				button {
					background: #007acc;
					border: none;
					color: white;
					padding: 10px 20px;
					margin: 8px;
					border-radius: 6px;
					font-size: 15px;
					cursor: pointer;
				}
				button:hover {
					background: #1a85ff;
				}
				button.secondary {
					background: #444;
				}
				button.danger {
					background: #c53030;
				}
			</style>
		`;

		const script = `
			<script>
				const vscode = acquireVsCodeApi();

				document.getElementById('switch').onclick = () => vscode.postMessage({ cmd: 'switch' });
				document.getElementById('fetch').onclick = () => vscode.postMessage({ cmd: 'fetch' });
				document.getElementById('close').onclick = () => vscode.postMessage({ cmd: 'close' });
			</script>
		`;

		const iconPath = vscode.Uri.joinPath(context.extensionUri, "icon.png");

		panel.webview.html = `
			<!DOCTYPE html>
			<html lang="en">
			<head><meta charset="UTF-8">${style}</head>
			<body>
				<div class="container">
					<img src="${panel.webview.asWebviewUri(iconPath)}" alt="Logo" />
					<h1>🚨 You are on branch:</h1>
					<div class="branch">${branch.toUpperCase()}</div>
					<button id="switch">🔁 Switch Branch</button>
					<button id="fetch" class="secondary">⬇️ Git Fetch --all</button>
					<button id="close" class="danger">✖ Close</button>
				</div>
				${script}
			</body>
			</html>
		`;

		panel.webview.onDidReceiveMessage(async (message) => {
			if (message.cmd === "close") {
				panel.dispose();
				return;
			}

			if (message.cmd === "fetch") {
				try {
					execSync("git fetch --all", { cwd });
					vscode.window.showInformationMessage(
						"✅ Git fetch completed!"
					);
				} catch (err) {
					vscode.window.showErrorMessage("❌ Git fetch failed");
				}
			}

			if (message.cmd === "switch") {
				try {
					let branches = execSync("git branch --all --color=never", {
						cwd,
					})
						.toString()
						.split("\n")
						.map((b) => b.replace("*", "").trim())
						.filter((b) => b);

					const picked = await vscode.window.showQuickPick(branches, {
						placeHolder: "Select a branch to switch to",
					});

					if (picked) {
						try {
							execSync(`git checkout ${picked}`, { cwd });
							vscode.window.showInformationMessage(
								`✅ Switched to branch ${picked}`
							);
							panel.dispose();
						} catch (err) {
							vscode.window.showErrorMessage(
								`❌ Failed to switch to branch ${picked}`
							);
						}
					}
				} catch (err) {
					vscode.window.showErrorMessage(
						"❌ Could not list branches"
					);
				}
			}
		});
	} catch (err) {
		console.log("Not a git repo");
	}
}

function deactivate() {}

module.exports = { activate, deactivate };
