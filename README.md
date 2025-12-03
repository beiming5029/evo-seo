# evoSEO: Vibe to Production

1. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

4. **Set up the database**
```bash
pnpm db:push
```

5. **Start the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

### 🛠 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Drizzle migrations
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```
