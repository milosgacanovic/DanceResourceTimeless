# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**DanceResourceTimeless** is the custom MediaWiki skin for DanceResource.org, forked from the Timeless skin. It lives at:
```
/var/www/wiki.danceresource.org/public_html/skins/DanceResourceTimeless/
```

The companion extension is at `../extensions/AiTranslationExtension/` — see its CLAUDE.md for the full wiki architecture.

## Color Architecture

Colors come from two layers:

1. **`resources/themes/wikimedia.less`** — LESS variables (`@base100`, `@text`, `@link`, etc.) compiled at build time into static CSS. Do not expect these to be overridable at runtime.
2. **`resources/danceresource-overrides.css`** — DanceResource brand overrides. Originally hardcoded hex values; dark mode work converts these to CSS custom properties (`--dr-*`).

For **dark mode**, all runtime theming is done via CSS custom properties in `danceresource-overrides.css`:
- `:root` block = light mode values
- `html[data-theme="dark"]` block = dark mode overrides
- The JS toggle (in `skins.danceresourcetimeless.js`) sets `data-theme` on `<html>` and persists to `localStorage`

## Key Files

| File | Purpose |
|------|---------|
| `skin.json` | Manifest; defines ResourceLoader modules |
| `includes/DanceResourceTimelessTemplate.php` | Main HTML template |
| `includes/DanceResourceTimelessVariablesModule.php` | Injects LESS vars at runtime |
| `resources/danceresource-overrides.css` | Brand CSS + dark mode CSS custom properties |
| `resources/themes/wikimedia.less` | LESS color variable definitions |

## Development

After CSS/JS changes, restart PHP-FPM to clear ResourceLoader cache:
```bash
sudo systemctl restart php8.1-fpm
```

Purge a specific page: append `?action=purge` in the browser.

## Git Workflow

- **Do not push to `origin` unless explicitly asked.**
- Remote: `github.com:milosgacanovic/DanceResourceTimeless`
