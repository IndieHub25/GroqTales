from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
import json
import time
import asyncio
from datetime import datetime
import logging
from functools import lru_cache

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# API versioning
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# Initialize FastAPI app
app = FastAPI(
    title="ML Model API",
    description="A production-ready FastAPI application serving ML model predictions",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = []

    def is_allowed(self) -> bool:
        now = time.time()
        minute_ago = now - 60

        # Remove requests older than 1 minute
        self.requests = [req for req in self.requests if req > minute_ago]

        if len(self.requests) >= self.requests_per_minute:
            return False

        self.requests.append(now)
        return True

rate_limiter = RateLimiter()

# Pydantic models for request/response
class PredictionRequest(BaseModel):
    features: List[float] = Field(..., description="List of input features for prediction")
    model_version: Optional[str] = Field(None, description="Specific model version to use")

    class Config:
        schema_extra = {
            "example": {
                "features": [1.0, 2.0, 3.0, 4.0],
                "model_version": "1.0.0"
            }
        }

class PredictionResponse(BaseModel):
    prediction: float = Field(..., description="Model prediction result")
    confidence: float = Field(..., description="Prediction confidence score")
    model_version: str = Field(..., description="Version of the model used")
    prediction_id: str = Field(..., description="Unique identifier for the prediction")

class HealthResponse(BaseModel):
    status: str = Field(..., description="Current health status of the API")
    timestamp: str = Field(..., description="Current server timestamp")
    version: str = Field(..., description="API version")

class MetadataResponse(BaseModel):
    model_name: str = Field(..., description="Name of the ML model")
    model_version: str = Field(..., description="Current model version")
    input_shape: List[int] = Field(..., description="Expected input shape")
    output_shape: List[int] = Field(..., description="Output shape")
    last_updated: str = Field(..., description="Last model update timestamp")

# Mock ML model class (replace with your actual model)
class MLModel:
    @lru_cache(maxsize=1)
    def load_model():
        # Simulate model loading
        time.sleep(1)
        return "model_loaded"

    def predict(self, features: List[float]) -> tuple[float, float]:
        # Simulate prediction
        prediction = sum(features) / len(features)
        confidence = 0.95
        return prediction, confidence

# Initialize model
model = MLModel()

# Authentication dependency
async def verify_api_key(api_key: str = Header(..., description="API key for authentication")):
    if api_key != "your-secret-key":  # Replace with secure key management
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key

# Middleware for rate limiting
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if not rate_limiter.is_allowed():
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests"}
        )
    response = await call_next(request)
    return response

# API endpoints
@app.post(
    f"{API_PREFIX}/predict",
    response_model=PredictionResponse,
    dependencies=[Depends(verify_api_key)]
)
async def predict(request: PredictionRequest):
    try:
        logger.info(f"Received prediction request with {len(request.features)} features")

        # Input validation
        if not request.features:
            raise HTTPException(status_code=400, detail="No features provided")

        # Make prediction
        prediction, confidence = model.predict(request.features)

        # Generate response
        response = PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            model_version="1.0.0",
            prediction_id=f"pred_{int(time.time())}"
        )

        logger.info(f"Prediction completed: {response.prediction_id}")
        return response

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get(
    f"{API_PREFIX}/health",
    response_model=HealthResponse
)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version=API_VERSION
    )

@app.get(
    f"{API_PREFIX}/metadata",
    response_model=MetadataResponse,
    dependencies=[Depends(verify_api_key)]
)
async def get_metadata():
    return MetadataResponse(
        model_name="Example ML Model",
        model_version="1.0.0",
        input_shape=[4],
        output_shape=[1],
        last_updated=datetime.now().isoformat()
    )

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "ApiKeyHeader": {
            "type": "apiKey",
            "in": "header",
            "name": "api_key"
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
