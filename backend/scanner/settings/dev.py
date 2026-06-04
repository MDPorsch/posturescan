from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

# Allow the local Vite dev server out of the box.
CORS_ALLOWED_ORIGINS = list({
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    *globals().get("CORS_ALLOWED_ORIGINS", []),
})
