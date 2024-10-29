import logging  
import json  
from django.db import connection
from django.utils.deprecation import MiddlewareMixin
import traceback
logger = logging.getLogger(__name__)
class RequestResponseLoggingMiddleware(MiddlewareMixin):  
    def __init__(self, get_response):  
        self.get_response = get_response  
        self.configure_logging()  

    def configure_logging(self):  
        # Create a custom logger  
        self.logger = logging.getLogger("RequestResponseLogger")  
        self.logger.setLevel(logging.INFO)  

        # Create a console handler for output to the console  
        ch = logging.StreamHandler()  
        ch.setLevel(logging.INFO)  

        # Create a custom formatter  
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')  
        ch.setFormatter(formatter)  

        # Add the handler to the logger  
        if not self.logger.hasHandlers():  
            self.logger.addHandler(ch)  

    def __call__(self, request):
        log_entry = {
            "request_method": request.method,
            "request_path": request.path,
            "request_headers": dict(request.headers),
        }

        if request.content_type and request.content_type.startswith('application/json'):
            log_entry["request_body"] = request.body.decode('utf-8')[:200]  # Log first 200 chars

        self.logger.info("Incoming request: " + json.dumps(log_entry))

        response = self.get_response(request)

        # Capture SQL queries
        queries = connection.queries
        total_time = sum(float(query['time']) for query in queries)
        log_entry["db_queries"] = queries
        log_entry["total_db_time"] = total_time
        self.logger.info(f"SQL Queries: {json.dumps(queries)}")
        self.logger.info(f"Total DB Time: {total_time:.2f} seconds")

        # Create a structured log entry for the response
        log_entry = {
            "response_status": response.status_code,
            "response_headers": dict(response.headers),
        }

        # Safely access the Content-Type header
        content_type = response.get('Content-Type', None)
        if content_type and content_type.startswith('application/json'):
            log_entry["response_body"] = response.content.decode('utf-8')[:200]  # Log first 200 chars

        self.logger.info("Outgoing response: " + json.dumps(log_entry))

        return response

    def process_exception(self, request, exception):
        error_log_entry = {
            "request_method": request.method,
            "request_path": request.path,
            "error_message": str(exception),
            "traceback": traceback.format_exc(),
        }
        self.logger.error("Exception occurred: " + json.dumps(error_log_entry))

    