# Graduate supervisor directory

The public website is static. Collection is a separate, local workflow; building or deploying the site never invokes Codex or downloads profile pages.

Use Node 20.6+ (Node 22/24 also work) and pnpm 9.15.9. Sign into Codex CLI on the machine that runs collection. The collector uses that CLI login; no credentials belong in this repository.

## Public inputs

- `src/data/grad-directory/*.json`: versioned university files, checked against `directory/schemas/university.schema.json` and TypeScript types in `src/lib/directory/types.ts`.
- `directory/registry.json`: official faculty rosters for discovery. Some sites may be dynamic or reject automated reads; these failures are reported and never imply closed recruitment.
- `directory/portrait-approvals.json`: explicit human approvals bound to the professor's identity and the exact image bytes.
- `public/assets/grad-directory/`: approved, immutable portrait files only.

The initial 134 records are a partial, roster-backed identity pilot. Recruitment, funding, and uncatalogued interests are intentionally unknown until a separately sourced statement is reviewed. UBC and Toronto initially cover CS only; other pilot universities also include mathematics. Faculty roster inclusion does not establish eligibility for every graduate program.

## Collect and review

```sh
pnpm directory:validate
pnpm directory:test

# First smoke batch: one professor per university; no publication.
pnpm directory:collect --per-university 1 --limit 6

# Weekly collection plus fresh roster discovery.
pnpm directory:collect --discover --limit 200

# Scope a collection, or resume an interrupted/private batch.
pnpm directory:collect --university manitoba --limit 10
pnpm directory:collect --run RUN_ID --limit 200

# Serve the latest report locally (or add --run RUN_ID).
pnpm directory:review
```

Reports, source caches, extraction caches, logs, progress checkpoints, proposed photos, and staging files live under ignored `.directory-work/`. They are not copied to `dist/`. Reports are also readable as `.directory-work/runs/RUN_ID/index.html`; the review server binds to `127.0.0.1:4322` and serves only that batch's report and candidate photos.

Review each proposed identity, degree/intake restriction, statement, and excerpt using its original source link. Conflict warnings are preserved. The collector checks that quoted passages occur in fetched text, but a model can still misinterpret context; schema validation does not establish correctness.

Extraction is batched at ten professors maximum. Source requests have timeouts, bounded retries, response size limits, and per-host throttling. Only HTTP(S) public destinations are allowed. Unchanged source text reuses extraction caches and refreshes only successfully checked evidence. The Codex subprocess has shell, browser, image, and app tools disabled, ignores user tool configuration, and runs read-only from the private run directory. Its instructions treat source content as data. Set `DIRECTORY_CODEX_BIN` if the executable is not on PATH.

A failed extraction preserves the published record. A failed source read preserves that source's earlier claims and dates. Dated historical recruitment evidence remains available. Runs checkpoint after each roster and extraction batch; repeat with `--run` to resume. A partial run can be reviewed and promoted selectively. A collection lock prevents overlapping collection runs; a separate publication lock serializes portrait approval and promotion. A completed snapshot can be reviewed while another collection runs. After a crash, the next invocation checks for the old PID before removing a stale lock.

## Approve an exact portrait

The review report shows the candidate image, its named source context, affiliation, ID, and SHA-256. Open the original profile and check the association yourself. Reject uncertain associations, logos, and group photographs. There is no automatic photo-approval path.

```sh
pnpm directory:approve-photo --run RUN_ID --id PROFESSOR_ID \
  --sha256 EXACT_HASH --reviewer "Your name" --confirm-identity
```

This records an approval and stores the original file privately. It does not publish the photo. Changed bytes or a different identity require new approval; remote image URLs are never used on public pages. Identical images cannot be assigned to different people.

## Promote reviewed changes

```sh
pnpm directory:promote --run RUN_ID --reviewed

# Or promote only selected records/photos (repeat --id as needed).
pnpm directory:promote --run RUN_ID --reviewed --id PROFESSOR_ID

pnpm build
git diff
```

Promotion validates all selected changes before writing website inputs. It rejects a batch if its underlying public records changed since collection. Portraits come exclusively from matching human approvals. Inspect the resulting diff, commit, and push when ready; the existing GitHub Pages deployment handles the build. Promotion never commits or pushes. Public builds fail for unapproved, mismatched, missing, or altered portrait files.

Recruitment and funding remain separate. Program funding cannot satisfy the funded-position filter. Openings-only excludes conflicts, expired deadlines, past advertised intakes, and source checks older than 90 days. Unknown degree/intake data does not match a specific degree/intake filter. Client-side results evaluate freshness using the visitor's current date in America/Winnipeg; static HTML is the latest build snapshot.

## Weekly macOS schedule

```sh
# Prepare an inspectable plist in .directory-work/schedule/.
pnpm directory:schedule

# Install a user LaunchAgent; writes to ~/Library/LaunchAgents/.
pnpm directory:schedule --install

# Stop scheduling without deleting the inspectable plist.
pnpm directory:schedule --uninstall
```

The LaunchAgent runs Monday at 09:00 Mac local time, plus a due check at login. Keep the Mac timezone set to America/Winnipeg. The Mac must be available and logged in; sleeping calendar jobs run after wake, and login checks cover overdue work. It does not wake a powered-off computer. Paths to Node, Codex, and this checkout are captured at installation; reinstall after moving them.

Collection prepares private batches only. A completed run suppresses another run until the next Monday at 09:00 in America/Winnipeg; an unfinished latest batch is resumed rather than restarting the first records. Logs are `.directory-work/schedule/stdout.log` and `stderr.log`. Authentication/usage errors require local attention; inspect the report and CLI login. The scheduler never approves photos, promotes data, commits, pushes, or sends messages.
