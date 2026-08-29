"""
Development server launcher for IntelliGov AI backend.

Starts uvicorn with --reload enabled but explicitly excludes
the virtual environment directory from the file watcher so that
package installations inside venv/ do not trigger restarts.

Usage (from the backend/ directory):
    python run_dev.py
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        # Exclude the virtual environment from the file watcher.
        # WatchFiles would otherwise detect every pip install
        # inside venv/Lib/site-packages/ and restart the server.
        reload_excludes=[
            "venv",
            ".venv",
            "venv/*",
            ".venv/*",
            "venv/**",
            ".venv/**",
            "__pycache__",
            "*.pyc",
            "vector_store",
        ],
        reload_includes=["*.py"],
        log_level="info",
    )
