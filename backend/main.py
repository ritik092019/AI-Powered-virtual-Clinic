from fastapi import FastAPI

app = FastAPI(title="Virtual Clinic API")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Powered Virtual Clinic API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
