import uvicorn
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    print("=" * 60)
    print("  Starting InteractMD AI Patient Backend Server...")
    print("  URL: http://localhost:8000")
    print("  Docs: http://localhost:8000/docs")
    print("  Health: http://localhost:8000/api/health")
    print("=" * 60)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
