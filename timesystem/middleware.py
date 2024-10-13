import logging  
import json  

class RequestResponseLoggingMiddleware:  
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
        
        if request.content_type.startswith('application/json'):  
            log_entry["request_body"] = request.body.decode('utf-8')[:200]  # Log first 200 chars  
        
        self.logger.info(json.dumps(log_entry))  

        # Process the request  
        response = self.get_response(request)  
        
        # Create a structured log entry for the response  
        log_entry = {  
            "response_status": response.status_code,  
            "response_headers": dict(response.headers),  
        }  

        if response['Content-Type'].startswith('application/json'):  
            log_entry["response_body"] = response.content.decode('utf-8')[:200]  # Log first 200 chars  

        self.logger.info(json.dumps(log_entry))  

        return response