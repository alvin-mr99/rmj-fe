declare module 'ag-grid-solid' {
  import { Component } from 'solid-js';
  import type { GridOptions } from 'ag-grid-community';

  interface AgGridSolidProps extends GridOptions {
    class?: string;
    style?: any;
  }

  const AgGridSolid: Component<AgGridSolidProps>;
  export default AgGridSolid;
}
