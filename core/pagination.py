from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardResultsSetPagination(PageNumberPagination):
    """تصفح قياسي للنتائج"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'count': self.page.paginator.count,
                'num_pages': self.page.paginator.num_pages,
                'current_page': self.page.number,
                'page_size': self.page_size,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
                'next_page': self.page.next_page_number() if self.page.has_next() else None,
                'previous_page': self.page.previous_page_number() if self.page.has_previous() else None,
            },
            'results': data
        })

class LargeResultsSetPagination(PageNumberPagination):
    """تصفح للنتائج الكبيرة"""
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200

class SmallResultsSetPagination(PageNumberPagination):
    """تصفح للنتائج الصغيرة"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50