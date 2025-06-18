#!/bin/sh
set -e

echo "🌴 Starting Palmr Server..."

# === UID/GID Runtime Configuration ===
TARGET_UID=${PALMR_UID:-1001}
TARGET_GID=${PALMR_GID:-1001}

if [ -n "$PALMR_UID" ] || [ -n "$PALMR_GID" ]; then
    echo "🔧 Runtime UID/GID: $TARGET_UID:$TARGET_GID"
    
    # Update ownership of critical directories to match target UID/GID
    echo "🔐 Updating file ownership..."
    chown -R $TARGET_UID:$TARGET_GID /app/palmr-app 2>/dev/null || echo "⚠️ Some ownership changes may have failed"
    chown -R $TARGET_UID:$TARGET_GID /home/palmr 2>/dev/null || echo "⚠️ Some home directory ownership changes may have failed"
    
    # Update ownership of data directory if it exists
    if [ -d "/app/server" ]; then
        chown -R $TARGET_UID:$TARGET_GID /app/server 2>/dev/null || echo "⚠️ Some data directory ownership changes may have failed"
    fi
    
    echo "✅ UID/GID configuration completed"
fi

# Ensure we're in the correct directory
cd /app/palmr-app

# Set the database URL
export DATABASE_URL="file:/app/server/prisma/palmr.db"

echo "📂 Data directory: /app/server"
echo "💾 Database: $DATABASE_URL"

# Create all necessary directories
echo "📁 Creating data directories..."
mkdir -p /app/server/prisma /app/server/uploads /app/server/temp-chunks /app/server/uploads/logo

# Fix ownership of database directory BEFORE database operations
if [ "$(id -u)" = "0" ]; then
    echo "🔐 Ensuring proper ownership before database operations..."
    chown -R $TARGET_UID:$TARGET_GID /app/server/prisma 2>/dev/null || true
fi

# Check if it's a first run (no database file exists)
if [ ! -f "/app/server/prisma/palmr.db" ]; then
    echo "🚀 First run detected - setting up database..."
    
    # Create database with proper schema path - run as target user to avoid permission issues
    echo "🗄️ Creating database schema..."
    if [ "$(id -u)" = "0" ]; then
        su-exec $TARGET_UID:$TARGET_GID npx prisma db push --schema=./prisma/schema.prisma --skip-generate
    else
        npx prisma db push --schema=./prisma/schema.prisma --skip-generate
    fi
    
    # Run seed script from application directory (where node_modules is) - as target user
    echo "🌱 Seeding database..."
    if [ "$(id -u)" = "0" ]; then
        su-exec $TARGET_UID:$TARGET_GID node ./prisma/seed.js
    else
        node ./prisma/seed.js
    fi
    
    echo "✅ Database setup completed!"
else
    echo "♻️ Existing database found"
    
    # Always run migrations to ensure schema is up to date - as target user
    echo "🔧 Checking for schema updates..."
    if [ "$(id -u)" = "0" ]; then
        su-exec $TARGET_UID:$TARGET_GID npx prisma db push --schema=./prisma/schema.prisma --skip-generate
    else
        npx prisma db push --schema=./prisma/schema.prisma --skip-generate
    fi
    
    # Check if configurations exist - as target user
    echo "🔍 Verifying database configurations..."
    CONFIG_COUNT=$(
        if [ "$(id -u)" = "0" ]; then
            su-exec $TARGET_UID:$TARGET_GID node -e "
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                prisma.appConfig.count()
                    .then(count => {
                        console.log(count);
                        process.exit(0);
                    })
                    .catch(() => {
                        console.log(0);
                        process.exit(0);
                    });
            " 2>/dev/null || echo "0"
        else
            node -e "
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                prisma.appConfig.count()
                    .then(count => {
                        console.log(count);
                        process.exit(0);
                    })
                    .catch(() => {
                        console.log(0);
                        process.exit(0);
                    });
            " 2>/dev/null || echo "0"
        fi
    )
    
    if [ "$CONFIG_COUNT" -eq "0" ]; then
        echo "🌱 No configurations found, running seed..."
        # Always run seed from application directory where node_modules is available - as target user
        if [ "$(id -u)" = "0" ]; then
            su-exec $TARGET_UID:$TARGET_GID node ./prisma/seed.js
        else
            node ./prisma/seed.js
        fi
    else
        echo "✅ Found $CONFIG_COUNT configurations"
    fi
fi

echo "🚀 Starting Palmr server..."

# Drop privileges using su-exec with specific UID/GID
if [ "$(id -u)" = "0" ]; then
    echo "🔽 Dropping privileges to UID:GID $TARGET_UID:$TARGET_GID"
    exec su-exec $TARGET_UID:$TARGET_GID node dist/server.js
else
    # We're already running as non-root
    exec node dist/server.js
fi 