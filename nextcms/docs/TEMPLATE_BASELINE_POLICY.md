# TEMPLATE BASELINE POLICY

**Canonical template root:** `C:\Users\nguye\.openclaw\workspace\nextcms`

This project is the **master baseline template** for all generated websites.

## Rules

1. Any generated website must be **feature-equivalent or better** than this baseline.
2. No generated project may remove core modules from this template unless explicitly approved.
3. Minimum standards inherited from this template:
   - Admin dashboard core tabs
   - Landing configuration system
   - Blog module baseline
   - SEO settings baseline
   - Security baseline settings
   - Build/run/deploy documentation
4. Multi-agent pipeline must run compliance checks against this baseline before release.

## Required Compliance Gates

- Template Compliance Gate (baseline parity)
- Build/Test Gate
- Security/SEO Gate

If any gate fails, workflow must loop back to the previous responsible stage.

## Ownership

This baseline template is versioned in git and acts as source-of-truth for future website kits.
