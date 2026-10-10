from datetime import datetime
import pytest
from pydantic import ValidationError
from api.schemas.language import Language, LanguageStatus


def test_language_model_instantiation():
    now = datetime.utcnow()
    language = Language(
        id="lang_igl",
        name="Igala",
        code="igl",
        description="A language spoken primarily in Kogi State, Nigeria.",
        status=LanguageStatus.registered,
        created_at=now,
        updated_at=now,
    )
    assert language.id == "lang_igl"
    assert language.name == "Igala"
    assert language.code == "igl"
    assert language.status == LanguageStatus.registered


def test_language_status_defaults_to_discovered():
    now = datetime.utcnow()
    language = Language(
        id="lang_igl",
        name="Igala",
        code="igl",
        created_at=now,
        updated_at=now,
    )
    assert language.status == LanguageStatus.discovered


def test_language_rejects_empty_name():
    now = datetime.utcnow()
    with pytest.raises(ValidationError):
        Language(
            id="lang_igl",
            name="",
            code="igl",
            created_at=now,
            updated_at=now,
        )


def test_language_rejects_invalid_short_code():
    now = datetime.utcnow()
    with pytest.raises(ValidationError):
        Language(
            id="lang_igl",
            name="Igala",
            code="i",
            created_at=now,
            updated_at=now,
        )


def test_language_status_values_are_valid():
    expected = {
        "discovered",
        "registered",
        "data_available",
        "ready",
        "adapting",
        "adapted",
    }
    actual = {status.value for status in LanguageStatus}
    assert actual == expected
