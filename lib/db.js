import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

async function readJson(file) {
  const raw = await fs.readFile(path.join(dataDir, file), "utf8");
  return JSON.parse(raw || "[]");
}

async function writeJson(file, data) {
  await fs.writeFile(path.join(dataDir, file), JSON.stringify(data, null, 2), "utf8");
}

export const db = {
  users: {
    list: () => readJson("users.json"),
    async findByEmail(email) {
      const users = await readJson("users.json");
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },
    async findById(id) {
      const users = await readJson("users.json");
      return users.find((u) => u.id === id);
    },
    async create(user) {
      const users = await readJson("users.json");
      users.push(user);
      await writeJson("users.json", users);
      return user;
    },
  },
  products: {
    list: () => readJson("products.json"),
    async create(product) {
      const products = await readJson("products.json");
      products.unshift(product);
      await writeJson("products.json", products);
      return product;
    },
    async remove(id) {
      const products = await readJson("products.json");
      const next = products.filter((p) => p.id !== id);
      await writeJson("products.json", next);
    },
  },
  orders: {
    list: () => readJson("orders.json"),
    async create(order) {
      const orders = await readJson("orders.json");
      orders.unshift(order);
      await writeJson("orders.json", orders);
      return order;
    },
    async updateStatus(id, status) {
      const orders = await readJson("orders.json");
      const target = orders.find((o) => o.id === id);
      if (!target) return null;
      target.status = status;
      await writeJson("orders.json", orders);
      return target;
    },
  },
};
