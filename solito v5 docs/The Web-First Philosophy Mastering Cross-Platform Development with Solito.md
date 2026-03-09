The Web-First Philosophy: Mastering Cross-Platform Development with Solito

1. The Paradigm Shift: From 'Native-First' to 'Web-First'

For years, cross-platform development was haunted by the "Native-First" ghost—the practice of building a mobile experience and forcefully porting it to the browser. This approach inevitably resulted in "uncanny" web experiences that violated fundamental browser heuristics. When you force mobile-style navigation stacks or fixed-height containers onto the web, you break scroll-chaining, ruin URL state management, and ignore the SEO advantages of a true document-based architecture.

The Web-First philosophy, codified in Solito 5, treats the web as a first-class citizen rather than a secondary build target. This architectural shift recognizes that the web has unique strengths: standard window scrolling, responsive layouts, and deep-linking capabilities that mobile apps often lack. By prioritizing "pure" web elements—specifically utilizing Next.js APIs rather than middle-ground abstractions like React Native Web for core components—we ensure the end-product feels native to the browser while maintaining a shared logic core for mobile.

Feature	Traditional "Native-First" Approach	Web-First Philosophy (Solito)
Navigation	Forces mobile stacks/tabs onto the web, breaking back-button behavior.	Employs Next.js routing for web and React Navigation for native mobile.
Scrolling	Uses fixed-height ScrollView containers, breaking window scroll heuristics.	Prioritizes standard browser window scrolling for performance and accessibility.
Core Components	Relies on React Native Web views for everything, sacrificing SEO/UX.	Uses best-in-class Next.js primitives (like next/link) on the web.
Philosophy	The web is a "port" of a mobile app.	Web is the architectural baseline; native is a specific implementation.

While this shift in mindset provides the strategic foundation, the technical execution relies on how we handle platform-specific code at the bundler level.


--------------------------------------------------------------------------------


2. The Mechanics of Platform Extensions (.native.tsx)

To maintain a web-first architecture without leaking mobile code into the browser, Solito leverages a sophisticated file-suffix system. Unlike older approaches that required .web.tsx suffixes, Solito 5 adopts a cleaner convention where the standard index.tsx is the web version by default.

* index.tsx: The primary implementation. Web bundlers (Next.js/Webpack/Turbo) prioritize this file and are entirely unaware of mobile-specific suffixes.
* index.native.tsx: The mobile implementation. The native bundler (Metro) is configured to prioritize the .native suffix over the standard file.

The "Bundler Benefit" and Tree-Shaking

This is essentially a zero-configuration approach for web performance. Because Webpack and Turbo ignore the .native extension, native-only dependencies (which often include heavy binaries or C++ code) are never included in the web bundle. This ensures aggressive tree-shaking and prevents "leaking" native modules into the browser, which would otherwise cause runtime crashes or bloated bundle sizes.

Code Structure Visualization:

* features/profile/
  * screen.tsx (Targeted by Webpack/Turbo for Web)
  * screen.native.tsx (Targeted by Metro for iOS/Android)
  * logic.ts (Shared business logic used by both implementations)

These file extensions serve as the architectural bridge, allowing us to build shared interfaces that hide unique, high-performance implementations under a single import.


--------------------------------------------------------------------------------


3. Shared Interfaces vs. Unique Implementations

A common architectural trap in cross-platform development is trying to share the "Shell." Solito avoids this by distinguishing between the Shell (the navigation and routing container) and the Screen (the UI content). In a Solito project, the Shell is always platform-specific, while the Screens live in a shared directory (typically packages/app).

Consider the Link Component:

* On Web: Solito renders a standard next/link. This ensures proper <a> tag generation, SEO indexing, and hover prefetching.
* On Native: Solito wraps React Navigation’s useLinkTo hook, providing the high-fidelity transition users expect from a mobile app.

This pattern extends to complex features like Auth Providers. You define one shared interface, but the web version handles cookies/sessions via Next.js, while the native version interacts with secure device storage or "Shadow Nodes" via Expo modules.

The Unopinionated Principle Solito functions as a thin, unopinionated bridge. It doesn’t force a "middle-ground" router. Instead, it empowers you to use the most powerful tools available: Next.js APIs for the web’s document-based nature and React Navigation (or Expo Router) for the mobile stack.

While the monorepo provides the structural container, the developer's strategy for choosing frameworks within that container dictates the project's ultimate success.


--------------------------------------------------------------------------------


4. The Monorepo Blueprint for Solito 5

Managing shared code requires a robust Monorepo structure. This acts as the "source of truth," coordinating dependency resolution across different environments.

Directory Hierarchy:

* apps/next/: The Next.js host. Manages the web shell, SSR, and routing.
* apps/expo/: The Expo/React Native host. Manages native binaries, splash screens, and the native navigation shell.
* packages/app/: The core repository for shared features, providers, and UI components.

Dependency Resolution and Expo SDK 54

Historically, the greatest "pain point" in monorepos was transitive dependencies. If a shared package in packages/app required a native module, you were forced to manually install that module in apps/expo to trigger autolinking.

With Expo SDK 54, this is resolved. Autolinking now correctly identifies transitive native dependencies within the monorepo. As a Senior Architect, I recommend using tools like Syncpack to manage dependency hoisting and avoid the "duplicate version" trap—especially for low-level libraries like React or Expo, where version mismatches can cause catastrophic runtime failures.

Proper structural choices empower the developer to build a foundation that scales beyond a simple "Hello World" into a professional-grade production app.


--------------------------------------------------------------------------------


5. Strategic Takeaways for the Aspiring Developer

The web-and-native ecosystem has reached peak maturity. We are no longer asking "if" we can share code, but "how" we can share it most performantly.

1. Commit to the Monorepo from Day Zero: Even for single-platform starts, the monorepo architecture prevents a painful migration later. It allows you to add new targets—like admin dashboards or desktop apps—without refactoring your core logic.
2. Practice Defensive Mocking on Web: To keep your web bundle lean, adopt the "no-op" strategy. If a library is native-only, create an index.tsx on the web that serves as a simple mock or no-op, while placing the actual logic in index.native.tsx. This prevents configuration errors and keeps web performance optimal.
3. Choose Best-in-Class over Middle-Ground: Do not settle for "universal" components that perform poorly on both platforms. Use Next.js for its power on the web and Expo for its native fidelity. Solito’s role is to link these giants together, not to replace them with a compromise.

Final Statement: As of Solito 5, the "Step Zero" debate is over. The freedom to build high-scale, professional applications that respect the unique strengths of both the browser and the mobile device is now a reality. The maturity of the tools has finally caught up to the ambition of the architect.
