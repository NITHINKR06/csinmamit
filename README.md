<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
<img src="https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel&logoColor=white" />

# CSI NMAMIT — Official Website

**The official web platform for the Computer Society of India, NMAMIT Student Branch.**  
Built with React 18 + Vite, powered by Firebase, and deployed on Vercel.

[Live Site](#) · [Report a Bug](https://github.com/NITHINKR06/csinmamit/issues) · [Request a Feature](https://github.com/NITHINKR06/csinmamit/issues)

</div>

---

## Overview

CSI NMAMIT v2.0 is a full-stack web application designed to serve the members of the Computer Society of India at NMAM Institute of Technology. It handles everything from event discovery and member registration to payments, admin management, and profile tracking — all in one place.

---

## Features

### For Members
- **Google Sign-In** — One-click authentication via Firebase OAuth
- **Profile Dashboard** — Manage academic info, contact details, and membership status
- **Event Browser** — Search and filter events by year, type, and category; register directly
- **Membership Registration** — Sign up for annual/semester plans with integrated Razorpay payments
- **Certificate Download** — Get your membership certificate after payment confirmation

### For Admins
- **Admin Dashboard** — Overview of users, events, members, and payments
- **User Management** — View, edit, delete users; assign roles
- **Event Management** — Create, update, and publish events with full CRUD
- **Payment Tracking** — Transaction history, revenue analytics, and webhook-verified status
- **Core Member Management** — Manage team profiles and role assignments

### UI & Design
- Glassmorphism components with backdrop blur
- Dark / Light mode with system preference detection
- Framer Motion animations and 3D card tilt effects
- Responsive, mobile-first layout
- Particle background animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Animations | Framer Motion, GSAP |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Firebase Firestore (real-time) |
| Storage | Firebase Storage |
| Payments | Razorpay (frontend + webhook backend) |
| Email | EmailJS |
| Backend | Node.js (webhook verification server) |
| Deployment | Vercel |

---

## Project Structure

```
csinmamit/
├── src/
│   ├── components/       # Reusable UI components (Navbar, Footer, Cards, etc.)
│   ├── pages/
│   │   ├── Admin/        # Admin dashboard, users, events, payments, members
│   │   └── ...           # Home, Events, Team, Recruit, Profile pages
│   ├── contexts/         # React Context: AuthContext, AdminAuthContext
│   ├── hooks/            # Custom hooks: useEvents, useProfile, useRecruit, etc.
│   ├── services/         # Firebase service layer: eventService, paymentService, emailService
│   ├── config/           # Firebase, EmailJS, Cloudinary config
│   └── utils/            # Security helpers, validation, diagnostics
├── backend/              # Node.js server for Razorpay webhook handling
├── public/               # Static assets
├── scripts/              # Data export scripts (core members, student team)
├── firestore.rules       # Firestore security rules
├── vercel.json           # Vercel deployment config
└── .env.example          # Environment variable template
```

---

## Getting Started

### Prerequisites

- Node.js v16 or higher
- A [Firebase](https://console.firebase.google.com/) project with Auth, Firestore, and Storage enabled
- A [Razorpay](https://razorpay.com/) account for payment integration

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/NITHINKR06/csinmamit.git
cd csinmamit

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Firebase and Razorpay credentials (see below)

# 4. Start the dev server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Razorpay
VITE_RAZORPAY_KEY_ID=
VITE_RAZORPAY_KEY_SECRET=

# Backend
VITE_API_URL=http://localhost:3000
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run export:core-members     # Export core member data
npm run export:student-team     # Export student team data
```

---

## Razorpay Webhook Setup

The backend verifies payment events via Razorpay webhooks to automatically activate memberships.

1. Start the backend server in `/backend`
2. In the [Razorpay Dashboard](https://dashboard.razorpay.com/), go to **Settings → Webhooks → Add New Webhook**
3. Set the Webhook URL:
   - Local: use [ngrok](https://ngrok.com/) — `https://<your-ngrok-id>.ngrok-free.app/webhook`
   - Production: `https://your-backend-domain.com/webhook`
4. Set the **Secret** to match `WEBHOOK_SECRET` in `backend/.env`
5. Enable the `payment.captured` event
6. Save

> The `WEBHOOK_SECRET` in your backend `.env` must exactly match what you enter in the Razorpay dashboard.

---

## Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home — hero, about, features, highlights, testimonials |
| `/events` | Public | Event browser with search and filters |
| `/team` | Public | Faculty and student core team |
| `/recruit` | Public | Membership registration + payment |
| `/profile` | Authenticated | User dashboard and profile editor |
| `/core-profile` | Core Members | Enhanced profile with extra permissions |
| `/admin` | Admin | Dashboard with stats and quick actions |
| `/admin/users` | Admin | User management |
| `/admin/events` | Admin | Event CRUD |
| `/admin/members` | Admin | Core member management |
| `/admin/payments` | Admin | Payment history and analytics |

---

## Role-Based Access

| Role | Access |
|---|---|
| Guest | Public pages only |
| Member | Public pages + Profile |
| Core Member | Member access + Core Profile |
| Admin | Full access including Admin Dashboard |

Role detection is automatic based on email domain and Firestore records.

---

## Security

- Firebase Auth with Google OAuth
- Firestore security rules enforced at the database level
- Rate limiting on payment attempts
- Input validation and XSS sanitization on all forms
- Environment variables for all sensitive credentials
- Razorpay payment verification via HMAC signature on the backend

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please keep PRs focused and include a clear description of what changed and why.

---

## Roadmap

- [ ] PWA support with offline access
- [ ] Push notifications for event reminders
- [ ] Blog / news section
- [ ] Member forum
- [ ] Project showcase / portfolio gallery
- [ ] Alumni network
- [ ] Job board

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Built with ❤️ by the <strong>CSI NMAMIT Tech Team</strong>
</div>
