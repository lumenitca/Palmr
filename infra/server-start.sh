#!/bin/sh
set -e

echo "🌴 Starting Palmr Server..."

TARGET_UID=${PALMR_UID:-1001}
TARGET_GID=${PALMR_GID:-1001}

if [ -n "$PALMR_UID" ] || [ -n "$PALMR_GID" ]; then
    echo "🔧 Runtime UID/GID: $TARGET_UID:$TARGET_GID"
    
    echo "🔐 Updating file ownership..."
    chown -R $TARGET_UID:$TARGET_GID /app/palmr-app 2>/dev/null || echo "⚠️ Some ownership changes may have failed"
    chown -R $TARGET_UID:$TARGET_GID /home/palmr 2>/dev/null || echo "⚠️ Some home directory ownership changes may have failed"
    
    if [ -d "/app/server" ]; then
        chown -R $TARGET_UID:$TARGET_GID /app/server 2>/dev/null || echo "⚠️ Some data directory ownership changes may have failed"
    fi
    
    echo "✅ UID/GID configuration completed"
fi

cd /app/palmr-app

export DATABASE_URL="file:/app/server/prisma/palmr.db"

echo "📂 Data directory: /app/server"
echo "💾 Database: $DATABASE_URL"

echo "📁 Creating data directories..."
mkdir -p /app/server/prisma /app/server/uploads /app/server/temp-uploads

if [ "$(id -u)" = "0" ]; then
    echo "🔐 Ensuring proper ownership before database operations..."
    chown -R $TARGET_UID:$TARGET_GID /app/server/prisma 2>/dev/null || true
fi

if [ ! -f "/app/server/prisma/palmr.db" ]; then
    echo "🚀 First run detected - setting up database..."
    
    echo "🗄️ Creating database schema..."
    if [ "$(id -u)" = "0" ]; then
        su-exec $TARGET_UID:$TARGET_GID npx prisma db push --schema=./prisma/schema.prisma --skip-generate
    else
        npx prisma db push --schema=./prisma/schema.prisma --skip-generate
    fi
    
    echo "🌱 Seeding database..."
    if [ "$(id -u)" = "0" ]; then
        su-exec $TARGET_UID:$TARGET_GID node ./prisma/seed.js
    else
        node ./prisma/seed.js
    fi
    
    echo "✅ Database setup completed!"
