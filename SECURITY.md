# Security Policy

## Supported Versions

IntelliGov AI is currently in active hackathon development. Security updates are provided for the following versions:

| Version | Supported |
|---|---|
| 1.0.x | ✅ Yes |
| < 1.0 | ❌ No (pre-release / development builds) |

## Reporting a Vulnerability

We take the security of IntelliGov AI seriously, even in its current hackathon-stage build. If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities.
2. Email the maintainers directly (see repository contact details) or use GitHub's private [Security Advisories](../../security/advisories) feature if enabled on this repository.
3. Include as much detail as possible:
   - A description of the vulnerability and its potential impact.
   - Steps to reproduce, including affected endpoint(s) or component(s).
   - Any suggested remediation, if known.

We aim to acknowledge reports within **5 business days** and will keep you updated as we investigate and remediate.

## Responsible Disclosure

We ask that you:

- Give us reasonable time to investigate and address a reported vulnerability before any public disclosure.
- Make a good-faith effort to avoid privacy violations, data destruction, or service disruption while investigating.
- Do not access, modify, or exfiltrate data belonging to others.

We will publicly credit reporters (unless anonymity is requested) once a fix has been released.

## Security Practices in This Repository

Because this is a hackathon-stage build running entirely on **local mock services**, current security practices include:

- **No real credentials in source control** — `.env` files are gitignored, and `.env.example` contains only placeholder values.
- **JWT authentication is currently a stub** (`backend/api/middleware/auth.py`) — any bearer token is accepted in this build. This is explicitly documented and **must not be used in production** until replaced with real IBM App ID OAuth 2.0 integration.
- **No real government or citizen PII is processed** — all citizen data used in demos (e.g., the "Priya Sharma" persona) is synthetic.
- **Local-only data stores** — ChromaDB and the NetworkX Knowledge Graph run entirely locally with no external network exposure by default.
- **CORS is scoped** to local development origins (`localhost:5173`, `localhost:3000`) and should be tightened before any public deployment.

## Production Hardening (Before Real Deployment)

Before deploying IntelliGov AI beyond a local/demo environment, the following must be addressed:

- Replace the JWT stub with **IBM App ID** OAuth 2.0.
- Enforce HTTPS/TLS for all API traffic.
- Apply rate limiting and request validation at the API Gateway layer (IBM API Connect in production).
- Conduct a dependency vulnerability scan (`pip-audit`, `npm audit`) as part of CI.
- Review and restrict CORS origins for production domains only.
- Ensure all real IBM Cloud credentials are managed via a secrets manager, never committed to source control.

Thank you for helping keep IntelliGov AI and its users secure.
