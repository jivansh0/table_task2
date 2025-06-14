import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center' | 'justify' | 'inherit';
}

interface DynamicTableProps {
  columns: TableColumn[];
  rows: Array<Record<string, unknown>>;
  orderBy?: string;
  order?: 'asc' | 'desc';
  onRequestSort?: (property: string) => void;
}

const StyledTableCell = styled(TableCell)({
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const DynamicTable: React.FC<DynamicTableProps> = ({ columns, rows, orderBy, order, onRequestSort }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            {columns.map((col) => {
              const isActive = orderBy === col.key;
              return (
                <TableCell
                  key={col.key}
                  sortDirection={isActive ? order : 'asc'}
                  align={col.align || 'left'}
                >
                  <TableSortLabel
                    active={isActive}
                    direction={isActive ? order : 'asc'}
                    onClick={() => onRequestSort && onRequestSort(col.key)}
                    hideSortIcon={false}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <StyledTableRow key={row.id ? String(row.id) : `row-${idx}`}>
              {columns.map((col) => (
                <StyledTableCell key={`${col.key}-${idx}`} align={col.align || 'left'}>
                  {typeof row[col.key] === 'object' && row[col.key] !== null
                    ? JSON.stringify(row[col.key])
                    : row[col.key] !== undefined ? String(row[col.key]) : ''}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DynamicTable; 