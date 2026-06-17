import { useState } from "react";
import { StandardDrawer } from "../../ui/StandardDrawer";

export function OrderDetailDrawer({
  isOpen,
  onClose,
  orderId,
  orderStatus,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  orderStatus?: string | null;
}) {
  const canEditShipping = orderStatus === "Failed" || orderStatus === "On Hold";
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [searchShipToId, setSearchShipToId] = useState("");
  const [searchAddress1, setSearchAddress1] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");

  const [shippingResults, setShippingResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const mockShipToResults = [
    { id: "SHIP-002", address1: "15 Broad St", city: "Nashville", state: "TN" },
    {
      id: "SHIP-003",
      address1: "20 Central Ave",
      city: "Nashville",
      state: "TN",
    },
    { id: "SHIP-004", address1: "123 Elm St", city: "Denver", state: "CO" },
    { id: "SHIP-005", address1: "444 Poplar Rd", city: "Denver", state: "CO" },
    { id: "SHIP-006", address1: "555 Cedar Ln", city: "Denver", state: "CO" },
    { id: "SHIP-007", address1: "666 Pine St", city: "Chicago", state: "IL" },
  ];

  const handleSearchShipping = () => {
    let results = mockShipToResults;
    if (searchShipToId)
      results = results.filter((r) =>
        r.id.toLowerCase().includes(searchShipToId.toLowerCase()),
      );
    if (searchAddress1)
      results = results.filter((r) =>
        r.address1.toLowerCase().includes(searchAddress1.toLowerCase()),
      );
    if (searchCity)
      results = results.filter((r) =>
        r.city.toLowerCase().includes(searchCity.toLowerCase()),
      );
    if (searchState)
      results = results.filter((r) =>
        r.state.toLowerCase().includes(searchState.toLowerCase()),
      );
    setShippingResults(results);
    setHasSearched(true);
  };

  const handleSelectShipTo = (val: any) => {
    setIsEditingShipping(false);
    setHasSearched(false);
    // Visual update logic or callback could go here
  };

  const cancelEdit = () => {
    setIsEditingShipping(false);
    setHasSearched(false);
    setSearchShipToId("");
    setSearchAddress1("");
    setSearchCity("");
    setSearchState("");
  };

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [searchContactType, setSearchContactType] = useState("lastName");
  const [searchContactValue, setSearchContactValue] = useState("");
  const [contactResults, setContactResults] = useState<any[]>([]);
  const [hasSearchedContact, setHasSearchedContact] = useState(false);

  const mockContactResults = [
    {
      userId: "mary123",
      firstName: "Mary",
      lastName: "Smith",
      email: "mary.smith@email.null",
      phone: "5557106075",
    },
    {
      userId: "jsmith",
      firstName: "John",
      lastName: "Smith",
      email: "john@email.null",
      phone: "5551234567",
    },
    {
      userId: "asmith",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@email.null",
      phone: "5559876543",
    },
    {
      userId: "bjohnson",
      firstName: "Bob",
      lastName: "Johnson",
      email: "bjohnson@email.null",
      phone: "5554567890",
    },
    {
      userId: "csmith",
      firstName: "Charlie",
      lastName: "Smith",
      email: "csmith@email.null",
      phone: "5553334444",
    },
  ];

  const handleSearchContact = () => {
    let results = mockContactResults;
    if (searchContactValue) {
      const val = searchContactValue.toLowerCase();
      if (searchContactType === "lastName") {
        results = results.filter((r) => r.lastName.toLowerCase().includes(val));
      } else if (searchContactType === "userId") {
        results = results.filter((r) => r.userId.toLowerCase().includes(val));
      } else if (searchContactType === "email") {
        results = results.filter((r) => r.email.toLowerCase().includes(val));
      }
    }
    setContactResults(results);
    setHasSearchedContact(true);
  };

  const handleSelectContact = (val: any) => {
    setIsEditingContact(false);
    setHasSearchedContact(false);
  };

  const cancelEditContact = () => {
    setIsEditingContact(false);
    setHasSearchedContact(false);
    setSearchContactValue("");
  };

  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [budgetCenter, setBudgetCenter] = useState("3456");
  const [purchaseOrder, setPurchaseOrder] = useState("3456");
  const [draftBudgetCenter, setDraftBudgetCenter] = useState("");
  const [draftPurchaseOrder, setDraftPurchaseOrder] = useState("");

  const handleEditBilling = () => {
    setDraftBudgetCenter(budgetCenter);
    setDraftPurchaseOrder(purchaseOrder);
    setIsEditingBilling(true);
  };

  const handleSaveBilling = () => {
    setBudgetCenter(draftBudgetCenter);
    setPurchaseOrder(draftPurchaseOrder);
    setIsEditingBilling(false);
  };

  const cancelEditBilling = () => {
    setIsEditingBilling(false);
  };

  const MOCK_DATA = {
    mappedOrderId: "760124891",
    externalOrderId: "HCA-155035",
    orderName: "Staples test 4",
    customer: "HCA",
    customerId: "12345678",
    contact: {
      userId: "mary123",
      firstName: "Mary",
      lastName: "Smith",
      phone: "5557106075",
      email: "mary.smith@email.null",
    },
    shipping: {
      shippingId: "SHIP-001",
      name: "work",
      divisionName: "Corporate",
      streetAddressOne: "10 Main Street",
      city: "Nashville",
      state: "TN",
      postalCode: "37206",
    },
    billing: {
      billingId: "BILL-001",
      hcaCOID: "11111",
      userId: "CYO2222",
      departmentNumber: "",
      budgetCenter: budgetCenter,
      purchaseOrder: purchaseOrder,
    },
    items: [
      {
        itemId: "550e8400-e29b-41d4-a716-446655440000",
        itemName: "XYZ Healthcare Business Card",
        itemType: "Template Instance",
        quantity: 500,
        jobTicketTemplateName: "MW_XYZMKT_BC_2S_3-5x2_130CSSC_BLEED",
        productConfigSKU: "203070",
        fileUrl: "https://example.com/file.pdf",
      },
    ],
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details`}
      customWidth="w-[95vw] lg:w-[940px]"
      footer={
        canEditShipping ? (
          <div className="w-full flex justify-start">
            <button
              onClick={() => {
                // Resubmit logic
                onClose();
              }}
              className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary/90 transition-all shadow-sm"
            >
              Resubmit
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="grid grid-cols-3 gap-8 border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold text-gray-900 col-span-1">
            Received
          </h2>
          <h2 className="text-lg font-semibold text-gray-900 col-span-2">
            Mapped
          </h2>
        </div>

        {/* Row: Order Info */}
        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col gap-4 col-span-1">
            <div>
              <span className="block text-sm font-medium text-gray-500">
                Order Name
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.orderName}
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">
                External Order ID
              </span>
              <span className="block text-sm text-gray-900">
                {orderId || MOCK_DATA.externalOrderId}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4 col-span-2">
            <div>
              <span className="block text-sm font-medium text-gray-500">
                Customer
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.customer} ({MOCK_DATA.customerId})
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">
                Order ID
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.mappedOrderId}
              </span>
            </div>
          </div>
        </div>

        {/* Row: Contact */}
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-3 mt-3">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1">
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                Contact
              </h3>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.contact.firstName} {MOCK_DATA.contact.lastName}
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.contact.phone}
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.contact.email}
              </span>
            </div>
            <div className="col-span-2">
              <div className="mt-7">
                <span className="block text-sm font-medium text-gray-500">
                  UserID
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-900">
                  {MOCK_DATA.contact.userId}
                  {canEditShipping && (
                    <button
                      onClick={() => setIsEditingContact(true)}
                      className={`text-gray-400 hover:text-gray-700 transition-colors p-1 flex items-center justify-center ${isEditingContact ? 'invisible pointer-events-none' : ''}`}
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        edit
                      </span>
                    </button>
                  )}
                </span>
              </div>
            </div>
          </div>

          {isEditingContact && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Search User
              </h4>
              <div className="flex items-end gap-4 mb-4">
                <div className="w-1/3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Search By
                  </label>
                  <select
                    value={searchContactType}
                    onChange={(e) => setSearchContactType(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  >
                    <option value="lastName">Last Name</option>
                    <option value="userId">User ID</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div className="w-2/3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Search Value
                  </label>
                  <input
                    type="text"
                    value={searchContactValue}
                    onChange={(e) => setSearchContactValue(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleSearchContact}
                  className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary/90 transition-all shadow-sm"
                >
                  Search
                </button>
                <button
                  onClick={cancelEditContact}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>

              {hasSearchedContact && (
                <div className="overflow-x-auto border border-gray-200 rounded max-h-[220px]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                      <tr>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          User ID
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          First Name
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          Last Name
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {contactResults.length > 0 ? (
                        contactResults.map((r, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50/50 transition cursor-pointer"
                            onClick={() => handleSelectContact(r)}
                          >
                            <td className="py-2 px-3 text-[var(--color-link-blue)] hover:underline font-medium">
                              {r.userId}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.firstName}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.lastName}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.email}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-center text-gray-500"
                          >
                            No results found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row: Shipping */}
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-3 mt-3">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1">
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                Shipping
              </h3>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.shipping.name} - {MOCK_DATA.shipping.divisionName}
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.shipping.streetAddressOne}
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.shipping.city}, {MOCK_DATA.shipping.state}{" "}
                {MOCK_DATA.shipping.postalCode}
              </span>
            </div>
            <div className="col-span-2">
              <div className="mt-7">
                <span className="block text-sm font-medium text-gray-500">
                  Ship To ID
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-900">
                  {MOCK_DATA.shipping.shippingId}
                  {canEditShipping && (
                    <button
                      onClick={() => setIsEditingShipping(true)}
                      className={`text-gray-400 hover:text-gray-700 transition-colors p-1 flex items-center justify-center ${isEditingShipping ? 'invisible pointer-events-none' : ''}`}
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        edit
                      </span>
                    </button>
                  )}
                </span>
              </div>
            </div>
          </div>

          {isEditingShipping && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Search Ship To ID
              </h4>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ship-To ID
                  </label>
                  <input
                    type="text"
                    value={searchShipToId}
                    onChange={(e) => setSearchShipToId(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={searchAddress1}
                    onChange={(e) => setSearchAddress1(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleSearchShipping}
                  className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary/90 transition-all shadow-sm"
                >
                  Search
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>

              {hasSearched && (
                <div className="overflow-x-auto border border-gray-200 rounded max-h-[220px]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                      <tr>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          Ship-To ID
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          Address Line 1
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          City
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          State
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {shippingResults.length > 0 ? (
                        shippingResults.map((r, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50/50 transition cursor-pointer"
                            onClick={() => handleSelectShipTo(r)}
                          >
                            <td className="py-2 px-3 text-[var(--color-link-blue)] hover:underline font-medium">
                              {r.id}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.address1}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.city}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.state}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-center text-gray-500"
                          >
                            No results found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row: Billing */}
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-3 mt-3">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1">
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                Billing
              </h3>
              <span className="block text-sm text-gray-900">
                HCA COID: {MOCK_DATA.billing.hcaCOID}
              </span>
              <span className="block text-sm text-gray-900">
                User ID: {MOCK_DATA.billing.userId}
              </span>
            </div>
            <div className="col-span-2">
              <div className="mt-7 grid grid-cols-3 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Bill To ID
                  </span>
                  <span className="block text-sm text-gray-900">
                    {MOCK_DATA.billing.billingId}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Budget Center
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gray-900">
                    {MOCK_DATA.billing.budgetCenter}
                    {canEditShipping && (
                      <button
                        onClick={handleEditBilling}
                        className={`text-gray-400 hover:text-gray-700 transition-colors p-1 flex items-center justify-center ${isEditingBilling ? 'invisible pointer-events-none' : ''}`}
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          edit
                        </span>
                      </button>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Purchase Order
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gray-900">
                    {MOCK_DATA.billing.purchaseOrder}
                    {canEditShipping && (
                      <button
                        onClick={handleEditBilling}
                        className={`text-gray-400 hover:text-gray-700 transition-colors p-1 flex items-center justify-center ${isEditingBilling ? 'invisible pointer-events-none' : ''}`}
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          edit
                        </span>
                      </button>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isEditingBilling && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Edit Billing Info
              </h4>
              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Budget Center
                  </label>
                  <input
                    type="text"
                    value={draftBudgetCenter}
                    onChange={(e) => setDraftBudgetCenter(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Purchase Order
                  </label>
                  <input
                    type="text"
                    value={draftPurchaseOrder}
                    onChange={(e) => setDraftPurchaseOrder(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveBilling}
                  className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary/90 transition-all shadow-sm"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditBilling}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="border-t border-gray-100 pt-4 mt-4 mb-2">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Items</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    ExternalID
                  </th>
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    QTY
                  </th>
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    File
                  </th>
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    Item ID / SKU
                  </th>
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    Specs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {MOCK_DATA.items.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-sm text-gray-900">
                      {item.jobTicketTemplateName}
                    </td>
                    <td className="py-2.5 px-4 text-sm font-medium text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-sm">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--color-link-blue)] hover:underline font-medium"
                      >
                        View
                      </a>
                    </td>
                    <td className="py-2.5 px-4 text-sm text-gray-600">
                      {item.productConfigSKU}
                    </td>
                    <td className="py-2.5 px-4 text-sm text-gray-900 font-mono">
                      {item.itemId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StandardDrawer>
  );
}
