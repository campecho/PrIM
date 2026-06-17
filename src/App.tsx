import { lazy, Suspense, useState } from "react";
import { FakeLoginOverlay } from "./components/FakeLoginOverlay";
import { INITIAL_PRODUCTION_TYPES, ProductionTypesContext } from "./context/ProductionTypesContext";
import { MOCK_FILES } from "./data/mockData";
import { usePersistentState } from "./hooks/usePersistentState";
import { bottomModules, topModules } from "./navigation";
import { FileAsset, Module } from "./types";
import { Button, Icon, NavButton, SegmentedControl } from "./ui";

// Modules are code-split so each loads on demand, keeping the initial
// bundle small and isolating heavy dependencies (pdf-lib, xlsx, exifr).
const ProgramModule = lazy(() => import("./modules/ProgramModule").then((m) => ({ default: m.ProgramModule })));
const ProjectsModule = lazy(() => import("./modules/ProjectsModule").then((m) => ({ default: m.ProjectsModule })));
const FilesModule = lazy(() => import("./modules/FilesModule").then((m) => ({ default: m.FilesModule })));
const ComponentsModule = lazy(() => import("./modules/ComponentsModule").then((m) => ({ default: m.ComponentsModule })));
const ProductsModule = lazy(() => import("./modules/ProductsModule").then((m) => ({ default: m.ProductsModule })));
const OrdersModule = lazy(() => import("./modules/OrdersModule").then((m) => ({ default: m.OrdersModule })));
const SettingsModule = lazy(() => import("./modules/SettingsModule").then((m) => ({ default: m.SettingsModule })));
const UserModule = lazy(() => import("./modules/UserModule").then((m) => ({ default: m.UserModule })));

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

  const [globalFiles, setGlobalFiles] = usePersistentState(
    "appData",
    "files",
    MOCK_FILES,
  );
  const [globalSelectedFile, setGlobalSelectedFile] =
    useState<FileAsset | null>(null);

  const [productionTypes, setProductionTypes] = usePersistentState(
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
              <Icon name="menu" size="text-3xl" />
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
              <NavButton
                key={mod.id}
                icon={mod.icon}
                label={mod.name}
                active={activeModule.id === mod.id}
                expanded={isSidebarExpanded}
                onClick={() => setActiveModule(mod)}
              />
            ))}
          </nav>

          {/* Bottom Modules */}
          <div className="py-4 border-t border-black/10 flex flex-col gap-1 shrink-0 bg-black/5">
            {bottomModules.map((mod) => (
              <NavButton
                key={mod.id}
                icon={mod.icon}
                label={mod.name}
                active={activeModule.id === mod.id}
                expanded={isSidebarExpanded}
                onClick={() => setActiveModule(mod)}
              />
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
                <Button variant="secondary" pill={false} size="sm">
                  Mapping
                </Button>
                <SegmentedControl
                  value={ordersState}
                  onChange={(v) => setOrdersState(v)}
                  options={[
                    { value: "orders", label: "Orders" },
                    { value: "empty", label: "Empty" },
                  ]}
                />
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
              <Suspense
                fallback={
                  <div className="col-span-12 flex items-center justify-center h-64 text-gray-400">
                    <Icon name="progress_activity" size="text-4xl" className="animate-spin" />
                  </div>
                }
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
                      <Icon name={activeModule.icon} size="text-4xl" className="mb-2 opacity-50" />
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
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </ProductionTypesContext.Provider>
  );
}
