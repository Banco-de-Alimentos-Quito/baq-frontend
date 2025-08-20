'use client';

import React from 'react';

interface Donor {
  id: number;
  name: string;
  email: string;
  amount: number;
  created_at: string;
}

// Datos estáticos de ejemplo para donantes
const mockDonors: Donor[] = [
  {
    id: 1,
    name: "María González",
    email: "maria@example.com",
    amount: 150.00,
    created_at: "2024-12-28T10:30:00Z"
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    email: "carlos@example.com",
    amount: 75.50,
    created_at: "2024-12-27T15:45:00Z"
  },
  {
    id: 3,
    name: "Ana Martínez",
    email: "ana@example.com",
    amount: 200.00,
    created_at: "2024-12-26T09:15:00Z"
  },
  {
    id: 4,
    name: "Luis Pérez",
    email: "luis@example.com",
    amount: 50.00,
    created_at: "2024-12-25T14:20:00Z"
  },
  {
    id: 5,
    name: "Sofia Herrera",
    email: "sofia@example.com",
    amount: 125.75,
    created_at: "2024-12-24T11:30:00Z"
  }
];

export default function DonorsList() {
  const donors = mockDonors;

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