# EngagementBot Dashboard

A Next.js frontend dashboard for monitoring EngagementBot analytics, managing coupons, and viewing active groups.

## Features

- **Owner Analytics**: View total revenue, game fees, and subscription income
- **Active Groups**: Monitor all groups with accumulated fees
- **Coupon Management**: Generate, view, and expire subscription coupons
- **Secure Authentication**: Password-protected dashboard access
- **Real-time Data**: Live statistics and analytics

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables in backend:
```bash
ADMIN_DASHBOARD_PASSWORD=your_secure_password_here
```

3. Start development server:
```bash
npm run dev
```

The dashboard will be available at http://localhost:3001

## Production

1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

## Authentication

Default password is `admin123` (set via `ADMIN_DASHBOARD_PASSWORD` environment variable)

## API Integration

The frontend communicates with the EngagementBot backend API running on port 3000:

- `/api/auth/login` - Authentication
- `/api/analytics/owner` - Owner revenue analytics
- `/api/groups/active` - Active groups with fees
- `/api/coupons` - Coupon management