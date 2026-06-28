// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EnterpriseDataTable, type EnterpriseColumnDef } from "./EnterpriseDataTable";
import type { TableQueryState } from "@/hooks/useTableQuery";

vi.mock("@/services/api", () => ({ api: { get: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
  cleanup();
  localStorage.clear();
});

type Row = { id: string; name: string; status: string };

const rows: Row[] = [
  { id: "a", name: "Alloy Steel", status: "ACTIVE" },
  { id: "b", name: "Billet Iron", status: "INACTIVE" }
];

const columns: EnterpriseColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name", meta: { label: "Name" } },
  { accessorKey: "status", header: "Status", meta: { label: "Status" } }
];

function Harness() {
  const [query, setQuery] = useState<TableQueryState>({
    page: 2,
    limit: 25,
    search: "",
    filters: {}
  });

  return (
    <>
      <EnterpriseDataTable
        tableId="test-table"
        data={rows}
        columns={columns}
        query={query}
        onQueryChange={setQuery}
        totalRows={rows.length}
        getRowId={(row) => row.id}
      />
      <output data-testid="query">{JSON.stringify(query)}</output>
    </>
  );
}

describe("EnterpriseDataTable", () => {
  it("updates search state and resets pagination", async () => {
    render(<Harness />);
    fireEvent.change(screen.getByPlaceholderText("Search records..."), { target: { value: "steel" } });
    await waitFor(() => {
      expect(screen.getByTestId("query").textContent).toContain('"search":"steel"');
      expect(screen.getByTestId("query").textContent).toContain('"page":1');
    });
  });

  it("updates server sort state from the column header", () => {
    render(<Harness />);
    fireEvent.click(screen.getAllByRole("button", { name: "Name" })[0]);
    expect(screen.getByTestId("query").textContent).toContain('"sortBy":"name"');
    expect(screen.getByTestId("query").textContent).toContain('"sortDir":"asc"');
  });

  it("persists column visibility and keeps selected rows by id", () => {
    render(<Harness />);
    fireEvent.click(screen.getAllByText("Columns")[0]);
    fireEvent.click(screen.getByLabelText("Status"));
    expect(localStorage.getItem("mcms-table-columns:test-table")).toContain('"status":false');

    fireEvent.click(screen.getAllByLabelText("Select row")[0]);
    expect(screen.getByText("1 selected")).toBeTruthy();
  });
});
