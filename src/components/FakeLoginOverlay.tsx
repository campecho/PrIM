import { useState } from "react";
import { FAKE_USERS } from "../data/mockData";

export function FakeLoginOverlay({ onLogin }: { onLogin: (user: string) => void }) {
  const [selectedUser, setSelectedUser] = useState("");
  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center border border-gray-200">
        <div className="w-16 h-16 bg-primary-alpha text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">login</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Simulated Login
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Select a user to continue previewing the app.
        </p>

        <div className="relative">
          <select
            className="w-full border border-gray-300 rounded-lg py-3 pl-4 pr-10 mb-6 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-gray-50 text-gray-800 font-medium text-left cursor-pointer"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="" disabled>
              Select User...
            </option>
            {FAKE_USERS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400 pointer-events-none">
            arrow_drop_down
          </span>
        </div>

        <button
          onClick={() => onLogin(selectedUser)}
          disabled={!selectedUser}
          className="w-full bg-primary text-white rounded-[20px] p-3 text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Enter Dashboard
        </button>
      </div>
    </div>
  );
}
