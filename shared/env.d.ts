/// <reference types="astro/client" />

// Loaded via page libs (libs.json) as classic <script> globals, not npm packages —
// declared ambiently so `astro check` can resolve them in the demo init scripts.

/** Minimal DataTables.net v3 API surface used by DataTable.astro. */
interface DataTableApi {
  rows(selector?: Record<string, unknown>): { select(): void; deselect(): void; count(): number }
  row(node: Element | null): { select(): void; deselect(): void; selected(): boolean }
  on(events: string, fn: () => void): void
}
/** datatables.net v3, used by DataTable.astro */
declare var DataTable: {
  new (selector: string | Element, options?: Record<string, unknown>): DataTableApi
  isDataTable(selector: string | Element): boolean
}
/** datatables.net instances, keyed by table id — see DataTable.astro */
declare var tabler_datatable: Record<string, DataTableApi> | undefined
/** typed.js, used by marketing/hero/Side.astro */
declare var Typed: new (selector: string, options: Record<string, unknown>) => unknown
/** tom-select, used by ui/Select.astro / FormElements1.astro */
declare var TomSelect: (new (element: Element | null, options: Record<string, unknown>) => unknown) | undefined
