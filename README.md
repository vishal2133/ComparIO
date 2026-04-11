# ComparIO 🛒

> **India's Smartest Phone & Laptop Price Comparison Platform**

ComparIO helps Indian consumers find the best deals across Amazon and Flipkart — powered by real-time price scraping, an AI shopping assistant, fake review detection, and a personalized tech chatbot.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 📸 Screenshots

> Homepage · Product Page · AI Assistant · Dashboard

*(Add screenshots here after deployment)*

---

## ✨ Features

### 🔍 Price Comparison
- Side-by-side price comparison across **Amazon** and **Flipkart**
- Best deal badge with savings calculation
- Real-time price updates via automated scraping (once daily)
- Price history tracking with visual sparkline charts

### 🤖 AI Shopping Assistant
- **10-question smart quiz** that matches users to their perfect phone or laptop
- Two-stage system: core questions → optional deep refinement
- Powered by **Groq (Llama 3.1)** — free and instant
- Personalized "Why this is for YOU" summaries per product
- Answers saved to localStorage — resume where you left off

### 🛡️ Review Shield
- Scrapes up to 100 reviews per product from Amazon/Flipkart
- Detects fake review patterns: repeated phrases, date clustering, unverified buyers, generic language
- **Trust Score (0–100)** with color-coded verdict
- AI-generated honest verdict in plain English
- Results cached for 24 hours to save API quota

### 💬 Smarty — AI Tech Chatbot
- Floating chatbot available on every page
- Explains tech specs in simple Indian-context analogies
- Quick-start suggestion chips for common questions
- Context-aware: knows which product page you're viewing
- Proactive toast notification after 15 seconds
- Powered by Groq API — stays strictly on tech topics

### 👤 User Dashboard
- **My Profile** — edit name, phone, bio, change password
- **My Alerts** — set price drop alerts per product/platform, earn Winner Coins
- **Warranty Tracker** — track purchase dates, warranty periods, get expiry warnings
- **Winner Coins** gamification — earn coins for setting alerts, tracking warranty
- Level system: Bronze → Silver → Gold → Platinum

### 🌙 Dark / Light Mode
- Full theme switching with CSS variables
- Persists across sessions via localStorage
- Smooth transitions on all elements

### 📊 Additional Features
- Separate `/phones` and `/laptops` browse pages with category-specific filters
- Side-by-side spec comparison tool (`/compare`)
- One-time spec scraping from Smartprix — stored permanently in MongoDB
- Contact page with animated form
- About page with company timeline
- Floating Action Button (FAB) for quick navigation
- Custom cursor effect, entrance reveal animations, skeleton loaders
- Toast notification system
- Mobile-responsive across all pages

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, Tailwind CSS, React Context |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI — Recommendations** | Groq API (Llama 3.1-8b-instant) |
| **AI — Chatbot** | Groq API (Llama 3.1-8b-instant) |
| **Scraping** | ScraperAPI + Cheerio |
| **Scheduling** | node-cron |
| **Auth** | JWT + bcryptjs |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 🗂️ Project Structure

