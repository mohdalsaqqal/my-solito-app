Architectural Implementation Strategy: Solito 5 Cross-Platform Framework

1. Strategic Foundation: The Monorepo and Solito Philosophy

As a Lead Architect, the mandate for cross-platform success relies on a thin wrapper strategy. Solito 5 serves as the critical orchestration layer between Next.js and React Navigation (or Expo Router). The strategic necessity of a monorepo cannot be overstated; it is not merely about code sharing, but about target isolation. By maintaining distinct entry points for apps/next and apps/expo, we ensure that the web application remains unencumbered by mobile-specific logic, allowing for aggressive tree-shaking and optimized performance across multiple targets, including Admin Apps and Electron deployments.

The transition to a Web-first mindset is the most significant evolution in Solito 5. We must reject the historical "React Native-first" configuration burden that forced web bundlers to interpret complex native files. The architectural mandate is now clear: all shared libraries must be web-first by default. This requires a "Call to Action" for all developers: even if a library does not support web, it must include an index.tsx that acts as a mock (doing nothing) to prevent bundler errors. This ensures Next.js resolves files with zero additional configuration, while the Metro bundler handles the native implementation via the .native.tsx suffix.

Core Monorepo Structure

* apps/next: The Next.js web application entry point (Web-first).
* apps/expo: The Expo/React Native mobile entry point.
* packages/app: The primary workspace containing the "source" for the entire system.

Strategic Advantages of the Monorepo Approach

* Target Isolation: Prevents the web app from being bloated by mobile-heavy logic through strict boundary management.
* Unified Business Logic: Centralizes data fetching and state management in packages/app, ensuring a single source of truth.
* Scalability: Provides a blueprint for adding secondary targets (e.g., desktop via Electron) without duplicating core feature sets.
* Reduced Configuration: Leverages Next.js native capabilities while letting Solito handle the adapter logic for mobile transitions.


--------------------------------------------------------------------------------


2. Logical Hierarchy: Feature-Based vs. Type-Based Organization

The organization of the shared codebase must shift from a technical "Type-based" approach to a functional "Output-oriented" hierarchy. In high-scale systems, the packages/app directory should not be viewed as a mere "UI Kit" or a collection of "dumb components." It is the source folder of the application. Organizing code by functionality rather than file type (e.g., screens, hooks, components) is superior for maintaining developer velocity and ensuring that cross-platform logic remains discoverable and cohesive.

By adopting Feature-Based Organization, we eliminate the friction of context switching. When an architect or developer works on a specific module, such as a user profile, all relevant UI, logic, and hooks are localized. This structure explicitly debunks the idea that shared packages should only contain "dumb" UI; instead, it houses the intelligent, platform-agnostic heart of the application.

Comparison: Organization Methodologies

Feature	Type-Based Organization	Feature-Based Organization
Primary Structure	Folders like /screens, /hooks, /components	Folders like /features/home, /features/user
Logic Location	Dispersed; hooks are separated from UI.	Localized; logic lives with the feature.
Discoverability	Low; requires searching multiple directories.	High; features are self-contained modules.
Architectural Role	Often treated as a "UI Kit" only.	The "Source Folder" for all app logic.
Developer Velocity	Slower due to constant context switching.	Faster; reduces cognitive load during iteration.

Feature Directory Blueprint

* features/profile/screen.tsx (The main shared screen)
* features/profile/components/ (Feature-specific UI elements)
* features/profile/hooks/ (Feature-specific business logic)


--------------------------------------------------------------------------------


3. Navigation Architecture: Bridging Next.js and React Navigation

The Platform-Specific Shell pattern is the only way to avoid the catastrophic Native-on-Web anti-patterns that plague modern cross-platform development. We must avoid forcing mobile primitives onto the web environment, which leads to "scroll-view hijacking" (where a ScrollView fails to use native window scrolling) and the infamous 100vh layout bugs. Instead, each platform must implement its own navigation skeleton. Next.js uses its robust File-Based Router, while Expo utilizes React Navigation or Expo Router.

Solito/link provides the necessary abstraction to bridge these routers without compromising platform integrity. On the web, it renders a pure Next.js link component with zero additional overhead. On native, it hooks into React Navigation’s useLink2. This ensures that web users experience standard browser behaviors—like proper URL handling and window scrolling—while mobile users receive native transitions and gestures.

Implementation Mandates for Navigation

* Shared Screens: Build UI in packages/app/features. These screens are then re-exported into their respective platform entry points.
* Next.js Export: Import the shared feature and export it as a default component in apps/next/app/[feature]/page.tsx.
* Expo/Native Export: Register the shared feature within the native navigation stack in apps/expo/app/_layout.tsx.
* Dynamic Routing: Use Next.js dynamic routing patterns on the web and link them to native dynamic routes using the Solito API, ensuring the routing "meat" is shared even if the "skeleton" is unique.


--------------------------------------------------------------------------------


4. Provider Strategy and State Management

A unified Root Provider in packages/app/provider is essential for injecting global state, themes, and authentication across all platforms. This pattern simplifies state management by providing a single point of entry for high-level providers like Dripsy, Zego, or Uniwind.

Our strategy for authentication and business logic must prioritize Conditional Rendering over platform-heavy redirects. By using a Shared Interface pattern, we define a unified hook (e.g., useAuth) that the feature code consumes. The implementation of this hook varies by platform: on mobile, it might manage session tokens, while on web, it behaves as a noop because the browser handles sessions automatically via cookies. This "Master Architect" approach ensures that the business logic remains platform-agnostic while respecting the underlying technical reality of the environment.

Strategic Implementation Patterns

* The Auth Masterclass: Use a useAuthToken hook that actively manages tokens for apps/expo but serves as a noop on apps/next, allowing the web's native cookie handling to take precedence.
* Platform Extensions: Strictly utilize the .native.tsx and .tsx suffix strategy for any dependency that lacks a unified cross-platform API.
* Styling Consistency: When choosing a UI layer, evaluate performance-heavy libraries against newer, low-level runtimes like Uniwind, which utilizes a C++ Nitro module for native performance while maintaining Tailwind compatibility on the web.


--------------------------------------------------------------------------------


5. Dependency Management and Platform Entry Points

Managing a cross-platform monorepo requires rigorous version control and a deep understanding of native autolinking. We must differentiate between pure JS libraries and those containing Native C++, Swift, or Java components. While the Expo SDK 54 update has introduced improvements to transitive dependency resolution, we must exercise architectural caution. Native autolinking in SDK 54 works well in isolation but can still present challenges in complex, high-scale monorepos.

To prevent runtime crashes and bundler errors, we must strictly enforce dependency placement and version alignment. Using tools like Syncpack is an architectural requirement to ensure that low-level libraries—specifically React, Expo, and core native modules—remain synchronized across all packages in the monorepo.

Dependency Management Checklist

* JS-Only Dependencies: Install in packages/app for broad consumption.
* Native-Based Dependencies: Install in apps/expo to ensure proper autolinking, unless the environment is fully verified for SDK 54 transitive linking in packages/app.
* Version Synchronization: Integrate Syncpack into the CI/CD workflow to prevent duplicate versions of React or Expo from causing build failures.
* Web-First Entry Points: Ensure every shared library has an index.tsx (web-first) and an index.native.tsx (native override) to prevent the web bundler from attempting to resolve native-only code.

This strategy provides the mature, scalable blueprint required for modern cross-platform systems, ensuring that we never compromise on the user experience of the web or the performance of the native application.
