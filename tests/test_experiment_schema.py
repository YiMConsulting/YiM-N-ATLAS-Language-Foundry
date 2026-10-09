from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from api.schemas.experiment import (
    AdaptationConfig,
    AdaptationMethod,
    EvaluationMetrics,
    Experiment,
    ExperimentArtifacts,
    ExperimentStatus,
    RuntimeConfig,
    TrainingConfig,
)


def make_experiment(**kwargs) -> Experiment:
    now = datetime.now(timezone.utc)
    base = {
        "id": "exp-001",
        "language_code": "igl",
        "base_model": "NCAIR1/N-ATLaS",
        "dataset_ids": ["dataset-001"],
        "split_id": "split-001",
        "adaptation": AdaptationConfig(),
        "training": TrainingConfig(
            per_device_batch_size=4,
            gradient_accumulation_steps=4,
            learning_rate=2e-4,
            epochs=3,
            seed=42,
        ),
        "runtime": RuntimeConfig(
            hardware="Tesla T4",
            device="cuda",
            precision="bf16",
        ),
        "status": ExperimentStatus.queued,
        "created_at": now,
    }
    base.update(kwargs)
    return Experiment(**base)


def test_experiment_can_be_created():
    experiment = make_experiment()
    assert experiment.id == "exp-001"
    assert experiment.language_code == "igl"
    assert experiment.base_model == "NCAIR1/N-ATLaS"
    assert experiment.dataset_ids == ["dataset-001"]
    assert experiment.split_id == "split-001"
    assert experiment.status == ExperimentStatus.queued


def test_experiment_supports_multiple_datasets():
    experiment = make_experiment(
        dataset_ids=["dataset-001", "dataset-002", "dataset-003"]
    )
    assert len(experiment.dataset_ids) == 3


def test_experiment_requires_at_least_one_dataset():
    with pytest.raises(ValidationError):
        make_experiment(dataset_ids=[])


def test_experiment_requires_split():
    with pytest.raises(ValidationError):
        make_experiment(split_id="")


def test_adaptation_defaults_are_valid():
    config = AdaptationConfig()
    assert config.method == AdaptationMethod.lora
    assert config.rank == 16
    assert config.alpha == 32
    assert config.dropout == 0.05
    assert config.target_modules == ["q_proj", "v_proj"]


def test_empty_target_modules_are_rejected():
    with pytest.raises(ValidationError):
        AdaptationConfig(target_modules=[])


def test_invalid_lora_rank_is_rejected():
    with pytest.raises(ValidationError):
        AdaptationConfig(rank=0)


def test_training_configuration_is_valid():
    training = TrainingConfig(
        per_device_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        epochs=3,
        seed=42,
    )
    assert training.per_device_batch_size == 4
    assert training.epochs == 3


def test_completed_experiment_requires_base_results():
    with pytest.raises(ValidationError):
        make_experiment(
            status=ExperimentStatus.completed,
            adapted_results=EvaluationMetrics(loss=0.1),
        )


def test_completed_experiment_requires_adapted_results():
    with pytest.raises(ValidationError):
        make_experiment(
            status=ExperimentStatus.completed,
            base_results=EvaluationMetrics(loss=0.2),
        )


def test_completed_experiment_requires_both_results():
    experiment = make_experiment(
        status=ExperimentStatus.completed,
        base_results=EvaluationMetrics(loss=0.2),
        adapted_results=EvaluationMetrics(loss=0.1),
    )
    assert experiment.base_results is not None
    assert experiment.adapted_results is not None


def test_results_are_optional_before_completion():
    queued = make_experiment()
    running = make_experiment(
        status=ExperimentStatus.running,
    )
    evaluating = make_experiment(
        status=ExperimentStatus.evaluating,
    )
    assert queued.base_results is None
    assert running.base_results is None
    assert evaluating.adapted_results is None


def test_failed_experiment_can_exist_without_results():
    experiment = make_experiment(
        status=ExperimentStatus.failed,
    )
    assert experiment.status == ExperimentStatus.failed
    assert experiment.base_results is None
    assert experiment.adapted_results is None


def test_artifacts_are_optional_during_early_lifecycle():
    experiment = make_experiment()
    assert isinstance(experiment.artifacts, ExperimentArtifacts)
    assert experiment.artifacts.adapter_path is None


def test_experiment_can_record_adapter_artifact():
    experiment = make_experiment(
        artifacts=ExperimentArtifacts(
            adapter_path="experiments/experiment-001/adapter",
            config_path="experiments/experiment-001/config.json",
            metrics_path="experiments/experiment-001/metrics.json",
            logs_path="experiments/experiment-001/logs",
        )
    )
    assert experiment.artifacts.adapter_path.endswith("adapter")
