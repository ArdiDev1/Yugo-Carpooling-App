from fastapi import FastAPI # type: ignore

chat = FastAPI(title="Chat API")

@chat.get("/")
def root():
    return {"message": "Hello, World!"} 