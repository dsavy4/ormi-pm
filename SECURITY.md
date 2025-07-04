# Security Guide - Ormi Property Management

## 🔒 Overview

This document outlines the security measures, best practices, and guidelines for the Ormi Property Management application.

## 🔐 JWT Security

### Secure JWT Secret Generation

**CRITICAL**: Never use default or weak JWT secrets in production.

Generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Requirements:**
- Minimum 64 characters (128 hex characters)
- Cryptographically secure random bytes
- Unique per environment
- Rotated regularly

### JWT Best Practices

1. **Short Expiration**: Use reasonable expiration times (7 days max)
2. **Secure Storage**: Store JWT secrets in environment variables, never in code
3. **Token Validation**: Always validate JWT tokens on protected routes
4. **Blacklisting**: Implement token blacklisting for logout functionality

## 🛡️ Authentication & Authorization

### Password Security

- **Hashing**: Uses bcrypt with salt rounds (minimum 12)
- **Password Requirements**: Minimum 8 characters
- **Rate Limiting**: Login attempts are rate-limited
- **Password Reset**: Secure token-based password reset

### Role-Based Access Control (RBAC)

```
SUPER_ADMIN: Full system access
ADMIN: Landlord account management
MANAGER: Property management within account
TENANT: Limited access to own data
```

## 🔧 Environment Variables

### Required Secrets

**Database:**
```bash
DATABASE_URL="postgresql://user:password@host:port/database"
```

**JWT:**
```bash
JWT_SECRET="your-64-character-secure-random-string"
JWT_EXPIRES_IN="7d"
```

**Stripe:**
```bash
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

**Email:**
```bash
EMAIL_USER="your-email@domain.com"
EMAIL_PASS="your-app-password"
```

### Environment-Specific Configuration

**Development:**
- Use `.env` files (never commit to version control)
- Test with non-production APIs
- Use test Stripe keys

**Production:**
- Use Cloudflare Workers secrets
- Use production Stripe keys
- Enable all security headers

## 🌐 API Security

### Security Headers

- **Helmet.js**: Comprehensive security headers
- **CORS**: Restricted to allowed origins
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Zod schemas for all endpoints

### Database Security

- **Connection Pooling**: Secure connection management
- **Query Parameterization**: Prevents SQL injection
- **Multi-tenancy**: User isolation at database level
- **Audit Logging**: All critical actions logged

## 🚀 Deployment Security

### Cloudflare Workers

**Secret Management:**
```bash
# Set secrets via Wrangler CLI
wrangler secret put JWT_SECRET --env production
wrangler secret put DATABASE_URL --env production
wrangler secret put STRIPE_SECRET_KEY --env production
```

**Environment Variables:**
- Never expose secrets in wrangler.toml
- Use Cloudflare Workers secrets for sensitive data
- Separate environments (production/development)

### CI/CD Security

**GitHub Actions:**
- Use GitHub Secrets for sensitive data
- Separate deployment keys per environment
- Regular secret rotation

## 📋 Security Checklist

### Pre-Deployment

- [ ] Generated secure JWT secret (64+ characters)
- [ ] Updated all default passwords
- [ ] Configured environment-specific secrets
- [ ] Enabled security headers
- [ ] Tested authentication flows
- [ ] Verified rate limiting
- [ ] Checked CORS configuration

### Post-Deployment

- [ ] Verified HTTPS enforcement
- [ ] Tested login/logout functionality
- [ ] Confirmed JWT token validation
- [ ] Checked error handling (no data leakage)
- [ ] Verified database connections
- [ ] Tested Stripe webhook signatures

## 🚨 Incident Response

### Security Vulnerability Reporting

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to: security@ormi.com
3. Include detailed reproduction steps
4. Allow reasonable time for response

### Emergency Response

1. **Identify**: Determine scope and impact
2. **Contain**: Disable affected services if necessary
3. **Eradicate**: Fix underlying vulnerability
4. **Recover**: Restore services securely
5. **Learn**: Document lessons learned

## 🔄 Regular Security Maintenance

### Monthly Tasks

- [ ] Review and rotate JWT secrets
- [ ] Update dependencies with security patches
- [ ] Audit user access and permissions
- [ ] Review API usage logs
- [ ] Check for unauthorized access attempts

### Quarterly Tasks

- [ ] Security audit of codebase
- [ ] Penetration testing
- [ ] Update security documentation
- [ ] Review and update access controls
- [ ] Backup and disaster recovery testing

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)
- [Cloudflare Security Documentation](https://developers.cloudflare.com/workers/platform/security/)
- [Stripe Security Guidelines](https://stripe.com/docs/security)

## 🆘 Security Contacts

- **Security Team**: security@ormi.com
- **Emergency**: security-emergency@ormi.com
- **Bug Bounty**: bounty@ormi.com 