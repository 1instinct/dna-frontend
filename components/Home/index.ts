// Conditionally export based on NEXT_PUBLIC_DYNAMIC_HOMEPAGE env var
import { StaticHome } from "./StaticHome";
import { DynamicHome } from "./DynamicHome";

const isDynamic = process.env.NEXT_PUBLIC_DYNAMIC_HOMEPAGE === "true";

export const Home = isDynamic ? DynamicHome : StaticHome;

// Also export both for direct access if needed
export { StaticHome } from "./StaticHome";
export { DynamicHome } from "./DynamicHome";
