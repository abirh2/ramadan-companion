# Security Policy

## Supported Versions

Currently supported versions of Deen Companion:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Deen Companion seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Email**: Send details to abirh@alumni.upenn.edu with subject line "Security Vulnerability - Deen Companion"
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Response Time**: We aim to respond within 48 hours
- **Updates**: You'll receive updates on the status of your report
- **Disclosure**: We follow coordinated disclosure - please allow us time to fix before public disclosure
- **Credit**: Security researchers will be credited (unless you prefer to remain anonymous)

### Security Best Practices for Users

1. **API Keys**: Never commit your `.env.local` file or expose API keys publicly
2. **Supabase RLS**: Always keep Row Level Security (RLS) policies enabled
3. **Updates**: Keep dependencies updated regularly (`npm update`)
4. **Authentication**: Use strong passwords and enable 2FA on your Supabase account
5. **Review Code**: If forking, review any third-party code before deployment

### Known Security Considerations

- **Supabase Anonymous Key**: The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intentionally public and protected by RLS policies
- **API Rate Limiting**: External APIs (AlAdhan, OpenStreetMap, Geoapify) have rate limits - implement your own rate limiting if needed
- **User Data**: All user data is protected by Supabase Row Level Security - users can only access their own data

## Security Features

- ✅ Row Level Security (RLS) on all user tables
- ✅ HttpOnly cookies for authentication
- ✅ Server-side API key storage (never exposed to client)
- ✅ Environment variable protection (`.env.local` in `.gitignore`)
- ✅ Input validation on all forms
- ✅ HTTPS enforcement in production
- ✅ No third-party tracking or analytics (privacy-first)

## Responsible Disclosure

We believe in responsible disclosure and will work with security researchers to:
1. Verify and reproduce the issue
2. Develop and test a fix
3. Release a security patch
4. Credit the researcher (with permission)
5. Publish a security advisory if appropriate

Thank you for helping keep Deen Companion secure!

