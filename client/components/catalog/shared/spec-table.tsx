import { type ProductSpec } from "@/lib/catalog";

type SpecTableProps = {
  rows: ProductSpec[];
};

function SpecTable({ rows }: SpecTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-100 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2" scope="col">
              Spec
            </th>
            <th className="px-4 py-2" scope="col">
              Value
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-4 py-2 font-medium text-gray-900">{row.label}</td>
              <td className="px-4 py-2 text-gray-600">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { SpecTable };
