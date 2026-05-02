# Source-Code Buyout Handoff

Purpose: define what happens if a client buys out a copy of the project source code.

## Principle

The normal platform subscription does not transfer ownership of the reusable platform framework. A source-code buyout is a separate commercial and legal event.

## Included In Buyout Package

- [ ] Client-specific application source snapshot.
- [ ] Client-specific environment variable inventory with secret values transferred through an approved secure channel.
- [ ] Database schema and migration history.
- [ ] Deployment instructions for web and mobile.
- [ ] EAS project/build notes if mobile is included.
- [ ] Adapter configuration notes for backend/payment/search/notifications.
- [ ] CMS content export where contractually included.
- [ ] Known limitations and open technical debt report.

## Excluded Unless Explicitly Agreed

- [ ] Reusable platform roadmap rights.
- [ ] Other clients' adapters, content, data, or configuration.
- [ ] Internal operator tooling not required to run the client app.
- [ ] Historical agent memory or private operator notes.
- [ ] Third-party accounts or licenses owned by the platform operator.

## Handoff Process

1. Freeze scope and select handoff date.
2. Create clean source snapshot.
3. Remove unrelated local/generated artifacts.
4. Verify build and smoke commands on the snapshot.
5. Export database/content according to the agreement.
6. Transfer secrets through secure channel.
7. Provide deployment handoff session.
8. Confirm recipient can run the app.
9. Revoke platform-owned credentials if the client is moving away.

## Verification Before Delivery

```bash
yarn verify:delivery:functional
```

Additional checks depend on the handoff scope:

- Production build.
- EAS preview/production build.
- Database migration dry run.
- Adapter smoke tests.

## Post-Handoff Support

- Support duration and response targets must be defined in the buyout agreement.
- New feature work after handoff is a separate scope unless the agreement says otherwise.
