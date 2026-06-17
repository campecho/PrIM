import { useState } from "react";
import { OrderDetailDrawer } from "../components/drawers/OrderDetailDrawer";
import { TrackingDrawer } from "../components/drawers/TrackingDrawer";
import { MOCK_ORDERS } from "../data/mockData";

export function OrdersModule({ ordersState }: { ordersState?: "orders" | "empty" }) {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [sortBy, setSortBy] = useState<{
    column: string;
    direction: "asc" | "desc";
  }>({ column: "dateReceived", direction: "desc" });
  const [searchExternalId, setSearchExternalId] = useState("");
  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [needsAttention, setNeedsAttention] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const filteredOrders = orders.filter((o) => {
    if (needsAttention && o.status !== "Failed" && o.status !== "On Hold")
      return false;
    if (
      searchExternalId &&
      !o.externalId.toLowerCase().includes(searchExternalId.toLowerCase())
    )
      return false;
    if (
      searchOrderNumber &&
      !o.id.toLowerCase().includes(searchOrderNumber.toLowerCase())
    )
      return false;
    if (
      searchCustomer &&
      !o.customer.toLowerCase().includes(searchCustomer.toLowerCase()) &&
      !o.customerId.toLowerCase().includes(searchCustomer.toLowerCase())
    )
      return false;
    if (
      searchContact &&
      !(
        o.contact?.name.toLowerCase().includes(searchContact.toLowerCase()) ||
        o.contact?.phone.toLowerCase().includes(searchContact.toLowerCase()) ||
        o.contact?.email.toLowerCase().includes(searchContact.toLowerCase())
      )
    )
      return false;
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dir = sortBy.direction === "asc" ? 1 : -1;
    if (sortBy.column === "dateReceived") {
      return (
        (new Date(a.dateReceived).getTime() -
          new Date(b.dateReceived).getTime()) *
        dir
      );
    }
    if (sortBy.column === "externalId") {
      return a.externalId.localeCompare(b.externalId) * dir;
    }
    if (sortBy.column === "id") {
      return a.id.localeCompare(b.id) * dir;
    }
    if (sortBy.column === "contact") {
      const aContact = a.contact?.name || "";
      const bContact = b.contact?.name || "";
      return aContact.localeCompare(bContact) * dir;
    }
    if (sortBy.column === "customer") {
      return a.customer.localeCompare(b.customer) * dir;
    }
    if (sortBy.column === "customerId") {
      return a.customerId.localeCompare(b.customerId) * dir;
    }
    if (sortBy.column === "status") {
      return a.status.localeCompare(b.status) * dir;
    }
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortBy.column === column) {
      setSortBy({
        column,
        direction: sortBy.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortBy({ column, direction: "desc" }); // default to desc for new columns
    }
  };

  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderSortIcon = (column: string) => {
    if (sortBy.column !== column) {
      return (
        <span className="material-symbols-outlined text-[14px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          unfold_more
        </span>
      );
    }
    return (
      <span className="material-symbols-outlined text-[14px] text-primary">
        {sortBy.direction === "asc"
          ? "keyboard_arrow_up"
          : "keyboard_arrow_down"}
      </span>
    );
  };

  return (
    <>
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 lg:self-start mb-6 md:mb-8 lg:mb-0 lg:h-full lg:overflow-y-auto lg:pr-2 lg:-mr-2 scrollbar-none pb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-6 relative">
            <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setNeedsAttention(!needsAttention)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                needsAttention
                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${needsAttention ? "bg-red-500" : "bg-gray-400"}`}
              />
              Needs Attention
            </button>
          </div>

          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              External ID
            </label>
            <input
              type="text"
              value={searchExternalId}
              onChange={(e) => setSearchExternalId(e.target.value)}
              className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
            />
          </div>
          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              Order Number
            </label>
            <input
              type="text"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
            />
          </div>
          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              Customer
            </label>
            <input
              type="text"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              placeholder="Name or ID"
              className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
            />
          </div>
          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              Contact
            </label>
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Name, Phone, or Email"
              className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-9 lg:h-full lg:min-h-0 flex flex-col overflow-y-auto scrollbar-none pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col shrink-0">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
          </div>
          {ordersState === "empty" ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <span className="sc-1xdthq8-2 ilDIBW mb-4 text-[#CDCDCD]">
                <svg viewBox="0 0 40 40" focusable="false" aria-hidden="true" height="40px" width="40px" color="currentColor" className="sc-14dq9fm-0 czVqFY">
                  <g fillRule="evenodd">
                    <path d="M39.3 13.5c-.7-1-1.8-1.6-3.1-1.6h-2.1l-6.3-10c-.4-.6-1.2-.8-1.8-.4s-.8 1.2-.4 1.8l5.4 8.6H9.2l5.4-8.6c.4-.6.2-1.4-.4-1.8s-1.4-.2-1.8.4L6 11.9H3.9c-1.2 0-2.3.6-3.1 1.6-.7 1-1 2.2-.7 3.3L4 35.5c.4 1.8 1.9 3 3.8 3.1h24.6c1.8 0 3.4-1.3 3.7-3.1l3.8-18.6c.3-1.2.1-2.4-.6-3.4m-2 2.7q0 .15 0 0l-3.8 18.7c-.1.6-.6 1-1.2 1H7.8c-.6 0-1.1-.4-1.2-1L2.8 16.3v-.1c-.1-.4 0-.8.2-1.1s.6-.5 1-.5h32.1c.4 0 .8.2 1 .5.3.3.4.7.2 1.1m-22.6 8.1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m10.7 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m-1.5 5.8h-7.7c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3h7.7c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3" fill="inherit"></path>
                  </g>
                </svg>
              </span>
              <p className="text-gray-900 font-medium">No orders to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("externalId")}
                  >
                    <div className="flex items-center gap-1">
                      External ID
                      {renderSortIcon("externalId")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center gap-1">
                      Order Number
                      {renderSortIcon("id")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("contact")}
                  >
                    <div className="flex items-center gap-1">
                      Contact
                      {renderSortIcon("contact")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      {renderSortIcon("customer")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("dateReceived")}
                  >
                    <div className="flex items-center gap-1">
                      Date received
                      {renderSortIcon("dateReceived")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {renderSortIcon("status")}
                    </div>
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider w-24">Tracking</th>
                  <th className="px-5 py-3 w-12 border-l border-gray-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td
                      className="px-5 py-4 text-sm text-[var(--color-link-blue)] cursor-pointer hover:underline font-medium"
                      onClick={() => setSelectedOrderId(order.externalId)}
                    >
                      {order.externalId}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900 font-medium">
                      {order.id}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {order.contact?.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {order.customer}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {(() => {
                        const [y, m, d] = order.dateReceived.split("-");
                        return `${m}/${d}/${y.slice(-2)}`;
                      })()}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-[2px] rounded text-xs font-medium border bg-white ${
                          order.status === "Shipped"
                            ? "border-green-600 text-green-700"
                            : order.status === "Processing"
                              ? "border-blue-600 text-blue-700"
                              : order.status === "Failed"
                                ? "border-red-600 text-red-700"
                                : order.status === "On Hold"
                                  ? "border-orange-600 text-orange-700"
                                  : order.status === "Delivered"
                                    ? "border-teal-600 text-teal-700"
                                    : "border-yellow-600 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900">
                      {(order.status === "Shipped" || order.status === "Delivered") && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setTrackingOrderId(order.id); }}
                          className="text-[var(--color-link-blue)] hover:underline font-medium"
                        >
                          Track
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center border-l border-gray-100 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === order.externalId ? null : order.externalId); }}
                        className="text-gray-400 hover:text-gray-900"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {openMenuId === order.externalId && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute right-8 top-10 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-20 py-1">
                            <button
                              onClick={() => { setOpenMenuId(null); setSelectedOrderId(order.externalId); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View details
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Pagination Controls */}
        {ordersState !== "empty" && (
          <div className="pt-6 pb-6 flex flex-col items-center gap-3">
            <div className="text-gray-900 text-sm text-center">
              Viewing <span className="font-bold">{sortedOrders.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedOrders.length)}</span> of <span className="font-bold">{sortedOrders.length}</span> items
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-[26px] h-[26px] rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center bg-white text-gray-400 hover:text-gray-900 hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Previous Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <div className="flex items-center gap-2.5 mx-1">
                <span className="text-gray-900 text-sm">Page</span>
                <div className="relative">
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="appearance-none border border-gray-400 rounded text-gray-900 text-sm px-2 py-0.5 pr-7 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                  >
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <option key={idx} value={idx + 1}>
                        {idx + 1}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none text-[16px]">expand_more</span>
                </div>
                <span className="text-gray-900 text-sm">of {totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-[26px] h-[26px] rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center bg-white text-gray-700 hover:text-gray-900 hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Next Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <OrderDetailDrawer
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
        orderStatus={
          orders.find(
            (o) => o.id === selectedOrderId || o.externalId === selectedOrderId,
          )?.status || null
        }
      />
      <TrackingDrawer
        isOpen={!!trackingOrderId}
        onClose={() => setTrackingOrderId(null)}
        orderId={trackingOrderId}
      />
    </>
  );
}
