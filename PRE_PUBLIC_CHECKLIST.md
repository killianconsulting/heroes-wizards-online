# Pre-Public Repository Checklist

**Date**: February 5, 2026  
**Status**: ⚠️ Review Required

This checklist was generated to help you safely make your repository public. Please review and address all items before making the repo public.

---

## ✅ SAFE - No Action Required

### 1. Environment Files
- ✅ `.env.local` is in `.gitignore` and not tracked by git
- ✅ `.env.local.example` contains only placeholder values (safe to commit)
- ✅ All sensitive env vars are properly excluded from version control

### 2. Configuration Files
- ✅ `vercel.json` - Clean, no secrets
- ✅ `jest.config.js` - Clean
- ✅ `next.config.js` - Clean
- ✅ `package.json` - No personal info

### 3. Source Code
- ✅ No hardcoded API keys or secrets found in code
- ✅ All secrets properly loaded from environment variables
- ✅ Cron endpoint properly secured with CRON_SECRET check
- ✅ No personal information in source files

### 4. Git History
- ✅ Author: Bailey Killian (consulting@baileykillian.com) - acceptable for public
- ✅ No `.env.local` or secrets in git history

### 5. Security
- ✅ Service role key only used server-side (cron endpoint)
- ✅ Supabase RLS (Row Level Security) enabled per setup docs
- ✅ Anonymous access properly controlled

---

## ⚠️ REVIEW REQUIRED - Action Items

### 1. **package.json - Change "private" flag**

**Current:**
```json
"private": true
```

**Action:** Change to `false` for public npm package, or remove the line entirely for public repo.

```bash
# Option 1: Remove the line
# Option 2: Change to "private": false
```

**File:** `package.json` line 4

---

### 2. **DOCUMENTATION_UPDATE_SUMMARY.md - Delete or Keep?**

**Status:** Untracked file (not in git yet)

This is a meta-document I created during the documentation update. It documents *what* was changed in the docs, not the project itself.

**Options:**
- **Delete it** - Most likely choice; this was for your reference during the update
- **Keep in separate branch** - For historical record
- **Commit to main** - If you want to show the documentation improvement process

**Recommendation:** Delete it (it's already served its purpose)

```bash
rm DOCUMENTATION_UPDATE_SUMMARY.md
```

---

### 3. **public/images/README.md - Remove question**

**Current last line:**
```
--- do I need this?
```

**Action:** Remove this question - it looks unprofessional in a public repo.

**File:** `public/images/README.md` line 20

---

### 4. **Card Images - Missing Source Files**

**Status:**
- `cards/` folder exists in root but only has 1 file
- `public/cards/` has 47 image files
- Card images appear to be in `public/cards/` (correct location)

**Question:** Is the root `cards/` folder still needed?

**Options:**
- If it's just source files for your reference, add to `.gitignore`
- If it's empty/unused, delete it
- If it contains source artwork, consider if you want to include it in the public repo

**Recommendation:** Check if `cards/` in root is needed. If not, delete it.

---

## 🔒 SECURITY REMINDERS

### Your Current Supabase Credentials (DO NOT COMMIT)

The following are in your `.env.local` (which is safely ignored):

- **Supabase URL:** `https://xkjwllwwnzdkmdcwnjhm.supabase.co`
- **Publishable Key:** `sb_publishable_TzM6rK3NPtH1R8ORUEGu-Q_jLkPB48v`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT)
- **Cron Secret:** `YkmZh4Fijbn5cd4zBh44kZlMeAo4KknT`

### ⚠️ IMPORTANT: Have these keys been shared anywhere?

If you've:
- Shared screenshots with these visible
- Pasted code with these keys
- Committed them (even temporarily) to a private repo that might go public
- Shared via email, Slack, Discord, etc.

**→ ROTATE THE KEYS in Supabase Dashboard before going public!**

### How to rotate keys (if needed):

1. **Supabase Dashboard → Project Settings → API**
2. Generate new anon/publishable key
3. **Database → Roles** - Reset service role password
4. Update your local `.env.local`
5. Update Vercel environment variables

---

## 📝 OPTIONAL IMPROVEMENTS

### 1. Add LICENSE file

**Current:** No license file

**Recommendation:** Add a license to clarify usage rights.

For a fan/non-commercial project, consider:
- **MIT License** - Very permissive, allows commercial use
- **CC BY-NC-SA 4.0** - Attribution required, non-commercial only, share-alike
- **Custom disclaimer** - Since it's a fan project of a commercial game

**Example for fan project:**
```
MIT License with Additional Terms

Copyright (c) 2026 Bailey Killian

Permission is hereby granted, free of charge, to any person obtaining a copy...

ADDITIONAL TERMS:
This is a fan-made, non-commercial project. The game "Heroes & Wizards" 
and all related trademarks belong to Jof Games. This project is not 
affiliated with, endorsed by, or connected to the original creators.
```

---

### 2. Add CONTRIBUTING.md

If you want others to contribute, add guidelines:
- How to set up dev environment
- How to run tests
- Code style preferences
- How to submit PRs

---

### 3. Console.log statements

**Found:** Some console statements in code (normal for development)

**Action:** Consider adding a cleanup script or using a logging library for production.

**Optional:** Replace `console.log` with proper logging library or remove debug logs.

---

### 4. Add GitHub Actions / CI

**Suggestions:**
- Run tests on PR
- Run linter on PR
- Build verification
- Deploy preview to Vercel

---

## 🎯 FINAL CHECKLIST

Before making the repository public:

- [ ] Change `package.json` "private" to `false` (or remove)
- [ ] Delete or move `DOCUMENTATION_UPDATE_SUMMARY.md`
- [ ] Remove "--- do I need this?" from `public/images/README.md`
- [ ] Decide what to do with root `cards/` folder
- [ ] Verify `.env.local` is not tracked: `git status`
- [ ] Double-check no secrets in git history: `git log -p | grep -i "supabase\|secret\|key"`
- [ ] Add LICENSE file (optional but recommended)
- [ ] Add CONTRIBUTING.md (optional)
- [ ] Review README.md for accuracy
- [ ] Commit all pending changes
- [ ] Make repository public
- [ ] Test clone the public repo and verify setup instructions work

---

## 🚀 READY TO GO PUBLIC?

Once all items above are addressed, your repository is ready to be made public!

**Note:** After going public, you cannot easily "undo" it if secrets were exposed. Review carefully!
