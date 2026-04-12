# Contract: Protected Mutation Policy

## Purpose

Define the behavioral contract for customer and admin routes that both mutate state and rely on cookie-backed authentication.

## Contract

- Protected mutation routes require a valid authenticated session.
- Protected mutation routes require a trusted request context for browser-driven requests.
- Rejection happens before business logic changes application state.
- Machine-to-machine integrations are explicitly exempted and use route-specific verification instead.

## Required Outcomes

| Scenario | Expected Outcome |
|----------|------------------|
| Missing or invalid session | Request is rejected with an authentication failure response |
| Trusted same-origin authenticated request | Request proceeds normally |
| Cross-site or untrusted authenticated browser request | Request is rejected with a request-validation failure response |
| Verified webhook or other explicit exemption | Request proceeds through route-specific validation rules |

## Notes

- This contract applies to JSON and multipart routes within the remediation scope.
- Public read routes and non-mutating requests are out of scope unless they currently rely on mutation-like behavior.
