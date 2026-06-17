import { useState } from "react";
import { FakeLoginOverlay } from "./components/FakeLoginOverlay";
import { INITIAL_PRODUCTION_TYPES, ProductionTypesContext } from "./context/ProductionTypesContext";
import { MOCK_FILES } from "./data/mockData";
import { useFirestoreSync } from "./hooks/useFirestoreSync";
import { ComponentsModule } from "./modules/ComponentsModule";
import { FilesModule } from "./modules/FilesModule";
import { OrdersModule } from "./modules/OrdersModule";
import { ProductsModule } from "./modules/ProductsModule";
import { ProgramModule } from "./modules/ProgramModule";
import { ProjectsModule } from "./modules/ProjectsModule";
import { SettingsModule } from "./modules/SettingsModule";
import { UserModule } from "./modules/UserModule";
import { bottomModules, topModules } from "./navigation";
import { FileAsset, Module } from "./types";

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>(topModules[0]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [filesSearchFilter, setFilesSearchFilter] = useState("");
  const [ordersState, setOrdersState] = useState<"orders" | "empty">("orders");

  const [simulatedUser, setSimulatedUser] = useState<string | null>(() => {
    return localStorage.getItem("simulatedUser");
  });

  const handleSimulatedLogin = (user: string) => {
    localStorage.setItem("simulatedUser", user);
    setSimulatedUser(user);
  };

  const [globalFiles, setGlobalFiles] = useFirestoreSync(
    "appData",
    "files",
    MOCK_FILES,
  );
  const [globalSelectedFile, setGlobalSelectedFile] =
    useState<FileAsset | null>(null);

  const [productionTypes, setProductionTypes] = useFirestoreSync(
    "appData",
    "production_types",
    INITIAL_PRODUCTION_TYPES,
  );

  const navigateToFilesWithFilter = (filter: string) => {
    setFilesSearchFilter(filter);
    setActiveModule(topModules.find((m) => m.id === "files") || activeModule);
  };

  if (!simulatedUser) {
    return <FakeLoginOverlay onLogin={handleSimulatedLogin} />;
  }

  return (
    <ProductionTypesContext.Provider
      value={[productionTypes, setProductionTypes]}
    >
      <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-primary text-white flex flex-col transition-all duration-300 ease-in-out z-20 shadow-lg ${
            isSidebarExpanded ? "w-64" : "w-16"
          }`}
        >
          {/* Top Icon */}
          <div className="h-[72px] pt-2 flex items-center border-b border-black/10 shrink-0 bg-black/5">
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className={`flex items-center w-full h-full hover:bg-black/10 transition-colors focus:outline-none ${
                isSidebarExpanded ? "px-4" : "justify-center"
              }`}
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
              {isSidebarExpanded && (
                <span className="ml-3 font-bold text-xl whitespace-nowrap overflow-hidden">
                  PrIM
                </span>
              )}
            </button>
          </div>

          {/* Top Modules */}
          <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
            {topModules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod)}
                className={`flex items-center px-4 py-3 w-full transition-colors ${
                  activeModule.id === mod.id
                    ? "bg-black/20 border-l-4 border-white"
                    : "hover:bg-black/10 border-l-4 border-transparent"
                }`}
                title={isSidebarExpanded ? undefined : mod.name}
              >
                {typeof mod.icon === "string" ? (
                  <span className="material-symbols-outlined">{mod.icon}</span>
                ) : (
                  <span className="flex items-center justify-center w-6 h-6">{mod.icon}</span>
                )}
                {isSidebarExpanded && (
                  <span className="ml-4 font-medium whitespace-nowrap">
                    {mod.name}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Modules */}
          <div className="py-4 border-t border-black/10 flex flex-col gap-1 shrink-0 bg-black/5">
            {bottomModules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod)}
                className={`flex items-center px-4 py-3 w-full transition-colors ${
                  activeModule.id === mod.id
                    ? "bg-black/20 border-l-4 border-white"
                    : "hover:bg-black/10 border-l-4 border-transparent"
                }`}
                title={isSidebarExpanded ? undefined : mod.name}
              >
                {typeof mod.icon === "string" ? (
                  <span className="material-symbols-outlined">{mod.icon}</span>
                ) : (
                  <span className="flex items-center justify-center w-6 h-6">{mod.icon}</span>
                )}
                {isSidebarExpanded && (
                  <span className="ml-4 font-medium whitespace-nowrap">
                    {mod.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-[72px] pt-2 bg-white shadow-md flex items-center justify-between px-6 shrink-0 z-10">
            <h1 className="text-xl font-semibold text-gray-800">
              {activeModule.headerName || activeModule.name}
            </h1>
            {activeModule.id === "orders" && (
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors">
                  Mapping
                </button>
                <div className="flex bg-gray-100 p-1 rounded-md border border-gray-200">
                  <button
                    onClick={() => setOrdersState("orders")}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      ordersState === "orders"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setOrdersState("empty")}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      ordersState === "empty"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Empty
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Module Content */}
          <div
            className={`flex-1 flex flex-col min-h-0 ${
              ["files", "components", "products", "orders"].includes(
                activeModule.id,
              )
                ? "p-6 md:p-8 pb-0 md:pb-0 overflow-auto lg:overflow-hidden"
                : "p-6 md:p-8 overflow-auto"
            }`}
          >
            {/* 12-Column Grid Container applied consistently to all pages */}
            <div
              className={`grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto w-full flex-1 ${
                ["files", "components", "products", "orders"].includes(
                  activeModule.id,
                )
                  ? "lg:grid-rows-1 lg:min-h-0"
                  : "content-start"
              }`}
            >
              {activeModule.id === "program" ? (
                <ProgramModule
                  onNavigateToFiles={navigateToFilesWithFilter}
                  files={globalFiles}
                  setFiles={setGlobalFiles}
                />
              ) : activeModule.id === "projects" ? (
                <ProjectsModule />
              ) : activeModule.id === "files" ? (
                <FilesModule
                  initialSearchTerm={filesSearchFilter}
                  files={globalFiles}
                  setFiles={setGlobalFiles}
                />
              ) : activeModule.id === "components" ? (
                <ComponentsModule />
              ) : activeModule.id === "products" ? (
                <ProductsModule />
              ) : activeModule.id === "orders" ? (
                <OrdersModule ordersState={ordersState} />
              ) : activeModule.id === "settings" ? (
                <SettingsModule />
              ) : activeModule.id === "user" ? (
                <UserModule
                  currentUser={simulatedUser}
                  onSwitchUser={handleSimulatedLogin}
                />
              ) : (
                <div className="col-span-12 flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 bg-gray-50">
                  <div className="text-center">
                    {typeof activeModule.icon === "string" ? (
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                        {activeModule.icon}
                      </span>
                    ) : (
                      <span className="inline-flex text-4xl mb-2 opacity-50 items-center justify-center">
                        {activeModule.icon}
                      </span>
                    )}
                    <p>
                      {activeModule.name} module content will be placed here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProductionTypesContext.Provider>
  );
}
