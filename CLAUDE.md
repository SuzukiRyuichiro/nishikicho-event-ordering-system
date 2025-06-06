# What this app is about

- The pain this app solves is the operational complexity of a local neighborhood event I host.
  - The pain: Without proper POS software, it is hard to keep track of who ordered what and how much at the point of check out.
  - The solution: An app that keeps the track of who came in how big of a group, and what drinks they ordered

# Tech stack

- The front end is Next JS
- The backend is firebase. Utilize the firebase MCP and talk to the live data when making the pages that talks to the firestore.

# Bash commands

- npm run build: Build the project
- npm run typecheck: Run the typechecker

# Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Use arrow functions for Javascript (eg. const func = () => {} )

# Workflow

- Be sure to typecheck when you’re done making a series of code changes
- Use Japanese for text in the UI. This app is for Japanese users only.

# Entity relations

- There is just one user. No authentication for now
- Customer is a single person or a group of people, who we will charge as a whole. It has a head count field, which is default to 1. Example of a single person customer is like John Doe, but we also have people who visit as a company group who they ask to be charged as a group so it can be like Example corp.
- Drink is as simple as it gets. It represent single drink we serve.
- Order is a drink order. So a customer makes an order for a drink, and the status is set to pending. It could be cancelled, it could also be marked as served.
