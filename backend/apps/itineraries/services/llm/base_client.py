from .constants import GROQ


class BaseLLMClient:
    ALLOWED_PROVIDERS = [GROQ]

    def __init__(self, provider: str, model_name: str, **kwargs):
        if provider not in self.ALLOWED_PROVIDERS:
            raise ValueError(
                f"Provider {provider} is not allowed. Allowed providers are: {self.ALLOWED_PROVIDERS}"
            )

        self.provider = provider
        self.model_name = model_name
        self.client = self._get_client(provider, model_name, **kwargs)

    def _get_client(self, provider, model_name, **kwargs):
        if provider == GROQ:
            from langchain_groq import ChatGroq

            # Handle API key from kwargs or settings
            api_key = kwargs.get("api_key") or self._get_api_key()

            # Extract LLM-specific parameters
            llm_params = {
                k: v
                for k, v in kwargs.items()
                if k not in ["api_key", "temperature", "response_format"]
            }

            return ChatGroq(model=model_name, api_key=api_key, **llm_params)

        raise ValueError(f"Provider {provider} is not supported.")

    def _get_api_key(self):
        from django.conf import settings

        return getattr(settings, "LLM_PROVIDER_API_KEY", None)
