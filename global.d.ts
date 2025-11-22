// Global style import declarations to satisfy TypeScript for side-effect CSS imports
// Allow importing non-module global CSS files like `./globals.css`
declare module "*.css" {
  const content: { [className: string]: string } | string;
  export default content;
}
