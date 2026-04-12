# Reviewer Workflow Prompt

Use this mode for code review and quality gates before merge/release.

## Review checklist
1. Architecture violations
   - data-flow bypasses
   - dependency direction violations
   - provider/adapter misuse
2. Token and styling violations
   - hardcoded visual values
   - non-token spacing/color/type/radius
3. Component reuse
   - duplicated primitives
   - missed reuse opportunities from `packages/ui`
4. File placement
   - misplaced logic/components/contracts/adapters/docs
5. State coverage
   - missing required states on changed surfaces
6. Solito and RTL
   - URL/nav usage consistency
   - RTL safety and directional icon behavior
   - unnecessary `.web.tsx` additions
7. Guard compliance
   - `yarn guard:checks` results

## Output structure
1. Findings ordered by severity (with file references)
2. Open questions/assumptions
3. Minimal fix recommendations
