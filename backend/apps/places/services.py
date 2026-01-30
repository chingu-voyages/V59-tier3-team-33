from pprint import pprint
from typing import List
import requests

from apps.places.serializers import PlaceSearchSerializer

MAPBOX_V6_FORWARD_GEOCODING_URL = "https://api.mapbox.com/search/geocode/v6/forward"

def _get(url: str, params:dict | None = None) -> dict:
    
    params = params or {}
    
    params = {**params, "access_token": "pk.eyJ1IjoiY2hyaXNtY2tlIiwiYSI6ImNta3p0aDgyajA2ZG0zZHB1cW9oZGFpZDIifQ.n1eMVL3S9ZfVvLcdZMHW-g"}
    
    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
    except requests.RequestException:
        raise
    
    return response.json()
    
    
def mapbox_forward_geocode(query: str, autocomplete: bool, limit: int) -> dict:
    
    url = MAPBOX_V6_FORWARD_GEOCODING_URL
    
    params = {"q": query, "limit": limit, "autocomplete": autocomplete}
    
    response = _get(url, params)
    
    return response
    
def normalize_mapbox_data(data: dict) -> List[dict]:
    
    normalized = []
    
    for item in data["features"]:
        properties = item["properties"]
        
        external_id = item["id"]
        address = properties["full_address"]
        name = properties["name"]
        lat= properties["coordinates"]["latitude"]
        lng = properties["coordinates"]["longitude"]
        
        normalized.append(
            {
            "external_id": external_id,
            "address": address,
            "name": name,
            "latitude": lat,
            "longitude": lng
            }
        )
    
    return normalized
    
def get_place_suggestions(query:str, autocomplete: bool = False, limit: int = 5):
    features = mapbox_forward_geocode(query, autocomplete=autocomplete, limit=limit)
    data = normalize_mapbox_data(features)
    
    p = PlaceSearchSerializer(data=data, many=True)
    p.is_valid(raise_exception=True)
    validated_data = p.validated_data
    
    return validated_data

