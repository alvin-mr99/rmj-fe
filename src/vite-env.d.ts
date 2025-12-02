/// <reference types="vite/client" />

// Declare module for KML files imported as raw text
declare module '*.kml?raw' {
  const content: string;
  export default content;
}

// Declare module for XLSX files imported as URL
declare module '*.xlsx?url' {
  const url: string;
  export default url;
}

// Declare module for KML files imported as URL
declare module '*.kml?url' {
  const url: string;
  export default url;
}
