# Backend Setup Guide

## 1. Install Python
- Download Python 3.10+ from https://www.python.org/downloads/
- Verify: `python --version`

## 2. Create Virtual Environment
```bash
cd backend
python -m venv venv
```

## 3. Activate Virtual Environment
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

## 4. Install Requirements
```bash
pip install -r requirements.txt
```

## 5. Configure Environment Variables
```bash
cp .env.example .env
# then fill in real IBM_API_KEY, IBM_PROJECT_ID, IBM_REGION
```

## 6. Run Backend
```bash
uvicorn main:app --reload
```

## 7. Verify
- http://127.0.0.1:8000/
- http://127.0.0.1:8000/health
- http://127.0.0.1:8000/docs
