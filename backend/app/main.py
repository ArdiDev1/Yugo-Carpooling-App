from fastapi import FastAPI # type: ignore
from app.routes import join 
from fastapi.middleware.cors import CORSMiddleware # type: ignore

app = FastAPI(title="backend")
app.include_router(join.router, prefix="/api/v1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "status ok!"}