```
compario/
├── frontend/                    # Next.js 16 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js          # Homepage with bento grid
│   │   │   ├── phones/          # Phones browse page
│   │   │   ├── laptops/         # Laptops browse page
│   │   │   ├── product/[slug]/  # Product detail page
│   │   │   ├── compare/         # Side-by-side comparison
│   │   │   ├── assistant/       # AI shopping assistant quiz
│   │   │   ├── dashboard/       # User dashboard
│   │   │   │   ├── profile/     # My profile
│   │   │   │   ├── alerts/      # Price alerts
│   │   │   │   └── warranty/    # Warranty tracker
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Register page
│   │   │   ├── contact/         # Contact page
│   │   │   └── about/           # About page
│   │   ├── components/
│   │   │   ├── Navbar.js        # Sticky nav with live search
│   │   │   ├── Smarty.js        # AI chatbot widget
│   │   │   ├── ReviewShield.js  # Fake review detector
│   │   │   ├── PersonalizedSummary.js  # AI product summary
│   │   │   ├── PriceHistoryChart.js    # Price trend chart
│   │   │   ├── PriceAlertForm.js       # Alert form
│   │   │   ├── ThemeToggle.js   # Dark/light switcher
│   │   │   ├── FAB.js           # Floating action button
│   │   │   └── Toast.js         # Toast notifications
│   │   ├── context/
│   │   │   ├── AuthContext.js   # JWT auth state
│   │   │   └── ThemeContext.js  # Theme state
│   │   └── hooks/
│   │       └── useAnimations.js # Reusable animation hooks
│   └── public/
│       ├── phones/              # Phone product images
│       └── laptops/             # Laptop product images
│
└── backend/                     # Express.js API
    └── src/
        ├── models/
        │   ├── Product.js       # Products + full specs schema
        │   ├── User.js          # User + alerts + coins
        │   ├── PriceHistory.js  # Price change log
        │   └── WarrantyItem.js  # Warranty tracker entries
        ├── controllers/
        │   ├── authController.js
        │   ├── productController.js
        │   ├── recommendController.js
        │   ├── reviewController.js
        │   ├── specsController.js
        │   └── summaryController.js
        ├── routes/
        │   ├── auth.js
        │   ├── products.js
        │   ├── recommend.js
        │   ├── reviews.js
        │   ├── specs.js
        │   ├── summary.js
        │   ├── history.js
        │   ├── user.js
        │   ├── admin.js
        │   └── chat.js
        ├── scrapers/
        │   ├── amazon.js        # Amazon price scraper
        │   ├── flipkart.js      # Flipkart price scraper
        │   ├── smartprix.js     # Smartprix spec scraper
        │   ├── reviews.js       # Review scraper
        │   └── index.js         # Parallel batch scraper
        ├── middleware/
        │   └── auth.js          # JWT protect middleware
        ├── config/
        │   └── db.js            # MongoDB connection
        └── index.js             # Express app + cron jobs
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier)
- ScraperAPI account (free tier — 5,000 requests/month)
- Groq API key (free)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/compario.git
cd compario
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/compario?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_random_secret_key_here
SCRAPERAPI_KEY=your_scraperapi_key
GROQ_API_KEY=your_groq_api_key
```

Seed the database with 23 phones and 11 laptops:

```bash
node src/seed.js
```

Start the backend:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas connection string | ✅ |
| `PORT` | Backend port (default 5000) | ✅ |
| `JWT_SECRET` | Random secret for JWT signing | ✅ |
| `SCRAPERAPI_KEY` | ScraperAPI key for price scraping | ✅ |
| `GROQ_API_KEY` | Groq API key for AI features | ✅ |

### Frontend (`frontend/.env.local`)

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ |

---

## 📡 API Endpoints

### Products
```
GET    /api/products              List all products (supports ?category=phone&featured=true)
GET    /api/products/search?q=    Search products by name or brand
GET    /api/products/:slug        Get single product by slug
```

### Price & Recommendations
```
POST   /api/recommend             AI product recommendation (takes budget, priorities, usage)
POST   /api/summary               AI personalized product summary
GET    /api/history/:slug         Price history for a product
POST   /api/history/alert         Save a price alert (guest)
```

### Specs & Comparison
```
POST   /api/specs/scrape          Scrape + store Smartprix specs for a product (once)
POST   /api/specs/scrape-all      Scrape specs for all products missing them
GET    /api/specs/:slug           Get full specs for a product
GET    /api/specs/compare/two     Compare two products (?slug1=&slug2=)
```

### Review Analysis
```
POST   /api/reviews/analyse       Scrape + analyse reviews for a product
```

### Authentication
```
POST   /api/auth/register         Create account
POST   /api/auth/login            Login
GET    /api/auth/me               Get current user (protected)
```

### User Dashboard
```
GET    /api/user/profile          Get profile (protected)
PUT    /api/user/profile          Update profile (protected)
PUT    /api/user/change-password  Change password (protected)
GET    /api/user/alerts           List price alerts (protected)
POST   /api/user/alerts           Create alert (protected)
DELETE /api/user/alerts/:id       Remove alert (protected)
GET    /api/user/warranty         List warranty items (protected)
POST   /api/user/warranty         Add warranty item (protected)
DELETE /api/user/warranty/:id     Remove warranty item (protected)
GET    /api/user/coins            Get Winner Coins balance (protected)
```

