# Testing Checklist - Dashboard Access & Login Button Fix

## Pre-Testing Setup

### 1. Run the Database Migration
- [ ] Open Supabase SQL Editor
- [ ] Run `migrations/backfill-team-members.sql`
- [ ] Verify migration completed successfully
- [ ] Run verification queries from `migrations/README.md`

### 2. Start Development Server
```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] Navigate to http://localhost:3000

---

## Test Suite 1: Legacy User Dashboard Access

### Test 1.1: Legacy User Login
**Goal**: Verify legacy company owners can now access dashboard

**Steps**:
1. [ ] Open http://localhost:3000/login
2. [ ] Log in with a legacy company owner account
3. [ ] Should redirect to `/company-dashboard`
4. [ ] Dashboard loads without errors
5. [ ] Company name and data displays correctly
6. [ ] No "user is not part of company" error in console

**Expected Result**: ✅ Dashboard loads successfully

**If Failed**: Check that:
- Migration ran successfully
- User's company has `user_id` set in database
- Browser console shows the actual error

---

## Test Suite 2: Login Button State

### Test 2.1: Logged Out State
**Goal**: Verify login button shows correctly when not logged in

**Steps**:
1. [ ] Open http://localhost:3000 (not logged in)
2. [ ] Check navbar in top right corner
3. [ ] Should see "Login" button
4. [ ] Should NOT see "Logout" button

**Expected Result**: ✅ "Login" button visible

### Test 2.2: Logged In State
**Goal**: Verify logout button shows when authenticated

**Steps**:
1. [ ] Log in with any user account
2. [ ] Check navbar in top right corner
3. [ ] Should see "Logout" button with logout icon
4. [ ] Should NOT see "Login" button
5. [ ] Public navigation links should be hidden

**Expected Result**: ✅ "Logout" button visible

### Test 2.3: Logout Functionality
**Goal**: Verify logout works correctly

**Steps**:
1. [ ] While logged in, click "Logout" button
2. [ ] Should redirect to `/login` page
3. [ ] Navbar should now show "Login" button
4. [ ] Trying to visit `/company-dashboard` should redirect to login

**Expected Result**: ✅ User logged out successfully

---

## Test Suite 3: Company Dashboard Features

### Test 3.1: View Opportunities
**Goal**: Verify company opportunities load correctly

**Steps**:
1. [ ] Log in as company owner
2. [ ] Navigate to `/company-dashboard`
3. [ ] Opportunities section displays
4. [ ] Can see existing events (if any)
5. [ ] "Create New Opportunity" button works

**Expected Result**: ✅ Opportunities display correctly

### Test 3.2: View Team Members
**Goal**: Verify team members display correctly

**Steps**:
1. [ ] On company dashboard
2. [ ] Scroll to "Team" section
3. [ ] Should see current user listed
4. [ ] User should have "admin" role
5. [ ] Status should be "accepted"

**Expected Result**: ✅ Team member (owner) displays correctly

### Test 3.3: Create New Event
**Goal**: Verify event creation still works

**Steps**:
1. [ ] Click "Create New Opportunity"
2. [ ] Fill in event details
3. [ ] (Optional) Upload an image
4. [ ] Click "Save" or "Publish"
5. [ ] Event should appear in opportunities list
6. [ ] No errors in console

**Expected Result**: ✅ Event created successfully

---

## Test Suite 4: New User Signup

### Test 4.1: New Company Creation
**Goal**: Verify new users automatically get team member entries

**Steps**:
1. [ ] Create a new user account (or use different email)
2. [ ] Create a new company profile
3. [ ] Should be able to access company dashboard immediately
4. [ ] Check database: `company_team_members` should have entry

**SQL Verification**:
```sql
SELECT * FROM company_team_members
WHERE user_id = 'your-new-user-id';
```

**Expected Result**: ✅ Team member entry created automatically

---

## Test Suite 5: API Endpoints

### Test 5.1: GET /api/companies
**Goal**: Verify company retrieval works

**Steps**:
1. [ ] Log in as company owner
2. [ ] Open browser DevTools → Network tab
3. [ ] Navigate to company dashboard
4. [ ] Check for `/api/companies` request
5. [ ] Should return 200 status
6. [ ] Response includes company data

**Expected Result**: ✅ Company data retrieved successfully

### Test 5.2: GET /api/companies/team
**Goal**: Verify team members retrieval works

**Steps**:
1. [ ] On company dashboard
2. [ ] Check Network tab for `/api/companies/team`
3. [ ] Should return 200 status
4. [ ] Response includes team member(s)

**Expected Result**: ✅ Team members retrieved successfully

### Test 5.3: POST /api/companies/opportunities
**Goal**: Verify event creation endpoint works

**Steps**:
1. [ ] Create a new event via UI
2. [ ] Check Network tab for POST to `/api/companies/opportunities`
3. [ ] Should return 201 status
4. [ ] Response includes created event data

**Expected Result**: ✅ Event creation API works

---

## Test Suite 6: Cross-Browser Testing

### Test 6.1: Chrome
- [ ] Login/logout works
- [ ] Dashboard access works
- [ ] Button states correct

### Test 6.2: Firefox
- [ ] Login/logout works
- [ ] Dashboard access works
- [ ] Button states correct

### Test 6.3: Edge
- [ ] Login/logout works
- [ ] Dashboard access works
- [ ] Button states correct

---

## Test Suite 7: Edge Cases

### Test 7.1: User Without Company
**Goal**: Verify proper error handling

**Steps**:
1. [ ] Create new user
2. [ ] Don't create a company
3. [ ] Try to access `/company-dashboard`
4. [ ] Should show appropriate error or redirect

**Expected Result**: ✅ Graceful error handling

### Test 7.2: Refresh During Session
**Goal**: Verify auth persists across refreshes

**Steps**:
1. [ ] Log in successfully
2. [ ] Refresh the page (F5)
3. [ ] Should stay logged in
4. [ ] Navbar should still show "Logout"

**Expected Result**: ✅ Session persists

### Test 7.3: Multiple Tabs
**Goal**: Verify logout affects all tabs

**Steps**:
1. [ ] Log in
2. [ ] Open same site in new tab
3. [ ] Both tabs should show logged-in state
4. [ ] Log out in one tab
5. [ ] Other tab should update (may need refresh)

**Expected Result**: ✅ Auth state synchronized

---

## Issue Tracking

### Issues Found

| Test ID | Issue Description | Severity | Status |
|---------|------------------|----------|---------|
| | | | |

### Notes
```
Add any additional notes or observations here during testing
```

---

## Final Verification

After all tests pass:
- [ ] No console errors on any page
- [ ] All legacy users can access dashboard
- [ ] All new users can create companies and access dashboard
- [ ] Login button shows correct state in all scenarios
- [ ] All API endpoints return expected responses
- [ ] Team member table has correct entries

---

## Sign-Off

**Tested By**: _________________
**Date**: _________________
**Environment**: Test/Development
**Overall Status**: ⬜ Pass | ⬜ Fail | ⬜ Pass with Issues

**Notes**:
```
```
