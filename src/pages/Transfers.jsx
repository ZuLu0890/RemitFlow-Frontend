import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Chart from '../components/Chart.jsx';
import TransferRow from '../components/TransferRow.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import Pagination from '../components/Pagination.jsx';
import PullToRefresh from '../components/PullToRefresh.jsx';
import SelectionToolbar from '../components/SelectionToolbar.jsx';
import { useTransfers } from '../hooks/useTransfers.js';
import { useSelection } from '../hooks/useSelection.js';
import { useApp } from '../context/AppContext.jsx';
import './Transfers.css';

const PAGE_SIZE = 5;

/**
 * Transfers page: lists all transfers with their status, supports filtering,
 * search, pagination, selection across pages, and pull-to-refresh.
 */
export default function Transfers() {
  const { transfers, loading, error, reload } = useTransfers();
  const { locale } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const selection = useSelection();

  // Read filters from URL params.
  const statusFilter = searchParams.get('status') || '';
  const searchTerm = searchParams.get('search') || '';

  // Update a URL param and reset page to 1.
  function setFilterParam(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
    setPage(1);
  }

  function clearFilters() {
    setSearchParams({});
    setPage(1);
  }

  // Apply client-side filtering and search.
  const filtered = useMemo(() => {
    let result = transfers;
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.recipient.toLowerCase().includes(lower) ||
          t.id.toLowerCase().includes(lower),
      );
    }
    return result;
  }, [transfers, statusFilter, searchTerm]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  const pageIds = paged.map((t) => t.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selection.isSelected(id));
  const somePageSelected = pageIds.some((id) => selection.isSelected(id));
  const allAcrossSelected =
    totalCount > 0 && selection.selectedCount === totalCount;
  const hasMorePages = totalPages > 1;

  function handleTogglePage() {
    if (allPageSelected) {
      selection.deselectMany(pageIds);
    } else {
      selection.selectMany(pageIds);
    }
  }

  function handleSelectAllAcross() {
    selection.replaceAll(filtered.map((t) => t.id));
  }

  function handleClear() {
    selection.clear();
  }

  const hasActiveFilters = Boolean(statusFilter || searchTerm);

  return (
    <div className="transfers">
      <div className="transfers-header">
        <h1 className="page-title">Your Transfers</h1>
        <Link to="/send">
          <Button>New Transfer</Button>
        </Link>
      </div>

      {/* Filter and search controls */}
      <div className="transfers-filters">
        <div className="transfers-filter-group">
          <label htmlFor="filter-status" className="transfers-filter-label">
            Filter by status
          </label>
          <select
            id="filter-status"
            className="transfers-filter-select"
            value={statusFilter}
            onChange={(e) => setFilterParam('status', e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="transfers-filter-group">
          <label htmlFor="filter-search" className="transfers-filter-label">
            Search transfers
          </label>
          <input
            id="filter-search"
            type="text"
            className="transfers-filter-input"
            placeholder="Search by recipient or ID..."
            value={searchTerm}
            onChange={(e) => setFilterParam('search', e.target.value)}
          />
        </div>
      </div>

      <PullToRefresh onRefresh={reload}>
        {loading && (
          <div className="transfers-list">
            <Skeleton count={3} height="4.5rem" />
          </div>
        )}

        {!loading && error && <ErrorMessage message={error} onRetry={reload} />}

        {!loading && !error && totalCount === 0 && hasActiveFilters && (
          <EmptyState
            icon="🔍"
            title="No matching transfers"
            message="Try adjusting your filters or search terms."
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          />
        )}

        {!loading && !error && totalCount === 0 && !hasActiveFilters && (
          <EmptyState
            icon="💸"
            title="No transfers yet"
            message="Once you send money, your transfers will show up here."
            action={
              <Link to="/send">
                <Button>Send your first transfer</Button>
              </Link>
            }
          />
        )}

        {!loading && !error && totalCount > 0 && (
          <>
            <SelectionToolbar
              pageCount={pageIds.length}
              selectedCount={selection.selectedCount}
              totalCount={totalCount}
              allPageSelected={allPageSelected}
              somePageSelected={somePageSelected}
              allAcrossSelected={allAcrossSelected}
              hasMorePages={hasMorePages}
              onTogglePage={handleTogglePage}
              onSelectAllAcross={handleSelectAllAcross}
              onClear={handleClear}
            />

            <div className="transfers-list">
              <Chart
                title="Recent Transfer Amounts"
                data={paged
                  .slice(0, 5)
                  .map((t) => ({ value: parseFloat(t.sendAmount) }))}
              />
              {paged.map((t) => (
                <TransferRow
                  key={t.id}
                  transfer={t}
                  locale={locale}
                  selected={selection.isSelected(t.id)}
                  onToggleSelect={() => selection.toggle(t.id)}
                />
              ))}
            </div>
          </>
        )}
      </PullToRefresh>

      {!loading && !error && totalCount > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={setPage}
        />
      )}
    </div>
  );
}
