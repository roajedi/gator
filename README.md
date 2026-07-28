# Gator - Blog Aggregator

Gator is a command-line RSS feed aggregator built using **TypeScript**, **PostgreSQL**, and **Drizzle ORM**.

The purpose of this project is to allow users to manage RSS feeds from the terminal. Users can create accounts, add feeds, follow feeds created by other users, collect posts from RSS feeds, and browse the latest posts.

## Requirements

Before running Gator, make sure you have the following installed:

* Node.js
* npm
* PostgreSQL

## Installation

First, clone the repository:

```bash
git clone <your-github-repository-link>
cd blog-aggregator
```

Install the project dependencies:

```bash
npm install
```

Make sure PostgreSQL is running, then run the database migrations:

```bash
npx drizzle-kit migrate
```

## Configuration

Gator uses a configuration file to store the database connection and the current logged-in user.

Create a file called:

```bash
~/.gatorconfig.json
```

Add your PostgreSQL database URL:

```json
{
  "db_url": "postgres://username:password@localhost:5432/database_name"
}
```

After logging in or registering a user, the current username will also be stored in this file.

## Running the Program

All commands are executed using:

```bash
npm run start <command>
```

## Available Commands

### Register a new user

Creates a new user and logs them in.

```bash
npm run start register <username>
```

Example:

```bash
npm run start register roa
```

---

### Login

Switches the current logged-in user.

```bash
npm run start login <username>
```

Example:

```bash
npm run start login roa
```

---

### Add a feed

Adds a new RSS feed and automatically follows it.

```bash
npm run start addfeed "<feed-name>" "<feed-url>"
```

Example:

```bash
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
```

---

### List all feeds

Displays all RSS feeds available in the database.

```bash
npm run start feeds
```

---

### Follow a feed

Allows the current user to follow an existing RSS feed.

```bash
npm run start follow <feed-url>
```

Example:

```bash
npm run start follow "https://news.ycombinator.com/rss"
```

---

### Show followed feeds

Displays all feeds followed by the current user.

```bash
npm run start following
```

---

### Unfollow a feed

Removes a feed from the user's followed feeds.

```bash
npm run start unfollow <feed-url>
```

---

### Aggregate feeds

Fetches posts from followed RSS feeds continuously.

```bash
npm run start agg <time-between-requests>
```

Example:

```bash
npm run start agg 10s
```

---

### Browse posts

Displays the latest posts from the feeds followed by the current user.

```bash
npm run start browse [limit]
```

Example:

```bash
npm run start browse 5
```

## Technologies Used

* TypeScript
* Node.js
* PostgreSQL
* Drizzle ORM
* RSS Parser

## Project Features

* User registration and authentication
* RSS feed management
* Following and unfollowing feeds
* Automatic RSS feed aggregation
* Storing posts in PostgreSQL
* Browsing collected posts from the terminal

## Author

Developed as part of a learning project to practice TypeScript, SQL databases, ORM usage, and backend development.
