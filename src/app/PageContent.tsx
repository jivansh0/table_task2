"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, ToggleButton, ToggleButtonGroup, CircularProgress, TablePagination, TextField, Tabs, Tab
} from "@mui/material";
import DynamicTable, { TableColumn } from "./DynamicTable";
import { useRouter, useSearchParams } from "next/navigation";

interface BaseItem {
  id: number;
  status: string;
  createdAt: string;
  [key: string]: string | number; // Allow dynamic string properties
}

const categories = [
  { label: "Users", value: "users" },
  { label: "Products", value: "products" },
];

const userColumns: TableColumn[] = [
  { key: "id", label: "ID" },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "age", label: "Age", align: "right" },
  { key: "gender", label: "Gender" },
  { key: "phone", label: "Phone" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created At" },
];
const productColumns: TableColumn[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "category", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "stock", label: "Stock", align: "right" },
  { key: "price", label: "Price", align: "right" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created At" },
];

const PageContent: React.FC = () => {
  const [category, setCategory] = useState("users");
  const [data, setData] = useState<BaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Columns for current category
  const columns = category === "users" ? userColumns : productColumns;

  // Restore filters from URL on mount
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setStatus(searchParams.get("status") || "all");
    setDateRange({ from: searchParams.get("from") || "", to: searchParams.get("to") || "" });
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (dateRange.from) params.set("from", dateRange.from);
    if (dateRange.to) params.set("to", dateRange.to);
    router.replace(`?${params.toString()}`);
  }, [search, status, dateRange, router]);

  // Fetch and augment data
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`https://dummyjson.com/${category}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(json => {
        let items = json[category] || [];
        const now = new Date();
        const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
        items = items.map((item: BaseItem, idx: number) => {
          const createdAt = new Date(twoYearsAgo.getTime() + ((now.getTime() - twoYearsAgo.getTime()) * idx / (items.length || 1)));
          return {
            ...item,
            status: idx % 2 === 0 ? "active" : "inactive",
            createdAt: createdAt.toISOString().slice(0, 10),
          };
        });
        setData(items);
        setPage(0);
        setOrderBy("");
        setOrder("asc");
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch data');
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category]);

  // Filtering
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesSearch = !search || Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = status === "all" || row.status === status;
      const date = row.createdAt ? new Date(row.createdAt) : null;
      const matchesFrom = !dateRange.from || (date && date >= new Date(dateRange.from));
      const matchesTo = !dateRange.to || (date && date <= new Date(dateRange.to));
      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [data, search, status, dateRange]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal === bVal) return 0;
      return (aVal < bVal ? -1 : 1) * (order === "asc" ? 1 : -1);
    });
  }, [filteredData, orderBy, order]);

  // Pagination
  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Date range for filter UI
  const minDate = useMemo(() => data.length ? data.reduce((min, row) => row.createdAt < min ? row.createdAt : min, data[0].createdAt) : "", [data]);
  const maxDate = useMemo(() => data.length ? data.reduce((max, row) => row.createdAt > max ? row.createdAt : max, data[0].createdAt) : "", [data]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>Table</Typography>
      {error && (
        <Typography color="error" align="center" gutterBottom>
          Error: {error}
        </Typography>
      )}
      {/* Filter UI */}
      <Box display="flex" gap={2} mb={2} alignItems="center">
        <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <Tabs value={status} onChange={(_, val) => setStatus(val)} aria-label="Status Tabs">
          <Tab label="All" value="all" />
          <Tab label="Active" value="active" />
          <Tab label="Inactive" value="inactive" />
        </Tabs>
        <TextField
          label="From"
          type="date"
          value={dateRange.from}
          onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
          size="small"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate, max: maxDate }}
        />
        <TextField
          label="To"
          type="date"
          value={dateRange.to}
          onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
          size="small"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate, max: maxDate }}
        />
        <Box fontSize={12} color="gray">
          {minDate && maxDate && `Available: ${minDate} to ${maxDate}`}
        </Box>
        <Box>
          <button onClick={() => setDateRange({ from: "", to: "" })}>Clear Date</button>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" mb={3}>
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={(_, val) => val && setCategory(val)}
          aria-label="Category selection"
        >
          {categories.map((cat) => (
            <ToggleButton key={cat.value} value={cat.value}>{cat.label}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <>
          <DynamicTable
            columns={columns}
            rows={paginatedData}
            orderBy={orderBy}
            order={order}
            onRequestSort={setOrderBy ? (col) => {
              const isAsc = orderBy === col && order === "asc";
              setOrder(isAsc ? "desc" : "asc");
              setOrderBy(col);
            } : undefined}
          />
          <TablePagination
            component="div"
            count={sortedData.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </>
      )}
    </Box>
  );
};

export default PageContent; 