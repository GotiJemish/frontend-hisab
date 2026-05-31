import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card/Card";

export const PERMISSION_MODULES = [
  { id: "users", label: "Users & Roles Management" },
  { id: "invoices", label: "Invoices & Billing" },
  { id: "taxes", label: "Taxes (GST)" },
  { id: "items", label: "Items & Inventory" },
  { id: "contacts", label: "Contacts & Customers" },
  { id: "accounts", label: "Accounts & Cash Flow" },
];

export const ACTIONS = ["create", "read", "update", "delete"];

export function PermissionMatrix({ permissions, onChange }) {
  // Helpers
  const handleToggle = (module, action, checked) => {
    onChange({
      ...permissions,
      [module]: {
        ...(permissions[module] || {}),
        [action]: checked,
      }
    });
  };

  const handleSelectRow = (module, checked) => {
    const newModulePerms = {};
    ACTIONS.forEach(a => newModulePerms[a] = checked);
    onChange({
      ...permissions,
      [module]: newModulePerms
    });
  };

  const handleSelectColumn = (action, checked) => {
    const newPerms = { ...permissions };
    PERMISSION_MODULES.forEach(m => {
      newPerms[m.id] = {
        ...(newPerms[m.id] || {}),
        [action]: checked
      };
    });
    onChange(newPerms);
  };

  const isRowSelected = (module) => {
    return ACTIONS.every(a => permissions[module]?.[a]);
  };

  const isRowIndeterminate = (module) => {
    const some = ACTIONS.some(a => permissions[module]?.[a]);
    return some && !isRowSelected(module);
  };

  const isColSelected = (action) => {
    return PERMISSION_MODULES.every(m => permissions[m.id]?.[action]);
  };

  const isColIndeterminate = (action) => {
    const some = PERMISSION_MODULES.some(m => permissions[m.id]?.[action]);
    return some && !isColSelected(action);
  };

  return (
    <div className="overflow-x-auto border rounded-xl dark:border-gray-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Modules</th>
            {ACTIONS.map(action => (
              <th key={action} className="px-4 py-3 text-center">
                <label className="flex flex-col items-center gap-1 cursor-pointer">
                  <span className="capitalize font-semibold text-gray-700 dark:text-gray-300">{action}</span>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    checked={isColSelected(action)}
                    ref={input => {
                      if (input) input.indeterminate = isColIndeterminate(action);
                    }}
                    onChange={(e) => handleSelectColumn(action, e.target.checked)}
                  />
                </label>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-700 bg-white dark:bg-gray-900">
          {PERMISSION_MODULES.map(module => (
            <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-3">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-900 dark:text-gray-100">
                  <input 
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    checked={isRowSelected(module.id)}
                    ref={input => {
                      if (input) input.indeterminate = isRowIndeterminate(module.id);
                    }}
                    onChange={(e) => handleSelectRow(module.id, e.target.checked)}
                  />
                  {module.label}
                </label>
              </td>
              {ACTIONS.map(action => (
                <td key={action} className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    checked={!!permissions[module.id]?.[action]}
                    onChange={(e) => handleToggle(module.id, action, e.target.checked)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
