# Configuration

This document will show you how to configure the application, including a full in-depth explanation of the environment variables (which is used to configure the app)

## Setting up

If you haven't already, create a .env for each folder using the provided script:

```bash
.\scripts\create-env.ps1 # Windows
# OR
./scripts/create-env.sh # Linux
```

This scripts creates a .env skeleton to be filled out for the frontend and backend.
## Frontend Environment Variables

Since React is built with Vite, all .env variables must be prefixed with VITE
### Configuration

VITE_ENVIRONMENT=                    # Development, production or testing

### Server

VITE_FRONTEND_URL=                   # Client URL
VITE_BACKEND_URL=                    # Backend URL

### OAuth

VITE_MSAL_CLIENT_ID=                 # MS CLient ID
VITE_MSAL_AUTHORITY=                 # MS Authority, use commons
VITE_MSAL_REDIRECT_URI=              # MS Callback
VITE_GOOGLE_CLIENT_ID=               # Google Client ID

## Backend Environment Variables

### Configuration
- ENVIRONMENT=              # production, development or test, defauls to development

### Database & Cache
- DATABASE_URL=             # Connection string for your database
- REDIS_URL=                # Redis connection string
- MONGO_URL=                # Mongo connection string

### Authentication
- JWT_SECRET_ACCESS=        # Primary JWT secret key for Access Tokens
- JWT_SECRET_REFRESH=       # Secondary JWT secret key for Refresh Tokens
- JWT_SECRET_VERIFY=        # Tertiary JWT secret key for Verify Tokens

### CORS
- CORS_WHITELIST=           # Comma-separated list of allowed origins

### OAuth
- GOOGLE_CLIENT_ID=         # Google OAuth client ID
- MS_TENANT_ID=             # Microsoft tenant ID
- MS_CLIENT_ID=             # Microsoft OAuth client ID

Acquire Google OAuth permissions by registering the app at [Google Cloud Console](https://cloud.google.com/cloud-console)

Acquire Microsoft OAuth Permissions by registering the app at [Azure Entra ID](https://www.microsoft.com/en-ca/security/business/identity-access/microsoft-entra-id)

### Email (SMTP)
- EMAIL_USER=               # Email address used to send mails
- EMAIL_PASS=               # App password or SMTP password

To enable verification via email and verify tokens, ensure that Email .env variables are set.
To enable OAuth for Google and Microsoft, ensure that Google and/or Microsoft variables are set.
