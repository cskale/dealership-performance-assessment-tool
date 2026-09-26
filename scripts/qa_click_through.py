"""Signed-in click-through of the key screens for each QA role (dealer, coach, OEM).

Usage:  python scripts/qa_click_through.py [base_url] [out_dir]
Reads QA_DEALER_EMAIL / QA_COACH_EMAIL / QA_OEM_EMAIL / QA_PASSWORD from .env.test (git-ignored).
Read-only: navigates and screenshots, never submits forms. Exits 1 if any page throws.
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://dealership-performance-assessment-t.vercel.app"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "qa-screens")
OUT.mkdir(parents=True, exist_ok=True)

env = dict(
    line.strip().split("=", 1)
    for line in Path(".env.test").read_text().splitlines()
    if "=" in line and not line.startswith("#")
)
PASSWORD = env["QA_PASSWORD"]
# Optional: a dealer assessment the QA coach/OEM can view, so their Results screens get checked too.
RESULTS_ID = env.get("QA_RESULTS_ID")
VIEWED_RESULTS = [
    ("results", f"/app/results/{RESULTS_ID}", None),
    ("results-action-plan", f"/app/results/{RESULTS_ID}?tab=action-plan", None),
] if RESULTS_ID else []

# role -> (email key, [(label, path, optional text to click after load)])
ROLES = {
    "dealer": ("QA_DEALER_EMAIL", [
        ("dashboard", "/app/dashboard", None),
        ("coaching-visits", "/app/dashboard#coaching-visits", None),
        ("results", "/app/results", None),
        ("results-action-plan", "/app/results?tab=action-plan", None),
    ]),
    "coach": ("QA_COACH_EMAIL", [
        ("coach-dashboard", "/app/coach-dashboard", None),
        ("dealer-panel", "/app/coach-dashboard", "Open Briefing"),
        *VIEWED_RESULTS,
    ]),
    "oem": ("QA_OEM_EMAIL", [
        ("oem-dashboard", "/app/oem-dashboard", None),
        ("oem-coverage", "/app/oem-dashboard", "Leaderboard"),
        *VIEWED_RESULTS,
    ]),
}

failures = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for role, (email_key, pages) in ROLES.items():
        ctx = browser.new_context(viewport={"width": 1440, "height": 1000})
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e, errors=errors: errors.append(f"PAGEERROR {e}"))
        page.on("console", lambda m, errors=errors: m.type == "error" and "Failed to load resource" not in m.text and errors.append(f"console {m.text[:200]}"))
        page.on("response", lambda r, errors=errors: r.status >= 400 and errors.append(f"HTTP {r.status} {r.request.method} {r.url.split('?')[0][:120]}"))

        page.goto(f"{BASE}/auth", wait_until="networkidle")
        page.get_by_placeholder("you@company.com").first.fill(env[email_key])
        page.get_by_placeholder("Enter your password").fill(PASSWORD)
        page.get_by_role("button", name="Sign In", exact=True).click()
        page.wait_for_url("**/app/**", timeout=20000)

        for label, path, click_text in pages:
            page.goto(f"{BASE}{path}", wait_until="networkidle")
            page.wait_for_timeout(2500)  # let React Query settle
            if click_text:
                target = page.get_by_text(click_text).first
                if target.count():
                    target.click()
                    page.wait_for_timeout(2500)
                else:
                    errors.append(f"could not find '{click_text}' to click")
            if "#" in path:
                page.locator(f"#{path.split('#')[1]}").scroll_into_view_if_needed(timeout=5000)
            shot = OUT / f"{role}-{label}.png"
            page.screenshot(path=str(shot), full_page=True)
            print(f"[{role}] {label}: {shot}")

        for e in errors:
            print(f"  [{role}] {e}")
        if any(e.startswith("PAGEERROR") for e in errors):
            failures.append(role)
        ctx.close()
    browser.close()

sys.exit(1 if failures else 0)
