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
        events = self.trip_day.events.all().order_by("position")
        if not events and not lodging:
            return None, None

        agent, jobs_list = self._determine_agent_and_jobs(events, lodging)

        payload = self._build_payload(agent, jobs_list)
        print("Payload:", payload)
        if not payload:
            return None, None

        try:
            response = requests.post(
                self.URL.format(settings.GEOAPIFY_API_KEY),
                headers=self.headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            print("Optimized route:", data)
            return agent, data

        except Exception as e:
            print("Error optimizing route:", e)
            return None, None

    def _build_payload(self, agent: any, jobs_list: list[Event]):
        payload = {
            "mode": self.mode,
            "agents": [
                {
                    "start_location": [
                        float(agent.place.longitude),
                        float(agent.place.latitude),
                    ],
                    "time_windows": [[0, 86400]],
                }
            ],
            "jobs": jobs_list,
        }
        return payload

    def _determine_agent_and_jobs(
        self, events: list[Event], lodging: Lodging
    ) -> tuple[any, list[Event]]:
        agent = None
        jobs_list = []
        jobs_source = []
        if lodging:
            agent = lodging
            jobs_source = events
        else:
            first_event = events[0]
            agent = first_event
            jobs_source = events[1:]

        jobs_list = [
            {
                "id": str(event.id),
                "location": [float(event.place.longitude), float(event.place.latitude)],
                "duration": 3600,
            }
            for event in jobs_source
            if event.place
        ]
        return agent, jobs_list
