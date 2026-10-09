import csv
import json
from pathlib import Path
import pandas as pd
import pytest

from foundry.datasets.builder import DatasetBuilder
from foundry.datasets.record import DatasetRecord


def write_jsonl(path: Path, records: list[dict]) -> None:
    with path.open("w", encoding="utf-8") as file:
        for record in records:
            file.write(json.dumps(record) + "\n")


def read_jsonl(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8") as file:
        return [json.loads(line) for line in file if line.strip()]


def read_ids(path: Path) -> list[str]:
    ids = []
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                record = json.loads(line)
                ids.append(record["id"])
    return ids


def test_builder_creates_reproducible_splits(tmp_path: Path):
    source = tmp_path / "dataset.jsonl"
    records = [
        {
            "id": f"igl-{i:03d}",
            "input": f"Input {i}",
            "target": f"Target {i}",
        }
        for i in range(20)
    ]
    write_jsonl(source, records)

    output_one = tmp_path / "output-one"
    output_two = tmp_path / "output-two"

    builder_one = DatasetBuilder(
        dataset_id="igala-v1",
        dataset_path=source,
        language_code="igl",
        output_dir=output_one,
        seed=42,
    )
    result_one = builder_one.build()

    builder_two = DatasetBuilder(
        dataset_id="igala-v1",
        dataset_path=source,
        language_code="igl",
        output_dir=output_two,
        seed=42,
    )
    result_two = builder_two.build()

    train_one = read_jsonl(output_one / "train.jsonl")
    train_two = read_jsonl(output_two / "train.jsonl")
    val_one = read_jsonl(output_one / "validation.jsonl")
    val_two = read_jsonl(output_two / "validation.jsonl")
    test_one = read_jsonl(output_one / "test.jsonl")
    test_two = read_jsonl(output_two / "test.jsonl")

    assert train_one == train_two
    assert val_one == val_two
    assert test_one == test_two

    assert result_one.split.total_records == result_two.split.total_records
    assert result_one.split.train_records == len(train_one)
    assert result_one.split.validation_records == len(val_one)
    assert result_one.split.test_records == len(test_one)


def test_no_record_appears_in_multiple_splits(tmp_path: Path):
    source = tmp_path / "dataset.jsonl"
    records = [
        {
            "id": f"igl-{i:03d}",
            "input": f"Input {i}",
            "target": f"Target {i}",
        }
        for i in range(100)
    ]
    write_jsonl(source, records)

    output = tmp_path / "output"
    builder = DatasetBuilder(
        dataset_id="igala-v1",
        dataset_path=source,
        language_code="igl",
        output_dir=output,
        seed=42,
    )
    builder.build()

    train_ids = set(read_ids(output / "train.jsonl"))
    validation_ids = set(read_ids(output / "validation.jsonl"))
    test_ids = set(read_ids(output / "test.jsonl"))

    assert train_ids.isdisjoint(validation_ids)
    assert train_ids.isdisjoint(test_ids)
    assert validation_ids.isdisjoint(test_ids)
    assert len(train_ids | validation_ids | test_ids) == 100


def test_all_output_records_match_canonical_schema(tmp_path: Path):
    source = tmp_path / "dataset.jsonl"
    records = [
        {
            "id": f"igl-{i:03d}",
            "input": f"Input {i}",
            "target": f"Target {i}",
        }
        for i in range(30)
    ]
    write_jsonl(source, records)

    output = tmp_path / "output"
    builder = DatasetBuilder(
        dataset_id="igala-v1",
        dataset_path=source,
        language_code="igl",
        output_dir=output,
    )
    builder.build()

    for split_name in (
        "train",
        "validation",
        "test",
    ):
        path = output / f"{split_name}.jsonl"
        with path.open("r", encoding="utf-8") as file:
            for line in file:
                record = DatasetRecord.model_validate(
                    json.loads(line)
                )
                assert record.language_code == "igl"


def test_split_metadata_matches_output_files(tmp_path: Path):
    source = tmp_path / "dataset.jsonl"
    records = [
        {
            "id": f"igl-{i:03d}",
            "input": f"Input {i}",
            "target": f"Target {i}",
        }
        for i in range(100)
    ]
    write_jsonl(source, records)

    output = tmp_path / "output"
    builder = DatasetBuilder(
        dataset_id="igala-v1",
        dataset_path=source,
        language_code="igl",
        output_dir=output,
        seed=42,
    )
    result = builder.build()

    metadata = json.loads(
        (output / "split_metadata.json").read_text(
            encoding="utf-8"
        )
    )

    assert metadata["total_records"] == 100
    assert metadata["train_records"] == len(
        read_ids(output / "train.jsonl")
    )
    assert metadata["validation_records"] == len(
        read_ids(output / "validation.jsonl")
    )
    assert metadata["test_records"] == len(
        read_ids(output / "test.jsonl")
    )
    assert (
        metadata["train_records"]
        + metadata["validation_records"]
        + metadata["test_records"]
        == metadata["total_records"]
    )
    assert result.split.total_records == 100


def test_different_seed_changes_split(tmp_path: Path):
    source = tmp_path / "dataset.jsonl"
    records = [
        {
            "id": f"igl-{i:03d}",
            "input": f"Input {i}",
            "target": f"Target {i}",
        }
        for i in range(100)
    ]
    write_jsonl(source, records)

    output_one = tmp_path / "output-one"
    output_two = tmp_path / "output-two"

    DatasetBuilder(
        dataset_id="igala-v1",
        dataset_path=source,
        language_code="igl",
        output_dir=output_one,
        seed=42,
    ).build()

    DatasetBuilder(
        dataset_id="igala-v1",
        dataset_path=source,
        language_code="igl",
        output_dir=output_two,
        seed=123,
    ).build()

    train_one = read_ids(output_one / "train.jsonl")
    train_two = read_ids(output_two / "train.jsonl")

    assert train_one != train_two


def test_builder_does_not_modify_source_dataset(tmp_path: Path):
    source = tmp_path / "dataset.jsonl"
    records = [
        {
            "id": f"igl-{i:03d}",
            "input": f"Input {i}",
            "target": f"Target {i}",
        }
        for i in range(20)
    ]
    write_jsonl(source, records)

    original_content = source.read_text(
        encoding="utf-8"
    )

    DatasetBuilder(
        dataset_id="igala-v1",
        dataset_path=source,
        language_code="igl",
        output_dir=tmp_path / "output",
    ).build()

    assert source.read_text(
        encoding="utf-8"
    ) == original_content


def test_supported_formats_produce_same_records(tmp_path: Path):
    records = [
        {
            "id": "igl-001",
            "input": "Hello",
            "target": "Response 1",
        },
        {
            "id": "igl-002",
            "input": "How are you?",
            "target": "Response 2",
        },
        {
            "id": "igl-003",
            "input": "Good morning",
            "target": "Response 3",
        },
    ]

    json_path = tmp_path / "dataset.json"
    json_path.write_text(
        json.dumps(records),
        encoding="utf-8",
    )

    jsonl_path = tmp_path / "dataset.jsonl"
    write_jsonl(jsonl_path, records)

    csv_path = tmp_path / "dataset.csv"
    with csv_path.open(
        "w",
        encoding="utf-8",
        newline="",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "id",
                "input",
                "target",
            ],
        )
        writer.writeheader()
        writer.writerows(records)

    parquet_path = tmp_path / "dataset.parquet"
    pd.DataFrame(records).to_parquet(
        parquet_path,
        index=False,
    )

    loaded_records = []
    for path in (
        json_path,
        jsonl_path,
        csv_path,
        parquet_path,
    ):
        builder = DatasetBuilder(
            dataset_id="igala-fmt-test",
            dataset_path=path,
            language_code="igl",
            output_dir=tmp_path / f"out_{path.suffix.lstrip('.')}",
        )
        raw = builder.load()
        valid, _ = builder.validate_records(raw)
        loaded_records.append([r.model_dump() for r in valid])

    first = loaded_records[0]
    for other in loaded_records[1:]:
        assert other == first


