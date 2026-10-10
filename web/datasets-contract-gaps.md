# Datasets — contract gaps and conventional solutions

Status: planning notes for the datasets feature. The target contract is
[`docs/api_contract.md`](../docs/api_contract.md). This file explains what
can be implemented against the contract today, what is blocked, and the
conventional REST solutions for the blocked parts.

## Context

The contract defines these dataset-related resources:

- `Dataset` — registration record (id, language_code, name, format,
  source_type, record_count, provenance_id, status, timestamps).
- `DatasetProvenance` — license/source/usage metadata, referenced by
  `Dataset.provenance_id`.
- `DatasetRecord` — one input/target training pair.
- `QualityAudit` — the latest automated quality audit for a dataset.
- `DatasetSplit` — a reproducible train/validation/test split.

Available endpoints (from the contract catalogue):

- `GET /datasets` → `PaginatedResponse<Dataset>`
- `POST /datasets` → register a dataset
- `GET /datasets/{dataset_id}` → dataset details
- `GET /datasets/{dataset_id}/records` → record preview
- `POST /datasets/{dataset_id}/records` → import records
- `POST /datasets/{dataset_id}/audit` → run quality audit
- `GET /datasets/{dataset_id}/quality` → latest quality audit (404 if none)
- `POST /datasets/{dataset_id}/review-requests` → create review request
- `POST /datasets/{dataset_id}/splits` → create a split
- `GET /splits/{split_id}` → split details

## What works against the contract today

The following can be implemented now, with no backend changes:

1. `GET /datasets` list — the list page fetches the paginated envelope and
   shows one row per `Dataset`.
2. `GET /datasets/{dataset_id}` detail — the detail page fetches a single
   `Dataset`, with 404 handling.
3. `GET /datasets/{dataset_id}/quality` — the detail page fetches the
   latest `QualityAudit`, with an explicit "no audit yet" state on 404.
4. Record preview/import, audit run, review request, and split creation —
   service-layer functions can be written against the contract now, even
   if the backend routes are not implemented yet.

## Gap 1 — no provenance endpoint

**Problem:** `Dataset` only stores `provenance_id`, but the endpoint
catalogue has no route to read a `DatasetProvenance` by id. The provenance
card therefore has nothing to render from the dataset detail alone.

**Conventional solutions:**

- **Option A (recommended):** add `GET /provenance/{provenance_id}` that
  returns a `DatasetProvenance`. This is the standard REST "read a
  resource by id" pattern and matches the existing `GET /splits/{split_id}`
  style.

  ```text
  GET /api/v1/provenance/{provenance_id} -> DatasetProvenance | 404
  ```

- **Option B:** embed the `DatasetProvenance` object in the
  `GET /datasets/{dataset_id}` response, e.g. a `provenance` field.
  Convenient for the UI, but denormalizes the resource and makes list
  responses heavier if applied everywhere.

- **Option C:** support an expand query param, e.g.
  `GET /datasets/{dataset_id}?include=provenance`. Flexible, but more
  backend work than a plain read route.

**Frontend fallback until resolved:** render a placeholder provenance card
("Provenance not available — waiting on backend route").

## Gap 2 — no split-list endpoint

**Problem:** a dataset can have multiple splits over time (different seeds
or ratios), but `Dataset` has no `split_id`, and the catalogue only offers
`POST /datasets/{id}/splits` and `GET /splits/{split_id}`. There is no way
for the UI to discover which split(s) belong to a dataset.

`GET /splits/{split_id}` and `GET /datasets/{id}/splits` are not the same:

- `GET /splits/{split_id}` answers "give me the split with this id".
- `GET /datasets/{id}/splits` answers "give me all splits for this dataset".

The "by dataset" route is the parent-child collection lookup that lets the
UI find the ids to use with the "by id" route.

**Conventional solution (recommended):** add the standard nested
collection endpoint.

```text
GET /api/v1/datasets/{dataset_id}/splits -> PaginatedResponse<DatasetSplit>
```

This mirrors `GET /datasets/{dataset_id}/records` and `POST
/datasets/{dataset_id}/splits` already in the contract.

**Alternative:** add an optional `split_id` to `Dataset` pointing at the
latest split. Simpler for the UI, but only surfaces one split and hides the
reproducibility history.

**Frontend fallback until resolved:** render a "no split yet" state.

## Gap 3 — dataset list columns

**Problem:** the existing list shows Source, License, Quality, and Use,
but those values live on `DatasetProvenance` and `QualityAudit`, not on
`Dataset`. `GET /datasets` returns only `Dataset` fields, so populating
those columns would require one extra request per row (N+1).

**Conventional solutions:**

- **Option A (chosen):** simplify the list to columns that exist on
  `Dataset` itself: name, language code, format, source type, record
  count, and status. No extra requests, always consistent with the list
  payload.
- **Option B:** have the backend embed provenance + latest audit in the
  list response (e.g. `provenance` and `latest_quality` fields). Rich UI,
  but changes the list contract.
- **Option C:** fetch provenance/audit per row client-side. Works, but
  scales poorly (N+1) and is discouraged.

## Implementation decisions summary

| Area            | Decision                                                                              |
| --------------- | ------------------------------------------------------------------------------------- |
| Types           | Rewrite `web/lib/datasets.ts` to the contract shapes; move mocks to a dedicated layer |
| List columns    | Option A — only `Dataset` fields                                                      |
| Provenance card | Accept `DatasetProvenance \| null`; placeholder until Gap 1 is resolved               |
| Quality card    | Accept `QualityAudit \| null`; "no audit yet" on 404                                  |
| Split bar       | Accept `DatasetSplit \| null`; "no split yet" until Gap 2 is resolved                 |
| Pagination      | Move `PaginatedResponse<T>` into a shared module used by languages and datasets       |

## Local development mock mode

To work without the backend running, the API service layer supports an
explicit mock mode. Set in `web/.env.local`:

```text
NEXT_PUBLIC_API_MOCK=true
```

When enabled, `getLanguages`, `getLanguage`, `getDatasets`, `getDataset`,
and `getQualityAudit` return the mock data in `web/lib/mocks/` instead of
calling the API. Mock "not found" results throw `ApiNotFoundError`, which
the pages map to a 404 exactly like the real API. Remove the variable (or
set it to `false`) to return to real API calls.
