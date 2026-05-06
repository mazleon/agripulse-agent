"""
RAG document ingestion pipeline.

Usage:
    python -m app.rag.ingest              # ingest all docs in rag/docs/
    python -m app.rag.ingest --incoming   # only ingest rag/docs/incoming/ (weekly refresh)
"""

import argparse
import asyncio
import logging
from pathlib import Path

from llama_index.core import SimpleDirectoryReader, StorageContext, VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.vector_stores.postgres import PGVectorStore

logger = logging.getLogger(__name__)

DOCS_DIR = Path(__file__).parent / "docs"
INCOMING_DIR = DOCS_DIR / "incoming"
EMBED_MODEL = FastEmbedEmbedding(model_name="BAAI/bge-m3")  # multilingual, supports Bangla


def get_vector_store() -> PGVectorStore:
    return PGVectorStore.from_params(
        database="agripulse",
        host="localhost",
        password="agripulse",
        port="5432",
        user="agripulse",
        table_name="agripulse_rag_embeddings",
        embed_dim=1024,  # bge-m3 dimension
    )


async def ingest_directory(directory: Path, incremental: bool = False) -> int:
    if not directory.exists() or not any(directory.iterdir()):
        logger.warning("No documents found in %s", directory)
        return 0

    logger.info("Loading documents from %s", directory)
    reader = SimpleDirectoryReader(
        input_dir=str(directory),
        recursive=True,
        required_exts=[".txt", ".md", ".pdf"],
    )
    documents = reader.load_data()
    logger.info("Loaded %d documents", len(documents))

    splitter = SentenceSplitter(chunk_size=512, chunk_overlap=64)
    nodes = splitter.get_nodes_from_documents(documents)
    logger.info("Split into %d chunks", len(nodes))

    vector_store = get_vector_store()
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    VectorStoreIndex(
        nodes=nodes,
        storage_context=storage_context,
        embed_model=EMBED_MODEL,
        show_progress=True,
    )

    logger.info("Ingestion complete: %d chunks indexed", len(nodes))
    return len(nodes)


async def main(incoming_only: bool = False) -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    target = INCOMING_DIR if incoming_only else DOCS_DIR
    count = await ingest_directory(target)
    print(f"✅ Ingested {count} chunks into pgvector")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--incoming", action="store_true")
    args = parser.parse_args()
    asyncio.run(main(incoming_only=args.incoming))
