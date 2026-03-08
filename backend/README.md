# FeastFleet Backend - Django + PostgreSQL

## Tech Stack
- **Backend Framework**: Python Django 4.2 + Django REST Framework
- **Database**: PostgreSQL 15
- **Authentication**: Django REST Framework + JWT (SimpleJWT)

## Setup Instructions (VS Code)

### 1. Prerequisites
- Python 3.10+ installed
- PostgreSQL 15+ installed and running
- pip (Python package manager)

### 2. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup PostgreSQL Database
Open pgAdmin or psql terminal:
```sql
CREATE DATABASE feastfleet_db;
CREATE USER feastfleet_user WITH PASSWORD 'feastfleet_pass123';
ALTER ROLE feastfleet_user SET client_encoding TO 'utf8';
ALTER ROLE feastfleet_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE feastfleet_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE feastfleet_db TO feastfleet_user;
```

### 5. Configure Database
Edit `feastfleet/settings.py` and update the DATABASES section if your credentials differ.

### 6. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

### 8. Run Development Server
```bash
python manage.py runserver
```

Server will start at: http://127.0.0.1:8000

### 9. Access Admin Panel
Visit: http://127.0.0.1:8000/admin/

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (returns JWT tokens) |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| POST | `/api/auth/password-reset/` | Request password reset |
| PUT | `/api/auth/profile/` | Update user profile |
| GET | `/api/auth/profile/` | Get user profile |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/` | List all approved restaurants |
| POST | `/api/restaurants/` | Register new restaurant (owner) |
| GET | `/api/restaurants/{id}/` | Get restaurant detail + menu |
| PUT | `/api/restaurants/{id}/` | Update restaurant (owner only) |
| DELETE | `/api/restaurants/{id}/` | Delete restaurant (owner only) |

### Menu Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/{id}/menu/` | Get menu for a restaurant |
| POST | `/api/restaurants/{id}/menu/` | Add menu item (owner only) |
| PUT | `/api/menu-items/{id}/` | Update menu item (owner only) |
| DELETE | `/api/menu-items/{id}/` | Delete menu item (owner only) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List user's orders |
| POST | `/api/orders/` | Place new order |
| GET | `/api/orders/{id}/` | Get order detail |
| PUT | `/api/orders/{id}/status/` | Update order status (owner) |
| PUT | `/api/orders/{id}/cancel/` | Cancel order (customer) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/{id}/reviews/` | Get reviews for restaurant |
| POST | `/api/reviews/` | Submit a review |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/restaurants/` | List all restaurants (admin) |
| PUT | `/api/admin/restaurants/{id}/approve/` | Approve restaurant (admin) |
| GET | `/api/admin/users/` | List all users (admin) |
| PUT | `/api/admin/users/{id}/role/` | Assign role to user (admin) |

## Project Structure
```
backend/
├── manage.py
├── requirements.txt
├── feastfleet/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── accounts/
│   ├── models.py        # User, Profile, UserRole
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── permissions.py
├── restaurants/
│   ├── models.py        # Restaurant, MenuItem
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── orders/
│   ├── models.py        # Order, OrderNotification
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
└── reviews/
    ├── models.py        # Review
    ├── serializers.py
    ├── views.py
    └── urls.py
```
