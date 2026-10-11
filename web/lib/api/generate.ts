import api from "@/lib/api/axios";

export type GenerateRequest = {
  prompt: string;
  language_code: string;
  experiment_id: string;
  max_new_tokens?: number;
  do_sample?: boolean;
};

export type GenerateResponse = {
  prompt: string;
  language_code: string;
  experiment_id: string;
  base_output: string;
  adapted_output: string;
  latency_ms: number;
  status: string;
};

export async function generate(
  payload: GenerateRequest,
): Promise<GenerateResponse> {
  const { data } = await api.post<GenerateResponse>(
    "/playground/generate",
    payload,
  );
  return data;
}
