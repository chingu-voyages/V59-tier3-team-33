# Local Development Setup Guide

This guide will help you set up the JoyRoute project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** (v1.0 or higher) - Fast JavaScript runtime and package manager: [Installation Guide](https://bun.sh/docs/installation)
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- **Python 3.14** (will be managed by uv)
- **uv** - Python package manager: [Installation Guide](https://github.com/astral-sh/uv)
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

## Project Structure

```
voyage-tasks/
├── backend/          # Django REST API
├── frontend/         # Next.js application
└── docs/            # Project documentation
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Environment File

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Frontend Configuration
FRONTEND_URL=http://localhost:3000
FRONTEND_EMAIL_VERIFICATION_PATH_NAME=verify-email
FRONTEND_PASSWORD_RESET_PATH_NAME=reset-password

# Email Configuration (Mailtrap)
EMAIL_HOST_USER=your_mailtrap_username
EMAIL_HOST_PASSWORD=your_mailtrap_password
EMAIL_PORT=2525
DEFAULT_FROM_EMAIL=joyroute.support@gmail.com

# Geoapify API Key
GEOAPIFY_API_KEY=your_geoapify_api_key
```

### 3. Set Up Email Service (Mailtrap)

1. Go to [Mailtrap.io](https://mailtrap.io/) and create a free account
2. Navigate to Email Testing → Inboxes
3. Select your inbox and go to SMTP Settings
4. Copy the credentials:
   - Username → `EMAIL_HOST_USER`
   - Password → `EMAIL_HOST_PASSWORD`
5. Update your `.env` file with these credentials

### 4. Set Up Geoapify API Key

1. Go to [Geoapify](https://www.geoapify.com/get-started-with-maps-api/)
2. Sign up for a free account
3. Create a new API key
4. Copy the API key and add it to your `.env` file as `GEOAPIFY_API_KEY`

### 5. Install Dependencies

```bash
uv sync
```

### 6. Run Database Migrations

```bash
uv run python manage.py migrate
```

### 7. Start the Development Server

```bash
uv run python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Common Backend Commands

```bash
# Run any Django management command
uv run python manage.py <command>

# Create a superuser for admin access
uv run python manage.py createsuperuser

# Add a new dependency
uv add <package>

# Update dependencies
uv sync

# Run tests
uv run python manage.py test
```

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Create Environment File

Create a `.env` file in the `frontend/` directory with the following variable:

```bash
NEXT_PUBLIC_DJANGO_API_BASE=http://localhost:8000/api
```

**Note:** The `/api` path is required as the Django app is mounted at this endpoint.

### 3. Install Dependencies

```bash
bun install
```

### 4. Start the Development Server

```bash
bun run dev
```

The frontend application will be available at `http://localhost:3000`

### Common Frontend Commands

```bash
# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run Storybook (component library)
bun run storybook

# Run tests
bun test

# Run tests (single run)
bun run test:run

# Lint code
bun run lint

# Format code
bun run format
```

## Running the Full Application

To run the complete application, you need both servers running simultaneously:

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   uv run python manage.py runserver
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   bun run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Troubleshooting

### Backend Issues

**Problem:** `uv: command not found`
- **Solution:** Install uv using the installation command in Prerequisites

**Problem:** Database migration errors
- **Solution:** Delete `db.sqlite3` and run migrations again:
  ```bash
  rm db.sqlite3
  uv run python manage.py migrate
  ```

**Problem:** Email not sending
- **Solution:** Verify your Mailtrap credentials in the `.env` file

### Frontend Issues

**Problem:** API connection errors
- **Solution:** Ensure the backend is running and `NEXT_PUBLIC_DJANGO_API_BASE` is correctly set in `.env`

**Problem:** Module not found errors
- **Solution:** Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  bun install
  ```

**Problem:** Port already in use
- **Solution:** Kill the process using the port or change the port:
  ```bash
  # Kill process on port 3000
  lsof -ti:3000 | xargs kill -9
  
  # Or run on different port
  PORT=3001 bun run dev
  ```

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `FRONTEND_EMAIL_VERIFICATION_PATH_NAME` | Email verification route | `verify-email` |
| `FRONTEND_PASSWORD_RESET_PATH_NAME` | Password reset route | `reset-password` |
| `EMAIL_HOST_USER` | Mailtrap username | `573d8391380848` |
| `EMAIL_HOST_PASSWORD` | Mailtrap password | `98b6a23274c2be` |
| `EMAIL_PORT` | SMTP port | `2525` |
| `DEFAULT_FROM_EMAIL` | Sender email address | `joyroute.support@gmail.com` |
| `GEOAPIFY_API_KEY` | Geoapify API key for geocoding | `your_api_key_here` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_DJANGO_API_BASE` | Backend API base URL | `http://localhost:8000/api` |

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [uv Documentation](https://github.com/astral-sh/uv)
- [Mailtrap Documentation](https://mailtrap.io/docs/)
- [Geoapify Documentation](https://www.geoapify.com/docs/)

## Need Help?

If you encounter any issues not covered in this guide, please:
1. Check the project's GitHub Issues
2. Reach out to the team on your communication channel
3. Review the backend and frontend README files for additional details