### Scraping
```
GET    /api/scrape                Trigger full price update (all products)
GET    /api/scrape/:slug          Trigger price update for one product
GET    /api/scrape-status         Check last update timestamps
```

### Chat
```
POST   /api/chat                  Smarty AI chatbot message
```

---

## 🕐 Automated Price Updates

Prices are automatically updated **once daily at 8:00 AM IST** using node-cron + ScraperAPI.

**API usage on free tier (5,000 requests/month):**
```
23 products × 2 platforms = 46 requests per run
1 run per day × 30 days  = 1,380 requests/month
Free tier limit           = 5,000/month
Usage                     = 27% of free quota ✅
```

To trigger a manual price update:
```
GET http://localhost:5000/api/scrape
```

---

## 🤖 AI Features Overview

### 1. Shopping Assistant Quiz
Users answer 10 smart conversational questions (budget, priorities, usage, brand preference, screen size, longevity). The backend filters the product catalog using a weighted scoring algorithm, then sends the top 3 matches to Groq for a personalized 2-sentence summary.

### 2. Personalized Product Summary
On any product page, if the user has completed the quiz, their answers are read from localStorage and sent with the product specs to Groq. The AI returns a 3-sentence summary:
- Why this product matches their specific needs
- An honest tradeoff
- A "Buy it if / Skip it if" verdict

### 3. Smarty Chatbot
A floating chatbot constrained to tech topics. Uses a detailed system prompt that enforces Indian-context analogies, 3–4 sentence limits, brand neutrality, and simple language. Context-aware: knows which product page the user is on.

### 4. Review Shield
Scrapes up to 100 reviews, analyses 7 fraud signals (verified buyer rate, repeated phrases, date clustering, generic language, star distribution anomalies), computes a Trust Score, and sends a summary to Groq for a plain-English verdict.

---

## 🔐 Authentication

- JWT-based authentication with 30-day token expiry
- Passwords hashed with bcrypt (12 salt rounds)
- Protected routes use `Authorization: Bearer <token>` header
- Frontend stores token in localStorage via AuthContext

---

## 🌙 Theme System

All colors use CSS custom properties defined in `globals.css`. Both dark and light themes are supported via `data-theme` attribute on `<html>`. Theme preference persists in localStorage.

```css
/* Dark theme (default) */
:root { --bg: #080810; --text: #ffffff; --accent: #3b82f6; }

/* Light theme */
[data-theme="light"] { --bg: #f5f5f7; --text: #0a0a14; --accent: #2563eb; }
```

---

## 🗺️ Roadmap

### ✅ Built (v1.0)
- Price comparison — Amazon & Flipkart
- AI shopping assistant (10-question quiz)
- Personalized AI product summaries
- Smarty tech chatbot
- Review Shield (fake review detector)
- User auth (register / login / JWT)
- Dashboard — profile, alerts, warranty tracker
- Winner Coins gamification
- Dark / light mode
- Separate phone and laptop browse pages
- Side-by-side product comparison
- One-time spec scraping from Smartprix
- Automated daily price updates
- Price history tracking
- Price drop alerts

### 🔜 Planned (v2.0)
- WhatsApp price alert notifications
- Refurbished market price integration (Cashify, OLX)
- Resale value intelligence (2-year depreciation forecast)
- Hindi / vernacular language search
- True Effective Price Calculator (bank offers + exchange)
- Extended product categories (TVs, earphones, smartwatches)
- Amazon Product Advertising API (official price feed)
- Review ML model for fake detection
- Mobile app (React Native)

---

## 🤝 Contributing

Pull requests are welcome. For major changes please open an issue first.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 Affiliate Disclosure

ComparIO uses affiliate links from Amazon Associates and Flipkart Affiliate programs. When you click a buy link and make a purchase, ComparIO earns a small commission at no extra cost to you. This is how the platform stays free for everyone.

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Vishal** — Building ComparIO as an open-source startup project.

- GitHub: [@yourusername](https://github.com/yourusername)
- Website: [compario.in](https://compario.in) *(coming soon)*

---

<div align="center">
  <strong>Built with ❤️ for Indian shoppers</strong><br/>
  <sub>Never overpay again.</sub>
</div>