def test_builder_handles_duplicates_and_exclusions(tmp_path: Path):
    source = tmp_path / "dirty_data.jsonl"
    records = [
        # Valid
        {"id": "igl-001", "input": "Hello", "target": "Ọlọjọ"},
        # Duplicate ID
        {"id": "igl-001", "input": "Other", "target": "Other"},
        # Duplicate Content (different ID)
        {"id": "igl-002", "input": "Hello", "target": "Ọlọjọ"},
        # Language mismatch
        {"id": "yor-001", "input": "Hello", "target": "Bawo", "language_code": "yor"},
        # Malformed / empty input
        {"id": "igl-003", "input": "", "target": "Valid"},
        # Missing target
        {"id": "igl-004", "input": "Hello"},
        # Valid
        {"id": "igl-005", "input": "Thank you", "target": "Agba"},
    ]
    write_jsonl(source, records)

    builder = DatasetBuilder(
        dataset_id="igala-dirty",
        dataset_path=source,
        language_code="igl",
        output_dir=tmp_path / "out_dirty",
    )
    result = builder.build()

    assert result.duplicate_records == 2  # 1 duplicate id + 1 duplicate content
    assert result.excluded_records == 3   # 1 yor + 1 empty input + 1 missing target
    assert result.split.total_records == 2  # igl-001 and igl-005
