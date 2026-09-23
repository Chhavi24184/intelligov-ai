"""
migrate.py
----------
Safe schema migration for IntelliGov AI.

Adds the new profile columns to the existing 'users' table
using ADD COLUMN IF NOT EXISTS — completely safe to run
multiple times and on any PostgreSQL (local, Neon, Render).

Does NOT drop, recreate, or touch existing rows or columns.
Does NOT affect login/register/password functionality.

Run manually:
    cd backend
    python migrate.py

Also called automatically by main.py on every startup.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in .env")
    sys.exit(1)


# =========================================================
# NEW COLUMNS — each entry is (column_name, sql_type)
# All nullable so existing rows keep working immediately.
# =========================================================

NEW_COLUMNS = [
    ("age",        "INTEGER"),
    ("state",      "VARCHAR(100)"),
    ("district",   "VARCHAR(100)"),
    ("education",  "VARCHAR(100)"),
    ("occupation", "VARCHAR(100)"),
    ("income",     "VARCHAR(50)"),
    ("category",   "VARCHAR(50)"),
    ("interests",  "VARCHAR(500)"),
    ("language",   "VARCHAR(20) DEFAULT 'en'"),
]


def run_migration():

    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

    print("Connecting to PostgreSQL…")

    added = []
    skipped = []

    with engine.begin() as conn:

        # --------------------------------------------------
        # 1. Get current columns in users table
        # --------------------------------------------------
        existing = {
            row[0]
            for row in conn.execute(text(
                "SELECT column_name "
                "FROM information_schema.columns "
                "WHERE table_schema = 'public' "
                "  AND table_name = 'users'"
            )).fetchall()
        }

        print(f"Existing users columns: {sorted(existing)}")

        # --------------------------------------------------
        # 2. ADD each missing column
        # --------------------------------------------------
        for col_name, col_type in NEW_COLUMNS:
            if col_name in existing:
                skipped.append(col_name)
                continue

            sql = f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
            conn.execute(text(sql))
            added.append(col_name)
            print(f"  ADDED  : {col_name} {col_type}")

        # --------------------------------------------------
        # 3. Create saved_schemes if somehow missing
        # --------------------------------------------------
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS saved_schemes (
                id               SERIAL PRIMARY KEY,
                user_id          INTEGER NOT NULL,
                scheme_id        INTEGER,
                scheme_name      VARCHAR(300) NOT NULL,
                scheme_category  VARCHAR(100),
                scheme_description TEXT,
                scheme_benefits  TEXT,
                scheme_eligibility TEXT,
                scheme_documents TEXT,
                scheme_deadline  VARCHAR(200),
                scheme_official_url VARCHAR(500),
                saved_at         TIMESTAMPTZ DEFAULT NOW()
            )
        """))

        # --------------------------------------------------
        # 4. Verify final state
        # --------------------------------------------------
        final_cols = [
            row[0]
            for row in conn.execute(text(
                "SELECT column_name "
                "FROM information_schema.columns "
                "WHERE table_schema = 'public' "
                "  AND table_name = 'users' "
                "ORDER BY ordinal_position"
            )).fetchall()
        ]

    # --------------------------------------------------
    # Report
    # --------------------------------------------------
    print()
    if added:
        print(f"Migration complete. Added {len(added)} column(s): {added}")
    if skipped:
        print(f"Already present  ({len(skipped)} column(s)): {skipped}")

    print(f"\nFinal users columns: {final_cols}")
    print("\nAll existing users and passwords are untouched.")
    return True


if __name__ == "__main__":
    ok = run_migration()
    sys.exit(0 if ok else 1)
