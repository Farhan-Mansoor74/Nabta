I'll help you create a more robust prompt for Claude Code that focuses on using MCP Supabase in plan mode. Here's an improved version:

Dashboard User Access & Database Schema Fix - Supabase MCP Audit
OBJECTIVE
Fix "user is not part of company" error for existing users and incorrect login button state using Supabase MCP for comprehensive database audit and schema remediation.
CRITICAL CONTEXT
Current Issues

Access Error: Existing user accounts cannot access dashboard - showing "user is not part of company"
UI State Bug: Login button displays "logged in" instead of "sign out" when user is authenticated
Data Integrity: Newly added team members with company roles work correctly, but legacy users are broken

Database Architecture

Tables: organizations, companies, users (and likely junction/relationship tables)
Suspected Issue: Missing or broken foreign key relationships between users and companies
RLS Policies: May be preventing legitimate access due to incorrect associations

IMPLEMENTATION PHASES
PHASE 1: MCP Supabase Deep Audit (PRIMARY FOCUS)
Goal: Comprehensive database schema analysis using Supabase MCP
1.1 Connection & Initial Survey

- Connect to Supabase instance via MCP
- List all tables in the schema
- Identify tables related to: users, organizations, companies, roles, memberships
- Document table counts and recent activity

```

#### 1.2 Schema Structure Analysis
```

For EACH relevant table:

- Extract complete table schema (columns, types, constraints)
- Document all foreign keys and their relationships
- List all indexes
- Capture RLS (Row Level Security) policies
- Note any triggers or functions affecting these tables

```

#### 1.3 Relationship Mapping
```

- Identify the relationship chain: users → ? → companies
- Look for junction tables (e.g., user_companies, company_members, organization_users)
- Document expected vs actual relationship structure
- Find orphaned records (users without company associations)
  1.4 Data Integrity Check
  sql-- Sample queries to run via MCP:
- Count users without company associations
- Identify users who CAN access (newly added) vs. CANNOT (legacy)
- Compare schema between working and broken user records
- Check for NULL foreign keys or missing junction table entries

```

#### 1.5 Permission & Policy Audit
```

- Review RLS policies on users and companies tables
- Identify which policies might block legitimate access
- Check if policies reference fields that are NULL for legacy users
- Document authentication flow requirements
  PHASE 2: Root Cause Diagnosis
  Based on MCP audit findings:
  2.1 Create Diagnosis Report
  markdown- Exact missing relationships identified
- Number of affected users
- Schema gaps preventing proper association
- RLS policies causing access denial
- Comparison: working vs broken user data structures

```

#### 2.2 Generate Migration Plan
```

- Required schema changes (new columns, foreign keys, junction tables)
- RLS policy updates needed
- Data backfill requirements for legacy users
- Rollback strategy if issues occur
  PHASE 3: Schema Remediation
  Only proceed after Phase 1 & 2 complete and plan is approved
  3.1 Create Migration SQL
  sql-- Generate migration scripts for:
- Add missing foreign key constraints
- Create junction tables if needed
- Update RLS policies
- Add indexes for performance
  3.2 Data Backfill Script
  sql-- Write safe UPDATE queries to:
- Associate legacy users with appropriate companies
- Populate missing relationship records
- Validate data integrity after updates
  3.3 Validation Queries
  sql-- Prepare verification queries:
- Check all users now have company associations
- Verify no orphaned records remain
- Test RLS policies with sample user contexts

```

### PHASE 4: Frontend Authentication Fix
#### 4.1 Auth Flow Analysis
```

- Review current authentication code
- Identify where company association is checked
- Find login button state management logic

```

#### 4.2 Implementation
```

- Update auth flow to properly query company associations
- Fix button state: "sign in" → "sign out" when authenticated
- Add proper error handling for missing associations
- Implement loading states during auth checks

```

### PHASE 5: End-to-End Testing
#### 5.1 Test Scenarios
```

- Legacy user login → should access dashboard successfully
- New user signup → should associate with company automatically
- Login button → should show correct state
- RLS policies → should permit legitimate access only

```

#### 5.2 Documentation
```

- Document schema changes made
- Update README with new table relationships
- Add troubleshooting guide for future issues
  EXECUTION STRATEGY
  PLAN MODE FIRST (Current Phase)

DO NOT make any changes yet
Use Supabase MCP to audit and understand the complete picture
Generate comprehensive diagnosis and migration plan
Present findings for review before proceeding

Success Criteria for Plan Mode

Complete schema map of all relevant tables
Identified exact missing relationships
Counted affected users
Generated safe migration SQL (not executed)
Created rollback plan
Documented expected vs actual behavior

Safety Guardrails

Backup: Ensure recent database backup exists before any writes
Staging: Test migrations in staging environment first if available
Transactions: Wrap all data modifications in transactions
Validation: Run read-only validation queries before and after changes
Incremental: Fix one user first, verify, then batch process

DELIVERABLES (Plan Mode)

Audit Report (Markdown document)

Current schema structure
Identified issues and root causes
Affected user count and details

Migration Plan (SQL + explanation)

Schema changes needed
Data backfill strategy
Rollback procedures

Implementation Checklist

Step-by-step execution plan
Testing procedures
Verification queries

Risk Assessment

Potential issues during migration
Mitigation strategies

QUESTIONS TO ANSWER DURING AUDIT

Schema Questions:

Is there a user_companies or similar junction table?
What's the primary key strategy (UUIDs, integers)?
Are there soft deletes or audit columns?

Data Questions:

How many users are affected?
What differentiates working vs broken users in the database?
Are there multiple companies or just one?

Policy Questions:

Which RLS policies are active on relevant tables?
What's the expected authentication flow?
How should company association be verified?

START HERE
Begin with Phase 1.1 - connect to Supabase via MCP and list all tables. Proceed systematically through the audit before proposing any changes.Retry
