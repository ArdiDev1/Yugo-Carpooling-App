"""
Rate-limiter shared across the app.

Lives in its own module so route files can import the decorator without
creating a circular dependency through `app.main`.

Disabled by setting `RATE_LIMIT_ENABLED=false` in the environment — useful
for the test suite, which would otherwise hit limits during normal flow.
"""
import os

from slowapi import Limiter
from slowapi.util import get_remote_address


_enabled = os.environ.get("RATE_LIMIT_ENABLED", "true").lower() == "true"

limiter = Limiter(key_func=get_remote_address, enabled=_enabled)
