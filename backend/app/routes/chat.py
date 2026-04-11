from fastapi import FastAPI # type: ignore

@app.get("/")
def root():
    return {"message": "Hello, World!"} 

