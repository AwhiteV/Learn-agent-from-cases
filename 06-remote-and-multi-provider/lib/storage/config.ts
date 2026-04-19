import fs from "node:fs/promises";

import type { StoredConfig, StoragePaths } from "@/lib/storage";

export class ConfigStorage {
  constructor(private readonly paths: StoragePaths) {}

  async read(): Promise<StoredConfig | null> {
    try {
      const content = await fs.readFile(this.paths.configPath, "utf8");
      return JSON.parse(content) as StoredConfig;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }

      throw error;
    }
  }

  async write(config: StoredConfig): Promise<void> {
    await fs.writeFile(this.paths.configPath, JSON.stringify(config, null, 2), "utf8");
  }
}
