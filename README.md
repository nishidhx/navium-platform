# Navium

Navium is a modern chat application and social platform designed for fast, seamless communication and community building. It combines real-time messaging, authentication, profile management, and a polished dark-themed experience in a single, responsive product.

## Overview

Navium is built with:
- Next.js
- Prisma
- Radix UI
- Tailwind CSS
- Bun

The platform focuses on creating a smooth user experience with real-time chatting, secure authentication, and a visually rich interface featuring custom gradients and animations.

## Features

- Secure authentication with email/password and OAuth providers such as Google and GitHub
- Real-time messaging and chat experiences
- Profile management for user details and preferences
- Social discovery and onboarding flows
- Dark theme with animated gradients and responsive layouts

## Screenshots

[![Signin](https://github.com/nishidhx/navium_client/raw/master/assets/1.png)](https://github.com/nishidhx/navium_client/blob/master/assets/1.png)
[![Signin](https://github.com/nishidhx/navium_client/raw/master/assets/3.png)](https://github.com/nishidhx/navium_client/blob/master/assets/3.png)

[![Chat Interface](https://github.com/nishidhx/navium_client/raw/master/assets/2.png)](https://github.com/nishidhx/navium_client/blob/master/assets/2.png)

## Setup

```bash
git clone https://github.com/yourusername/navium.git
# or
git clone git@github.com:yourusername/navium.git
cp .env.example .env
bun install
bunx prisma migrate dev
bunx prisma generate
bun dev
```

For production builds:

```bash
bun build
```

## Environment Variables

Create a `.env` file and add the required variables for your database and authentication providers.

## Contributing

Contributions are welcome. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the ISC License.

Made with ❤️ by the Navium team.
