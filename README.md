# 🎓 SchoolSpace

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

SchoolSpace is a SaaS platform that provides students and teachers with a collaborative environment for learning. It supports course enrollment, lecture and assignment management, group discussions, grade tracking, tutor booking, and a personal AI assistant to support users throughout their learning journey.

> 🚀 **Live Demo:** [schoolspace.io](https://schoolspace.io) | 📖 **Full Docs:** [Documentation](/docs)

---

## ✨ Features

- 📚 **Course Management** — Enroll in courses, manage lectures and assignments
- 💬 **Group Discussions** — Collaborate with peers in course-specific discussion boards
- 📊 **Grade Tracking** — View and manage grades across all enrolled courses
- 🧑‍🏫 **Tutor Booking** — Book tutors for specific courses directly through the platform
- 🤖 **AI Assistant** — Personalized AI assistant to help users with their learning

---

## 🗂️ Repositories

SchoolSpace is split across multiple repositories:

| Repository | Description |
|---|---|
| [SchoolSpace](https://github.com/bluex117/SchoolSpace) | Deployments and scripts |
| [SchoolSpace-Server](https://github.com/bluex117/SchoolSpace-Server) | .NET 9 REST API and backend services |
| [SchoolSpace-Web](https://github.com/bluex117/SchoolSpace-Web) | React web client |
| [SchoolSpace-Mobile](https://github.com/bluex117/SchoolSpace-Mobile) | React Native mobile app |
---

## 🚀 Getting Started

Setting up SchoolSpace involves configuring multiple repositories. You must configure the server, and one of the clients (web or mobile). Please refer to their repostory to set it up properly.

---

## 🛠️ Tech Stack

**Web Client** ([SchoolSpace-Web](https://github.com/thomastran117/SchoolSpace-Web)):
- [React](https://react.dev/) — UI framework
- [Redux](https://redux.js.org/) — Global state management
- [TypeScript](https://www.typescriptlang.org/) — Type safety across the codebase
- [TailwindCSS](https://tailwindcss.com/) — Utility-first styling

**Mobile Client** ([SchoolSpace-Mobile](https://github.com/thomastran117/SchoolSpace-Mobile)):
- [React Native](https://reactnative.dev/) — Cross-platform mobile framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety across the codebase

**Server** ([SchoolSpace-Server](https://github.com/thomastran117/SchoolSpace-Server)):
- [.NET 9](https://dotnet.microsoft.com/) (C#) — ASP.NET Core REST API
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/) — ORM and migrations for MySQL

**Infrastructure:**
- [MySQL](https://www.mysql.com/) — Primary relational database
- [Redis](https://redis.io/) — Caching and session management
- [RabbitMQ](https://www.rabbitmq.com/) — Message queuing for async tasks
- [Azure](https://azure.microsoft.com/) — Cloud hosting and services

---

## Contributing

Contributions are welcome! Please open an issue in the relevant repository first to discuss any changes you'd like to make, then submit a pull request.

1. Fork the relevant repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 👥 Authors

- [@thomastran117](https://github.com/thomastran117)
- [@bluex117](https://github.com/bluex117)
- [@btran0014](https://github.com/btran0014)
- [@sanjeeveasparan](https://github.com/sanjeeveasparan)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
