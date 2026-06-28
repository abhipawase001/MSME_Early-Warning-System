Create a one-click VS Code debug setup for the TanStack Start + Vite app.

1. Add `.vscode/launch.json` with three profiles:
   - **Full Stack**: launch `vite dev --inspect` via Node, then open Chrome/Edge against `http://localhost:8080` with a pre-configured `userDataDir` and source-map support.
   - **Server Only**: start Vite SSR with `--inspect=9229` and attach the Node debugger.
   - **Client Only**: launch Chrome/Edge against the dev server URL using the `pwa-chrome`/`pwa-msedge` type, so React breakpoints in the editor are hit.

2. Add `.vscode/settings.json` with recommended Node/Vite settings: auto-attach smart patterns, `node_modules` search exclusion, default formatter, TypeScript preferences, and `VITE_*` env display in `.env` files.

3. Add `.vscode/extensions.json` with recommended extensions: ESLint, Prettier, Chrome Debugger (msjsdiag.debugger-for-chrome) / Edge tools, and a Vite helper if needed.

4. Update `package.json` to expose a debug script: `debug: "vite dev --inspect"`, so `launch.json` can call `npm run debug` (or `bun run debug`) without hard-coding Vite internals.

5. Add a short section to the README (or `AGENTS.md` if no README) explaining the one-click workflow: select the debug profile, press F5, set breakpoints in React components and server functions, and use the Debug Console.