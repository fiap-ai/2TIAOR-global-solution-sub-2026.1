"""TerraVista — Real dataset downloader.

Fetches real-world datasets that ground the synthetic model in reality.
Designed to run repeatedly (idempotent) and to degrade gracefully when a
credential is missing — it skips that source with a clear message instead of
failing.

Subcommands:
    python download.py uci      # UCI Forest Fires (no login)
    python download.py kaggle   # Kaggle Crop Recommendation (~/.kaggle/kaggle.json)
    python download.py firms    # NASA FIRMS active fires (FIRMS_MAP_KEY in .env)
    python download.py all      # try all; skip those without credentials

See ../../docs/ACCOUNTS_SETUP.md for how to obtain the (free) credentials.

Author: Gabriel Mule (RM 560586)
"""

from __future__ import annotations

import argparse
import io
import os
import sys
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent

# Load FIRMS key from ml/.env if python-dotenv is available (optional).
try:
    from dotenv import load_dotenv

    load_dotenv(HERE.parent / ".env")
except Exception:
    pass


def _stamp() -> str:
    """UTC timestamp for traceability of refreshed downloads."""
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _log(msg: str) -> None:
    print(f"[download] {msg}")


# ---------------------------------------------------------------------------
# UCI — Forest Fires (no credentials)
# ---------------------------------------------------------------------------

UCI_URL = "https://archive.ics.uci.edu/static/public/162/forest+fires.zip"


def download_uci() -> bool:
    """Download UCI Forest Fires dataset (official zip) and extract the CSV."""
    out = HERE / "forestfires.csv"
    try:
        _log(f"Fetching UCI Forest Fires (official zip) → {out.name}")
        # A User-Agent header avoids occasional 403s from the UCI server.
        req = urllib.request.Request(UCI_URL, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read()

        with zipfile.ZipFile(io.BytesIO(raw)) as zf:
            csv_name = next(
                (n for n in zf.namelist() if n.lower().endswith(".csv")), None
            )
            if csv_name is None:
                _log("ERROR: no CSV found inside the UCI zip.")
                return False
            out.write_bytes(zf.read(csv_name))

        size = out.stat().st_size
        _log(f"OK: {out} ({size} bytes)")
        return True
    except Exception as exc:  # noqa: BLE001
        _log(f"ERROR fetching UCI dataset: {exc}")
        _log("You can manually download from: " + UCI_URL)
        return False


# ---------------------------------------------------------------------------
# Kaggle — Crop Recommendation (needs ~/.kaggle/kaggle.json)
# ---------------------------------------------------------------------------

KAGGLE_DATASET = "atharvaingle/crop-recommendation-dataset"


def download_kaggle() -> bool:
    """Download Kaggle Crop Recommendation dataset via the kaggle API."""
    kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
    if not kaggle_json.exists():
        _log("SKIP Kaggle: ~/.kaggle/kaggle.json not found.")
        _log("  See docs/ACCOUNTS_SETUP.md §2 to create your token.")
        return False

    try:
        # Imported lazily so the script works without the kaggle package.
        from kaggle.api.kaggle_api_extended import KaggleApi

        api = KaggleApi()
        api.authenticate()
        dest = HERE / "kaggle_crop"
        dest.mkdir(parents=True, exist_ok=True)
        _log(f"Downloading Kaggle dataset {KAGGLE_DATASET} → {dest.name}/")
        api.dataset_download_files(KAGGLE_DATASET, path=str(dest), unzip=True)
        _log(f"OK: files in {dest}")
        return True
    except ImportError:
        _log("SKIP Kaggle: 'kaggle' package not installed. Run: pip install kaggle")
        return False
    except Exception as exc:  # noqa: BLE001
        _log(f"ERROR with Kaggle download: {exc}")
        return False


# ---------------------------------------------------------------------------
# NASA FIRMS — active fires (needs FIRMS_MAP_KEY)
# ---------------------------------------------------------------------------

# Area-based CSV endpoint with a bounding box (works with a standard free
# MAP_KEY; the /country/ endpoint requires elevated access). Defaults:
# VIIRS_SNPP_NRT over a Brazil bbox (west,south,east,north), last 1 day.
FIRMS_SOURCE = os.getenv("FIRMS_SOURCE", "VIIRS_SNPP_NRT")
FIRMS_AREA = os.getenv("FIRMS_AREA", "BRA")          # label used in filenames
FIRMS_BBOX = os.getenv("FIRMS_BBOX", "-74,-34,-34,6")  # Brazil bounding box
FIRMS_DAYS = os.getenv("FIRMS_DAYS", "1")


def download_firms() -> bool:
    """Download NASA FIRMS active-fire CSV for a bounding box / time window."""
    map_key = os.getenv("FIRMS_MAP_KEY", "").strip()
    if not map_key:
        _log("SKIP FIRMS: FIRMS_MAP_KEY not set in ml/.env.")
        _log("  See docs/ACCOUNTS_SETUP.md §3 to get a free MAP_KEY.")
        return False

    url = (
        "https://firms.modaps.eosdis.nasa.gov/api/area/csv/"
        f"{map_key}/{FIRMS_SOURCE}/{FIRMS_BBOX}/{FIRMS_DAYS}"
    )
    out = HERE / f"firms_{FIRMS_AREA}_{_stamp()}.csv"
    try:
        _log(f"Fetching FIRMS active fires ({FIRMS_SOURCE}, bbox={FIRMS_BBOX}, "
             f"{FIRMS_DAYS}d) → {out.name}")
        urllib.request.urlretrieve(url, out)

        # The API returns plain text ("Invalid API call.") instead of an HTTP
        # error when something is off — detect that and fail clearly.
        head = out.read_text(errors="ignore")[:200].lstrip()
        if not head.lower().startswith("latitude"):
            _log(f"ERROR: unexpected FIRMS response: {head!r}")
            out.unlink(missing_ok=True)
            return False

        size = out.stat().st_size
        _log(f"OK: {out} ({size} bytes)")
        # Also write/refresh a stable 'latest' copy for the notebook/backend.
        latest = HERE / f"firms_{FIRMS_AREA}_latest.csv"
        latest.write_bytes(out.read_bytes())
        _log(f"OK: refreshed {latest.name}")
        return True
    except Exception as exc:  # noqa: BLE001
        _log(f"ERROR fetching FIRMS data: {exc}")
        return False



# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

SOURCES = {
    "uci": download_uci,
    "kaggle": download_kaggle,
    "firms": download_firms,
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Download TerraVista real datasets.")
    parser.add_argument(
        "source",
        choices=[*SOURCES.keys(), "all"],
        help="Which dataset to download (or 'all').",
    )
    args = parser.parse_args()

    if args.source == "all":
        results = {name: fn() for name, fn in SOURCES.items()}
        ok = sum(results.values())
        _log(f"Done. {ok}/{len(results)} sources downloaded.")
        for name, success in results.items():
            _log(f"  {name:7s}: {'OK' if success else 'skipped/failed'}")
        # 'all' is best-effort: success if at least UCI worked.
        return 0 if results.get("uci") else 1

    success = SOURCES[args.source]()
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
