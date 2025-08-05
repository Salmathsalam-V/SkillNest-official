from rest_framework import serializers
from . models import Post

class PostSerializer(serializers.ModelSerializer):
    like_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user', 'caption', 'post', 'like_count', 'likes']
        read_only_fields = ['like_count']

    def get_like_count(self, obj):
        return obj.likes.count()

  