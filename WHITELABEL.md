# Palmr White-Label Implementation Guide

## Overview
This guide documents the white-label implementation for Palmr, enabling complete customization for MSPs and enterprises.

## Architecture

### 1. Configuration Layer
- **Server-side**: Environment variables validated through Zod schema (`/apps/server/src/env.ts`)
- **Client-side**: React Context API with `useWhiteLabel` hook
- **API Bridge**: Next.js API route serves configuration to frontend

### 2. Key Features

#### Branding Customization
- Dynamic app name, company details
- Custom logos and favicons
- Primary color theming (extends existing color picker)
- Terms and privacy policy URLs

#### MSP Security Features
- MSP Mode activation for enhanced security
- Mandatory password protection
- Virus scanning requirements
- Registration restrictions
- File type allowlisting/blocklisting
- 2FA enforcement
- Session timeout management

#### UI Customization
- Hide/show branding elements
- Custom CSS injection
- Theme defaults
- Language defaults

## Implementation Status

### ✅ Completed
1. Environment variable schema extension
2. White-label configuration service
3. Frontend React hook system
4. API endpoint for configuration
5. Example environment file

### 📋 TODO
1. Integrate with existing customization module
2. Add server-side route handlers
3. Implement security validations
4. Create professional UI components
5. Add Docker configuration
6. Testing suite

## Quick Start

### 1. Copy Environment Template
```bash
cp .env.whitelabel.example .env.local
```

### 2. Configure Your Branding
Edit `.env.local` with your organization's details:

```env
APP_NAME="YourApp"
COMPANY_NAME="Your Company"
COMPANY_URL="https://your-domain.com"
SUPPORT_EMAIL="support@your-domain.com"
```

### 3. Enable MSP Features (Optional)
For enhanced security in managed service provider environments:

```env
MSP_MODE=true
REQUIRE_PASSWORD_PROTECTION=true
MANDATORY_VIRUS_SCAN=true
DISABLE_PUBLIC_REGISTRATION=true
```

### 4. Start the Application
```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## Integration Points

### Extending Existing Customization
Palmr already has a customization module at `/apps/web/src/app/customization/`. The white-label system enhances this by:

1. **Color Picker**: Reads default from `PRIMARY_COLOR` env var
2. **Theme Picker**: Respects `DEFAULT_THEME` setting
3. **Font Picker**: Can be extended with `CUSTOM_FONTS` env var
4. **Background Picker**: Can load custom backgrounds from env

### Security Enforcement

When `MSP_MODE=true`, the following security policies are enforced:

1. **File Upload Validation**
   - Check against `ALLOWED_FILE_EXTENSIONS`
   - Block `BLOCKED_FILE_EXTENSIONS`
   - Enforce `MAX_FILE_SIZE_MB`

2. **Share Creation**
   - Require password when `REQUIRE_PASSWORD_PROTECTION=true`
   - Trigger virus scan when `MANDATORY_VIRUS_SCAN=true`

3. **Authentication**
   - Enforce 2FA when `REQUIRE_2FA=true`
   - Auto-logout after `SESSION_TIMEOUT_MINUTES`
   - Block public registration when `DISABLE_PUBLIC_REGISTRATION=true`

## Advanced Customization

### Custom CSS
Add organization-specific styles via `CUSTOM_CSS`:

```env
CUSTOM_CSS="
.header { 
  background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%); 
}
.logo {
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}
"
```

### Dynamic Branding
The system supports runtime branding changes without rebuilds:

```typescript
// In your component
import { useWhiteLabel } from '@/hooks/use-whitelabel';

function Header() {
  const config = useWhiteLabel();
  
  return (
    <div>
      <h1>{config.appName}</h1>
      {config.logoUrl && <img src={config.logoUrl} alt={config.companyName} />}
    </div>
  );
}
```

## Contributing Back

This implementation maintains compatibility with upstream Palmr:
- All white-label features are optional
- Default values preserve original behavior
- Configuration is environment-based (no code changes required)
- Can be disabled by simply not setting env vars

## Support

For issues or questions about the white-label implementation:
1. Check this documentation
2. Review `.env.whitelabel.example` for all options
3. Contact your MSP administrator
4. File issues at your organization's support portal