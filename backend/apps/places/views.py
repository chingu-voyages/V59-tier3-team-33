from apps.places.services import get_place_suggestions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import authentication, permissions

class PlaceViewSearch(APIView):
    """
    View to search place in mapbox api.

    * Requires token authentication.
    * Only admin users are able to access this view.
    """
    def get(self, request):
        """
        Return a list of places.
        """
        query = request.query_params.get("q", "").strip()
        autocomplete = request.query_params.get("autocomplete", "false")
        try:
            limit = int(request.query_params.get("limit", 5))
        except ValueError:
            return Response({"detail": "limit must be an int"})
        
        limit = max(1, min(limit,10))
        
        if len(query) < 2:
            return Response({"detail": "query must be at least 2 chars"}, status=400)
        
        results = get_place_suggestions(
            query=query, 
            autocomplete=autocomplete,
            limit=limit
            )
        
        return Response(results)
