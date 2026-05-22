"use client";

import { useEffect, useState } from "react";
import { getSalesOrders } from "@/lib/supabase-data";

interface SalesViewProps {
  onToast: (message: string) => void;
}

type Sale = {
  customer_name: string;
  product: string;
  quantity: string;
  total_amount: number | null;
  status: string;
};

const fallbackSales: Sale[] = [
  { customer_name: "Tienda Natural Sur", product: "Miel 500 g", quantity: "120 frascos", total_amount: 576000, status: "quoted" },
  { customer_name: "Feria San Carlos", product: "Miel 1 kg", quantity: "80 frascos", total_amount: 640000, status: "reserved" },
  { customer_name: "Restaurant Valle", product: "Miel balde 5 kg", quantity: "12 baldes", total_amount: 360000, status: "paid" },
  { customer_name: "Mercado Local", product: "Pack degustacion", quantity: "48 frascos", total_amount: 216000, status: "delivered" }
];

export function SalesView({ onToast }: SalesViewProps) {
  const [sales, setSales] = useState<Sale[]>(fallbackSales);
  const total = sales.reduce((sum, sale) => sum + Number(sale.total_amount ?? 0), 0);

  useEffect(() => {
    getSalesOrders().then((rows) => {
      if (rows.length) setSales(rows as Sale[]);
    });
  }, []);

  return (
    <>
      <div className="sales-layout">
        <section className="card sales-hero">
          <div>
            <span className="pill">Pipeline comercial</span>
            <h2>{formatCurrency(total)} en oportunidades activas</h2>
            <p>Gestiona clientes, lotes, reservas y margen sin mezclarlo con los registros sanitarios.</p>
          </div>
          <button className="primary-button" onClick={() => onToast("Nueva venta agregada al pipeline")} type="button">Nueva venta</button>
        </section>
        <section className="card">
          <div className="panel-header"><h2>Resumen</h2></div>
          <div className="metric-stack">
            <article><strong>$4.800/kg</strong><span>Precio promedio</span></article>
            <article><strong>{sales.length}</strong><span>Clientes activos</span></article>
            <article><strong>43,8%</strong><span>Margen lote lider</span></article>
          </div>
        </section>
      </div>
      <div className="kanban-board">
        {sales.map((sale) => (
          <Column
            client={sale.customer_name}
            detail={`${sale.quantity} · ${sale.product}`}
            key={`${sale.customer_name}-${sale.product}`}
            title={statusLabel(sale.status)}
            total={formatCurrency(Number(sale.total_amount ?? 0))}
          />
        ))}
      </div>
    </>
  );
}

function Column({ title, client, detail, total }: { title: string; client: string; detail: string; total: string }) {
  return (
    <section className="kanban-column">
      <h2>{title}</h2>
      <article>
        <strong>{client}</strong>
        <p>{detail}</p>
        <b>{total}</b>
      </article>
    </section>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", { currency: "CLP", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function statusLabel(status: string) {
  return ({ quoted: "Cotizado", reserved: "Reservado", paid: "Pagado", delivered: "Entregado" } as Record<string, string>)[status] ?? "Venta";
}
