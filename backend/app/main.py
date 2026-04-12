from dotenv import load_dotenv
load_dotenv()  # must run before any app module reads os.environ at import time

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, users, rides
from app.db.mongo import connect_to_mongo, close_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

tags_metadata = [
    {
        "name": "Auth",
        "description": "Login, logout, profile retrieval, and driver license upload.",
    },
{
        "name": "Users",
        "description": "View and manage user profiles, follows, and ratings.",
    },
    {
        "name": "Posts",
        "description": "Create and browse ride offers (drivers) and ride requests (passengers).",
    },
]

app = FastAPI(
    title="Yugo API",
    description="College-only rideshare platform. Students post ride offers and requests matched by school email.",
    version="0.1.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
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


@app.get("/", tags=["Health"])
def root():
    return {"message": "status ok!"}
