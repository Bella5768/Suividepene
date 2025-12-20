from rest_framework.views import exception_handler
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that logs errors and provides consistent error responses.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Log the error
        logger.error(
            f"API Error: {exc.__class__.__name__}",
            extra={
                'status_code': response.status_code,
                'detail': str(exc),
                'view': context.get('view').__class__.__name__,
            }
        )
        
        # Customize response format
        if isinstance(response.data, dict):
            response.data = {
                'error': True,
                'message': response.data.get('detail', 'An error occurred'),
                'status_code': response.status_code,
            }
    else:
        # Log unhandled exceptions
        logger.error(
            f"Unhandled Exception: {exc.__class__.__name__}: {str(exc)}",
            exc_info=True,
            extra={'view': context.get('view').__class__.__name__}
        )
        response = Response(
            {
                'error': True,
                'message': 'Internal server error',
                'status_code': 500,
            },
            status=500
        )

    return response
