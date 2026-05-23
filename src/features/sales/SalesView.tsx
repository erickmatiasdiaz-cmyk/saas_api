"use client";

import { useEffect, useState } from "react";
import { getSalesOrders, saveSalesOrder } from "@/lib/supabase-data";

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
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerChannel: "Retail local",
    product: "Miel 500 g",
    quantity: "",
    unitPrice: "4800",
    totalAmount: "",
    status: "quoted",
    notes: ""
  });
  const total = sales.reduce((sum, sale) => sum + Number(sale.total_amount ?? 0), 0);

  function loadSales() {
    return getSalesOrders().then((rows) => {
      if (rows.length) setSales(rows as Sale[]);
    });
  }

  useEffect(() => {
    void loadSales();
  }, []);

  async function handleSave() {
    if (!form.customerName || !form.quantity) {
      onToast("Completa cliente y cantidad");
      return;
    }

    setSaving(true);
    try {
      const id = await saveSalesOrder(form);
      await loadSales();
      setOpen(false);
      onToast(`Venta guardada en Supabase: ${id.slice(0, 8)}`);
    } catch (error) {
      onToast(error instanceof Error ? error.message : "No se pudo guardar venta");
    } finally {
      setSaving(false);
    }
  }

  function update(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <div className="sales-layout">
        <section className="card sales-hero">
          <div>
            <span className="pill">Pipeline comercial</span>
            <h2>{formatCurrency(total)} en oportunidades activas</h2>
            <p>Gestiona clientes, lotes, reservas y margen sin mezclarlo con los registros sanitarios.</p>
          </div>
          <button className="primary-button" onClick={() => setOpen((value) => !value)} type="button">Nueva venta</button>
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
      {open && (
        <section className="card record-editor open">
          <div className="panel-header">
            <div>
              <span className="pill">CRM apicola</span>
              <h2>Nueva oportunidad comercial</h2>
              <p>Registra cliente, producto, estado y monto directamente en Supabase.</p>
            </div>
            <button className="ghost-button" onClick={() => setOpen(false)} type="button">Cerrar</button>
          </div>
          <div className="form-grid triple">
            <label>Cliente<input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} /></label>
            <label>Canal<input value={form.customerChannel} onChange={(event) => update("customerChannel", event.target.value)} /></label>
            <label>Producto<input value={form.product} onChange={(event) => update("product", event.target.value)} /></label>
            <label>Cantidad<input value={form.quantity} onChange={(event) => update("quantity", event.target.value)} placeholder="120 frascos" /></label>
            <label>Precio unitario<input min="0" type="number" value={form.unitPrice} onChange={(event) => update("unitPrice", event.target.value)} /></label>
            <label>Total<input min="0" type="number" value={form.totalAmount} onChange={(event) => update("totalAmount", event.target.value)} /></label>
            <label>Estado
              <select value={form.status} onChange={(event) => update("status", event.target.value)}>
                <option value="quoted">Cotizado</option>
                <option value="reserved">Reservado</option>
                <option value="paid">Pagado</option>
                <option value="delivered">Entregado</option>
              </select>
            </label>
            <label className="wide-field">Notas<textarea rows={3} value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label>
          </div>
          <div className="modal-actions">
            <button className="primary-button" disabled={saving} onClick={() => void handleSave()} type="button">{saving ? "Guardando..." : "Guardar venta"}</button>
          </div>
        </section>
      )}
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
