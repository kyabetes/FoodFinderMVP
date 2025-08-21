// Tailwind CSS type declaration
declare module '*.css' {
  const content: string;
  export default content;
}

// Support for Tailwind directives
declare module 'postcss' {
  interface AtRule {
    tailwind?: string;
  }
}