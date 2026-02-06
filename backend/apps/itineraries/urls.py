from . import views
from rest_framework_nested import routers

router = routers.SimpleRouter()
router.register(r'trips', views.TripViewset)

trip_saved_place_router = routers.NestedSimpleRouter(router, r'trips', lookup='trip')
trip_saved_place_router.register(r'saved-places', views.TripSavedPlaceViewset, basename='saved-places')

urlpatterns = router.urls + trip_saved_place_router.urls
