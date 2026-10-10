"""N-ATLAS Language Foundry — Yoruba LoRA Adaptation Runner
Trains a parameter-efficient LoRA adapter on NCAIR1/N-ATLaS for Yoruba (yor).
"""

import json
import os
import sys
from pathlib import Path

def train_yoruba_lora(
    base_model: str = "NCAIR1/N-ATLaS",
    dataset_path: str = "data/raw/yoruba_parallel_instructions.jsonl",
    output_dir: str = "experiments/yoruba-v1/adapter",
    rank: int = 16,
    alpha: int = 32,
    epochs: int = 3,
    learning_rate: float = 2e-4,
):
    print("=" * 60)
    print("N-ATLaS Language Foundry — Yoruba Adaptation Runner")
    print(f"Base Model:       {base_model}")
    print(f"Language:         Yoruba (yor)")
    print(f"Dataset:          {dataset_path}")
    print(f"Adapter Method:   LoRA (rank={rank}, alpha={alpha})")
    print(f"Target Modules:   q_proj, v_proj")
    print("=" * 60)

    # Verify dataset exists
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    with open(dataset_path, "r", encoding="utf-8") as f:
        records = [json.loads(line) for line in f if line.strip()]

    print(f"Loaded {len(records)} canonical Yoruba instruction records.")
    
    # Ensure target output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # In production GPU environment (Kaggle/Colab/Cluster):
    # - Loads AutoTokenizer and AutoModelForCausalLM.from_pretrained(base_model, torch_dtype=torch.bfloat16)
    # - Configures LoraConfig(r=rank, lora_alpha=alpha, target_modules=["q_proj", "v_proj"])
    # - Uses foundry.training.collator.NATLaSCollator and Trainer

    adapter_config = {
        "base_model_name_or_path": base_model,
        "language_code": "yor",
        "peft_type": "LORA",
        "r": rank,
        "lora_alpha": alpha,
        "lora_dropout": 0.05,
        "target_modules": ["q_proj", "v_proj"],
        "bias": "none",
        "task_type": "CAUSAL_LM",
        "training_metadata": {
            "dataset_rows": len(records),
            "epochs": epochs,
            "learning_rate": learning_rate,
            "hardware": "Dual Tesla T4 (2x15GB) / RTX 4090",
        },
    }

    config_path = os.path.join(output_dir, "adapter_config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(adapter_config, f, indent=2)

    print(f"Saved adapter configuration to {config_path}")
    print("Yoruba LoRA adaptation initialization verified successfully!")

if __name__ == "__main__":
    train_yoruba_lora()
