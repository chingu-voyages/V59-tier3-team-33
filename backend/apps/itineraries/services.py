import requests
from requests.structures import CaseInsensitiveDict
from django.conf import settings
from .models import TripDay, Lodging, Event

class RouteService:
    URL = "https://api.geoapify.com/v1/routeplanner?apiKey={}"
    headers = CaseInsensitiveDict()
    headers["Content-Type"] = "application/json"

    def __init__(self, trip_day: TripDay, mode="drive"):
        self.trip_day = trip_day
        self.mode = mode

    def optimize_route(self) -> tuple[any, dict]:
        lodging = Lodging.objects.filter(
            trip=self.trip_day.trip,
            arrival_date__lte=self.trip_day.date,
            departure_date__gte=self.trip_day.date,
        ).first()
        
        events = list(self.trip_day.events.all().order_by("position"))

        if not events and not lodging:
            return None, None

        # 1. Get the Agent object and the Jobs
        agent, jobs_list = self._determine_agent_and_jobs(events, lodging)

        if not jobs_list:
            return None, None

        # 2. Build Payload
        payload = self._build_payload(agent, jobs_list)
        print("Payload:", payload)
        
        if not payload:
            return None, None

        # 3. Call API
        try:
            response = requests.post(
                self.URL.format(settings.GEOAPIFY_API_KEY),
                headers=self.headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            print("Optimized route:", data)
            
            # 👇 FIX: Return BOTH the agent object and the response data
            return agent, data

        except Exception as e:
            print("Error optimizing route:", e)
            return None, None

    def _build_payload(self, agent: any, jobs_list: list[dict]):
        try:
            # Handle both Event and Lodging objects safely
            if hasattr(agent, 'place'):
                lat = float(agent.place.latitude)
                lng = float(agent.place.longitude)
            else:
                lat = float(agent.latitude)
                lng = float(agent.longitude)

            return {
                "mode": self.mode,
                "agents": [{
                    "start_location": [lng, lat],
                    "time_windows": [[0, 86400]],
                }],
                "jobs": jobs_list
            }
        except AttributeError:
            return None

    def _determine_agent_and_jobs(self, events: list[Event], lodging: Lodging) -> tuple[any, list[dict]]:
        agent = None
        jobs_source = []

        if lodging:
            agent = lodging
            jobs_source = events
        else:
            agent = events[0]
            jobs_source = events[1:]

        jobs_list = [{
            "id": str(event.id),
            "location": [float(event.place.longitude), float(event.place.latitude)],
            "duration": 3600,
        } for event in jobs_source if event.place]
        
        return agent, jobs_list