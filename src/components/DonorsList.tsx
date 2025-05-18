'use client';

import React from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabase';

interface Donor {
  id: number;
  name: string;
  email: string;
  amount: number;
  created_at: string;
}

export default function DonorsList() {
  const { data: donors, error, loading } = useSupabaseQuery<Donor>('donors', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 10
  });

  if (loading) return <div className="p-4 text-center">Cargando donantes...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;
  if (!donors || donors.length === 0) return <div className="p-4 text-center">No hay donantes registrados.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Últimos Donantes</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-right">Monto</th>
              <th className="py-2 px-4 text-right">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor) => (
              <tr key={donor.id} className="border-t border-gray-200">
                <td className="py-2 px-4">{donor.name}</td>
                <td className="py-2 px-4">{donor.email}</td>
                <td className="py-2 px-4 text-right">${donor.amount.toFixed(2)}</td>
                <td className="py-2 px-4 text-right">
                  {new Date(donor.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 