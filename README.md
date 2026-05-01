# StudyBot 📚

An intelligent, multi-role platform for managing, sharing, and discovering educational resources with built-in moderation, gamification, and admin controls.

## 🎯 Project Overview

StudyBot is a comprehensive web-based platform designed to streamline educational resource management for academic institutions. It enables students, faculty members, researchers, and administrators to collaborate seamlessly through a unified interface with role-based access control, content moderation, and interactive features.

### Key Value Propositions

- 🎓 Multi-role ecosystem (Student, Faculty, Researcher, Visitor, Admin)
- 📚 Centralized resource repository with intuitive browsing and filtering
- 🛡️ Robust moderation system for maintaining content quality
- 🏆 Gamification features including points and achievement tracking
- ⚡ Real-time activity monitoring and administrative dashboard
- 🎨 Modern, responsive UI built with TypeScript and React

---

## ✨ Core Features

### For Students & General Users
- 👤 **User Profiles** - Customize your academic profile with institution, major, and year
- 📖 **Resource Discovery** - Browse and search through curated educational materials
- 🔖 **Saved Resources** - Bookmark and organize resources for quick access
- 💬 **Community Engagement** - View activity, interactions, and contribute to discussions
- 🏅 **Points System** - Earn points through uploads, interactions, and achievements
- 📊 **Progress Tracking** - Monitor your contributions and learning journey

### For Faculty & Researchers
- ⬆️ **Resource Upload** - Submit courses, materials, research papers, and educational content
- 📝 **Content Management** - Edit, update, and manage your uploaded resources
- 🔍 **Analytics** - Track resource views, downloads, and engagement metrics
- 📋 **Request Approvals** - Submit resources for admin review and publication

### For Administrators
- ✅ **Access Management** - Review and approve user access requests
- 📤 **Upload Approvals** - Curate and approve submitted educational content
- 🚨 **Content Moderation** - Review reported resources and take action
- 📚 **Resource Administration** - Full CRUD operations on platform resources
- 📊 **Activity Monitoring** - Real-time dashboard showing platform-wide activities
- 🛠️ **System Settings** - Configure platform parameters and policies

---

## 👥 User Roles & Workflows

| Role | Starting Points | Key Capabilities |
|------|----------------|-----------------|
| Student | 20 bonus points | Browse, download, earn points, personal dashboard |
| Faculty | 20 bonus points | All student capabilities + upload course materials |
| Researcher | 20 bonus points | All faculty capabilities + submit research papers |
| Visitor | None | Limited browse access, no uploads or interactions |
| Administrator | N/A | Full platform control, no points system |

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** 6.3.5 - Build tool with HMR

### Styling & UI
- **Tailwind CSS** 4.1.12 - Utility-first CSS framework
- **Material-UI (MUI)** 7.3.5 - Component library
- **Radix UI / shadcn/ui** - Accessible component primitives
- **Lucide React** 0.487.0 - Icon library
- **Emotion** - CSS-in-JS styling

### Forms & State
- **React Hook Form** 7.55.0 - Form validation
- **Class Variance Authority** - Type-safe component variants

### Data & Interactions
- **Recharts** 2.15.2 - Charting library
- **React DnD** 16.0.1 - Drag-and-drop
- **React Resizable Panels** 2.1.7 - Resizable layouts
- **Embla Carousel / React Slick** - Carousels and sliders

### Utilities
- **Date-fns** 3.6.0 - Date utility library
- **Sonner** 2.0.3 - Toast notifications
- **Next Themes** - Light/dark mode
- **CLSX** 2.1.1 - Conditional classnames

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 16.x or higher
- **npm** 7.x or higher (or **pnpm** 8.x+)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RaihanRafi12/StudyBot.git
cd StudyBot
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser at `http://localhost:5173`

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with HMR at `http://localhost:5173` |
| `npm run build` | Build optimized production output to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run TypeScript compiler check |

---

## 🔐 Admin Mode

Administrators get an amber/orange themed dashboard with 4 dedicated sections:

| Section | Purpose |
|---------|---------|
| Request Approval | Manage user access requests |
| Activity Log | Monitor real-time platform activities |
| All Resources | Full CRUD on platform resources |
| Settings | Configure platform parameters |

### Testing Admin Mode
1. Click "Sign Up" on the landing page
2. Select **Admin** from the Role dropdown
3. Fill in your details and create the account
4. You'll be redirected to the Request Approval dashboard automatically

---

## 📱 Responsive Design

| Device | Breakpoint |
|--------|-----------|
| 🖥️ Desktop | 1920px and above |
| 💻 Laptop | 1024px – 1919px |
| 📱 Tablet | 768px – 1023px |
| 📱 Mobile | 320px – 767px |

---

## 🌐 Deployment

### Netlify (Recommended)

The project includes `netlify.toml` for streamlined deployment:

1. Push your code to GitHub
2. Connect your repository to [Netlify Dashboard](https://app.netlify.com)
3. Build settings are auto-configured:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist/`

### Manual Deployment

```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

### Docker

```bash
docker build -t studybot .
docker run -p 3000:3000 studybot
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please read [GUIDELINES.md](GUIDELINES.md) for full details on code style, git workflow, PR rules, role-based development, and testing expectations.

---

## 🎯 Roadmap

- 🔔 Real-time notifications system
- 💬 In-app messaging and discussions
- 📅 Event calendar and scheduling
- 🎖️ Advanced badge/achievement system
- 🌍 Multi-language support
- 🔐 Two-factor authentication
- 📱 Native mobile app (React Native)
- 🤖 AI-powered content recommendations

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for third-party credits including shadcn/ui (MIT) and Unsplash images.

---

## 👨‍💻 Author

**Raihan Rafi**  
GitHub: [@RaihanRafi12](https://github.com/RaihanRafi12)

---

## 🙏 Acknowledgments

- [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/) communities
- [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), and [Tailwind CSS](https://tailwindcss.com/) for excellent components
- [Unsplash](https://unsplash.com/) for providing beautiful images
- All contributors and users who help improve StudyBot
