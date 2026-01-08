# AI Estimator - Moving Cost Estimation Platform

A production-grade system consisting of two frontends and a shared backend.

## System Structure
- `/backend`: Node.js Express API (Shared logic, DB, Auth)
- `/user`: Customer assessment website (Vite / React)
- `/crm`: Internal management platform (Vite / React)

## Setup & Running

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
- API will be on `http://localhost:5000`
- Initial Admin: `admin@aiestimator.com` / `admin123`

### 2. User Application
```bash
cd user
npm install
npm run dev
```
- Standard landing and assessment flow for customers.

### 3. CRM Application
```bash
cd crm
npm install
npm run dev
```
- Dashboards for Admin and Sales roles.

## Core Features
- **AI-Driven Assessment**: Customers upload media; system generates initial estimates.
- **Strict Status Pipeline**: NEW -> ASSIGNED -> CONTACTED -> PROPOSAL_SENT -> BOOKED -> HANDOVER -> COMPLETED.
- **Audit Logging**: Every single action (price change, assignment, status update) is logged with who, what, and when.
- **RBAC**: Admin can manage team and assign leads; Sales handles their own leads.
- **Dual Perspective**: AI price suggestion vs Manual sales override.
