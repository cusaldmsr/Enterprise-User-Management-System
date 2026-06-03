# Enterprise User Management System (EUMS)

A full-stack Enterprise User Management System for managing authenticated users, roles, permissions, profile images, document uploads, dashboard analytics, audit logs, and notifications.

This repository is organized as a JavaScript/TypeScript monorepo with an Express + MongoDB backend and a React + Vite frontend.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Database Seeding](#database-seeding)
- [Default Login](#default-login)
- [Available Scripts](#available-scripts)
- [Backend API Reference](#backend-api-reference)
- [Authentication and Authorization](#authentication-and-authorization)
- [Roles and Permissions](#roles-and-permissions)
- [File Uploads](#file-uploads)
- [Frontend Routes](#frontend-routes)
- [Data Models](#data-models)
- [Sample Data](#sample-data)
- [Build and Production Usage](#build-and-production-usage)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

## Overview

EUMS provides an admin-focused interface for enterprise user administration. Administrators and authorized staff can create, update, search, filter, and delete users; assign users to roles; upload profile images and documents; view dashboard analytics; inspect audit logs; and manage in-app notifications.

The backend exposes REST APIs secured with JWT access tokens and refresh-token cookies. The frontend consumes those APIs through Axios, stores authentication state with Zustand, and renders a modern dashboard UI using React, Vite, Tailwind CSS, Radix UI components, and TanStack Query.

## Features

### User Management

- Create users with first name, last name, email, password, role, and active status.
- View paginated user lists.
- Search users by first name, last name, or email.
- Filter users by role and active/inactive status.
- Update user details, role, active status, and password.
- Delete users, with protection against deleting the current authenticated account.
- Automatically send welcome, password-change, and account-deletion email notifications when configured.

### Authentication

- Email/password login.
- JWT access token authentication.
- HTTP-only refresh token cookie.
- Access-token refresh flow.
- Logout with refresh token invalidation.
- Authenticated `/auth/me` endpoint for current-user data.

### Role-Based Access Control

- Permission-aware API protection.
- Seeded roles: `ADMIN`, `MANAGER`, and `USER`.
- Seeded permissions for user viewing, creation, editing, deletion, file uploads, dashboard access, and search.

### Dashboard and Auditing

- Dashboard analytics for total users, role counts, active accounts, inactive accounts, and recent activity.
- Audit logs for login, logout, user creation, user editing, user deletion, password resets, profile uploads, and document uploads.
- Captures user, action, details, IP address, user agent, and timestamp.

### Notifications

- In-app notifications per user.
- Paginated notification retrieval.
- Unread notification count.
- Mark individual notifications as read.
- Mark all notifications as read.
- Delete notifications.

### Uploads and Documents

- Profile image uploads to Cloudinary.
- Document uploads to AWS S3.
- Supported profile image formats: JPEG, JPG, PNG, and WebP.
- Supported document upload formats: JPEG, JPG, PNG, WebP, PDF, and DOCX.
- Profile image upload limit: 5 MB.
- Document upload limit: 20 MB.
- Document metadata stored in MongoDB.

### Frontend Experience

- Protected application layout.
- Login page.
- Dashboard page.
- Users page.
- Uploads page.
- Documents page.
- Light/dark theme support persisted in local storage.
- React Query data fetching and cache management.
- Axios interceptor for bearer tokens and automatic refresh handling.

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT (`jsonwebtoken`)
- bcryptjs
- Multer
- Cloudinary
- AWS SDK for S3
- Nodemailer
- Zod
- Cookie Parser
- CORS

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Axios
- Tailwind CSS
- Radix UI
- Lucide React
- Recharts
- Sonner
- React Hook Form
- Zod

## Repository Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/              # Database, Cloudinary, and S3 configuration
│   │   ├── controllers/         # Request handlers for auth, users, uploads, notifications
│   │   ├── middleware/          # Authentication, RBAC, and upload middleware
│   │   ├── models/              # Mongoose models
│   │   ├── routes/              # Express route definitions
│   │   ├── services/            # Audit and email services
│   │   ├── utils/               # Seed script
│   │   └── server.ts            # Express app entry point
│   ├── .env.example             # Backend environment variable template
│   ├── package.json             # Backend scripts and dependencies
│   └── tsconfig.json            # Backend TypeScript config
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Layout, UI, and user components
│   │   ├── contexts/            # Toast context
│   │   ├── hooks/               # API hooks
│   │   ├── lib/                 # Axios, query client, and utilities
│   │   ├── pages/               # Login, dashboard, users, uploads, documents
│   │   ├── services/            # Frontend API client wrappers
│   │   ├── store/               # Zustand auth and theme stores
│   │   ├── types/               # Shared frontend TypeScript types
│   │   ├── App.tsx              # Frontend route tree
│   │   └── main.tsx             # React entry point
│   ├── package.json             # Frontend scripts and dependencies
│   └── vite.config.ts           # Vite config and dev proxy
├── sample-data/                 # Example JSON data files
├── package.json                 # Root monorepo helper scripts
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js 20 or newer recommended.
- npm.
- MongoDB connection string, either local MongoDB or MongoDB Atlas.
- Cloudinary account for profile image uploads.
- AWS account and S3 bucket for document uploads.
- SMTP credentials for outbound email notifications.

## Environment Variables

The backend reads environment variables from `backend/.env`. Start by copying the example file:

```bash
cd backend
cp .env.example .env
```

On Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Update `backend/.env` with your own values:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/eums

JWT_ACCESS_SECRET=replace_with_a_strong_access_secret
JWT_REFRESH_SECRET=replace_with_a_strong_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="EUMS System <noreply@example.com>"

FRONTEND_URL=http://localhost:5173
```

The frontend API base URL is controlled by `VITE_API_URL`. If it is not set, the frontend defaults to `http://localhost:5000`.

Create `frontend/.env` only if you need to override the default:

```env
VITE_API_URL=http://localhost:5000
```

## Installation

From the repository root, install both backend and frontend dependencies:

```bash
npm run install:all
```

Or install each workspace manually:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Running the Application

Run the backend and frontend in separate terminals.

### Terminal 1: Backend

```bash
npm run dev:backend
```

The backend starts on:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/health
```

### Terminal 2: Frontend

```bash
npm run dev:frontend
```

The frontend starts on:

```text
http://localhost:5173
```

The Vite dev server proxies `/auth` and `/api` requests to `http://localhost:5000`.

## Database Seeding

Seed the database with permissions, roles, an admin user, and sample users:

```bash
npm run seed
```

The seed script performs the following actions:

1. Connects to MongoDB using `MONGODB_URI`.
2. Clears existing permissions, roles, and users.
3. Creates default permissions.
4. Creates `ADMIN`, `MANAGER`, and `USER` roles.
5. Creates the default admin account.
6. Attempts to fetch sample users from DummyJSON.
7. Falls back to local sample users if the external request fails.

> Warning: seeding deletes existing users, roles, and permissions before inserting fresh records.

## Default Login

After seeding, use this account to sign in:

```text
Email:    admin@eums.dev
Password: Admin@1234
```

Sample users created by the seed script use this password:

```text
Pass@1234
```

## Available Scripts

### Root Scripts

Run these from the repository root.

| Script | Description |
| --- | --- |
| `npm run install:all` | Installs backend and frontend dependencies. |
| `npm run dev:backend` | Starts the backend dev server. |
| `npm run dev:frontend` | Starts the frontend dev server. |
| `npm run seed` | Runs the backend seed script. |

### Backend Scripts

Run these from `backend/`.

| Script | Description |
| --- | --- |
| `npm run dev` | Starts Express with `ts-node-dev`. |
| `npm run build` | Compiles TypeScript into `dist/`. |
| `npm start` | Runs the compiled backend from `dist/server.js`. |
| `npm run seed` | Seeds MongoDB with default data. |

### Frontend Scripts

Run these from `frontend/`.

| Script | Description |
| --- | --- |
| `npm run dev` | Starts Vite dev server. |
| `npm run build` | Type-checks and builds the frontend. |
| `npm run lint` | Runs ESLint. |
| `npm run preview` | Previews the production build locally. |

## Backend API Reference

Base URL in local development:

```text
http://localhost:5000
```

Most protected routes require this header:

```http
Authorization: Bearer <accessToken>
```

Refresh tokens are stored in an HTTP-only cookie named `refreshToken`.

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Returns API status and timestamp. |

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | No | Logs in with email and password. |
| `POST` | `/auth/refresh` | Cookie | Issues a new access token from the refresh cookie. |
| `POST` | `/auth/logout` | Yes | Clears the refresh token and logs out. |
| `GET` | `/auth/me` | Yes | Returns the authenticated user. |

#### Login Request

```json
{
  "email": "admin@eums.dev",
  "password": "Admin@1234"
}
```

#### Login Response Shape

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {},
    "accessToken": "jwt_access_token"
  }
}
```

### Users

All user endpoints require authentication. Permission requirements are listed below.

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users` | `VIEW_USERS` | Lists users with pagination, search, and filters. |
| `GET` | `/api/users/:id` | `VIEW_USERS` | Gets a single user by ID. |
| `POST` | `/api/users` | `CREATE_USER` | Creates a new user. |
| `PUT` | `/api/users/:id` | `EDIT_USER` | Updates an existing user. |
| `DELETE` | `/api/users/:id` | `DELETE_USER` | Deletes a user. |
| `GET` | `/api/users/roles` | Authenticated | Lists roles and permissions. |
| `GET` | `/api/users/analytics/dashboard` | `VIEW_DASHBOARD` | Returns dashboard analytics. |
| `GET` | `/api/users/audit-logs` | `VIEW_DASHBOARD` | Returns paginated audit logs. |

#### User List Query Parameters

| Parameter | Description | Example |
| --- | --- | --- |
| `page` | Page number. | `1` |
| `limit` | Records per page, max 100. | `10` |
| `search` | Searches first name, last name, and email. | `john` |
| `role` | Filters by role name. | `ADMIN` |
| `isActive` | Filters active state. | `true` |

Example:

```text
GET /api/users?page=1&limit=10&search=john&role=ADMIN&isActive=true
```

#### Create User Request

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "password": "StrongPass123",
  "roleId": "mongo_role_id",
  "isActive": true
}
```

#### Update User Request

```json
{
  "firstName": "Jane",
  "lastName": "Manager",
  "email": "jane.manager@example.com",
  "roleId": "mongo_role_id",
  "isActive": true,
  "password": "OptionalNewPassword123"
}
```

### Uploads

All upload endpoints require authentication.

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| `POST` | `/api/upload/profile` | `UPLOAD_FILES` | Uploads the current user's profile image to Cloudinary. |
| `POST` | `/api/upload/profile/:userId` | `UPLOAD_FILES` | Uploads a profile image for a specific user. |
| `POST` | `/api/upload/document` | `UPLOAD_FILES` | Uploads a document to AWS S3. |
| `GET` | `/api/upload/documents` | `VIEW_USERS` | Lists documents visible to the authenticated user. |

#### Profile Image Upload

- Form field name: `profileImage`
- Max size: 5 MB
- Accepted MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

Example with cURL:

```bash
curl -X POST http://localhost:5000/api/upload/profile \
  -H "Authorization: Bearer <accessToken>" \
  -F "profileImage=@avatar.png"
```

#### Document Upload

- Form field name: `document`
- Max size: 20 MB
- Accepted MIME types: JPEG, JPG, PNG, WebP, PDF, DOCX

Example with cURL:

```bash
curl -X POST http://localhost:5000/api/upload/document \
  -H "Authorization: Bearer <accessToken>" \
  -F "document=@policy.pdf"
```

### Notifications

All notification endpoints require authentication.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/notifications` | Lists notifications for the authenticated user. |
| `PATCH` | `/api/notifications/:id/read` | Marks one notification as read. |
| `PATCH` | `/api/notifications/read-all` | Marks all notifications as read. |
| `DELETE` | `/api/notifications/:id` | Deletes a notification. |

#### Notification Query Parameters

| Parameter | Description | Default |
| --- | --- | --- |
| `page` | Page number. | `1` |
| `limit` | Records per page, max 50. | `10` |

## Authentication and Authorization

The application uses a two-token authentication model:

1. The user logs in with email and password.
2. The backend returns an access token in the response body.
3. The backend sets a `refreshToken` HTTP-only cookie.
4. The frontend stores the access token and attaches it as a bearer token.
5. If the API returns `401`, the Axios interceptor calls `/auth/refresh`.
6. If refresh succeeds, the original request is retried.
7. If refresh fails, the frontend clears local auth state and redirects to `/login`.

Authorization is enforced on the backend using permission middleware. Routes declare required permissions such as `VIEW_USERS`, `CREATE_USER`, or `UPLOAD_FILES`.

## Roles and Permissions

The seed script creates these permissions:

| Permission | Description |
| --- | --- |
| `VIEW_USERS` | View users list and profiles. |
| `CREATE_USER` | Create new user accounts. |
| `EDIT_USER` | Edit existing user accounts. |
| `DELETE_USER` | Delete user accounts. |
| `UPLOAD_FILES` | Upload profile images and documents. |
| `VIEW_DASHBOARD` | Access dashboard analytics and audit logs. |
| `SEARCH_USERS` | Search and filter users. |

The seed script maps permissions to roles as follows:

| Role | Permissions |
| --- | --- |
| `ADMIN` | `VIEW_USERS`, `CREATE_USER`, `EDIT_USER`, `DELETE_USER`, `UPLOAD_FILES`, `VIEW_DASHBOARD`, `SEARCH_USERS` |
| `MANAGER` | `VIEW_USERS`, `EDIT_USER`, `UPLOAD_FILES`, `SEARCH_USERS` |
| `USER` | `VIEW_USERS`, `SEARCH_USERS` |

## File Uploads

### Profile Images

Profile images are uploaded through Multer memory storage and streamed to Cloudinary. Cloudinary stores images in the `eums/profiles` folder and applies a profile-oriented transformation.

After upload, the backend updates the selected user's `profileImage` field with the Cloudinary secure URL.

### Documents

Documents are uploaded through Multer memory storage and written to S3 under keys like:

```text
eums/documents/<uuid>.<extension>
```

The backend stores document metadata in MongoDB, including original filename, S3 file URL, file key, file type, size, uploader, and timestamps.

Document visibility depends on role:

- `ADMIN` users can see all documents.
- Non-admin users see only their own uploaded documents.

## Frontend Routes

| Route | Description |
| --- | --- |
| `/login` | Login screen. |
| `/dashboard` | Analytics and recent activity dashboard. |
| `/users` | User management screen. |
| `/uploads` | Upload interface. |
| `/documents` | Uploaded documents list. |
| `/` | Redirects to `/dashboard`. |
| `*` | Redirects to `/dashboard`. |

## Data Models

### User

Main fields:

- `firstName`
- `lastName`
- `email`
- `password` hashed with bcrypt
- `role` reference
- `profileImage`
- `isActive`
- `refreshToken`
- `createdAt`
- `updatedAt`
- `fullName` virtual

### Role

Main fields:

- `name`
- `permissions`
- `createdAt`
- `updatedAt`

### Permission

Main fields:

- `name`
- `description`
- `createdAt`
- `updatedAt`

### AuditLog

Main fields:

- `userId`
- `action`
- `details`
- `ipAddress`
- `userAgent`
- `timestamp`

Supported actions:

- `LOGIN`
- `LOGOUT`
- `CREATE_USER`
- `EDIT_USER`
- `DELETE_USER`
- `PASSWORD_RESET`
- `UPLOAD_PROFILE`
- `UPLOAD_DOCUMENT`

### Notification

Main fields:

- `userId`
- `title`
- `message`
- `isRead`
- `createdAt`
- `updatedAt`

### Document

Main fields:

- `fileName`
- `originalName`
- `fileUrl`
- `fileKey`
- `fileType`
- `fileSize`
- `uploadedBy`
- `createdAt`
- `updatedAt`

## Sample Data

The `sample-data/` directory contains JSON files that can be used as reference data for development or testing:

- `sample-data/users.json`
- `sample-data/roles.json`
- `sample-data/permissions.json`
- `sample-data/notifications.json`

The active seed implementation lives in `backend/src/utils/seed.ts` and inserts data directly into MongoDB.

## Build and Production Usage

### Backend Build

```bash
cd backend
npm run build
npm start
```

The compiled backend runs from `backend/dist/server.js`.

### Frontend Build

```bash
cd frontend
npm run build
npm run preview
```

The production frontend build is generated in `frontend/dist/`.

### Production Checklist

Before deploying, update the following:

- Set `NODE_ENV=production`.
- Use strong, unique JWT secrets.
- Use a production MongoDB connection string.
- Configure production Cloudinary credentials.
- Configure production AWS S3 credentials and bucket permissions.
- Configure production SMTP credentials.
- Set `FRONTEND_URL` to the deployed frontend URL.
- Set `VITE_API_URL` to the deployed backend API URL if needed.
- Use HTTPS so secure cookies work correctly in production.
- Do not commit real `.env` files or secrets.

## Troubleshooting

### Backend cannot connect to MongoDB

- Confirm `MONGODB_URI` is correct.
- Check network access to MongoDB Atlas if using a hosted cluster.
- Make sure your IP address is allowed in MongoDB Atlas Network Access.
- Ensure the database user has the correct username, password, and permissions.

### Login fails after seeding

- Confirm the seed command completed successfully.
- Confirm you are using `admin@eums.dev` and `Admin@1234`.
- Make sure the frontend is calling the correct backend URL.
- Check browser devtools for failed `/auth/login` or `/auth/refresh` requests.

### Frontend cannot reach backend

- Confirm the backend is running on `http://localhost:5000`.
- Confirm the frontend is running on `http://localhost:5173`.
- If using a custom API URL, check `frontend/.env` and `VITE_API_URL`.
- If using Vite proxy, use `/auth` and `/api` paths from the frontend.

### Uploads fail

- Confirm Cloudinary variables are set for profile images.
- Confirm AWS S3 variables are set for document uploads.
- Check file type and file size limits.
- Make sure the authenticated user has `UPLOAD_FILES` permission.

### Emails are not sent

- Confirm SMTP settings are valid.
- For Gmail, use an app password instead of a normal account password.
- Check backend logs for Nodemailer warnings or send failures.
- Email failures are logged but do not intentionally break API responses.

## Security Notes

- Never commit real credentials, access keys, SMTP passwords, or JWT secrets.
- Rotate any credentials that may have been shared or committed accidentally.
- Use strong JWT secrets in every non-local environment.
- Keep refresh tokens HTTP-only.
- Use HTTPS in production.
- Restrict CORS to trusted frontend origins.
- Apply least-privilege permissions to AWS credentials and S3 buckets.
- Review seeded demo credentials before deploying.
- Consider adding request validation, rate limiting, centralized logging, and automated tests before production use.
