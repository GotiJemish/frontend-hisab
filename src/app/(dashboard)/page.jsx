export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Metric {i + 1}</h3>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">1,234</p>
          <span className="text-sm text-green-500 font-medium">+12.5% from last month</span>
        </div>
      ))}
      
      <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <p className="text-gray-500 dark:text-gray-400">Activity chart or table goes here...</p>
        </div>
      </div>
    </div>
  );
}
