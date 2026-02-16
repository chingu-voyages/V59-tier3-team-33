import requests
from requests.structures import CaseInsensitiveDict
import json
from django.conf import settings
from .models import TripDay, Trip, Lodging, Event


class RouteService:
    
    URL = "https://api.geoapify.com/v1/routeplanner?apiKey={}"
    headers = CaseInsensitiveDict()
    headers["Content-Type"] = "application/json"
    
    def __init__(self, trip_day: TripDay, mode = "drive"):
        self.trip_day = trip_day
        self.mode = mode
        
    def optimize_route(self):
        payload = self._build_payload()
        print("Payload:", payload)
        if not payload:
            return {}
        
        try:
            response = requests.post(
                self.URL.format(settings.GEOAPIFY_API_KEY),
                headers=self.headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            print("Optimized route:", data)
            return data
        
        except Exception as e:
            print("Error optimizing route:", e)
            return {}
        
    def _build_payload(self):
        
        lodging = Lodging.objects.filter(
            trip=self.trip_day.trip,
            arrival_date__lte=self.trip_day.date,
            departure_date__gte=self.trip_day.date,
        ).first()
        events = self.trip_day.events.all().order_by("position")
        
        if not events and not lodging:
            return {}
        
        agent_start_lat, agent_start_lng, jobs_list = self._determine_agent_and_jobs(events, lodging)
        
        payload = {
            "mode": self.mode,
            "agents": [{
                "start_location": [agent_start_lng, agent_start_lat],
                "time_windows": [[0, 86400]],
            }],
            "jobs": jobs_list
        }
        return payload
        
    def _determine_agent_and_jobs(self, events: list[Event], lodging: Lodging) -> tuple[float, float, list[Event]]:
        agent_start_lat = agent_start_lng = None
        jobs_list = []
        jobs_source = []
        if lodging:
            agent_start_lat = float(lodging.place.latitude)
            agent_start_lng = float(lodging.place.longitude)
            jobs_source = events
        else:
            first_event = events[0]
            agent_start_lat = float(first_event.place.latitude)
            agent_start_lng = float(first_event.place.longitude)
            jobs_source = events[1:]
            
        jobs_list = [{
            "id": str(event.id),
            "location": [float(event.place.longitude), float(event.place.latitude)],
            "duration": 3600,
        } for event in jobs_source if event.place]
        return agent_start_lat, agent_start_lng, jobs_list
    
    
        
        