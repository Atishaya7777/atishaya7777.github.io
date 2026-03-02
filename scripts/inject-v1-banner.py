"""
Inject a 'back to new site' banner into every HTML file under v1-source/dist/.
Run from the repo root: python3 scripts/inject-v1-banner.py
"""
import os

BANNER = """\
<div id="v1-back-banner" style="position:fixed;bottom:0;left:0;right:0;z-index:9999;\
background:#1a0020;color:#e8e0e8;font-family:ui-sans-serif,system-ui,sans-serif;\
font-size:13px;padding:10px 16px;display:flex;align-items:center;justify-content:center;\
gap:12px;border-top:1px solid #3d1248;">
  <span>You&rsquo;re viewing the <strong>classic portfolio</strong> &mdash;
    <a href="/" style="color:#ff9f40;text-decoration:underline;text-underline-offset:3px;\
font-weight:600;">View new site &#8599;</a>
  </span>
  <button onclick="document.getElementById('v1-back-banner').style.display='none'"
    aria-label="Dismiss"
    style="position:absolute;right:14px;background:none;border:none;color:#a07ab0;\
font-size:16px;cursor:pointer;line-height:1;">&#x2715;</button>
</div>"""

dist = "v1-source/dist"
for root, _dirs, files in os.walk(dist):
    for fname in files:
        if not fname.endswith(".html"):
            continue
        fpath = os.path.join(root, fname)
        html = open(fpath, encoding="utf-8").read()
        if "v1-back-banner" in html:
            continue
        html = html.replace("</body>", BANNER + "\n</body>", 1)
        open(fpath, "w", encoding="utf-8").write(html)
        print("Patched:", fpath)
