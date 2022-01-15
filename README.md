# EngHub Booking Site

This is the code for [https://enghub.io] -- the room booking system for the UCL Engineering Hub.

## Overview

This is a [Next.js app](https://nextjs.org/) using [Prisma](https://www.prisma.io/) as an ORM with the main UCL API Postgres database.

Authentication is done using [UCL API's OAuth system](https://uclapi.com/docs/#operations-tag-OAuth) via [NextAuth.js](https://next-auth.js.org/).

The API routes are in `./pages/api`. All files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Development

1. Clone this repository
2. Copy `.env.example` to `.env` and fill in the environment variables
3. Run `npm install` to install dependencies
4. Run `npx prisma generate` to generate the local Prisma client (used for database interactions)
5. Run `npm run dev` to run the development server (with hot reloading etc.) -- by default this will be on [port 3000](localhost:3000)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
