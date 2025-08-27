# Fork Maintenance Guide - Lumenit Palmr

## Overview
This document outlines the procedures for maintaining the Lumenit fork of Palmr, ensuring we can incorporate upstream improvements while preserving our white-label customizations.

## Repository Structure

### Remotes
- **origin**: https://github.com/lumenitca/Palmr.git (Our fork)
- **upstream**: https://github.com/kyantech/Palmr.git (Original project)

### Branches
- **main**: Stable release branch with our customizations
- **develop**: Active development and integration branch
- **upstream-sync**: Temporary branch for merging upstream changes
- **feature/***: Feature branches for new development

## Daily Workflow

### 1. Starting New Work
```bash
# Always start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push feature branch
git push -u origin feature/your-feature-name
```

### 2. Creating Pull Requests
1. Push your feature branch to GitHub
2. Open PR from feature branch to `develop`
3. After review and approval, merge to `develop`
4. When stable, create PR from `develop` to `main`

## Syncing with Upstream

### Weekly Sync Procedure (Recommended)
```bash
# 1. Fetch latest upstream changes
git fetch upstream

# 2. Check what's new
git log --oneline --graph --all --decorate -10

# 3. Create sync branch
git checkout main
git pull origin main
git checkout -b upstream-sync

# 4. Merge upstream changes
git merge upstream/main

# 5. Resolve any conflicts
# - Keep our white-label modifications
# - Incorporate upstream improvements
# - Test thoroughly

# 6. Create PR for review
git push -u origin upstream-sync
```

### Handling Conflicts

When conflicts arise during upstream sync:

1. **White-label files** (always keep ours):
   - `.env.whitelabel.example`
   - `WHITELABEL.md`
   - `apps/server/src/config/whitelabel.config.ts`
   - `apps/web/src/hooks/use-whitelabel.tsx`
   - `apps/web/src/app/api/config/whitelabel/`

2. **Modified core files** (merge carefully):
   - `apps/server/src/env.ts` - Keep our additions, incorporate upstream changes

3. **Testing after merge**:
   ```bash
   # Install dependencies
   pnpm install
   
   # Run tests
   pnpm test
   
   # Build project
   pnpm build
   
   # Test white-label features
   cp .env.whitelabel.example .env.local
   pnpm dev
   ```

## Version Management

### Tagging Releases
```bash
# Tag Lumenit releases with -lumenit suffix
git tag v3.2.0-lumenit.1
git push origin v3.2.0-lumenit.1
```

### Version Numbering
- Upstream version: `v3.2.0-beta`
- Our version: `v3.2.0-lumenit.1`
- Format: `[upstream-version]-lumenit.[our-revision]`

## Emergency Procedures

### Rolling Back a Bad Merge
```bash
# Find the last good commit
git log --oneline -20

# Reset to that commit
git checkout main
git reset --hard <commit-hash>
git push --force-with-lease origin main
```

### Recovering Deleted White-Label Files
```bash
# Restore from a specific commit
git checkout 52abe6e -- WHITELABEL.md
git checkout 52abe6e -- .env.whitelabel.example
# ... restore other files as needed
```

## White-Label Customization Notes

### Protected Customizations
Our white-label implementation is designed to:
1. Never conflict with upstream code (all additions are optional)
2. Use environment variables for configuration (no hardcoding)
3. Maintain backward compatibility

### Key Customization Files
- **Server Config**: `apps/server/src/config/whitelabel.config.ts`
- **Frontend Hook**: `apps/web/src/hooks/use-whitelabel.tsx`
- **API Endpoint**: `apps/web/src/app/api/config/whitelabel/route.ts`
- **Environment Schema**: `apps/server/src/env.ts` (extended, not replaced)

## Contribution Guidelines

### Contributing to Upstream
When we develop features that could benefit the community:

1. Create a clean branch from upstream/main
2. Implement feature without white-label dependencies
3. Test against vanilla Palmr
4. Submit PR to kyantech/Palmr

### Internal Contributions
1. All changes go through PR review
2. Maintain test coverage
3. Update documentation
4. Follow existing code style

## Monitoring Upstream

### Check for Updates
```bash
# View upstream activity
git fetch upstream
git log upstream/main --oneline -10

# Check for new releases
gh release list --repo kyantech/Palmr --limit 5
```

### Security Updates
Priority sync triggers:
- Security patches
- Critical bug fixes
- Performance improvements

## Automation (Future)

### GitHub Actions Workflow (To Be Implemented)
```yaml
name: Upstream Sync Check
on:
  schedule:
    - cron: '0 9 * * MON'  # Weekly on Monday
jobs:
  check-upstream:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for upstream updates
        run: |
          git remote add upstream https://github.com/kyantech/Palmr.git
          git fetch upstream
          # Check if we're behind upstream
          BEHIND=$(git rev-list --count HEAD..upstream/main)
          if [ $BEHIND -gt 0 ]; then
            echo "We are $BEHIND commits behind upstream"
            # Create issue or notification
          fi
```

## Support

For issues with:
- **Fork maintenance**: Contact Lumenit DevOps team
- **White-label features**: Check WHITELABEL.md
- **Upstream bugs**: Report to kyantech/Palmr
- **Security issues**: Report privately to security@lumenit.ca

## Quick Reference

```bash
# Common Commands
git fetch upstream                    # Get latest upstream
git checkout develop                  # Switch to develop
git merge upstream/main               # Merge upstream
git push origin develop              # Push changes
git tag -l                           # List tags
gh pr create                         # Create PR
gh pr list                          # List PRs
gh release list --repo kyantech/Palmr # Check upstream releases
```

---

*Last Updated: August 2025*
*Maintained by: Lumenit Development Team*