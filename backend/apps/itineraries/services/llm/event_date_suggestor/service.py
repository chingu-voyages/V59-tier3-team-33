from ..base_client import BaseLLMClient
from .prompts import EVENT_SUGGESTION_PROMPT
from django.conf import settings
import json


class EventDateSuggestor(BaseLLMClient):
    def __init__(self, **kwargs):
        # Set defaults
        provider = kwargs.pop("provider", None) or settings.LLM_PROVIDER
        model_name = kwargs.pop("model_name", None) or settings.LLM_MODEL
        max_retries = kwargs.pop("max_retries", 3)
        temperature = kwargs.pop("temperature", 0.7)
        response_format = kwargs.pop("response_format", "json_object")

        super().__init__(
            provider=provider,
            model_name=model_name,
            api_key=getattr(settings, "LLM_PROVIDER_API_KEY", None),
            **kwargs,  # Pass any remaining kwargs to base client
        )

        self.max_retries = max_retries
        self.temperature = temperature
        self.response_format = response_format

    def suggest_date(self, payload: dict) -> dict:
        """Suggest optimal date and time for an event"""

        # Inject payload into prompt
        formatted_prompt = EVENT_SUGGESTION_PROMPT.format(
            place_to_schedule=payload.get("place_to_schedule", ""),
            trip_start_date=payload.get("trip_start_date", ""),
            trip_end_date=payload.get("trip_end_date", ""),
            itinerary=self._format_itinerary(payload.get("itinerary", {})),
        )

        # Retry logic with exponential backoff
        for attempt in range(self.max_retries):
            try:
                # Get AI response with configured parameters
                invoke_params = {}
                if hasattr(self.client, "invoke"):
                    # LangChain style
                    if self.temperature is not None:
                        invoke_params["temperature"] = self.temperature
                    if self.response_format:
                        invoke_params["response_format"] = {
                            "type": self.response_format
                        }

                    response = self.client.invoke(formatted_prompt, **invoke_params)
                else:
                    # Direct client call
                    response = self.client.invoke(formatted_prompt)

                # Parse JSON response
                try:
                    parsed_response = json.loads(response.content)
                    return parsed_response
                except json.JSONDecodeError:
                    # Fallback to structured response if JSON parsing fails
                    return {
                        "suggested_date": "",
                        "suggested_time": "",
                        "reasoning": f"AI response could not be parsed. Raw response: {response.content}",
                        "alternative": "",
                    }

            except Exception as e:
                if attempt == self.max_retries - 1:
                    # Final attempt failed
                    return {
                        "suggested_date": payload.get("trip_start_date", ""),
                        "suggested_time": "10:00",
                        "reasoning": f"AI service unavailable after {self.max_retries} attempts. Error: {str(e)}",
                        "alternative": "",
                    }

                # Wait before retry (exponential backoff)
                import time

                time.sleep(2**attempt)

    def _format_itinerary(self, itinerary: dict) -> str:
        """Format itinerary data for prompt"""
        if not itinerary:
            return "No existing schedule"

        formatted = []
        for date, data in itinerary.items():
            events_str = ", ".join(data.get("events", []))
            lodging_str = data.get("lodging", "No lodging")
            formatted.append(f"{date}: {events_str} (Lodging: {lodging_str})")

        return "\n".join(formatted)