else
    echo "♻️ Existing database found"
    
    echo "🔧 Checking for schema updates..."
    if [ "$(id -u)" = "0" ]; then
        su-exec $TARGET_UID:$TARGET_GID npx prisma db push --schema=./prisma/schema.prisma --skip-generate
    else
        npx prisma db push --schema=./prisma/schema.prisma --skip-generate
    fi
    
    echo "🔍 Checking if new tables need seeding..."
    NEEDS_SEEDING=$(
        if [ "$(id -u)" = "0" ]; then
            su-exec $TARGET_UID:$TARGET_GID node -e "
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                
                async function checkSeedingNeeded() {
                    try {
                        const appConfigCount = await prisma.appConfig.count();
                        const userCount = await prisma.user.count();
                        const authProviderCount = await prisma.authProvider.count();
                        
                        if (appConfigCount === 0 || userCount === 0) {
                            console.log('true');
                            return;
                        }
                        
                        if (authProviderCount === 0) {
                            console.log('true');
                            return;
                        }
                        
                        const expectedProviders = ['google', 'discord', 'github', 'auth0', 'kinde', 'zitadel', 'authentik', 'frontegg', 'pocketid'];
                        const existingProviders = await prisma.authProvider.findMany({
                            select: { name: true }
                        });
                        const existingProviderNames = existingProviders.map(p => p.name);
                        
                        const missingProviders = expectedProviders.filter(name => !existingProviderNames.includes(name));
                        
                        if (missingProviders.length > 0) {
                            console.log('true');
                            return;
                        }
                        
                        console.log('false');
                    } catch (error) {
                        console.log('true');
                    } finally {
                        await prisma.\$disconnect();
                    }
                }
                
                checkSeedingNeeded();
            " 2>/dev/null || echo "true"
        else
            node -e "
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                
                async function checkSeedingNeeded() {
                    try {
                        const appConfigCount = await prisma.appConfig.count();
                        const userCount = await prisma.user.count();
                        const authProviderCount = await prisma.authProvider.count();
                        
                        if (appConfigCount === 0 || userCount === 0) {
                            console.log('true');
                            return;
                        }
                        
                        if (authProviderCount === 0) {
                            console.log('true');
                            return;
                        }
                        
                        const expectedProviders = ['google', 'discord', 'github', 'auth0', 'kinde', 'zitadel', 'authentik', 'frontegg', 'pocketid'];
                        const existingProviders = await prisma.authProvider.findMany({
                            select: { name: true }
                        });
                        const existingProviderNames = existingProviders.map(p => p.name);
                        
                        const missingProviders = expectedProviders.filter(name => !existingProviderNames.includes(name));
                        
                        if (missingProviders.length > 0) {
                            console.log('true');
                            return;
                        }
                        
                        console.log('false');
                    } catch (error) {
                        console.log('true');
                    } finally {
                        await prisma.\$disconnect();
                    }
                }
                
                checkSeedingNeeded();
            " 2>/dev/null || echo "true"
        fi
    )
    
    if [ "$NEEDS_SEEDING" = "true" ]; then
        echo "🌱 New tables detected or missing data, running seed..."
        
        # Check which providers are missing for better logging
        MISSING_PROVIDERS=$(
            if [ "$(id -u)" = "0" ]; then
                su-exec $TARGET_UID:$TARGET_GID node -e "
                    const { PrismaClient } = require('@prisma/client');
                    const prisma = new PrismaClient();
                    
                    async function checkMissingProviders() {
                        try {
                            const expectedProviders = ['google', 'discord', 'github', 'auth0', 'kinde', 'zitadel', 'authentik', 'frontegg', 'pocketid'];
                            const existingProviders = await prisma.authProvider.findMany({
                                select: { name: true }
                            });
                            const existingProviderNames = existingProviders.map(p => p.name);
                            const missingProviders = expectedProviders.filter(name => !existingProviderNames.includes(name));
                            
                            if (missingProviders.length > 0) {
                                console.log('Missing providers: ' + missingProviders.join(', '));
                            } else {
                                console.log('No missing providers');
                            }
                        } catch (error) {
                            console.log('Error checking providers');
                        } finally {
                            await prisma.\$disconnect();
                        }
                    }
                    
                    checkMissingProviders();
                " 2>/dev/null || echo "Error checking providers"
            else
                node -e "
                    const { PrismaClient } = require('@prisma/client');
                    const prisma = new PrismaClient();
                    
                    async function checkMissingProviders() {
                        try {
                            const expectedProviders = ['google', 'discord', 'github', 'auth0', 'kinde', 'zitadel', 'authentik', 'frontegg', 'pocketid'];
                            const existingProviders = await prisma.authProvider.findMany({
                                select: { name: true }
                            });
                            const existingProviderNames = existingProviders.map(p => p.name);
                            const missingProviders = expectedProviders.filter(name => !existingProviderNames.includes(name));
                            
                            if (missingProviders.length > 0) {
                                console.log('Missing providers: ' + missingProviders.join(', '));
                            } else {
                                console.log('No missing providers');
                            }
                        } catch (error) {
                            console.log('Error checking providers');
                        } finally {
                            await prisma.\$disconnect();
                        }
                    }
                    
                    checkMissingProviders();
                " 2>/dev/null || echo "Error checking providers"
            fi
        )
        
        if [ "$MISSING_PROVIDERS" != "No missing providers" ] && [ "$MISSING_PROVIDERS" != "Error checking providers" ]; then
            echo "🔍 $MISSING_PROVIDERS"
        fi
        
        if [ "$(id -u)" = "0" ]; then
            su-exec $TARGET_UID:$TARGET_GID node ./prisma/seed.js
        else
            node ./prisma/seed.js
        fi
        echo "✅ Seeding completed!"
    else
        echo "✅ All tables have data, no seeding needed"
    fi
fi

echo "🚀 Starting Palmr server..."

if [ "$(id -u)" = "0" ]; then
    echo "🔽 Dropping privileges to UID:GID $TARGET_UID:$TARGET_GID"
    exec su-exec $TARGET_UID:$TARGET_GID node dist/server.js
else
    exec node dist/server.js
fi 