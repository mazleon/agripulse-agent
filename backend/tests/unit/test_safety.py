"""Unit tests for the safety layer."""

import pytest

from app.utils.safety import _has_overdose_language, _is_bangla, apply_safety


class TestOverdoseDetection:
    def test_catches_times_more(self):
        assert _has_overdose_language("Use 3 times more than the recommended dose") is True

    def test_catches_double_dose(self):
        assert _has_overdose_language("double the dose for faster results") is True

    def test_safe_text_passes(self):
        assert _has_overdose_language("ব্লাস্ট রোগে Tricyclazole স্প্রে করুন।") is False

    def test_normal_number_passes(self):
        assert _has_overdose_language("প্রতি বিঘায় ৫০ মিলি স্প্রে করুন") is False


class TestBanglaDetection:
    def test_bangla_text_detected(self):
        assert _is_bangla("পাতায় দাগ পড়ছে, কী করব?") is True

    def test_english_only_detected(self):
        assert _is_bangla("The leaf has spots on it.") is False


class TestApplySafety:
    @pytest.mark.asyncio
    async def test_empty_response_returns_fallback(self):
        result = await apply_safety("")
        assert "দুঃখিত" in result

    @pytest.mark.asyncio
    async def test_safe_bangla_response_passes_through(self):
        safe_text = "ধানে ব্লাস্ট রোগ হয়েছে। Tricyclazole স্প্রে করুন।"
        result = await apply_safety(safe_text)
        assert result == safe_text

    @pytest.mark.asyncio
    async def test_low_confidence_appends_photo_suffix(self):
        result = await apply_safety("কিছু একটা রোগ হয়েছে।", vision_confidence=0.45)
        assert "ছবিটি আরও স্পষ্ট" in result

    @pytest.mark.asyncio
    async def test_high_confidence_no_photo_suffix(self):
        result = await apply_safety("ব্লাস্ট রোগ হয়েছে।", vision_confidence=0.95)
        assert "ছবিটি আরও স্পষ্ট" not in result
