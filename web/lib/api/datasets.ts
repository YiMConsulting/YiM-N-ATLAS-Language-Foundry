import type {
  Dataset,
  DatasetRecord,
  DatasetSplit,
  QualityAudit,
} from "@/lib/datasets";
import type {
  DatasetCreate,
  DatasetImportResult,
  DatasetRecordImport,
  PaginatedResponse,
  SplitCreate,
} from "@/lib/api/types";
import api from "@/lib/api/axios";
import { ApiNotFoundError } from "@/lib/api/errors";
import { isMockMode } from "@/lib/api/mock";
import { mockDatasets, mockQualityAudit } from "@/lib/mocks/datasets";

export async function getDatasets(): Promise<PaginatedResponse<Dataset>> {
  if (isMockMode()) {
    return {
      items: mockDatasets,
      total: mockDatasets.length,
      limit: 20,
      offset: 0,
    };
  }

  const { data } = await api.get<PaginatedResponse<Dataset>>("/datasets");
  return data;
}

export async function getDataset(datasetId: string): Promise<Dataset> {
  if (isMockMode()) {
    const dataset = mockDatasets.find((item) => item.id === datasetId);
    if (!dataset) {
      throw new ApiNotFoundError(`Dataset ${datasetId} not found`);
    }
    return dataset;
  }

  const { data } = await api.get<Dataset>(`/datasets/${datasetId}`);
  return data;
}

export async function registerDataset(
  payload: DatasetCreate,
): Promise<Dataset> {
  const { data } = await api.post<Dataset>("/datasets", payload);
  return data;
}

export async function getDatasetRecords(
  datasetId: string,
  params?: { limit?: number; offset?: number },
): Promise<PaginatedResponse<DatasetRecord>> {
  const { data } = await api.get<PaginatedResponse<DatasetRecord>>(
    `/datasets/${datasetId}/records`,
    { params },
  );
  return data;
}

export async function importDatasetRecords(
  datasetId: string,
  payload: DatasetRecordImport,
): Promise<DatasetImportResult> {
  const { data } = await api.post<DatasetImportResult>(
    `/datasets/${datasetId}/records`,
    payload,
  );
  return data;
}

export async function runQualityAudit(
  datasetId: string,
): Promise<QualityAudit> {
  const { data } = await api.post<QualityAudit>(`/datasets/${datasetId}/audit`);
  return data;
}

export async function getQualityAudit(
  datasetId: string,
): Promise<QualityAudit> {
  if (isMockMode()) {
    if (mockQualityAudit.dataset_id !== datasetId) {
      throw new ApiNotFoundError(`No audit for dataset ${datasetId}`);
    }
    return mockQualityAudit;
  }

  const { data } = await api.get<QualityAudit>(
    `/datasets/${datasetId}/quality`,
  );
  return data;
}

export async function createSplit(
  datasetId: string,
  payload: SplitCreate,
): Promise<DatasetSplit> {
  const { data } = await api.post<DatasetSplit>(
    `/datasets/${datasetId}/splits`,
    payload,
  );
  return data;
}

export async function getSplit(splitId: string): Promise<DatasetSplit> {
  const { data } = await api.get<DatasetSplit>(`/splits/${splitId}`);
  return data;
}
