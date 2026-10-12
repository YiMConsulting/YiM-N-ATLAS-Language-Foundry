# 07 — Setup, Installation & Reproduction Guide

> **N-ATLaS Language Foundry — Reproduction Manual**  
> *Author: YiM Consulting Engineering Team*

---

## 1. Prerequisites & System Requirements

The Foundry is designed with a decoupled architecture. You can run and test the **Control Plane API and Web Portal** entirely on standard CPU machines, while **LoRA Training and Comparative Inference** require an NVIDIA GPU environment.

### CPU Development (Control Plane API & Frontend)
- **OS:** Linux (Ubuntu 22.04+ recommended), macOS, or Windows via WSL2.
- **Python:** 3.11+
- **Node.js:** 18.x or 20.x LTS, with `npm`
- **Docker:** Docker Engine 24+ and Docker Compose v2 (recommended)
- **Memory:** 4 GB RAM minimum

### GPU Training & Evaluation (ML Pipeline)
- **GPU:** NVIDIA GPU with $\ge 16\text{ GB}$ VRAM (e.g. NVIDIA Tesla T4, V100, A10G, or A100).
- **CUDA:** 11.8 or 12.1+ with compatible NVIDIA drivers.
- **Python Environment:** PyTorch 2.2+, Transformers 4.40+, PEFT 0.10+, bitsandbytes 0.43+.
- **Authentication:** Hugging Face account with access granted to the gated model [`NCAIR1/N-ATLaS`](https://huggingface.co/NCAIR1/N-ATLaS).

---

## 2. Repository Clone & Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/YiMConsulting/YiM-N-ATLAS-Language-Foundry.git
cd YiM-N-ATLAS-Language-Foundry

# 2. Switch to the active development branch
git checkout feat/james-ml-pipeline

# 3. Create environment file from template
cp .env.example .env
```

### Environment Configuration (`.env`)
Configure the following parameters in your `.env` file (never commit real tokens):

```bash
# Hugging Face Access Token (Required for gated NCAIR1/N-ATLaS base model)
HF_TOKEN=hf_your_huggingface_access_token_here

# Base Model Identifier
BASE_MODEL_NAME=NCAIR1/N-ATLaS

# Control Plane Server Settings
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development

# Security Guard (Set to true in public demo environments)
READ_ONLY_MODE=false
ADMIN_API_KEY=

# CORS Configuration (Comma-separated origins or wildcard)
CORS_ORIGINS=*

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 3. Running the Control Plane API

### Option A: Using Docker Compose (Recommended)
Docker Compose spins up the containerized FastAPI control plane with local volume mounts:

```bash
# Build and start the container in the background
docker compose up -d --build

# Inspect running container status
docker compose ps

# Tail container logs
docker compose logs -f api
```

The API will be available at `http://localhost:8000`.

### Option B: Local Python Virtual Environment
```bash
# Create and activate virtual environment
python3.11 -m venv .venv
source .venv/bin/activate

# Install control plane dependencies
pip install --upgrade pip
pip install -r requirements-api.txt

# Start FastAPI using Uvicorn with hot-reload
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Option C: Standalone Docker Image (Render Cloud Simulation)
To test the standalone image exactly as Render builds and runs it in production:

```bash
# Build standalone image
docker build -t natlas-foundry-api .

# Run with simulated dynamic PORT (e.g. 10000)
docker run -p 10000:10000 -e PORT=10000 -e READ_ONLY_MODE=true natlas-foundry-api
```

---

## 4. Running the Web Frontend

```bash
cd web

# 1. Configure local frontend environment
cat <<EOF > .env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
EOF

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 5. Running Automated Tests

### Backend Unit & Regression Suite (125 tests)
```bash
# Inside the running Docker container:
docker exec natlas-foundry-api pytest

# Or from local Python environment:
pytest -v
```

### Targeted Test Commands
```bash
# Run API truthfulness and contract tests:
docker exec natlas-foundry-api pytest tests/test_api_truthfulness.py -v

# Run evaluation harness unit tests:
docker exec natlas-foundry-api pytest tests/test_evaluation_harness.py -v

# Run deployment readiness and security tests:
docker exec natlas-foundry-api pytest tests/test_deployment_readiness.py -v
```

### Frontend Typecheck & Production Build
```bash
cd web
npx tsc --noEmit
npm run build
```

---

## 6. Accessing Interactive API Documentation

Once the backend is running, explore the OpenAPI Swagger documentation:
- **Local Swagger UI:** `http://localhost:8000/docs`
- **Local ReDoc:** `http://localhost:8000/redoc`
- **Hosted Cloud Docs:** `https://yim-n-atlas-language-foundry.onrender.com/docs`

---

## 7. Dataset Ingestion & Split Reproduction

To reproduce the deterministic split from raw source files:

```bash
# Execute the dataset builder script
python3 scripts/build_tiv_dataset.py \
  --source michsethowusu/english-tiv_sentence-pairs_mt560 \
  --revision 252074f0d4c82c0005099b5eb4043fddc43026f1 \
  --output-dir data/processed/tiv-mt560-v1 \
  --seed 42 \
  --strategy grouped_by_input
```

This generates `split_metadata.json`, `train.jsonl` (138,074 rows), `validation.jsonl` (18,410 rows), and `test.jsonl` (27,615 rows).

---

## 8. Running LoRA Training & Evaluation (GPU Required)

Training and comparative generation require an NVIDIA GPU environment (such as Google Colab with T4 GPU runtime or a cloud VM).

### Executing the Diagnostic Evaluation in Google Colab
1. Upload `notebooks/tiv_base_vs_adapter_evaluation.ipynb` to Google Colab.
2. Select **Runtime > Change runtime type > T4 GPU**.
3. Set your Hugging Face token in Colab Secrets under `hf_token`.
4. Run all cells sequentially. The notebook:
   - Loads `NCAIR1/N-ATLaS` in 8-bit precision.
   - Attaches the saved PEFT adapter (`foundry/runs/tiv-lora-smoke-v1/best_adapter`).
   - Renders prompts using the explicit template:
     `Translate the following English text into Tiv:\n{text}`
   - Computes baseline vs. adapted predictions using `model.disable_adapter()`.
   - Computes SacreBLEU and chrF scores.

---

## 9. Common Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`403 Forbidden` on review submit** | `READ_ONLY_MODE=true` is active | Pass `Authorization: Bearer <ADMIN_API_KEY>` or set `READ_ONLY_MODE=false`. |
| **`503 Service Unavailable` on playground** | Model inference worker is not yet hosted | Expected behavior. The control plane honestly reports inference pending GPU hosting. |
| **Hugging Face `GatedRepoError`** | Missing access to `NCAIR1/N-ATLaS` | Visit Hugging Face model card, request access, and set valid `HF_TOKEN`. |
| **`CUDA out of memory` during training** | Batch size exceeds available VRAM | Set `per_device_batch_size: 1` and increase `gradient_accumulation_steps` in YAML config. |
| **Splits return 0 items in cloud container** | Missing `data/processed` directory | Verified fixed: the API falls back to `data/manifests/tiv_split_metadata.json`. |

---
*Next: Read the practical tester manual in [08-beta-testing-guide.md](./08-beta-testing-guide.md).*
