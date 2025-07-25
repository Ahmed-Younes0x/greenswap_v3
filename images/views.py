import logging
from django.http import FileResponse, Http404
from django.conf import settings
import os

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
        
import logging
from django.http import FileResponse, Http404
from django.conf import settings
import os

logger = logging.getLogger(__name__)

def serve_avatar(request, filename):
    """
    Serve item images with fallback to default image if not found
    """
    # Construct paths
    image_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
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