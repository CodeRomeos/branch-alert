<p align="center">
  <br />
  <a title="Learn more about Branch Alert" href="http://github.com/coderomeos/branch-alert"><img src="https://github.com/CodeRomeos/branch-alert/blob/main/images/detail-screenshot.png" alt="image preview" width="50%" /></a>
</p>

# Branch Alert

A VS Code extension that shows a **native modal popup** with your **current Git branch** when opening any project.

## Features

-   Shows a warning modal with the branch name.
-   Activates on project open or workspace change.
-   Works for all Git projects.

## Installation

1. Run `vsce package` in this folder to create `.vsix`.
2. Install it globally:
    ```bash
    code --install-extension branch-alert-0.0.x.vsix
    ```
3. Open any Git project → modal appears with branch name.
