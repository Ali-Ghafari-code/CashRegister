from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "CashRegister POS API"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = Field(
        default="mysql+pymysql://cashregister:cashregister@localhost:3306/cashregister?charset=utf8mb4"
    )

    SECRET_KEY: str = Field(default="dev-secret-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    SEED_ON_START: bool = False

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
