<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Local Development & VS Code Debugging

This project is a standard TanStack Start + Vite TypeScript app. You can run it locally in VS Code with one click.

### Requirements
- Node.js 20+ (recommended; see `.nvmrc`)
- npm (or bun)
- VS Code with the recommended extensions (see `.vscode/extensions.json`)

### One-click debug workflow
1. Open the project in VS Code.
2. Press `F5` or open the **Run and Debug** panel (`Ctrl+Shift+D` / `Cmd+Shift+D`).
3. Choose one of the profiles:
   - **Full Stack: Server + Chrome/Edge** — starts the Vite dev server with Node debugging and opens a browser window for client-side debugging.
   - **Server: Vite Dev (Node)** — debugs server functions, SSR, and the Vite dev server itself.
   - **Client: Chrome/Edge** — debugs React components and browser-side code only ( assumes the dev server is already running).
4. Set breakpoints in `.tsx` or `.ts` files in `src/`.
5. Use the Debug Console and Variables panel to inspect state.

### Manual start
If you prefer to start the server manually:

```bash
npm run debug
# or
bun run debug
```

The dev server runs on `http://localhost:8080` by default.
