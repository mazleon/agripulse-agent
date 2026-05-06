"""Shared LlamaIndex query engine — used by KnowledgeAgent."""

from functools import lru_cache

from llama_index.core import VectorStoreIndex
from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient

from app.config import settings

EMBED_MODEL = FastEmbedEmbedding(model_name="BAAI/bge-m3")


def _make_qdrant_client() -> QdrantClient:
    return QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY or None,
    )


@lru_cache(maxsize=1)
def get_query_engine():
    vector_store = QdrantVectorStore(
        client=_make_qdrant_client(),
        collection_name=settings.QDRANT_COLLECTION_NAME,
    )
    index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store,
        embed_model=EMBED_MODEL,
    )
    return index.as_query_engine(
        similarity_top_k=5,
        embed_model=EMBED_MODEL,
    )
