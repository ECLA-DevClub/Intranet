# Security Audit Report — Intranet Project

| Parameter          | Value                                                            |
|--------------------|------------------------------------------------------------------|
| Document ID        | SA-2026-001   e2d4356                                            |
| Date               | 2026-03-25                                                       |
| Project            | Intranet (Corporate Portal)                                      |
| Technology Stack   | Django 6, Wagtail 7.3rc1, Next.js 16, PostgreSQL 16, Nginx, Docker |
| Audit Scope        | Full-stack: backend, frontend, infrastructure, CI/CD             |
| Auditor            | Automated Security Review                                        |
| Classification     | Internal / Confidential                                          |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [STRIDE Threat Model](#2-stride-threat-model)
3. [Critical Findings](#3-critical-findings)
4. [High Severity Findings](#4-high-severity-findings)
5. [Medium Severity Findings](#5-medium-severity-findings)
6. [Low Severity and Informational Findings](#6-low-severity-and-informational-findings)
7. [Positive Findings](#7-positive-findings)
8. [Remediation Plan](#8-remediation-plan)

---

## 1. Executive Summary

A comprehensive security audit was conducted on the Intranet project covering all application layers: Django REST API backend, Next.js frontend, Nginx reverse proxy, Docker orchestration, and CI/CD pipeline.

**28 security findings** were identified:

| Severity | Count |
|----------|-------|
| Critical | 8     |
| High     | 7     |
| Medium   | 5     |
| Low      | 8     |

The most severe issues are **broken access control** on two API endpoints (`DepartmentViewSet`, `EmployeeViewSet`), which allow any authenticated user to perform administrative operations. These require immediate remediation.

---

## 2. STRIDE Threat Model

| Threat Category         | Risk Level | Summary                                                   |
|-------------------------|------------|-----------------------------------------------------------|
| Spoofing                | Critical   | Hardcoded credentials, insecure default passwords         |
| Tampering               | Critical   | Broken RBAC on 2 endpoints, no file upload validation     |
| Repudiation             | Medium     | Audit logging present but lacks structure and IP tracking  |
| Information Disclosure  | Critical   | Database file in repository, JWT in localStorage, CORS *  |
| Denial of Service       | Critical   | No rate limiting on any endpoint                          |
| Elevation of Privilege  | Critical   | Any authenticated user can manage departments & employees |

---

## 3. Critical Findings

### 3.1 Broken Access Control — DepartmentViewSet

- **Severity:** Critical
- **CVSS Estimate:** 8.8
- **File:** `intranet_backend/departments/views.py`, lines 28–31
- **CWE:** CWE-862 (Missing Authorization)

**Description:** The `get_permissions` method returns `IsAuthenticated()` for all actions including `create`, `destroy`, `update`, and `partial_update`. The `IsManagerOrAdmin` permission class is defined but unreachable due to the condition covering all action names.

**Current code:**

```python
def get_permissions(self):
    if self.action in ("list", "retrieve", "create", "destroy", "update", "partial_update"):
        return [IsAuthenticated()]
    return [IsManagerOrAdmin()]  # unreachable
```

**Impact:** Any authenticated user with the `employee` role can create, modify, and delete departments.

**Recommendation:** Restrict write operations to `IsManagerOrAdmin`:

```python
def get_permissions(self):
    if self.action in ("list", "retrieve"):
        return [IsAuthenticated()]
    return [IsManagerOrAdmin()]
```

---

### 3.2 Broken Access Control — EmployeeViewSet

- **Severity:** Critical
- **CVSS Estimate:** 9.1
- **File:** `intranet_backend/employees/views.py`, lines 10–14
- **CWE:** CWE-862 (Missing Authorization)

**Description:** `EmployeeViewSet` does not define `permission_classes`. It inherits the global default `IsAuthenticated` from `REST_FRAMEWORK` settings. Any authenticated user can perform all CRUD operations on employees, which also triggers automatic `User` account creation via `perform_create`.

**Impact:** Privilege escalation — an employee-role user can create new users with admin roles.

**Recommendation:** Add explicit permission class:

```python
class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
```

---

### 3.3 Hardcoded Default Password in Employee Creation

- **Severity:** Critical
- **CVSS Estimate:** 8.1
- **File:** `intranet_backend/employees/views.py`, line 43
- **CWE:** CWE-798 (Use of Hard-coded Credentials)

**Description:** When creating an employee without specifying a password, the system creates a `User` account with the hardcoded password `"password123"`.

```python
final_password = password if password else "password123"
```

**Impact:** All user accounts created without explicit passwords use a predictable credential, enabling credential stuffing attacks.

**Recommendation:** Generate a cryptographically secure random password using `django.utils.crypto.get_random_string()` and enforce a password change on first login.

---

### 3.4 Hardcoded Admin Credentials

- **Severity:** Critical
- **CVSS Estimate:** 9.0
- **File:** `intranet_backend/setup_admin.py`, lines 12–14
- **CWE:** CWE-798 (Use of Hard-coded Credentials)

**Description:** The `setup_admin.py` script creates or resets a superuser account with `username="admin"` and `password="admin"`. This file is committed to the repository.

**Impact:** Known credentials for administrative access. Any person with repository access can authenticate as the superuser.

**Recommendation:** Read credentials from environment variables. Remove hardcoded values from the script.

---

### 3.5 CORS Allow All Origins in Base Settings

- **Severity:** Critical
- **CVSS Estimate:** 7.5
- **File:** `intranet_backend/intranet_backend/settings/base.py`, lines 115–116
- **CWE:** CWE-942 (Overly Permissive CORS Policy)

**Description:** The base settings file sets:

```python
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
```

Since `base.py` is inherited by all environment settings (including production), this configuration permits any origin to make authenticated cross-origin requests.

**Impact:** Any malicious website can make authenticated API requests on behalf of a logged-in user.

**Recommendation:** Remove `CORS_ALLOW_ALL_ORIGINS` from `base.py`. Set it only in `dev.py`. In `production.py`, define explicit allowed origins via `CORS_ALLOWED_ORIGINS`.

---

### 3.6 Database File Committed to Repository

- **Severity:** Critical
- **CVSS Estimate:** 7.5
- **File:** `intranet_backend/db.sqlite3` (1,028,096 bytes)
- **CWE:** CWE-200 (Exposure of Sensitive Information)

**Description:** A SQLite database file is tracked by git. The `.gitignore` file does not exclude `*.sqlite3` patterns. The `.dockerignore` correctly excludes it, but this does not prevent git from tracking the file.

**Impact:** User credentials (hashed passwords), PII, and business data are exposed to all repository contributors and in git history.

**Recommendation:**
1. Add `*.sqlite3` to `.gitignore`.
2. Remove the file from tracking: `git rm --cached intranet_backend/db.sqlite3`.
3. Consider using `git filter-branch` or `BFG Repo-Cleaner` to purge from git history.

---

### 3.7 No Rate Limiting

- **Severity:** Critical
- **CVSS Estimate:** 7.5
- **File:** `intranet_backend/intranet_backend/settings/base.py` (REST_FRAMEWORK config)
- **CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Description:** No throttling or rate limiting is configured on any endpoint. The login endpoint (`/api/auth/login/`) is directly exposed without brute-force protection.

**Impact:** Attackers can perform unlimited login attempts, password spraying, and API abuse.

**Recommendation:** Add DRF throttling:

```python
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "20/minute",
        "user": "100/minute",
    },
}
```

---

### 3.8 JWT Tokens Stored in localStorage

- **Severity:** Critical
- **CVSS Estimate:** 7.1
- **File:** `intranet-frontend/lib/auth.ts`, lines 22–36
- **CWE:** CWE-922 (Insecure Storage of Sensitive Information)

**Description:** Both access and refresh tokens are stored in `window.localStorage`. Any XSS vulnerability in the application would allow an attacker to exfiltrate these tokens.

**Impact:** Complete account takeover via token theft if any XSS vulnerability exists.

**Recommendation:** Store the refresh token in an `httpOnly` secure cookie (requires backend support). Retain the access token in JavaScript memory only (not persisted to storage).

---

## 4. High Severity Findings

### 4.1 Insecure Fallback SECRET_KEY

- **Severity:** High
- **File:** `intranet_backend/intranet_backend/settings/base.py`, lines 31–35
- **CWE:** CWE-321 (Use of Hard-coded Cryptographic Key)

**Description:** If the `SECRET_KEY` environment variable is not set and `DEBUG` is not explicitly `"false"`, the application uses a hardcoded fallback value `"django-insecure-fallback-for-dev-only"`. Since `DEBUG` defaults to `True`, this fallback activates in any unconfigured environment.

**Recommendation:** Remove the fallback entirely. Require `SECRET_KEY` as a mandatory environment variable in all environments.

---

### 4.2 ALLOWED_HOSTS Defaults to Wildcard

- **Severity:** High
- **File:** `intranet_backend/intranet_backend/settings/base.py`, line 40
- **CWE:** CWE-183 (Permissive List of Allowed Inputs)

**Description:**

```python
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")
```

If the environment variable is not set, the application accepts requests for any hostname.

**Recommendation:** Default to an empty list and require explicit configuration.

---

### 4.3 DEBUG Enabled by Default in Docker

- **Severity:** High
- **File:** `docker-compose.yml`, line 26
- **CWE:** CWE-489 (Active Debug Code)

**Description:** The `DEBUG` environment variable defaults to `True`:

```yaml
- DEBUG=${DEBUG:-True}
```

**Recommendation:** Default to `False`. Developers should explicitly enable debug mode in their local `.env` file.

---

### 4.4 Hardcoded PostgreSQL Credentials

- **Severity:** High
- **File:** `docker-compose.yml`, lines 7–9
- **CWE:** CWE-798 (Use of Hard-coded Credentials)

**Description:** Database credentials are hardcoded:

```yaml
- POSTGRES_DB=postgres
- POSTGRES_USER=postgres
- POSTGRES_PASSWORD=postgres
```

**Recommendation:** Reference all credentials from a `.env` file. Ensure `.env` is in `.gitignore`.

---

### 4.5 No File Upload Validation

- **Severity:** High
- **File:** `intranet_backend/documents/models.py`, line 10
- **CWE:** CWE-434 (Unrestricted Upload of File with Dangerous Type)

**Description:** The `Document` and `DocumentVersion` models use `FileField` without any validation for file extension, MIME type, or file content. The Wagtail documents module defines allowed extensions, but the custom REST API document upload bypasses this.

**Recommendation:** Add `FileExtensionValidator` to the model field and implement MIME type verification in the serializer.

---

### 4.6 No Password Validation on Employee-Created Users

- **Severity:** High
- **File:** `intranet_backend/employees/serializers.py`, line 5
- **CWE:** CWE-521 (Weak Password Requirements)

**Description:** The `password` field in `EmployeeSerializer` does not use `validate_password`, unlike the `RegisterSerializer` which correctly applies Django password validators.

**Recommendation:** Add `validators=[validate_password]` to the password field.

---

### 4.7 Production API URL Hardcoded in Frontend

- **Severity:** High
- **File:** `intranet-frontend/lib/api.ts`, line 12
- **CWE:** CWE-200 (Exposure of Sensitive Information)

**Description:** The production backend URL is hardcoded as a fallback:

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://intranet-prodd-production.up.railway.app";
```

**Recommendation:** Require `NEXT_PUBLIC_API_BASE_URL` environment variable. Do not provide a fallback containing production infrastructure details.

---

## 5. Medium Severity Findings

### 5.1 Nginx — No HTTPS/TLS Configuration

- **Severity:** Medium
- **File:** `nginx/default.conf`
- **CWE:** CWE-319 (Cleartext Transmission of Sensitive Information)

**Description:** Nginx listens only on port 80 (HTTP). No TLS termination is configured. No security headers are set (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`).

**Recommendation:** Configure TLS termination, HTTP-to-HTTPS redirect, and add standard security headers.

---

### 5.2 Non-Structured Logging

- **Severity:** Medium
- **File:** `intranet_backend/intranet_backend/settings/base.py`, lines 268–311
- **CWE:** CWE-778 (Insufficient Logging)

**Description:** Logs use plain text format. No correlation ID is generated per request. No integration with structured logging or observability tools.

**Recommendation:** Use `python-json-logger` for structured JSON output. Add correlation-id middleware.

---

### 5.3 Token Blacklist App Not Registered

- **Severity:** Medium
- **File:** `intranet_backend/intranet_backend/settings/base.py`, lines 242–248
- **CWE:** CWE-613 (Insufficient Session Expiration)

**Description:** `SIMPLE_JWT` is configured with `BLACKLIST_AFTER_ROTATION = True`, but `rest_framework_simplejwt.token_blacklist` is not included in `INSTALLED_APPS`. The blacklisting feature is silently disabled.

**Recommendation:** Add `"rest_framework_simplejwt.token_blacklist"` to `INSTALLED_APPS` and run migrations.

---

### 5.4 Release Candidate Dependency in Production

- **Severity:** Medium
- **File:** `intranet_backend/requirements.txt`, line 2
- **CWE:** CWE-1104 (Use of Unmaintained Third-Party Components)

**Description:** `wagtail==7.3rc1` is a release candidate, not a stable release. RC versions may contain unresolved bugs and security issues.

**Recommendation:** Pin to the latest stable Wagtail release.

---

### 5.5 No Pagination on List Endpoints

- **Severity:** Medium
- **File:** `intranet_backend/intranet_backend/settings/base.py` (REST_FRAMEWORK config)
- **CWE:** CWE-770 (Allocation of Resources Without Limits)

**Description:** No default pagination is configured. List endpoints will return all records from the database in a single response.

**Recommendation:** Add default pagination:

```python
"DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
"PAGE_SIZE": 50,
```

---

## 6. Low Severity and Informational Findings

| ID   | Finding                                                           | File / Location                        |
|------|-------------------------------------------------------------------|----------------------------------------|
| 6.1  | No Content-Security-Policy headers configured on frontend         | `next.config.ts` (empty configuration) |
| 6.2  | Gunicorn runs without explicit `--workers` configuration          | `intranet_backend/Dockerfile`, CMD     |
| 6.3  | Audit log does not capture client IP address or User-Agent        | `intranet_backend/audit/models.py`     |
| 6.4  | `Employee.department` is a CharField, not a ForeignKey            | `intranet_backend/employees/models.py` |
| 6.5  | Settings allow override via uncommitted `local.py`                | `dev.py`, `production.py`              |
| 6.6  | No security scanning configured in CI/CD pipeline                 | `.github/` directory                   |
| 6.7  | PostgreSQL port 5432 exposed externally via Docker                | `docker-compose.yml`, line 11          |
| 6.8  | `psycopg2-binary` used instead of production-grade `psycopg2`    | `requirements.txt`, line 11            |

---

## 7. Positive Findings

The following security practices were identified and should be maintained:

| ID  | Finding                                                                      |
|-----|------------------------------------------------------------------------------|
| 7.1 | JWT authentication with short-lived access tokens (30 minutes) and refresh rotation |
| 7.2 | Custom RBAC system with `IsAdmin`, `IsManagerOrAdmin` permission classes     |
| 7.3 | Audit logging for all CRUD operations on tickets and documents               |
| 7.4 | Production settings include HSTS (1 year), `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` |
| 7.5 | Ticket status transitions validated via deterministic `TRANSITION_MAP`       |
| 7.6 | Docker images run as non-root users (`wagtail`, `nextjs`)                    |
| 7.7 | `.dockerignore` properly excludes sensitive files and build artifacts        |
| 7.8 | Password validation on user registration using `validate_password`           |
| 7.9 | `AUTH_PASSWORD_VALIDATORS` configured with 4 standard validators             |
| 7.10| Automated test suite for authentication module (14 test cases)               |

---

## 8. Remediation Plan

### Priority 0 — Immediate (estimated effort: under 1 hour total)

| Item | Finding Ref | Estimated Effort |
|------|-------------|------------------|
| Fix `DepartmentViewSet` permissions | 3.1 | 5 minutes |
| Add permissions to `EmployeeViewSet` | 3.2 | 5 minutes |
| Remove hardcoded passwords (`password123`, `admin/admin`) | 3.3, 3.4 | 15 minutes |
| Move `CORS_ALLOW_ALL_ORIGINS` to `dev.py` only | 3.5 | 5 minutes |
| Remove `db.sqlite3` from git, update `.gitignore` | 3.6 | 5 minutes |

### Priority 1 — Within 1 week

| Item | Finding Ref | Estimated Effort |
|------|-------------|------------------|
| Add rate limiting / throttling | 3.7 | 15 minutes |
| Remove `SECRET_KEY` fallback | 4.1 | 5 minutes |
| Fix `ALLOWED_HOSTS` default | 4.2 | 5 minutes |
| Register `token_blacklist` app | 5.3 | 5 minutes |
| Add file upload validation | 4.5 | 30 minutes |
| Add password validation to `EmployeeSerializer` | 4.6 | 5 minutes |

### Priority 2 — Within 1 month

| Item | Finding Ref | Estimated Effort |
|------|-------------|------------------|
| Migrate JWT storage to httpOnly cookies | 3.8 | 2–4 hours |
| Configure HTTPS/TLS on Nginx | 5.1 | 1 hour |
| Implement structured JSON logging | 5.2 | 1 hour |
| Add default pagination | 5.5 | 15 minutes |
| Upgrade Wagtail to stable release | 5.4 | 30 minutes |
| Change `DEBUG` default to `False` in Docker | 4.3 | 5 minutes |

### Priority 3 — Backlog

| Item | Finding Ref | Estimated Effort |
|------|-------------|------------------|
| Add CSP headers to frontend | 6.1 | 1 hour |
| Configure Gunicorn workers | 6.2 | 15 minutes |
| Add IP/User-Agent to audit logs | 6.3 | 30 minutes |
| Normalize `Employee.department` to ForeignKey | 6.4 | 2 hours |
| Set up CI/CD security scanning | 6.6 | 2 hours |
| Remove external PostgreSQL port exposure | 6.7 | 5 minutes |

---

*End of document.*
