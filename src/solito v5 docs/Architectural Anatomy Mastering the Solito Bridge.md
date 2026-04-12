Architectural Anatomy: Mastering the Solito Bridge

1. The Solito Philosophy: High-Level Synthesis

The release of Solito 5 marks a significant architectural shift. Rather than acting as a heavy framework that adds layers of complexity, Solito 5 is defined by what it has removed. It is a "thin wrapper" that emphasizes flexibility over prescription. In previous iterations, the philosophy often leaned toward forcing react-native-web to handle everything. Today, the bridge is cleaner: it allows for a "pure" Next.js experience on the web while maintaining a first-class React Native experience on mobile.

The "So What?": 3 Primary Architectural Benefits

* Avoiding the "Force Native onto Web" Trap: Historically, cross-platform tools tried to make websites mimic mobile app behavior (e.g., forcing mobile-style stack navigation in a browser). Solito 5 allows the web to be "pure web" and the app to be "pure native" while sharing the core UI logic.
* Maintaining Platform-Specific Shells: By keeping the "skeleton" (navigation bars, tabs, and layouts) platform-specific, you avoid the "uncanny valley" where a web app feels like a clunky mobile port.
* Unopinionated Logic Sharing: Solito does not dictate your styling (Tailwind vs. Dripsy) or data-fetching (SWR vs. React Query) patterns. It simply provides the primitives to ensure these tools can talk to the underlying platform routers.

To understand how this synthesis works in practice, we must look at the physical layout of the code: the monorepo blueprint.


--------------------------------------------------------------------------------


2. The Monorepo Blueprint: Directory Breakdown

Solito utilizes a monorepo to manage the ecosystem, ensuring that shared code is isolated from platform-specific entry points.

Directory Path	Platform/Role	Responsibility
apps/next	Web (Next.js)	The Web Optimization Layer. Handles Next.js App Router, Server Components, SEO, and web-specific behaviors like window scrolling.
apps/expo	Mobile (Native)	The Native Entry Point. Manages native navigation stacks (React Navigation), Expo config, and mobile-specific native modules.
packages/app	Shared Workspace	The Source of Truth. Contains all shared "output-oriented" features, shared providers, and core business logic.

"Output-Oriented" Feature Organization

A hallmark of Fernando Rojo’s architecture is organizing code by "feature" rather than "type."

* The Old Way (Type-based): Folders like screens/, hooks/, and components/. This becomes a cognitive burden as projects scale.
* The Solito Way (Output-oriented): Folders like features/home/ or features/profile/. Everything required to produce that specific "output"—the screen, its specific hooks, and its sub-components—lives together. This makes the code portable and easier to navigate.

Inside these features, we find the most critical abstraction: the split between the shared screen and the platform skeleton.


--------------------------------------------------------------------------------


3. The Screen Anatomy: Shared Logic vs. Platform Skeletons

In the Solito model, the "Screen" is the shared content, while the "Skeleton" (or Shell) is the platform-specific wrapper.

Avoiding the "Uncanny Valley" of Scrolling

A major reason for this split is Scrolling Behavior. On mobile, React Navigation often expects a ScrollView inside a container. If you force this onto the web, you end up with "100vh" containers that break standard window scrolling and feel "off" to web users. By separating the Shell, the Next.js app can use standard window scrolling, while the Expo app uses the native ScrollView behavior.

The 3-Step Lifecycle of a Screen

1. Defining the shared component: Build the UI in packages/app/features using React Native primitives (View, Text, Pressable).
2. Web Registration: Import the component into apps/next/app/[route]/page.tsx. Next.js renders this as a standard page.
3. Mobile Registration: Import the component into apps/expo and add it to a React Navigation Stack or Tab Navigator.

Architectural Pattern: Handling Platform Logic (No-Op Mocking)

When dealing with logic like Authentication, don't use platform-based redirects which break the bridge. Instead, use conditional rendering based on state.

* Example: A useAuthToken hook. On Mobile, it retrieves a token from secure storage. On Web, it returns null (a "No-Op") because the session is handled via cookies. The shared screen simply reacts to the presence or absence of that token.


--------------------------------------------------------------------------------


4. The Navigation Adapter: Mapping Web to Mobile

Solito acts as an adapter between Next.js file-based routing and React Navigation’s imperative stack-based routing.

Feature	Web Implementation (Next.js)	Mobile Implementation (Native)	Solito Bridge Primitive
Link Component	next/link	useLink2 (React Navigation)	Link
Routing Pattern	File-based (/profile/page.tsx)	Stack/Tab Navigator	Shared Link API
Behavior	Browser URL navigation	Native Stack Push/Pop	useRouter / useParams

Teacher’s Note: The Web-First Extension Pattern For developers building shared libraries, I advocate for a Web-First Mindset.

1. Create index.tsx as your web implementation (using standard HTML/JS). This ensures the library works in Next.js with zero configuration.
2. Create index.native.tsx for mobile. React Native bundlers (Metro) will automatically prioritize the .native file, while web bundlers will ignore it. This prevents "Native module not found" errors on the web.


--------------------------------------------------------------------------------


5. Step-by-Step: Adding a 'Profile' Screen

To add a new feature, follow this architectural checklist to ensure the bridge is properly implemented.

* Step 1: Create the Feature Directory Create packages/app/features/profile/screen.tsx. Define your UI here.
* Step 2: Define Shared UI Use React Native primitives. Pro-Tip: Ensure your feature uses a default export. Next.js pages require a default export to register routes correctly.
* Step 3: Register the Web Route (Next.js App Router) Create apps/next/app/profile/page.tsx.
* Step 4: Register the Mobile Route In your apps/expo navigation config, add the ProfileScreen to your Stack.Navigator.


--------------------------------------------------------------------------------


6. Dependency Management in the Monorepo

Dependency management has historically been the "nightmare" of React Native development due to Hoisting and Hardcoded Paths.

The Problem: Native Paths

Tools like Gradle (Android) and CocoaPods (iOS) often use relative paths to find binaries (e.g., ../node_modules/react-native/...). In a monorepo, if a dependency is "hoisted" to the root node_modules, these hardcoded paths break.

The Solution: The "Rule of Thumb"

* Pure JS/React Dependencies: (e.g., lodash, date-fns). Install these in packages/app. They are easily consumed by both platforms.
* Native Dependencies: (e.g., react-native-reanimated, expo-camera).
  * Pre-Expo SDK 54: These usually had to be installed directly in apps/expo to ensure autolinking worked.
  * Post-Expo SDK 54: The "Transitive Dependency" fix now allows you to install native libraries in the shared packages/app folder. The native code will link correctly even if it's not in the app's immediate package.json.

Investing in Scale

A Solito monorepo is not a shortcut for a "Hello World" project; it is an investment in scale. This architecture is designed for mature projects where you refuse to compromise. It ensures that your mobile app is truly native and your web app is a high-performance, SEO-optimized Next.js site, both powered by a single, shared source of truth.
