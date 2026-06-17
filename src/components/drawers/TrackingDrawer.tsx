import { useState } from "react";
import { StandardDrawer } from "../../ui/StandardDrawer";

export function TrackingDrawer({ isOpen, onClose, orderId }: { isOpen: boolean, onClose: () => void, orderId: string | null }) {
  const [showMoreAll, setShowMoreAll] = useState(false);
  const [showMoreFirst, setShowMoreFirst] = useState(false);

  return (
    <StandardDrawer isOpen={isOpen} onClose={onClose} title="Track print order">
      {orderId ? (
        <div className="flex flex-col h-full bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Order # {orderId}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            
            {/* Box 1 */}
            <div className="border border-[var(--color-link-blue)] rounded-xl bg-white p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-white text-green-700 text-sm font-semibold rounded border border-green-600">Delivered</span>
                <span className="text-sm text-gray-900">Apr 27, 2026</span>
              </div>
              
              <div className="flex justify-between items-start mb-2 text-sm">
                <div className="space-y-0.5">
                  <div><span className="font-bold text-gray-900 tracking-tight">Tracking #:</span> 1ZX414050322144101</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Carrier :</span> United Parcel Service</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Signed by :</span> MICHAEL</div>
                </div>
                <div className="font-bold text-gray-900 tracking-tight">Box 1 of 1</div>
              </div>

              {!showMoreFirst ? (
                <button className="text-[var(--color-link-blue)] text-sm mb-4 hover:underline" onClick={() => setShowMoreFirst(true)}>Show more</button>
              ) : (
                <div className="pl-4 border-l border-gray-300 ml-1.5 mb-4 space-y-6 py-1 mt-6">
                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-green-600 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Last scan: Apr 27, 2:30 PM</span><br/>
                      <span className="italic text-gray-700">Delivered</span>
                    </div>
                  </div>
                  <button className="text-[var(--color-link-blue)] text-sm hover:underline mt-2 -ml-4" onClick={() => setShowMoreFirst(false)}>Show less</button>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between items-center cursor-pointer mb-1">
                  <span className="text-sm text-gray-900">1 item in this shipment group</span>
                  <span className="material-symbols-outlined text-[20px] text-gray-900">expand_less</span>
                </div>
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <div className="font-bold text-sm text-gray-900">Job 4463140 - </div>
                    <div className="text-xs text-gray-500 mt-0.5">Item #: 717081</div>
                  </div>
                  <div className="text-xs text-gray-500 self-end">Qty: 1</div>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="border border-[var(--color-link-blue)] rounded-xl bg-white p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-white text-green-700 text-sm font-semibold rounded border border-green-600">Delivered</span>
                <span className="text-sm text-gray-900">Apr 24, 2026</span>
              </div>
              
              <div className="flex justify-between items-start mb-2 text-sm">
                <div className="space-y-0.5">
                  <div><span className="font-bold text-gray-900 tracking-tight">Tracking #:</span> 00000006921704669949</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Carrier :</span> On Trac</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Signed by :</span> DAVID H</div>
                </div>
                <div className="font-bold text-gray-900 tracking-tight">Box 1 of 3</div>
              </div>

               <div className="pl-4 border-l border-gray-300 ml-1.5 mb-4 space-y-6 py-1 mt-6">
                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-[3px] border-green-600 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Last scan: Apr 24, 4:55 PM</span><br/>
                      <span className="italic text-gray-900">Delivered</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-[2.5px] border-gray-300 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Apr 24, 11:54 AM</span><br/>
                      <span className="italic text-gray-900">Loaded on Truck : Out for Delivery</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-[2.5px] border-gray-300 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Apr 24, 5:47 AM</span><br/>
                      <span className="italic text-gray-900">Order Received</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-[2.5px] border-gray-300 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Apr 23, 12:00 AM</span><br/>
                      <span className="italic text-gray-900">Manifest Received</span>
                    </div>
                  </div>
                  
                  <button className="text-[var(--color-link-blue)] text-sm -ml-4 hover:underline block pt-2">Show less</button>
                </div>
            </div>
            
             {/* Box 3 */}
            <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm mb-4">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-white text-green-700 text-sm font-semibold rounded border border-green-600">Delivered</span>
                <span className="text-sm text-gray-900">Apr 24, 2026</span>
              </div>
              
              <div className="flex justify-between items-start mb-2 text-sm">
                <div className="space-y-0.5">
                  <div><span className="font-bold text-gray-900 tracking-tight">Tracking #:</span> 00000006921704781092</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Carrier :</span> On Trac</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Signed by :</span> DAVID H</div>
                </div>
                <div className="font-bold text-gray-900 tracking-tight">Box 2 of 3</div>
              </div>

               <button className="text-[var(--color-link-blue)] text-sm mb-2 hover:underline">Show more</button>
            </div>

          </div>
        </div>
      ) : null}
    </StandardDrawer>
  );
}
