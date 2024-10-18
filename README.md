# Emplytech

Emplytech is an employee tracking and management system designed for small and medium-sized organizations. It helps organizations manage employee work hours, productivity, and time management. The system features modern and user-friendly admin components for HR and managers to handle employee data, leave requests, clock-ins, and more.

## Features

Clock-In, Clock-Out, and Break Tracking: Employees can log working hours and breaks, giving managers insights into productivity.
Leave Request & Approval System: Employees can submit leave requests, and managers can approve or reject them through a streamlined interface.
Role-Based Access Control: Ensures users have access to relevant features based on their role (e.g., admin, manager, employee).
Timesheets: Displays clock-in and clock-out records, providing an overview of worked hours.
Real-Time Statistics: Live updates on leave balances, clock-ins, and employee productivity statistics.
Task Management: Users can track tasks and manage workloads with real-time status updates.
Admin Dashboard: Managers can view employee data, leave statistics, and real-time system metrics.

## Planned Features:

Notice components for memos and task assignments.
Extra time (overtime) request and calculation.
Payroll system integration.
Job-based clock-in functionality and job switching.
Scheduling and calendar booking with supervisor notifications.
More granular role creation and management.

## Technologies Used

### Backend

    Django: Web framework used for backend logic and API creation.
    Django REST Framework: Provides APIs for the frontend to interact with backend services.
    MYSQL: Database for storing employee data, clock-in records, leave requests, and more.
    JWT Authentication: Secure login system with role-based access control and token rotation.

### Frontend

    React: JavaScript library for building a dynamic user interface.
    Axios: For handling HTTP requests to the backend APIs.
    Tailwind: For responsive and modern styling.
    React Router: Client-side routing for navigation.

## Installation Instructions
### Backend (Django)

    1 Clone the repository
        git clone https://github.com/your-repo/emplytech.git
            cd emplytech/backend
    2.Create a virtual environment:
        python3 -m venv env
        source env/bin/activate
    3. Install dependencies

    4.Set up environment variables: Create a .env file with your database configurations and JWT settings:
        SECRET_KEY=your_secret_key
        DATABASE_URL=your_postgresql_url

    5. Run migrations:
        python manage.py migrate


## Frontend (React)

    1. Navigate to the frontend directory:
        cd ../frontend

    2. Install dependencies:
            npm install

    3. Start the development server:
        npm start

## Contact

For any questions or feedback, feel free to contact us at:

    Email: okevinotieno@outlook.com
    GitHub: https://github.com/Aellun