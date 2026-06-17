import { FAKE_USERS } from "../data/mockData";

export function UserModule({
  currentUser,
  onSwitchUser,
}: {
  currentUser: string | null;
  onSwitchUser: (user: string) => void;
}) {
  return (
    <div className="col-span-12 lg:col-span-6 lg:col-start-4 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-gray-500">person</span>
        User Profile (Simulated)
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Active User
        </label>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-alpha text-primary flex items-center justify-center font-bold text-lg">
            {currentUser?.charAt(0) || "?"}
          </div>
          <span className="text-lg">{currentUser || "None"}</span>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <h3 className="text-lg font-medium text-gray-800 mb-4">Switch User</h3>
      <div className="flex flex-col gap-3">
        {FAKE_USERS.map((user) => (
          <button
            key={user}
            onClick={() => onSwitchUser(user)}
            disabled={user === currentUser}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition ${
              user === currentUser
                ? "border-primary bg-primary-alpha cursor-default shadow-sm ring-1 ring-primary"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  user === currentUser
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {user.charAt(0)}
              </div>
              <span
                className={`font-medium text-lg ${user === currentUser ? "text-primary" : "text-gray-800"}`}
              >
                {user}
              </span>
            </div>
            {user === currentUser && (
              <span className="text-xs font-bold text-white uppercase tracking-wider bg-primary px-3 py-1.5 rounded-full">
                Active
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
