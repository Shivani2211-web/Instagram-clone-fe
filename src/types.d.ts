declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Declare modules for our page components
declare module './pages/Home' {
  import { FC } from 'react';
  const Home: FC;
  export default Home;
}

declare module './pages/Explore' {
  import { FC } from 'react';
  const Explore: FC;
  export default Explore;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
