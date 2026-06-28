"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { ChevronLeft, ChevronRight, Search, Inbox, Loader2 } from "lucide-react";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  loading?: boolean;
  emptyMessage?: string;
  /** Optional action buttons rendered next to the search bar */
  actions?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Cari data...",
  searchKeys = ["name", "label", "slug"],
  loading = false,
  emptyMessage = "Tidak ada data ditemukan.",
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, limit]);

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const query = search.toLowerCase().trim();
    return data.filter((item: any) => {
      return searchKeys.some((key) => {
        const value = item[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, search, searchKeys]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const startIndex = (currentPage - 1) * limit;
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + limit);
  }, [filteredData, startIndex, limit]);

  return (
    <div className="w-full space-y-4">
      {/* Toolbar: Search + Limit + Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-background border border-border rounded-md text-xs w-full focus:outline-hidden focus:border-primary/50 text-foreground transition-all h-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-5xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
            Baris:
          </span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-2 py-0 bg-background border border-border rounded-md text-2xs font-bold text-foreground focus:outline-hidden focus:border-primary/50 cursor-pointer h-9"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        {actions && (
          <div className="flex items-center gap-2 ml-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-md overflow-hidden shadow-3xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-2xs font-bold">Memuat data...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Inbox className="w-12 h-12 mx-auto stroke-1.5 opacity-40 mb-3" />
            <h3 className="font-bold text-xs">Belum ada data</h3>
            <p className="text-3xs mt-1">{emptyMessage}</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/15">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px] text-center font-bold text-2xs">No</TableHead>
                {columns.map((col, idx) => (
                  <TableHead key={idx} className={`font-bold text-2xs ${col.className || ""}`}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, rowIdx) => {
                const globalIndex = startIndex + rowIdx + 1;
                return (
                  <TableRow key={rowIdx} className="hover:bg-muted/5 transition-all">
                    <TableCell className="text-center font-bold text-3xs text-muted-foreground/80 font-mono w-[50px]">
                      {globalIndex}
                    </TableCell>
                    {columns.map((col, colIdx) => {
                      let cellContent: React.ReactNode = null;
                      if (col.cell) {
                        cellContent = col.cell(item, globalIndex - 1);
                      } else if (col.accessorKey) {
                        cellContent = String((item as any)[col.accessorKey] ?? "");
                      }
                      return (
                        <TableCell key={colIdx} className={col.className}>
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
          <span className="text-5xs font-bold text-muted-foreground uppercase tracking-wider">
            Menampilkan {startIndex + 1}-{Math.min(startIndex + limit, totalItems)} dari {totalItems} data
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-border rounded-md bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="text-3xs text-muted-foreground px-1 select-none">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-2xs font-bold rounded-md transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background hover:bg-muted text-foreground"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-border rounded-md bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
