"""Block until the database accepts connections. Used by the Docker entrypoint."""
from __future__ import annotations

# --- Make `app` importable when this file is run directly (not as -m) ---
import os, sys
_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_ROOT = os.path.dirname(_HERE)
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

import time

from sqlalchemy import text

from app.db.session import engine


def main() -> int:
    for attempt in range(60):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"Database ready after {attempt} attempts")
            return 0
        except Exception as exc:  # noqa: BLE001
            print(f"[{attempt:02d}] DB not ready yet: {exc.__class__.__name__}")
            time.sleep(2)
    print("Database did not become ready in time", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
