// Generic API wrapper for frontend CRUD operations

export const apiService = {
  // --- Shoots ---
  async getShoots() {
    const res = await fetch("/api/shoots");
    if (!res.ok) throw new Error("Failed to fetch shoots");
    return res.json();
  },

  async createShoot(data: any) {
    const res = await fetch("/api/shoots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create shoot");
    return res.json();
  },

  async updateShoot(id: string, data: any) {
    const res = await fetch(`/api/shoots/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update shoot");
    return res.json();
  },

  async deleteShoot(id: string) {
    const res = await fetch(`/api/shoots/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete shoot");
    return res.json();
  },

  // --- Equipment ---
  async deleteEquipment(id: string) {
    const res = await fetch(`/api/equipment/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete equipment");
    return res.json();
  },
};
