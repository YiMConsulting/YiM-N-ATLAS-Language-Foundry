from __future__ import annotations

import csv
from datetime import datetime, timezone
from dataclasses import dataclass
import json
from pathlib import Path
import random
from typing import Iterable

import pandas as pd

from foundry.datasets.record import DatasetRecord
from foundry.datasets.split import DatasetSplit, SplitStrategy

SUPPORTED_FORMATS = {"json", "jsonl", "csv", "parquet"}


@dataclass
class DatasetBuildResult:
    dataset_id: str
    output_dir: Path
    split: DatasetSplit
    excluded_records: int
    duplicate_records: int


class DatasetBuilder:
    def __init__(
        self,
        dataset_id: str,
        dataset_path: str | Path,
        language_code: str,
        output_dir: str | Path,
        *,
        file_format: str | None = None,
        seed: int = 42,
        train_ratio: float = 0.75,
        validation_ratio: float = 0.10,
        test_ratio: float = 0.15,
    ) -> None:
        self.dataset_id = dataset_id
        self.dataset_path = Path(dataset_path)
        self.language_code = language_code
        self.output_dir = Path(output_dir)
        self.file_format = (
            file_format.lower()
            if file_format
            else self.dataset_path.suffix.lstrip(".").lower()
        )
        self.seed = seed
        self.train_ratio = train_ratio
        self.validation_ratio = validation_ratio
        self.test_ratio = test_ratio
        self._validate_configuration()

    def _validate_configuration(self) -> None:
        if self.file_format not in SUPPORTED_FORMATS:
            raise ValueError(
                f"Unsupported dataset format: {self.file_format}. "
                f"Supported formats: {sorted(SUPPORTED_FORMATS)}"
            )
        if not self.dataset_path.exists():
            raise FileNotFoundError(
                f"Dataset file not found: {self.dataset_path}"
            )
        if abs(
            self.train_ratio
            + self.validation_ratio
            + self.test_ratio
            - 1.0
        ) > 1e-6:
            raise ValueError(
                "train_ratio, validation_ratio, and test_ratio "
                "must sum to 1.0"
            )
        for name, ratio in (
            ("train_ratio", self.train_ratio),
            ("validation_ratio", self.validation_ratio),
            ("test_ratio", self.test_ratio),
        ):
            if ratio <= 0 or ratio >= 1:
                raise ValueError(
                    f"{name} must be greater than 0 and less than 1"
                )

    def load(self) -> list[dict]:
        if self.file_format == "json":
            return self._load_json()
        if self.file_format == "jsonl":
            return self._load_jsonl()
        if self.file_format == "csv":
            return self._load_csv()
        if self.file_format == "parquet":
            return self._load_parquet()
        raise ValueError(
            f"Unsupported dataset format: {self.file_format}"
        )

    def _load_json(self) -> list[dict]:
        with self.dataset_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)
        if isinstance(data, list):
            records = data
        elif isinstance(data, dict) and isinstance(
            data.get("records"),
            list,
        ):
            records = data["records"]
        else:
            raise ValueError(
                "JSON dataset must contain either a list of records "
                "or an object with a 'records' list"
            )
        return records

    def _load_jsonl(self) -> list[dict]:
        records = []
        with self.dataset_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            for line_number, line in enumerate(file, start=1):
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                except json.JSONDecodeError as exc:
                    raise ValueError(
                        f"Invalid JSON on line {line_number}"
                    ) from exc
                records.append(record)
        return records

    def _load_csv(self) -> list[dict]:
        with self.dataset_path.open(
            "r",
            encoding="utf-8",
            newline="",
        ) as file:
            reader = csv.DictReader(file)
            return list(reader)

    def _load_parquet(self) -> list[dict]:
        dataframe = pd.read_parquet(self.dataset_path)
        return dataframe.to_dict(
            orient="records"
        )

    def normalize_record(
        self,
        raw_record: dict,
    ) -> DatasetRecord:
        return DatasetRecord(
            id=str(raw_record["id"]).strip(),
            input=str(raw_record["input"]).strip(),
            target=str(raw_record["target"]).strip(),
            language_code=str(
                raw_record.get(
                    "language_code",
                    self.language_code,
                )
            ).strip(),
        )

    def validate_records(
        self,
        raw_records: Iterable[dict],
    ) -> tuple[list[DatasetRecord], int]:
        valid_records: list[DatasetRecord] = []
        excluded_records = 0
        for raw_record in raw_records:
            try:
                record = self.normalize_record(raw_record)
            except (KeyError, TypeError, ValueError):
                excluded_records += 1
                continue
            if record.language_code != self.language_code:
                excluded_records += 1
                continue
            valid_records.append(record)
        return valid_records, excluded_records

    def deduplicate_records(
        self,
        records: Iterable[DatasetRecord],
    ) -> tuple[list[DatasetRecord], int]:
        unique_records: list[DatasetRecord] = []
        seen_ids: set[str] = set()
        seen_content: set[tuple[str, str, str]] = set()
        duplicates = 0
        for record in records:
            content_key = (
                record.language_code,
                record.input,
                record.target,
            )
            if record.id in seen_ids:
                duplicates += 1
                continue
            if content_key in seen_content:
                duplicates += 1
                continue
            seen_ids.add(record.id)
            seen_content.add(content_key)
            unique_records.append(record)
        return unique_records, duplicates

    def split_records(
        self,
        records: list[DatasetRecord],
    ) -> tuple[
        list[DatasetRecord],
        list[DatasetRecord],
        list[DatasetRecord],
    ]:
        shuffled = list(records)
        rng = random.Random(self.seed)
        rng.shuffle(shuffled)
        total = len(shuffled)
        train_end = int(
            total * self.train_ratio
        )
        validation_end = train_end + int(
            total * self.validation_ratio
        )
        train_records = shuffled[:train_end]
        validation_records = shuffled[
            train_end:validation_end
        ]
        test_records = shuffled[
            validation_end:
        ]
        return (
            train_records,
            validation_records,
            test_records,
        )

    def _write_jsonl(
        self,
        path: Path,
        records: Iterable[DatasetRecord],
    ) -> None:
        with path.open(
            "w",
            encoding="utf-8",
        ) as file:
            for record in records:
                file.write(
                    json.dumps(
                        record.model_dump(),
                        ensure_ascii=False,
                    )
                    + "\n"
                )

    def write_splits(
        self,
        train_records: list[DatasetRecord],
        validation_records: list[DatasetRecord],
        test_records: list[DatasetRecord],
    ) -> None:
        self.output_dir.mkdir(
            parents=True,
            exist_ok=True,
        )
        self._write_jsonl(
            self.output_dir / "train.jsonl",
            train_records,
        )
        self._write_jsonl(
            self.output_dir / "validation.jsonl",
            validation_records,
        )
        self._write_jsonl(
            self.output_dir / "test.jsonl",
            test_records,
        )

    def create_split_metadata(
        self,
        total_records: int,
        train_records: list[DatasetRecord],
        validation_records: list[DatasetRecord],
        test_records: list[DatasetRecord],
    ) -> DatasetSplit:
        return DatasetSplit(
            id=f"{self.dataset_id}-split-{self.seed}",
            dataset_id=self.dataset_id,
            strategy=SplitStrategy.random,
            seed=self.seed,
            train_ratio=self.train_ratio,
            validation_ratio=self.validation_ratio,
            test_ratio=self.test_ratio,
            total_records=total_records,
            train_records=len(train_records),
            validation_records=len(validation_records),
            test_records=len(test_records),
            created_at=datetime.now(timezone.utc),
        )

    def write_split_metadata(
        self,
        split: DatasetSplit,
    ) -> None:
        metadata_path = (
            self.output_dir
            / "split_metadata.json"
        )
        with metadata_path.open(
            "w",
            encoding="utf-8",
        ) as file:
            json.dump(
                split.model_dump(mode="json"),
                file,
                indent=2,
            )

    def build(self) -> DatasetBuildResult:
        raw_records = self.load()
        valid_records, excluded_records = (
            self.validate_records(raw_records)
        )
        unique_records, duplicate_records = (
            self.deduplicate_records(
                valid_records
            )
        )
        (
            train_records,
            validation_records,
            test_records,
        ) = self.split_records(
            unique_records
        )
        split = self.create_split_metadata(
            total_records=len(unique_records),
            train_records=train_records,
            validation_records=validation_records,
            test_records=test_records,
        )
        self.write_splits(
            train_records,
            validation_records,
            test_records,
        )
        self.write_split_metadata(split)
        return DatasetBuildResult(
            dataset_id=self.dataset_id,
            output_dir=self.output_dir,
            split=split,
            excluded_records=excluded_records,
            duplicate_records=duplicate_records,
        )
