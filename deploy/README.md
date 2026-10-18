# Experimental Tiv demo deployment notes

## Current demo: Kaggle + Gradio

The current experimental English-to-Tiv demo runs outside this repository's
web/API deployment:

1. Start the Kaggle inference notebook and load the pinned base model
   `NCAIR1/N-ATLaS@e294476928aca9030e924ca27bb8e085e8581273` together with the
   experimental adapter `YiMConsulting/n-atlas-slanguage-tiv-qlora-experimental-v1`.
2. Launch its Gradio interface with a share URL.
3. Set the current URL as `TIV_GRADIO_URL` in the Foundry backend environment.
   The control plane reads that setting through `GET /api/v1/config/tiv-demo`
   (also available at `/config/tiv-demo`), allowing the frontend to use the
   current session URL without embedding it in frontend source.

Kaggle sessions and Gradio share URLs are temporary. The demo is experimental;
its translations have not been independently validated. Use of the model and
adapter is subject to the terms and license conditions of their respective
repositories. Check those terms before use. This workflow does not provide a
permanently hosted inference service.

## Separate legacy inference API

`inference_service/` is retained as provider-neutral FastAPI implementation
and tests for a possible future persistent API. It is **not part of the current
Kaggle + Gradio demo**. Its defaults, prompt, and smoke-test safeguards target
the older adapter `YiMConsulting/n-atlas-tiv-lora-smoke-v1` and mark results as
an unvalidated smoke-test preview. They have not been migrated to the
SLANGUAGE adapter.

The Foundry also retains the legacy `/playground/generate` and `/inference/status`
gateway routes and their `InferenceGatewayClient`. Those routes still target
the standalone inference API using `INFERENCE_SERVICE_URL` and
`INFERENCE_API_KEY`; they are separate from the current Gradio URL configuration.
The legacy API and routes have not been removed.

## Deployment scope

There is no Modal deployment configuration in the current workflow. Do not use
this directory as instructions for a persistent or always-available GPU
endpoint. Any future persistent API deployment requires a separate architecture
and deployment decision.
