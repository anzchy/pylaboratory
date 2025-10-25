# Vercel Deployment Manual

This guide walks you through deploying the `pylaboratory` project to Vercel using the current GitHub repository contents, including the Pyodide runtime and any offline wheels used by the Markdown playground demos.

---

## 1. Prepare Your Repository

1. Make sure all local changes are committed and pushed to GitHub, especially:
   - `docs/assets/pyodide/` (contains Pyodide runtime + wheels discovered by `scripts/download-pyodide.sh`)
   - Updated Markdown snippets referencing packages (the `packages=["..."]` metadata)
   - Any recent changes to scripts, README, or macros
2. Confirm the default branch (`master`/`main`) points to the version you want to deploy.

> **Tip:** After editing Markdown snippets with new packages/libraries, run  
> `bash scripts/download-pyodide.sh` to refresh the offline wheels before pushing.

---

## 2. Create the Vercel Project

1. Navigate to [https://vercel.com](https://vercel.com) and log in (GitHub account recommended).
2. Click **New Project → Import Git Repository**.
3. Select the repository (`anzchy/pylaboratory` or your fork).
4. On the project configuration page, set:

   | Setting          | Value                |
   | ---------------- | -------------------- |
   | Framework Preset | `Other`              |
   | Build Command    | `mkdocs build`       |
   | Output Directory | `site`               |

5. Add the following environment variable so Vercel installs MkDocs for the build:

   | Name          | Value                       |
   | ------------- | --------------------------- |
   | `PIP_PACKAGES` | `mkdocs mkdocs-material`     |

   (Vercel’s build system will run `pip install mkdocs mkdocs-material` automatically.)

6. Click **Deploy**.

Vercel will clone the repository, install the Python tooling, run `mkdocs build`, and publish the generated `site/` folder.

---

## 3. Verify the Deployment

1. Once the build finishes, visit the generated preview URL (e.g. `https://<project>.vercel.app/`).
2. Open `/tutorial/02_snippet_demo/` (or any page with PyLab snippets).
3. In the browser console, confirm Pyodide logs something like:
   ```
   [PyLab] Loading Pyodide from: https://<project>.vercel.app/assets/pyodide
   ```
4. Execute a few snippets (e.g., Fibonacci with NumPy, pandas demo) to ensure packages load properly. If a wheel is missing you’ll see a 404/SRI error—rerun the download script locally, re-commit the new wheel, and redeploy.

---

## 4. Optional: Production Domain

If you want a custom domain:
1. Go to **Project Settings → Domains** on Vercel.
2. Add your custom domain and follow the DNS instructions.
3. Update `mkdocs.yml`’s `site_url` to the new domain (optional but recommended for canonical links).
4. Push the change so the next deployment includes the updated metadata.

---

## Troubleshooting

| Symptom                               | Likely Cause / Fix                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Build fails: `mkdocs: command not found` | Ensure `PIP_PACKAGES=mkdocs mkdocs-material` is set in Vercel project settings |
| Runtime 404 for `numpy`/`pandas` wheel | Wheel not committed; run `bash scripts/download-pyodide.sh` then push changes  |
| Pyodide logs fallback CDN usage       | Offline wheel missing; see row above                                           |
| Stale content after deployment        | Vercel CDN caching; re-run deployment or purge cache                             |

---

## Handy Commands

```bash
# Refresh Pyodide runtime + wheels after editing docs
bash scripts/download-pyodide.sh

# Local preview
mkdocs serve --dev-addr 127.0.0.1:8000
```

Keep `docs/assets/pyodide` synchronized with the packages referenced in your Markdown snippets, and every Vercel deployment will deliver a full offline-capable PyLab experience. Enjoy!

