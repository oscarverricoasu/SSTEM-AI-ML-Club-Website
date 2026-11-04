# SSTEM-AI-ML-Club-Website

## Themes

Serve this directory over HTTP (for example, `python3 -m http.server 8000`).
The registry fetch and theme JavaScript modules require a web server rather than
opening HTML with `file://`. No build step or dependencies are required.

`themes/themes.json` defines the theme picker on standard pages. Each entry has:

| Field | Purpose |
| --- | --- |
| `id` | Unique lowercase identifier; also used as `html[data-theme]`. |
| `name` | Label displayed in the picker. |
| `layout` | `standard` for existing pages; `explorer` for File Explorer. |
| `stylesheet` | CSS path relative to the site root. |
| `module` | Optional JavaScript module with synchronous `mount()` and `unmount()` exports. |
| `entry` | Required entry page for an alternate layout. |

To add a skin:

1. Create `themes/<id>/theme.css`. Scope rules to `html[data-theme="<id>"]`
   and reuse variables such as `--theme-accent`, `--theme-text`,
   `--theme-surface`, and `--theme-border` where appropriate.
2. Add an entry to the registry with `layout: "standard"`.
3. If the skin adds interactive elements, provide a module and register its path.
   `mount()` creates the elements/listeners; `unmount()` removes them and releases
   timers, observers, or listeners on shared elements.

The shared manager (`scripts/theme.js`) generates menus, loads assets before
applying a skin, cleans up the previous module, and saves the theme ID in
`localStorage` under `aiml-club-theme`. Unknown IDs fall back to `defaultTheme`.
Asset paths resolve from the manager's site root, supporting subdirectory hosting.
Stylesheet image URLs still resolve relative to the stylesheet itself.

File Explorer remains a separate layout. Selecting it opens its entry page
without replacing the saved standard theme. Its “Return to previous theme”
button returns to `index.html` with that saved theme (or the default when no
valid saved standard theme exists). Direct visits also preserve that preference.
Layout-specific content remains in the
existing HTML files for now; a future shared `data/` layer can feed both layouts.

Luke's animated palette lives in `scripts/waves.js`; its CSS file is available
for additional styling. `css/themes.css` contains only shared picker UI and
base theme variables. Standard page CSS continues to define the original design.
