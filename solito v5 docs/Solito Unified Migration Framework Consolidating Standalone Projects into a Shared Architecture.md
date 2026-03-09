Solito Unified Migration Framework: Consolidating Standalone Projects into a Shared Architecture

1. Strategic Rationale: The Solito Paradigm Shift

The traditional approach of maintaining isolated web and mobile codebases is an exercise in architectural debt. Engineering teams are perpetually trapped in the cycle of "building the same thing twice"—synchronizing fragmented state logic, reconciling design discrepancies, and managing disparate API consumption patterns. Shifting to a unified Solito architecture isn’t just about code reuse; it is a fundamental transformation of the developer experience. By centering development on shared features rather than platform silos, we eliminate the operational overhead of dual maintenance.

Under the "Screen-First" philosophy championed by Fernando Rojo, we make a critical architectural distinction: components stay as headless UI, while features are where the shared logic lives. In this paradigm, the platform-specific targets—Next.js for web and Expo for mobile—are treated as mere "skeletons." They act as shells that handle platform primitives like window scrolling versus native stack navigation. This provides a massive competitive advantage: you leverage the full SEO and performance power of Next.js on the web while maintaining high-fidelity, high-performance native apps via React Native.

2. Architectural Foundation: The Monorepo Transition

The "single-repo world" is a scaling dead-end. It fails the moment you need to support additional targets, such as native admin apps, Electron desktops, or specialized TV interfaces. A monorepo architecture utilizing a shared packages directory is the only sustainable path for cross-platform portability.

Reorganizing the Directory Structure

Migrating a legacy project requires shifting from "Code Type" organization to "Feature-Based" output. We utilize the @ alias as a tactical tool to pivot from a single native app to a shared package structure.

Legacy Structure (Code Type)	Unified Structure (Feature-Based)
/src/screens	packages/app/features/[feature-name]/screen.tsx
/src/hooks	packages/app/features/[feature-name]/hooks.tsx
/src/components	packages/app/components
/src/providers	packages/app/provider/index.tsx

The Solito Three-Tier Structure

This framework partitions responsibilities into three logical tiers:

1. apps/expo: The native entry point. Responsible for native navigation mounting, mobile configuration (app.json), and the native "skeleton" implementation.
2. apps/next: The web entry point. Handles file-based routing, SEO metadata, and web-specific optimizations.
3. packages/app: The shared core. This is the primary "source" folder containing features, provider shells, and headless UI.

This separation ensures each platform handles its specific "shell" requirements—like the JavaScript bridge on native or the DOM on web—without contaminating the core business logic.

3. Feature Extraction & Component Unification

The strategic mandate is clear: the packages directory is the primary source of truth. When extracting a feature, such as a User Profile, it must be isolated from platform-specific entry points.

Extracting Screen Components

To move a screen into the shared package:

1. Isolation: Relocate UI and state logic to packages/app/features/profile/screen.tsx.
2. Directive Management: Use the use client directive only where necessary for Next.js App Router compatibility.
3. Default Re-exporting: Next.js requires default exports for pages. In apps/next/app/profile/page.tsx, you should simply import the shared screen and re-export it as a default component.

The "Web-First" Library Philosophy

The "secret" to zero-configuration for web bundlers is a mandatory file-naming convention. Web bundlers are often extension-blind (ignoring .native.tsx), whereas native bundlers (Metro) prioritize platform extensions.

* index.tsx: Must be web-compatible. If a library has no web implementation, this file should contain a functional mock/shim to prevent build failure.
* index.native.tsx: Contains the native-specific implementation.

This ensures that the web bundler resolves the root file instantly without requiring complex transpilation rules for native-only dependencies.

4. Implementing Platform-Agnostic Interfaces

High-value features like Authentication and Data Fetching require specialized implementations to avoid the performance bottlenecks of the JavaScript bridge.

Authentication and Conditional Rendering

Instead of using platform-specific redirects, create a shared interface where the UI remains agnostic.

* Web Pattern: Leverage session cookies (standard browser behavior).
* Mobile Pattern: Use a useAuthToken hook to manually inject tokens into network requests.
* Rendering Strategy: Fernando Rojo prefers conditional rendering over redirects. Use a root AuthProvider to listen for state changes and swap the entire screen stack based on the auth state, ensuring the UI doesn't flicker between platform-specific routing logic.

Data Fetching: Suspense vs. Loading States

Data fetching patterns can vary significantly:

* Next.js: Utilize Server Components for zero-bundle-size data fetching.
* Expo: Use React Query or SWR for client-side state management.
* Implementation Choice: Your shared interface can allow one platform to use Suspense for a seamless loading experience while the other platform renders a manual loading UI. The shared feature component remains indifferent to the data source.

5. Bridging Navigation: The Solito Wrapper

Solito acts as a "thin wrapper" that abstracts the friction between Next.js's file-based routing and React Navigation's dynamic stack.

The Link Component and useLink2

The unified Link component is the bridge. On native, it calls the React Navigation useLink2 hook; on web, it renders a standard Next/Link. This allows a single navigation definition to work across environments.

Platform-Specific Escapes

A unified architecture does not mean every page must be shared. Solito is unopinionated. You can maintain "Web-Only Pages" (e.g., apps/next/app/admin/page.tsx) that are never re-exported to the native app. This allows for rapid web experimentation without bloating the mobile binary.

6. Solving the "Monorepo Nightmare": Dependencies & Resolution

React Native monorepos are notoriously fragile due to hardcoded paths and module resolution conflicts. Moving an app to apps/expo breaks relative paths in Android’s Gradle configuration and CLI search patterns.

Technical Resolution Checklist:

* Gradle Paths: Manually update relative paths in Gradle files. The Android build frequently fails because it searches for node_modules at the project root rather than the monorepo root.
* Transitive Dependencies (Expo SDK 54+): Historically, native dependencies had to live in apps/expo. SDK 54 introduces a critical fix: you can now install native dependencies directly in packages/app. Native autolinking will now find these transitive dependencies, significantly simplifying the monorepo structure.
* Hoisting & Syncpack: Use Syncpack to enforce version consistency. Duplicate versions of low-level dependencies like react, expo, or react-native-reanimated are the primary cause of native build crashes.

7. Unified Styling & UI Infrastructure

Performance at scale is determined by the styling layer. Traditional libraries with high runtime JavaScript overhead are unacceptable for native environments.

Styling Solution Evaluation

Library	Platform Support	Core Benefit
Uniwind / Unistyles	Full	Uses C++ Nitro Modules for near-native performance; avoids JS bridge overhead.
React Strict DOM	Full	Brings web APIs to native. Requires Stylex. Currently addressing 120fps issues in native runtimes.
Dripsy	Full	The original responsive design system for React Native; uses theme-based styling.

The "Web-First" Styling Mandate

Architectural purity demands a "Web-First" styling mandate:

1. Web: Use pure CSS or Tailwind. This ensures zero-runtime overhead and leverages browser native optimizations.
2. Native: Utilize native runtimes (like Nitro modules in Uniwind) to bypass the JavaScript bridge bottleneck.

By choosing styling solutions that minimize runtime work, you ensure that even as the component tree grows to thousands of nodes, the app remains performant. The Solito community has reached a level of maturity where these "Step Zero" infrastructure hurdles are solved, allowing us to build high-scale, truly universal products.
