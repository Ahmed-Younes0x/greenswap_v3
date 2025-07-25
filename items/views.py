from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, permissions
from rest_framework import status
from django.db.models import Q, Count, Avg, Sum
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Item, ItemImage, ItemRating, ItemLike, ItemView
from .serializers import (
    CategorySerializer, ItemListSerializer, ItemDetailSerializer,
    ItemCreateUpdateSerializer, ItemRatingSerializer, ItemStatsSerializer
)
from .filters import ItemFilter
from .permissions import IsOwnerOrReadOnly
import logging
from django.http import FileResponse, Http404
from django.conf import settings
import os

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class ItemListView(generics.ListAPIView):
    queryset = Item.objects.filter(status='available')
    serializer_class = ItemListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ItemFilter
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'price', 'views_count', 'likes_count']
    ordering = ['-created_at']



class ItemCreateView(generics.CreateAPIView):
    serializer_class = ItemCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Debug print of raw request data
        print("==== Incoming Request Data ====")
        print("DATA:", request.data)
        print("FILES:", request.FILES)
        print("QUERY PARAMS:", request.query_params)
        print("USER:", request.user)
        print("===============================")
        request.data['images'] = request.FILES.getlist('images')
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print("Error during item creation:", e)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        item = serializer.save(owner=self.request.user)
        # Update user statistics
        self.request.user.total_items_posted += 1
        self.request.user.save()
        return item


class ItemDetailView(generics.RetrieveAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemDetailSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        item = self.get_object()
        
        # Record view
        ItemView.objects.create(
            item=item,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Update view count
        item.views_count += 1
        item.save()
        
        return super().retrieve(request, *args, **kwargs)

class ItemUpdateView(generics.UpdateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

class ItemDeleteView(generics.DestroyAPIView):
    queryset = Item.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

class MyItemsView(generics.ListAPIView):
    serializer_class = ItemListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Item.objects.filter(owner=self.request.user)

class FeaturedItemsView(generics.ListAPIView):
    queryset = Item.objects.filter(status='available', is_featured=True)
    serializer_class = ItemListSerializer
    permission_classes = [permissions.AllowAny]

class ItemRatingListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemRatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        item_id = self.kwargs.get('item_id')
        return ItemRating.objects.filter(item_id=item_id)

    def perform_create(self, serializer):
        item_id = self.kwargs.get('item_id')
        item = get_object_or_404(Item, id=item_id)
        
        if item.owner == self.request.user:
            raise serializers.ValidationError('لا يمكنك تقييم منتجك الخاص')
        
        serializer.save(rater=self.request.user, item=item)
        item.update_rating()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, item_id):
    item = get_object_or_404(Item, id=item_id)
    
    if item.owner == request.user:
        return Response({'error': 'لا يمكنك الإعجاب بمنتجك الخاص'}, status=status.HTTP_400_BAD_REQUEST)
    
    like, created = ItemLike.objects.get_or_create(item=item, user=request.user)
    
    if not created:
        like.delete()
        item.likes_count -= 1
        liked = False
    else:
        item.likes_count += 1
        liked = True
    
    item.save()
    
    return Response({
        'liked': liked,
        'likes_count': item.likes_count
    })

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def item_stats(request):
    total_items = Item.objects.count()
    available_items = Item.objects.filter(status='available').count()
    sold_items = Item.objects.filter(status='sold').count()
    featured_items = Item.objects.filter(is_featured=True).count()
    categories_count = Category.objects.filter(is_active=True).count()
    
    stats = Item.objects.aggregate(
        total_views=Sum('views_count'),
        total_likes=Sum('likes_count'),
        average_price=Avg('price')
    )
    
    data = {
        'total_items': total_items,
        'available_items': available_items,
        'sold_items': sold_items,
        'featured_items': featured_items,
        'categories_count': categories_count,
        'total_views': stats['total_views'] or 0,
        'total_likes': stats['total_likes'] or 0,
        'average_price': stats['average_price'] or 0
    }
    
    serializer = ItemStatsSerializer(data)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def popular_items(request):
    items = Item.objects.filter(status='available').order_by('-views_count', '-likes_count')[:10]
    serializer = ItemListSerializer(items, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def recent_items(request):
    items = Item.objects.filter(status='available').order_by('-created_at')[:10]
    serializer = ItemListSerializer(items, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recommended_items(request):
    user = request.user
    
    # Get user's liked categories
    liked_categories = ItemLike.objects.filter(user=user).values_list('item__category', flat=True)
    
    # Get items from liked categories
    recommended = Item.objects.filter(
        status='available',
        category__in=liked_categories
    ).exclude(owner=user).order_by('-created_at')[:20]
    
    # If no recommendations, get popular items
    if not recommended:
        recommended = Item.objects.filter(status='available').exclude(owner=user).order_by('-views_count')[:20]
    
    serializer = ItemListSerializer(recommended, many=True, context={'request': request})
    return Response(serializer.data)




logger = logging.getLogger(__name__)

def serve_image(request, filename):
    """
    Serve item images with fallback to default image if not found
    """
    # Construct paths
    image_dir = os.path.join(settings.MEDIA_ROOT, 'items')
    image_path = os.path.join(image_dir, filename)
    default_path = os.path.join(image_dir, 'default.jpg')
    
    # Log paths for debugging
    logger.debug(f"Attempting to serve image from: {image_path}")
    logger.debug(f"Default image path: {default_path}")

    # Check if default image exists
    if not os.path.exists(default_path):
        logger.error("Default image not found at: %s", default_path)
        raise Http404("Default image is missing from server")

    try:
        # Try serving requested image first
        if os.path.exists(image_path):
            logger.debug(f"Serving image: {filename}")
            return FileResponse(
                open(image_path, 'rb'),
                content_type='image/jpeg',
                as_attachment=False
            )
        
        # Fallback to default image
        logger.warning(f"Image not found, serving default: {filename}")
        return FileResponse(
            open(default_path, 'rb'),
            content_type='image/jpeg',
            as_attachment=False
        )
        
    except PermissionError as e:
        logger.error(f"Permission denied accessing image: {e}")
        raise Http404("Permission error accessing image")
    except Exception as e:
        logger.error(f"Unexpected error serving image: {e}")
        # Final fallback to default even if other errors occur
        return FileResponse(
            open(default_path, 'rb'),
            content_type='image/jpeg',
            as_attachment=False
        )
        
logger = logging.getLogger(__name__)

