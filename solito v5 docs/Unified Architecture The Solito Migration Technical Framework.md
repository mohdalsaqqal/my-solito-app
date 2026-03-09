Unified Architecture: The Solito Migration Technical Framework

1. Strategic Foundation: The Monorepo Transition

In a professional architectural context, the transition from standalone repositories to a unified monorepo is not a matter of preference—it is a non-negotiable requirement for scaling. Standalone "single-repo" silos inevitably lead to logic drift, doubled maintenance costs, and a fragmented user experience. Adopting a monorepo structure from day zero, regardless of initial project size, is the only way to ensure the codebase remains "Source-First." This foresight anticipates the inevitable demand for secondary targets, such as admin dashboards, Electron desktop apps, or specialized mobile interfaces, by establishing a centralized engine for business logic.

The framework mandates a strict organizational hierarchy to maintain this "single source of truth":

* apps/ Directory: Contains the platform-specific entry points and configurations.
  * expo/: The native host. It manages the native binary configuration, Expo modules, and the React Navigation or Expo Router entry points.
  * next/: The web host. It leverages Next.js file-based routing and serves as the primary environment for Server Components and SEO optimization.
* packages/ Directory: The core shared source of the ecosystem.
  * packages/app: This is the primary "source folder." It houses the shared features, hooks, and domain logic that both platform hosts consume.
  * packages/ui: (Optional) Reserved for a centralized, platform-agnostic design system.

By treating packages/app as the shared source rather than a mere utility library, the architect ensures that the monorepo functions as a cohesive unit. This high-level structural integrity is the prerequisite for implementing a "Feature-First" organization of the internal code.

2. Feature-Based Code Organization & Component Extraction

A Senior Architect must reject organization by "code-type" (folders like /screens or /hooks) as it obfuscates the relationship between logic and output. We implement a Feature-First Architecture, where the directory structure reflects the application's functionality. The migration involves extracting standalone screens and reimagining them as shared screen components within packages/app/features.

To execute this migration effectively:

* Decouple Navigation: Shared features must be "headless" regarding routing; they should receive navigation callbacks or use universal hooks rather than importing platform-specific routers.
* Extract Shared UI: Move core layout logic to a feature folder (e.g., features/profile/profile-screen.tsx) to serve as the universal UI layer.
* Implement Platform Skeletons: Each platform host provides its own "Skeleton" to wrap these shared features. This is critical for maintaining platform-native behaviors—specifically, enabling standard window scrolling on the web while utilizing native ScrollViews on mobile.

The implementation of shared screens across platforms is detailed below:

Platform	Routing/Shell Implementation	Implementation Detail
Next.js	Next.js App/Pages Router	Uses page.tsx re-exports to host the shared feature; manages window-level scrolling.
Expo	React Navigation / Expo Router	Serves as the navigation host, implementing native stacks/tabs and hosting shared screens within native containers.

This "Skeleton" methodology ensures that the web version does not feel like a compromised mobile port. By maintaining separate shells, we preserve the distinct UX requirements of each platform while sharing the heavy lifting of feature logic.

3. Implementing Platform-Agnostic Interfaces

To maintain portability, complex systems like authentication and data fetching must be abstracted behind platform-agnostic interfaces. This ensures the core UI remains focused on the user experience while the underlying implementation is swapped at build time.

The primary mechanism for this is the Platform Extension strategy. Architecturally, we follow a "Web-First" naming convention: use index.tsx for web and index.native.tsx for native. This is a critical technical nuance; most web bundlers do not recognize .web.tsx without significant configuration debt, whereas native bundlers are designed to prioritize the .native suffix.

For an Auth Provider, the shared interface lives in the app package:

* Web Implementation (index.tsx): Utilizes standard browser cookies or session headers, often acting as a "no-op" for token management.
* Native Implementation (index.native.tsx): Implements secure storage logic (e.g., via expo-secure-store) to provide tokens for network requests.

Solito 5 facilitates unparalleled data-fetching flexibility. Shared components can be structured to consume data without knowing the source. This allows Next.js to leverage React Server Components (RSC) to suspend with a server-side loading state, while Expo implements a client-side strategy using SWR or React Query to render a local loading state. For UI complexity, we utilize adapters like ZGO, which brings Radix UI primitives to native platforms, ensuring that even complex components like dropdowns maintain a consistent API across the monorepo.

4. Resolving Dependency Hoisting & Module Resolution

Dependency management in a React Native monorepo is traditionally a "resolution nightmare" due to hardcoded relative paths and autolinking requirements. Senior Architects must enforce strict rules for dependency placement to prevent build breakage:

* JavaScript-Only Dependencies: Install in packages/app. These are easily hoisted and shared.
* Native-Heavy Dependencies: Historically, these required installation in apps/expo to satisfy the native linker. However, Expo SDK 54 has fundamentally changed this by supporting the autolinking of transitive dependencies. This allows native-linked libraries to be installed directly within the shared app package, significantly reducing package.json maintenance overhead.
* Syncpack for Version Parity: The use of Syncpack is non-negotiable. Mismatched versions of low-level libraries—specifically React, Expo, or React Navigation—are the primary cause of build failures. Syncpack enforces centralized versioning across all packages, ensuring the entire monorepo remains in sync.

The goal is to move dependency management from a manual, error-prone task to an automated, rule-based operation, allowing the team to focus on the UI and styling layer.

5. UI Layer & Performance-First Styling

The selection of a styling solution is a performance-critical decision. In a professional application, styling logic must not be a bottleneck. Solito 5 advocates for a "Web-First" philosophy: if a library is native-only, mock it on the web with an index.tsx that does nothing rather than fighting the bundler.

Current high-performance options for the Solito framework include:

* Uniwind / Uni Styles: These are the gold standard for performance because they utilize C++ Nitro modules. By moving styling logic out of the JavaScript runtime and into a native C++ layer, they bypass the typical overhead associated with React context and JS-based style calculations.
* React Strict DOM: This brings web APIs to native. However, architects must be aware of the current "gotchas": it requires Stylex, supports only the RN Animated API, and currently lacks 120fps support on native (though PRs are in progress via Callstack to address this).

The "So What?" of performance styling is cumulative. In a production-grade application with thousands of rendered components, every millisecond spent in the JS runtime on styling logic accumulates into "jank" and dropped frames. By utilizing Nitro-powered modules or efficient web-to-native translations, we ensure that the unified architecture delivers a 60fps (or 120fps) experience on mobile without compromising the flexibility of a modern Next.js web application. This framework grants total control, ensuring that "shared code" never equates to "compromised quality."
