Solito 5 Deep Dive: Building Modern Web and Mobile Apps

Executive Summary

Solito 5 represents a significant evolution in cross-platform development, providing a unified framework for integrating React Native with Next.js within a single codebase. Created by Fernando Rojo, Solito acts as a high-level adapter that bridges the gap between mobile navigation (React Navigation) and web routing (Next Router). The core philosophy of Solito 5 is a shift toward a "web-first" approach, where web implementations utilize pure Next.js primitives rather than relying on React Native Web (RNW). This change reduces configuration overhead and improves performance by allowing developers to use platform-native features, such as window scrolling and SEO-friendly links, while maintaining shared logic and components in a monorepo structure.

Key takeaways include:

* Architectural Strategy: The use of a monorepo is essential for scaling, allowing shared features to reside in a common package while platform-specific "skeletons" (Expo for mobile, Next.js for web) implement the UI.
* Technological Shift: Solito 5 moves away from forcing React Native primitives onto the web. On the web, it re-exports Next.js link components and utilizes standard HTML elements, ensuring zero configuration for web bundlers.
* Styling and Performance: Modern styling solutions like Uniwid and Uni Styles are gaining traction due to their high performance and ability to offload work from the JavaScript runtime to C++ via Nitro modules.
* Developer Experience: While Solito offers immense flexibility, it is tailored for mature projects where quality on both web and mobile is a priority, rather than simple "Hello World" prototypes.


--------------------------------------------------------------------------------


1. Core Architecture and Code Organization

Solito is designed to function within a monorepo, typically managed with tools like Turbo Repo. This structure facilitates the sharing of business logic and UI components across different target applications.

1.1 Folder Structure

A standard Solito project is organized into distinct sections:

* packages/app: Contains the bulk of the shared codebase, including "features," components, and hooks.
* apps/expo: The entry point for the native mobile application, utilizing Expo.
* apps/next: The entry point for the web application, utilizing Next.js.

1.2 Feature-Based Development

The recommended approach for organizing code within Solito is by feature rather than by type (e.g., separating screens from hooks).

* Feature Folders: Each feature (e.g., "Home," "User," "Profile") contains its own screen components and logic.
* Shared Screens: Screens are defined once in the shared package and then imported by the platform-specific apps.
* Platform Specificity: Each platform implements its own "shell." For instance, the Next.js app handles the layout and routing via the app directory, while the Expo app manages the stack via React Navigation.


--------------------------------------------------------------------------------


2. Navigation and Routing Mechanisms

The primary technical challenge Solito solves is the reconciliation of disparate routing paradigms.

* The Link Component: Solito provides a unified Link component. On mobile, this calls React Navigation’s useLinkTo hook. On web, it utilizes the native Next.js Link component.
* Adapter Pattern: Solito serves as a "thin wrapper" or adapter. It does not provide its own file-based routing but instead hooks into the existing routing solutions of each platform.
* Compatibility: Solito works seamlessly with Expo Router because Expo Router is built on top of React Navigation. Developers can re-export shared pages from the packages directory into the Expo Router's file structure.


--------------------------------------------------------------------------------


3. Evolution in Solito 5: Web-First Philosophy

A major theme in the transition to Solito 5 is the deprecation of React Native Web (RNW) as the default for web rendering within the framework.

3.1 Removing React Native Web Constraints

Prior versions of Solito attempted to bring native APIs to the web. However, this often resulted in limitations, such as:

* Difficulties with window scrolling vs. ScrollView scrolling.
* Incompatibility with CSS-in-JS solutions like Tailwind or Shaded CNN.
* Increased bundle complexity.

3.2 Implementation Changes

* Pure Next.js Code: Solito 5 renders pure Next.js code on the web. This means using standard div, span, and a tags (via Next.js Link) instead of RNW View or Text components.
* Zero Configuration: By adopting a web-first approach (e.g., using .native.tsx extensions for mobile-specific code and keeping .tsx as the web default), Solito ensures that web bundlers do not require special configurations to ignore native code.


--------------------------------------------------------------------------------


4. Styling and Performance Optimization

Styling remains a complex area for cross-platform apps. The discussion highlights several emerging and established patterns.

Tool	Description	Key Advantage
Uni Styles	A performance-focused styling library for React Native.	Moves heavy styling calculations out of the JS runtime.
Uniwid	A new project integrating Tailwind CSS with native performance.	Uses a C++ native runtime (Nitro module) for high-speed styling on mobile.
React Strict DOM	A Meta project that brings web APIs (DOM-like) to native.	Simplifies cross-platform development by standardizing on web paradigms.

Performance Insight: Traditional React Native styling libraries often suffer because they perform heavy work in the JavaScript runtime at render time. Solutions that utilize native modules (C++) or static styling (like Tailwind-based approaches) are preferred for scaling to thousands of components.


--------------------------------------------------------------------------------


5. Implementation Insights and Best Practices

5.1 Monorepo Management

Fernando Rojo strongly advocates for starting every project with a monorepo, even if only one target platform is planned initially.

* Dependency Hoisting: Most JavaScript-based dependencies can be installed in the root or the shared app package.
* Native Dependencies: Native-specific libraries should ideally be installed in the apps/expo folder to ensure proper auto-linking, though Expo SDK 54 has improved the handling of transitive dependencies.

5.2 Handling Platform Differences (Authentication Example)

When implementing features like authentication, developers should create a shared interface but allow platform-specific implementations:

* Web: May rely on cookies and standard Next.js session management.
* Mobile: May require a useAuthToken hook to manually pass tokens in network requests.
* Conditional Rendering: Instead of complex redirects, use the authentication state to conditionally render different stacks (e.g., an "Auth Stack" vs. a "Main Stack").


--------------------------------------------------------------------------------


6. Community and Future Outlook

Solito is supported by a robust community, including a dedicated Discord and GitHub ecosystem.

* AI Integration: While new versions of libraries can sometimes "confuse" AI models like Cursor or Gemini, Solito 5's smaller surface area and adherence to standard Next.js patterns make it increasingly compatible with AI-assisted development.
* Real-World Application: The framework is used in complex, high-stakes projects like Vzero, an AI-powered app that focuses on a native feel while leveraging React Native logic.
* Competitive Landscape: While other tools like Tanstack Start are emerging, Solito remains a specialized solution for those committed to the Next.js and React Native ecosystem.


--------------------------------------------------------------------------------


7. Significant Quotes

"The big problem with it was that every existing solution like forced too much of your website to be like your native app... the trade-off instead is like just create shared screen components and then each platform implements them themselves." — Fernando Rojo

"Any library you build for React Native should be web-first... even if you don't implement it on web, just mock it on web with an index.tsx that does nothing and then use index.native for native platforms." — Fernando Rojo

"Monorepo has a lot of downsides with React Native... it's definitely better but it's not like on the web where I just don't have these problems. Typically I just install stuff and it just works." — Fernando Rojo
