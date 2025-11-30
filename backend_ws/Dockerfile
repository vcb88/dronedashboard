# Stage 1: Build the React frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Stage 2: Build the Python backend
FROM python:3.9-slim
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies from the specific backend_ws directory
COPY backend_ws/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code from the specific backend_ws directory
COPY backend_ws/main.py .

# Copy the built frontend from the builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend_dist

# Expose port 8000
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
