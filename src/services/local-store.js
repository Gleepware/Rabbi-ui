export function delay(ms = 300, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

export function createLocalStore({ storeKey, nextIdKey }) {
  function load() {
    const raw = localStorage.getItem(storeKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function save(records) {
    localStorage.setItem(storeKey, JSON.stringify(records));
  }

  function loadNextId() {
    const raw = localStorage.getItem(nextIdKey);
    if (raw) return Number(raw);
    const maxId = load().reduce((max, record) => Math.max(max, Number(record.id)), 0);
    localStorage.setItem(nextIdKey, String(maxId + 1));
    return maxId + 1;
  }

  function saveNextId(id) {
    localStorage.setItem(nextIdKey, String(id));
  }

  return {
    async list() {
      await delay();
      return [...load()];
    },

    async get(id) {
      await delay();
      return load().find((record) => record.id === id) ?? null;
    },

    async create(buildRecord) {
      await delay();
      const nextId = loadNextId();
      const records = load();
      const record = buildRecord(String(nextId));
      records.push(record);
      save(records);
      saveNextId(nextId + 1);
      return record;
    },

    async update(id, patch) {
      await delay();
      const records = load();
      const record = records.find((r) => r.id === id);
      if (!record) return null;
      for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) record[key] = value;
      }
      save(records);
      return { ...record };
    },

    async remove(id) {
      await delay();
      const records = load();
      const index = records.findIndex((r) => r.id === id);
      if (index === -1) return null;
      const [removed] = records.splice(index, 1);
      save(records);
      return removed;
    },

    mutate(id, fn) {
      const records = load();
      const record = records.find((r) => r.id === id);
      if (!record) return null;
      fn(record);
      save(records);
      return { ...record };
    },

    loadNextId,
    saveNextId,
  };
}