#!/usr/bin/env python3
"""
MCP Server for ChromaDB Semantic Querying
Provides tools to query a local ChromaDB collection and fetch results
"""

import json
import os
from typing import Any, Dict, List

from fastmcp import FastMCP

import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Lazy-loaded embedding model
_embedding_model = None

# --- NEW: Use environment variables for cloud connection ---
CHROMA_SERVER_URL = os.getenv("CHROMA_SERVER_URL")
CHROMA_API_KEY = os.getenv("CHROMA_API_KEY")
CHROMA_TENANT = os.getenv("CHROMA_TENANT")
CHROMA_DATABASE = os.getenv("CHROMA_DATABASE")
CHROMA_COLLECTION_NAME = os.getenv("CHROMA_COLLECTION_NAME", "argo_profiles")
CHROMA_EMBEDDING_MODEL = os.getenv("CHROMA_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

_chroma_client = None
_collection = None

def _get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        _embedding_model = SentenceTransformer(CHROMA_EMBEDDING_MODEL)
    return _embedding_model


def _get_client() -> chromadb.ClientAPI:
    global _chroma_client
    if _chroma_client is None:
        # --- FIX: Change from PersistentClient to HttpClient for cloud ---
        _chroma_client = chromadb.HttpClient(
            host=CHROMA_SERVER_URL,
            api_key=CHROMA_API_KEY,
            tenant=CHROMA_TENANT,
            database=CHROMA_DATABASE,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
    return _chroma_client

def _get_collection():
    global _collection
    if _collection is None:
        client = _get_client()
        _collection = client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)
    return _collection


def _uniform_sample_indices(length: int, target: int) -> List[int]:
    if length <= target:
        return list(range(length))
    step = length / float(target)
    return [min(int(i * step), length - 1) for i in range(target)]


mcp = FastMCP("ChromaDB Server")


@mcp.tool
async def chroma_collection_info() -> str:
    """
    Return basic information about the ChromaDB collection, including name and count.

    Input: None
    Returns: JSON string with {"name": str, "count": int, "path": str}
    """
    try:
        col = _get_collection()
        count = col.count()
        return json.dumps({
            "name": CHROMA_COLLECTION_NAME,
            "count": int(count),
            "path": CHROMA_PERSIST_DIRECTORY
        })
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool
async def chroma_health() -> str:
    """
    Health check for ChromaDB connectivity and configuration.

    Returns: JSON with {status, path, collection, count, embedding_model}
    """
    try:
        client = _get_client()
        col = _get_collection()
        count = col.count()
        # Try initializing embedding model lazily (without heavy compute)
        model_name = CHROMA_EMBEDDING_MODEL
        result = {
            "status": "ok",
            "path": CHROMA_PERSIST_DIRECTORY,
            "collection": CHROMA_COLLECTION_NAME,
            "count": int(count),
            "embedding_model": model_name
        }
        return json.dumps(result)
    except Exception as e:
        return json.dumps({
            "status": "error",
            "error": str(e),
            "path": CHROMA_PERSIST_DIRECTORY,
            "collection": CHROMA_COLLECTION_NAME
        })


@mcp.tool
async def chroma_search(query_text: str, top_k: int = 10) -> str:
    """
    Semantic search over the ChromaDB collection using query text.

    Inputs:
      - query_text: natural language text to search for
      - top_k: number of results to return (default 10)

    Returns: JSON string with fields: ids, distances, metadatas, documents
    """
    try:
        if not query_text or not str(query_text).strip():
            return json.dumps({"error": "query_text is required"})

        model = _get_embedding_model()
        query_vec = model.encode([query_text]).tolist()

        col = _get_collection()
        res = col.query(
            query_embeddings=query_vec,
            n_results=max(1, min(int(top_k), 50)),
            include=["metadatas", "documents", "distances"]
        )

        # Flatten the first query result set
        ids = res.get("ids", [[]])[0]
        metadatas = res.get("metadatas", [[]])[0]
        documents = res.get("documents", [[]])[0]
        distances = res.get("distances", [[]])[0]

        # Clip document text for compactness
        clipped_docs = []
        for doc in documents:
            if not isinstance(doc, str):
                clipped_docs.append(str(doc))
                continue
            clipped_docs.append(doc if len(doc) <= 500 else doc[:500] + "...")

        return json.dumps({
            "ids": ids,
            "distances": distances,
            "metadatas": metadatas,
            "documents": clipped_docs
        })
    except Exception as e:
        return json.dumps({"error": str(e)})


@mcp.tool
async def chroma_get_by_id(item_id: str) -> str:
    """
    Fetch a single item by its id from the ChromaDB collection.

    Input:
      - item_id: the id stored for the vector (e.g., "<platform>_cycle_<n>")

    Returns: JSON with the record's ids, metadatas, documents
    """
    try:
        if not item_id or not str(item_id).strip():
            return json.dumps({"error": "item_id is required"})

        col = _get_collection()
        res = col.get(ids=[item_id], include=["metadatas", "documents"])
        return json.dumps(res)
    except Exception as e:
        return json.dumps({"error": str(e)})


def main():
    # Startup diagnostics so the process doesn't look stuck
    try:
        print("[ChromaServer] Initializing...", flush=True)
        client = _get_client()
        print(f"[ChromaServer] Using storage path: {CHROMA_PERSIST_DIRECTORY}", flush=True)
        col = _get_collection()
        cnt = col.count()
        print(f"[ChromaServer] Collection '{CHROMA_COLLECTION_NAME}' ready with {int(cnt)} items.", flush=True)
        print("[ChromaServer] Exposing tools: chroma_health, chroma_collection_info, chroma_search, chroma_get_by_id", flush=True)
        print("[ChromaServer] Waiting for MCP client on stdio...", flush=True)
    except Exception as e:
        print(f"[ChromaServer] Startup error: {e}", flush=True)
    mcp.run()


if __name__ == "__main__":
    main()


