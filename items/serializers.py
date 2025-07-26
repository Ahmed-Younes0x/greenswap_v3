from rest_framework import serializers
from .models import Category, Item, ItemImage, ItemRating, ItemLike, ItemView
from accounts.serializers import UserPublicSerializer

class CategorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'color', 'parent', 'items_count', 'sort_order']

    def get_name(self, obj):
        request = self.context.get('request')
        language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'ar')[:2] if request else 'ar'
        return obj.get_name(language)

    def get_description(self, obj):
        request = self.context.get('request')
        language = request.META.get('HTTP_ACCEPT_LANGUAGE', 'ar')[:2] if request else 'ar'
        return obj.get_description(language)

    def get_items_count(self, obj):
        return obj.items.filter(status='available').count()

# class ItemImageSerializer(serializers.ModelSerializer):
#     image_url = serializers.SerializerMethodField()

#     class Meta:
#         model = ItemImage
#         fields = ['id', 'image', 'image_url', 'alt_text', 'is_primary', 'sort_order']

#     def get_image_url(self, obj):
#         if obj.image:
#             return self.context['request'].build_absolute_uri(obj.image.url)
#         return None


class ItemImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    class Meta:
        model = ItemImage
        fields = ['id', 'image', 'item', 'image_url', 'alt_text', 'is_primary', 'sort_order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ItemRatingSerializer(serializers.ModelSerializer):
    rater = UserPublicSerializer(read_only=True)

    class Meta:
        model = ItemRating
        fields = ['id', 'rater', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

class ItemListSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name_ar', read_only=True)
    image = serializers.SerializerMethodField()  # <-- Use method field
    is_liked = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'price', 'quantity', 'condition', 'location',
            'status', 'is_featured', 'is_urgent', 'owner', 'category_name', 'image',
            'views_count', 'likes_count', 'rating_average', 'rating_count', 'created_at',
            'is_liked', 'distance'
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        primary_image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary_image and primary_image.image and hasattr(primary_image.image, 'url'):
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        # fallback to main image field if exists
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_distance(self, obj):
        # TODO: Implement distance calculation based on user location
        return None



class ItemDetailSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = ItemImageSerializer(many=True, read_only=True)
    ratings = ItemRatingSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'owner', 'price', 'quantity', 
            'is_negotiable', 'condition', 'weight', 'dimensions', 'material', 'location', 
            'latitude', 'longitude', 'status', 'is_featured', 'is_urgent', 'ai_analyzed',
            'ai_category_suggestion', 'ai_condition_assessment', 'ai_price_suggestion',
            'created_at', 'updated_at', 'expires_at', 'views_count', 'likes_count',
            'rating_average', 'rating_count', 'image', 'images', 'ratings', 'is_liked', 'can_edit'
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        primary_image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary_image and primary_image.image and hasattr(primary_image.image, 'url'):
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        # fallback to main image field if exists
        if obj.image and hasattr(obj.image, 'url'):
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.owner == request.user
        return False

# class ItemCreateUpdateSerializer(serializers.ModelSerializer):
#     # images = serializers.ListField(
#     #     child=serializers.ImageField(),
#     #     write_only=True,
#     #     required=False
#     # )
#     images = ItemImageSerializer(many=True)


#     class Meta:
#         model = Item
#         fields = ['id','title', 'description', 'category', 'price', 'quantity', 'is_negotiable', 
#                  'condition', 'weight', 'dimensions', 'material', 'location', 'latitude', 
#                  'longitude', 'is_urgent', 'images']

#     def create(self, validated_data):
#         images_data = validated_data.pop('images', [])
#         item = Item.objects.create(**validated_data)
        
#         # Create images
#         for i, image_data in enumerate(images_data):
#             ItemImage.objects.create(
#                 item=item,
#                 image=image_data,
#                 is_primary=(i == 0),
#                 sort_order=i
#             )
        
#         return item

#     def update(self, instance, validated_data):
#         images_data = validated_data.pop('images', [])
        
#         # Update item fields
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()
        
#         # Update images if provided
#         if images_data:
#             instance.images.all().delete()
#             for i, image_data in enumerate(images_data):
#                 ItemImage.objects.create(
#                     item=instance,
#                     image=image_data,
#                     is_primary=(i == 0),
#                     sort_order=i
#                 )
        
#         return instance


class ItemCreateUpdateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'category', 'price', 'quantity', 'is_negotiable',
            'condition', 'weight', 'dimensions', 'material', 'location', 'latitude',
            'longitude', 'is_urgent', 'image'
        ]

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return Item.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
class ItemStatsSerializer(serializers.Serializer):
    total_items = serializers.IntegerField()
    available_items = serializers.IntegerField()
    sold_items = serializers.IntegerField()
    featured_items = serializers.IntegerField()
    categories_count = serializers.IntegerField()
    total_views = serializers.IntegerField()
    total_likes = serializers.IntegerField()
    average_price = serializers.DecimalField(max_digits=10, decimal_places=2)
