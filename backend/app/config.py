from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ───────────────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    LOG_LEVEL: str = "INFO"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    # ── LLM provider ──────────────────────────────────────────────────────────
    # Supported: anthropic | openai | google | openrouter
    LLM_PROVIDER: str = "anthropic"

    # Anthropic
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL_FAST: str = "claude-haiku-4-5-20251001"  # intent classification, simple tasks
    ANTHROPIC_MODEL_MAIN: str = "claude-sonnet-4-6"  # synthesis, complex reasoning

    # OpenAI (fallback / alternative)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL_FAST: str = "gpt-4o-mini"
    OPENAI_MODEL_MAIN: str = "gpt-4o"

    # Google Gemini (fallback / alternative)
    GOOGLE_API_KEY: str = ""
    GOOGLE_MODEL_FAST: str = "gemini-1.5-flash"
    GOOGLE_MODEL_MAIN: str = "gemini-1.5-pro"

    # OpenRouter (gateway for many providers)
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL_FAST: str = "anthropic/claude-haiku-4-5-20251001"
    OPENROUTER_MODEL_MAIN: str = "anthropic/claude-sonnet-4-6"

    # ── Weather ───────────────────────────────────────────────────────────────
    OPENWEATHERMAP_API_KEY: str = ""

    # ── Notifications ─────────────────────────────────────────────────────────
    FIREBASE_SERVICE_ACCOUNT_JSON: str = ""
    SSL_WIRELESS_API_KEY: str = ""
    SSL_WIRELESS_SENDER_ID: str = "AgriPulse"

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://agripulse:agripulse@localhost:5432/agripulse"
    DATABASE_URL_SYNC: str = "postgresql://agripulse:agripulse@localhost:5432/agripulse"

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_SESSION_TTL_SECONDS: int = 7200  # 2 hours

    # ── Graphiti / Neo4j ──────────────────────────────────────────────────────
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "agripulse_dev"

    # ── Embeddings ────────────────────────────────────────────────────────────
    EMBEDDING_PROVIDER: str = "fastembed"

    # ── Observability ─────────────────────────────────────────────────────────
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "agripulse"
    SENTRY_DSN: str = ""

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: str | list) -> list[str]:
        if isinstance(v, str):
            import json

            return json.loads(v)
        return v

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def is_test(self) -> bool:
        return self.APP_ENV == "test"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


def get_llm(fast: bool = False):
    """Return a LangChain chat model for the configured provider."""
    s = settings
    if s.LLM_PROVIDER == "openai":
        from langchain_openai import ChatOpenAI

        model = s.OPENAI_MODEL_FAST if fast else s.OPENAI_MODEL_MAIN
        return ChatOpenAI(model=model, api_key=s.OPENAI_API_KEY)  # type: ignore[arg-type]
    elif s.LLM_PROVIDER == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI

        model = s.GOOGLE_MODEL_FAST if fast else s.GOOGLE_MODEL_MAIN
        return ChatGoogleGenerativeAI(model=model, google_api_key=s.GOOGLE_API_KEY)
    elif s.LLM_PROVIDER == "openrouter":
        from langchain_openai import ChatOpenAI

        model = s.OPENROUTER_MODEL_FAST if fast else s.OPENROUTER_MODEL_MAIN
        return ChatOpenAI(
            model=model,
            api_key=s.OPENROUTER_API_KEY,  # type: ignore[arg-type]
            base_url="https://openrouter.ai/api/v1",
        )
    else:  # anthropic (default)
        from langchain_anthropic import ChatAnthropic

        model = s.ANTHROPIC_MODEL_FAST if fast else s.ANTHROPIC_MODEL_MAIN
        return ChatAnthropic(model=model, api_key=s.ANTHROPIC_API_KEY)  # type: ignore[call-arg,arg-type]
