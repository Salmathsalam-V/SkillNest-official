from django.urls import path
from . views import CreatorDetailView, LearnerDetailView, LearnerListView,CreatorListView,CreatorData,ContactUsView


urlpatterns = [

    path('learners/', LearnerListView.as_view(), name='learners'),
    path('learners/<int:id>/', LearnerDetailView.as_view(), name='learner-detail'),
    path('creators/', CreatorListView.as_view(), name='creators'),
    path('creators/<int:id>/', CreatorDetailView.as_view(), name='creator-detail'),
    path('creators-view/<int:id>/', CreatorData.as_view(), name='creator-detail'),
    path('contact-us/', ContactUsView.as_view(), name='contact-us'),
]