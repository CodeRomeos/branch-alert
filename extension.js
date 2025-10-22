const vscode = require("vscode");
const { execSync } = require("child_process");

// Track if the modal has already been shown in this session
let modalShown = false;

function activate(context) {
	showBranchModal(); // show once on startup

	// Optional: if you want to re-show when workspace changes, uncomment below
	vscode.workspace.onDidChangeWorkspaceFolders(() => {
		if (!modalShown) showBranchModal();
	});
}

async function showBranchModal() {
	// Prevent multiple triggers
	if (modalShown) return;
	modalShown = true;

	try {
		const workspace = vscode.workspace.workspaceFolders?.[0];
		if (!workspace) return;

		const cwd = workspace.uri.fsPath;
		const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd })
			.toString()
			.trim();

		const selection = await vscode.window.showInformationMessage(
			`🚨 You are on branch: ${branch.toUpperCase()}`,
			{ modal: true },
			"Switch Branch",
			"Git Fetch --all"
		);

		if (!selection || selection === "Close") {
			return; // just close
		}

		if (selection === "Switch Branch") {
			let branches = execSync("git branch --all --color=never", { cwd })
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
				} catch (err) {
					vscode.window.showErrorMessage(
						`❌ Failed to switch to branch ${picked}`
					);
				}
			}
		} else if (selection === "Git Fetch --all") {
			try {
				execSync("git fetch --all", { cwd });
				vscode.window.showInformationMessage("✅ Git fetch completed!");
			} catch (err) {
				vscode.window.showErrorMessage("❌ Git fetch failed");
			}
		}
	} catch (err) {
		console.log("Not a git repo");
	}
}

function deactivate() {}

module.exports = { activate, deactivate };
