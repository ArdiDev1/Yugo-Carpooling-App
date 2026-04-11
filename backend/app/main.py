from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, users, rides
from app.auth import login

tags_metadata = [
    {
        "name": "Auth",
        "description": "Register, log in, verify email and driver's license.",
    },
    {
        "name": "Users",
        "description": "View and manage user profiles, follows, and ratings.",
    },
    {
        "name": "Posts",
        "description": "Create and browse ride offers (drivers) and ride requests (passengers).",
    },
    {
        "name": "Passenger Auth",
        "description": "Email-code based passenger signup flow (Resend).",
    },
]

app = FastAPI(
    title="Yugo API",
    description="College-only rideshare platform. Students post ride offers and requests matched by school email.",
    version="0.1.0",
    openapi_tags=tags_metadata,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,  prefix="/api/v1/auth",  tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(rides.router, prefix="/api/v1/posts", tags=["Posts"])
app.include_router(login.router, prefix="/api/v1",       tags=["Passenger Auth"])


@app.get("/", tags=["Health"])
def root():
    return {"message": "status ok!"}
