# ChefMate Project - EADDRINUSE Error Solution & Startup Guide

## Understanding the EADDRINUSE Error

The `EADDRINUSE: address already in use :::5000` error occurs when:
- Another process is already using port 5000
- A previous server instance didn't shut down properly  
- Multiple server instances are running simultaneously

On some macOS setups, port `5000` can be used by a system process (e.g. Control Center). In that case, the port will appear “busy” again even after you kill it.

## Quick Solutions

### Option 1: Kill Process Using Port 5000
```bash
# Find and kill process using port 5000
kill -9 $(lsof -ti:5000)

# Then start your server
cd server && node src/index.js
```

### Option 2: Use Different Port
```bash
# If you are in the PROJECT ROOT (ChefMate/)
PORT=5001 node server/src/index.js

# If you are inside the SERVER FOLDER (ChefMate/server/)
PORT=5001 node src/index.js
```

### Option 3: Use the Project's Built-in Scripts
```bash
# From root directory - runs both server and client
npm run dev

# Server only (uses server/.env PORT, usually 5001)
npm run dev:server

# Server only on a different port
PORT=5001 npm run dev:server

# Client only  
npm run dev:client
```

## Project Structure

This is a ChefMate recipe recommendation app with:

- **Server**: Node.js backend
  - Default port: 5001 (to avoid conflicts)
  - Auto fallback: if the chosen port is busy, the server will try the next ports automatically
  - Location: `/server/src/index.js`

- **Client**: Vite/React frontend
  - Default port: 5173
  - Location: `/client/`

## Recommended Startup Commands

### For Development (Recommended)
```bash
# From project root - starts both server and client concurrently
npm run dev
```

### For Individual Components
```bash
# Start server only
npm run dev:server

# Start client only
npm run dev:client
```

### Manual Startup
```bash
# Server (from server directory)
cd server && node src/index.js

# Client (from client directory) 
cd client && npm run dev
```

## Preventing Future EADDRINUSE Errors

1. **Always stop servers properly**: Use Ctrl+C instead of closing terminal
2. **Use the project scripts**: `npm run dev` handles port conflicts automatically
3. **Check for existing processes**: `lsof -nP -iTCP:5000 -sTCP:LISTEN` before starting new instances
4. **Use different ports for development**: The project already configures port 5001 for dev

## Troubleshooting Steps

If you encounter EADDRINUSE:

1. Check what's using the port: `lsof -nP -iTCP:5000 -sTCP:LISTEN`
2. Kill the process: `kill -9 $(lsof -ti:5000)`
3. Try starting again with proper script: `npm run dev`
4. If still failing, restart your terminal/computer

If you see a new PID appear again right after killing, it often means something like `nodemon` (or a previously running `npm run dev`) is restarting the server automatically. In that case, stop the dev process with Ctrl+C in the terminal where it is running.

## Environment Setup

Make sure you have:
- Node.js installed
- Run `npm install` in both root and server/client directories
- Environment files configured (`.env` files exist)

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Kill process or use port 5001 |
| Client can't connect | Ensure server is running first |
| Concurrent startup fails | Check both server and client dependencies |

---
*This dock file serves as a quick reference for resolving port conflicts and properly starting the ChefMate application.*
