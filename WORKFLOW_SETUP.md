# GitHub Actions Workflow Setup

## Upstream Sync Workflow

Due to GitHub OAuth token limitations, the upstream sync workflow needs to be added manually through the GitHub web interface.

### Steps to Add the Workflow:

1. Go to https://github.com/lumenitca/Palmr
2. Navigate to Actions tab
3. Click "New workflow"
4. Choose "set up a workflow yourself"
5. Name the file `upstream-sync.yml`
6. Paste the following content:

```yaml
name: Check Upstream Updates

on:
  schedule:
    # Run every Monday at 9 AM UTC
    - cron: '0 9 * * 1'
  workflow_dispatch:
    # Allow manual trigger

jobs:
  check-upstream:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: read
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Add upstream remote
        run: |
          git remote add upstream https://github.com/kyantech/Palmr.git || true
          git fetch upstream
      
      - name: Check for upstream updates
        id: check
        run: |
          # Count commits we're behind
          BEHIND_COUNT=$(git rev-list --count HEAD..upstream/main)
          echo "behind_count=$BEHIND_COUNT" >> $GITHUB_OUTPUT
          
          if [ "$BEHIND_COUNT" -gt 0 ]; then
            echo "Repository is $BEHIND_COUNT commits behind upstream"
            
            # Get list of new commits
            echo "## New upstream commits:" > upstream_changes.md
            git log HEAD..upstream/main --oneline --max-count=20 >> upstream_changes.md
            
            # Check for security-related commits
            SECURITY_COMMITS=$(git log HEAD..upstream/main --grep="security\|vulnerability\|CVE" -i --oneline)
            if [ -n "$SECURITY_COMMITS" ]; then
              echo "has_security=true" >> $GITHUB_OUTPUT
              echo "## ⚠️ Security-related commits found:" >> upstream_changes.md
              echo "$SECURITY_COMMITS" >> upstream_changes.md
            fi
          else
            echo "Repository is up to date with upstream"
          fi
      
      - name: Create or update issue
        if: steps.check.outputs.behind_count > 0
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const behindCount = ${{ steps.check.outputs.behind_count }};
            const hasSecurity = '${{ steps.check.outputs.has_security }}' === 'true';
            
            // Read the changes file if it exists
            let changes = '';
            try {
              changes = fs.readFileSync('upstream_changes.md', 'utf8');
            } catch (e) {
              changes = 'Could not retrieve commit details.';
            }
            
            const title = hasSecurity 
              ? `⚠️ SECURITY: Upstream updates available (${behindCount} commits behind)`
              : `Upstream updates available (${behindCount} commits behind)`;
            
            const body = `## Upstream Sync Required
            
            The repository is **${behindCount} commits** behind [kyantech/Palmr](https://github.com/kyantech/Palmr).
            
            ${hasSecurity ? '### ⚠️ Security Updates Detected\nThis sync includes security-related commits and should be prioritized.\n' : ''}
            
            ### Sync Instructions
            
            1. Create a sync branch:
               \`\`\`bash
               git checkout main
               git pull origin main
               git checkout -b upstream-sync-$(date +%Y%m%d)
               git merge upstream/main
               \`\`\`
            
            2. Resolve any conflicts (preserve white-label customizations)
            
            3. Test the changes:
               \`\`\`bash
               pnpm install
               pnpm test
               pnpm build
               \`\`\`
            
            4. Create a PR for review
            
            ### Recent Upstream Changes
            
            ${changes}
            
            ---
            *This issue was automatically created by the upstream sync workflow.*
            *Check [FORK_MAINTENANCE.md](https://github.com/lumenitca/Palmr/blob/main/FORK_MAINTENANCE.md) for detailed sync procedures.*`;
            
            // Check for existing open issues
            const issues = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'open',
              labels: 'upstream-sync'
            });
            
            if (issues.data.length > 0) {
              // Update existing issue
              await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issues.data[0].number,
                title: title,
                body: body
              });
              console.log(`Updated issue #${issues.data[0].number}`);
            } else {
              // Create new issue
              const issue = await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title: title,
                body: body,
                labels: ['upstream-sync', hasSecurity ? 'security' : 'maintenance']
              });
              console.log(`Created issue #${issue.data.number}`);
            }

  check-versions:
    runs-on: ubuntu-latest
    steps:
      - name: Check latest releases
        run: |
          echo "## Checking for new Palmr releases"
          
          # Get latest release from upstream
          LATEST_UPSTREAM=$(curl -s https://api.github.com/repos/kyantech/Palmr/releases/latest | jq -r '.tag_name // "none"')
          echo "Latest upstream release: $LATEST_UPSTREAM"
          
          # Get our latest release
          LATEST_OURS=$(curl -s https://api.github.com/repos/lumenitca/Palmr/releases/latest | jq -r '.tag_name // "none"')
          echo "Our latest release: $LATEST_OURS"
          
          if [ "$LATEST_UPSTREAM" != "none" ] && [ "$LATEST_OURS" != "$LATEST_UPSTREAM-lumenit.1" ]; then
            echo "::warning::New upstream release available: $LATEST_UPSTREAM"
          fi
```

7. Commit the workflow file

### What This Workflow Does:

- **Runs weekly** (every Monday at 9 AM UTC)
- **Can be triggered manually** from Actions tab
- **Checks for upstream updates** and counts commits behind
- **Identifies security updates** by scanning commit messages
- **Creates/updates GitHub issues** to track needed syncs
- **Checks for new releases** from upstream

### Required Repository Settings:

1. **Labels**: Create these labels in your repository:
   - `upstream-sync` (color: #0075ca)
   - `security` (color: #d73a4a)
   - `maintenance` (color: #fef2c0)

2. **Actions Permissions**:
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

### Testing the Workflow:

After adding the workflow:
1. Go to Actions tab
2. Select "Check Upstream Updates" workflow
3. Click "Run workflow"
4. Select branch and run

The workflow will check for updates and create an issue if the fork is behind upstream.