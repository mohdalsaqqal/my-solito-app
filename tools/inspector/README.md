# ECT Standalone Inspector

This inspector is external to app runtime. It is not mounted by Next/Expo components.

## Use

1. Run web app in dev mode (`yarn web`).
2. Open browser DevTools Console.
3. Run one-line loader:
   ```js
   (async () => { await import('/dev/ect-inspector-loader.js') })()
   ```
4. Click `Inspect: ON`, then hover + click an element.

It captures:
- tag
- selector
- text
- class
- name/aria-label
- `data-ect-node` marker (if present)
- best-effort React component/source (dev build only)
- URL + bounding rect + timestamp

Buttons:
- `Copy Selector`
- `Copy Source`
- `Copy JSON`
- `Ask Codex` (copies a ready-to-paste prompt template with `[ECT_INSPECT]` payload)

Hotkeys:
- `Alt+X`: toggle inspect mode

## Edge Extension (no console needed)

1. Keep extension script synced:
   ```sh
   yarn inspector:sync-extension
   ```
2. Open Edge: `edge://extensions`
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select folder:
   `tools/inspector/extension`
6. Open your site and click the extension icon to toggle inspector.

## Sync public script

When you modify `tools/inspector/ect-inspector.js`, sync it to Next public folder:

```sh
yarn inspector:sync
```

Sync both public loader + extension copy:

```sh
yarn inspector:sync-all
```
