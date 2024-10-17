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
        # Create a structured log entry for the request  
        log_entry = {  
            "request_method": request.method,  
            "request_path": request.path,  
            "request_headers": dict(request.headers),  
        }  
        
        if request.content_type and request.content_type.startswith('application/json'):  
            log_entry["request_body"] = request.body.decode('utf-8')[:200]  # Log first 200 chars  
        
        self.logger.info("Incoming request: " + json.dumps(log_entry))  

        # Process the request  
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

        if response['Content-Type'].startswith('application/json'):  
            log_entry["response_body"] = response.content.decode('utf-8')[:200]  # Log first 200 chars  

        self.logger.info("Outgoing response: " + json.dumps(log_entry))  

        return response  

    def process_exception(self, request, exception):
        # Log any exceptions that occur during request processing
        error_log_entry = {
            "request_method": request.method,
            "request_path": request.path,
            "error_message": str(exception),
            "traceback": traceback.format_exc(),
        }
        self.logger.error("Exception occurred: " + json.dumps(error_log_entry))


    def _update_leave_balance(self, instance):
        """Deduct the appropriate leave days from the user's leave balance."""
        leave_type = instance.leave_type
        start_date = instance.start_date
        end_date = instance.end_date
        leave_days = (end_date - start_date).days + 1  # +1 to include end date

        # Log the request details
        logger.info(f"Updating leave balance for user: {instance.user.username} - Leave Type: {leave_type}, Leave Days: {leave_days}")

        leave_balance, _ = LeaveBalance.objects.get_or_create(user=self.request.user)

        logger.info(f"Current Leave Balance - Annual: {leave_balance.annual}, Sick: {leave_balance.sick}, Casual: {leave_balance.casual}, Maternity: {leave_balance.maternity}")

        try:
            if leave_type == 'annual':
                self._deduct_leave(leave_balance, 'annual', leave_days)
            elif leave_type == 'sick':
                self._deduct_leave(leave_balance, 'sick', leave_days)
            elif leave_type == 'casual':
                self._deduct_leave(leave_balance, 'casual', leave_days)
            elif leave_type == 'maternity':
                self._deduct_leave(leave_balance, 'maternity', leave_days)
            
            leave_balance.save()
            logger.info(f"Updated Leave Balance - Annual: {leave_balance.annual}, Sick: {leave_balance.sick}, Casual: {leave_balance.casual}, Maternity: {leave_balance.maternity}")

        except ValidationError as e:
            logger.error(f"Error updating leave balance for user {instance.user.username}: {e}")
            raise