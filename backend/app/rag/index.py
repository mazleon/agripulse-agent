"""Shared LlamaIndex query engine — used by KnowledgeAgent."""

from functools import lru_cache

from llama_index.core import VectorStoreIndex
from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.vector_stores.postgres import PGVectorStore

from app.config import settings

EMBED_MODEL = FastEmbedEmbedding(model_name="BAAI/bge-m3")


@lru_cache(maxsize=1)
def get_query_engine():
    vector_store = PGVectorStore.from_params(
        database="agripulse",
        host=settings.DATABASE_URL.split("@")[1].split(":")[0]
        if "@" in settings.DATABASE_URL
        else "localhost",
        password="agripulse",
        port=5432,
        user="agripulse",
        table_name="agripulse_rag_embeddings",
        embed_dim=1024,
    )
    index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store,
        embed_model=EMBED_MODEL,
    )
    return index.as_query_engine(
        similarity_top_k=5,
        embed_model=EMBED_MODEL,
    )
