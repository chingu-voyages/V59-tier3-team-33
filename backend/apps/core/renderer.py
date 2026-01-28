from rest_framework.renderers import JSONRenderer


def _first_str(value, default: str) -> str:
    if isinstance(value, str) and value:
        return value
    if isinstance(value, list) and value:
        first = value[0]
        return first if isinstance(first, str) and first else default
    return default


class StandardResponseRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        renderer_context = renderer_context or {}
        response = renderer_context.get("response")
        status_code = response.status_code if response else 200
        # If DRF did not provide a response object, fallback to default JSON rendering.
        if response is None:
            return super().render(data, accepted_media_type, renderer_context)

        formatted_data: dict = {"status": True, "message": "OK", "data": data}
        
        if status_code >= 400:
            message = "An error occurred"
            if isinstance(data, dict):
                # DRF commonly uses "detail" for single-error responses
                if "detail" in data:
                    message = _first_str(data.get("detail"), message)
                elif "message" in data:
                    message = _first_str(data.get("message"), message)
                elif "non_field_errors" in data:
                    message = _first_str(data.get("non_field_errors"), message)

            formatted_data = {"status": False, "message": message, "errors": data}
            
        if isinstance(data, dict) and 'results' in data:
            formatted_data["data"] = data.get("results")
            formatted_data["meta"] = {
                "count": data.get("count"),
                "next": data.get("next"),
                "previous": data.get("previous"),
            }
            
        return super().render(formatted_data, accepted_media_type, renderer_context)