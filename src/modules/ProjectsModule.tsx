

export function ProjectsModule() {
  return (
    <>
      <div className="col-span-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Projects Overview
        </h2>
        <p className="text-gray-600">This card spans all 12 columns.</p>
      </div>

      <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Active Projects
        </h2>
        <p className="text-gray-600">This card spans 6 columns.</p>
      </div>
      <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Completed Projects
        </h2>
        <p className="text-gray-600">This card spans 6 columns.</p>
      </div>
    </>
  );
}
