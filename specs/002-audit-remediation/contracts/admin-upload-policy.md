# Contract: Administrative Upload Policy

## Purpose

Define the accepted asset policy for admin upload routes that store files on the same origin as the storefront.

## Contract

- Only policy-approved image formats are accepted.
- Unsafe same-origin asset types are rejected consistently.
- Upload size limits are enforced before persistence.
- Successful uploads return normalized metadata needed by the admin UI.

## Required Outcomes

| Scenario | Expected Outcome |
|----------|------------------|
| Allowed image within size limits | File is stored and a success payload is returned |
| Disallowed file type | Request is rejected with a type-policy response |
| Empty or oversized file | Request is rejected with a validation response |
| Unauthorized admin request | Request is rejected before file processing begins |

## Notes

- This contract covers the remediated endpoints for site branding, CMS blocks, and offer-banner uploads.
- Future support for broader file types requires an explicit storage and serving model review.
