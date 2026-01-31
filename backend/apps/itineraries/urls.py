from . import views
from rest_framework_nested import routers

router = routers.SimpleRouter()
router.register(r'trips', views.TripViewset)

urlpatterns = router.urls
