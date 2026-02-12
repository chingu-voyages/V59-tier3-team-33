from . import views
from rest_framework_nested import routers

router = routers.SimpleRouter()
router.register(r"trips", views.TripViewset)

trips_router = routers.NestedSimpleRouter(router, r"trips", lookup="trip")

trips_router.register(
    r"saved-places",
    views.TripSavedPlaceViewset,
    basename="trip-saved-places"
)

trips_router.register(
    r"events",
    views.TripEventViewset,
    basename="trip-events"
)

trips_router.register(
    r"lodgings",
    views.TripLodgingViewset,
    basename="trip-lodgings"
)


urlpatterns = router.urls + trips_router.urls
