// Imports de CSS (global.css, *.module.css) existem só no alvo web;
// estas declarações mantêm o typecheck do projeto RN limpo.
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.css';
