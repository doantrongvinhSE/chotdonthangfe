import React, { useEffect, useRef, useState } from 'react';
import { AlarmClockCheck, ArrowUp, MessageSquare, MessageSquareDashed, RefreshCw, Search } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { useOrders } from '../hooks/useOrders';
import CommentsTable from '../components/tables/CommentsTable';
import CreateOrderModal from '../components/forms/CreateOrderModal';
import DateRangeFilter from '../components/filters/DateRangeFilter';
import { Toast, ToastType } from '../components/ui/Toast';
import { Comment } from '../types/posts';

const CommentsPage: React.FC = () => {
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const showToastMessage = (message: string, type: ToastType = 'success') => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const {
    comments,
    loading,
    error,
    totalItems,
    isRealTime,
    lastUpdate,
    todayCount,
    updateCommentStatus,
    fetchComments,
    filterCommentsByDate,
    clearDateFilter,
    phoneFilter,
    togglePhoneFilter,
    notificationsEnabled,
    toggleNotifications,
    highlightedIds,
    loadMoreComments,
    hasMore,
    isFetchingMore,
  } = useComments(showToastMessage);

  const loadMoreRef = useRef(loadMoreComments);
  const hasMoreRef = useRef(hasMore);
  const isFetchingMoreRef = useRef(isFetchingMore);

  const { addOrder, addingOrder } = useOrders(showToastMessage);

  useEffect(() => {
    loadMoreRef.current = loadMoreComments;
  }, [loadMoreComments]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isFetchingMoreRef.current = isFetchingMore;
  }, [isFetchingMore]);

  useEffect(() => {
    const handleWindowScroll = () => {
      setShowScrollTop(window.scrollY > 480);

      if (!hasMoreRef.current || isFetchingMoreRef.current || loading) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 240;

      if (scrollPosition >= threshold) {
        loadMoreRef.current();
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll();

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [loading]);

  const handleRefresh = () => {
    fetchComments({ page: 1 });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateOrder = (comment: Comment) => {
    setSelectedComment(comment);
    setShowCreateOrderModal(true);
  };

  const handleCloseCreateOrderModal = () => {
    setShowCreateOrderModal(false);
    setSelectedComment(null);
  };

  const handleSubmitOrder = async (orderData: {
    product_name: string;
    customer_name: string;
    phone: string;
    address: string;
    note: string;
    price: number;
    quality: number;
    total_price: number;
  }) => {
    try {
      await addOrder({
        ...orderData,
        avatar_customer: selectedComment?.avatar_user || undefined,
        status: 'pending',
      });
      if (selectedComment) {
        await updateCommentStatus(selectedComment.id, 'success');
      }
      handleCloseCreateOrderModal();
    } catch {
      // Error handling được thực hiện trong useOrders hook
    }
  };

  return (
    <div className="min-h-full py-4 px-8 space-y-4" style={{ backgroundColor: '#f5f7fa' }}>
      {/* Header Section */}
      <div className="rounded-2xl overflow-hidden px-5 pt-0 pb-0" style={{ backgroundColor: '#f5f7fa' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left: Title & Description */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800">Danh sách bình luận</h1>
              <p className="text-xs text-slate-500">
                Quản lý và tương tác với khách hàng thông qua các phản hồi từ mạng xã hội
                {isRealTime && (
                  <span className="ml-2 text-emerald-500 animate-pulse">• Cập nhật lần cuối: {lastUpdate}</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Stat Cards */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Total Card */}
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 flex items-center gap-3 shadow-sm min-w-[180px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 hover:bg-blue-50/30 active:scale-[0.99]">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MessageSquareDashed className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Tổng số</p>
                <p className="text-base font-bold text-slate-800 leading-tight">{totalItems.toLocaleString()}</p>
              </div>
            </div>

            {/* Today Card */}
            <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 flex items-center gap-3 shadow-sm min-w-[200px] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-orange-200 hover:bg-orange-50/30 active:scale-[0.99]">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <AlarmClockCheck className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Hôm nay</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-green-600 leading-tight">{todayCount.toLocaleString()}</p>
                  <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Mới</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px" style={{ backgroundColor: '#dde3ec' }}></div>

      {/* Actions Bar */}
      <div className="rounded-2xl bg-white overflow-hidden px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-nowrap items-center gap-3">
            <div className="relative w-full min-w-[220px] max-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                onChange={(e) => {
                  const endDateInput = e.target.closest('.flex')?.querySelector('input[type="date"]:last-of-type') as HTMLInputElement;
                  if (endDateInput?.value) {
                    filterCommentsByDate(e.target.value, endDateInput.value);
                  }
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <span className="text-sm text-slate-400">—</span>
              <input
                type="date"
                onChange={(e) => {
                  const startDateInput = e.target.closest('.flex')?.querySelector('input[type="date"]:first-of-type') as HTMLInputElement;
                  if (startDateInput?.value) {
                    filterCommentsByDate(startDateInput.value, e.target.value);
                  }
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#eef5ff_100%)] px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-[0_12px_24px_-18px_rgba(37,99,235,0.7)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                title="Tải lại bình luận"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-500' : 'text-blue-500'}`} />
                <span className="whitespace-nowrap">{loading ? 'Đang tải...' : 'Tải lại'}</span>
              </button>
            </div>
          </div>
          <div className="flex flex-nowrap items-center gap-2">
            <DateRangeFilter
              onDateRangeChange={filterCommentsByDate}
              onClear={clearDateFilter}
              phoneFilter={phoneFilter}
              onTogglePhoneFilter={togglePhoneFilter}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={toggleNotifications}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <CommentsTable
        comments={comments}
        loading={loading}
        error={error}
        totalItems={totalItems}
        onStatusChange={updateCommentStatus}
        onCreateOrder={handleCreateOrder}
        compact={false}
        onShowToast={showToastMessage}
        highlightedIds={highlightedIds}
        hasMore={hasMore}
        isFetchingMore={isFetchingMore}
      />

      <CreateOrderModal
        isOpen={showCreateOrderModal}
        onClose={handleCloseCreateOrderModal}
        comment={selectedComment}
        onSubmit={handleSubmitOrder}
        loading={addingOrder}
      />

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />

      <button
        type="button"
        onClick={handleScrollToTop}
        className={`fixed bottom-6 right-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#2563ee] text-white shadow-[0_18px_35px_-18px_rgba(37,99,238,0.9)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1d4ed8] hover:shadow-[0_24px_40px_-18px_rgba(29,78,216,0.95)] ${showScrollTop ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none'}`}
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CommentsPage;
