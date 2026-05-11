import { NextResponse } from "next/server";
import si from "systeminformation";

export async function GET() {
  try {
    const [cpu, mem, graphics, os, diskLayout, fsSize] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics(),
      si.osInfo(),
      si.diskLayout(),
      si.fsSize(),
    ]);

    const firstDisk = diskLayout[0];
    const driver =
      typeof (firstDisk as unknown as { driver?: unknown })?.driver === "string"
        ? ((firstDisk as unknown as { driver?: unknown }).driver as string)
        : undefined;

    const isSSD =
      !!firstDisk &&
      (firstDisk.type === "SSD" ||
        (driver?.toLowerCase().includes("nvme") ?? false) ||
        (driver?.toLowerCase().includes("solid") ?? false));

    const storageType = isSSD ? "SSD" : "HD";

    const gpus = graphics.controllers.map((g) => ({
      model: g.model,
      vram: g.vram,
      vendor: g.vendor,
    }));

    const totalDisk = diskLayout.reduce((acc, d) => acc + (d.size || 0), 0);

    const specs = {
      cpu: {
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed,
        manufacturer: cpu.manufacturer,
      },
      ram: {
        total: Math.round(mem.total / 1024 / 1024 / 1024),
        free: Math.round(mem.free / 1024 / 1024 / 1024),
      },
      gpu: gpus[0] || { model: "Unknown", vram: 0, vendor: "Unknown" },
      allGpus: gpus,
      os: {
        platform: os.platform,
        distro: os.distro,
        release: os.release,
        arch: os.arch,
      },
      disk: {
        totalGB: Math.round(totalDisk / 1024 / 1024 / 1024),
        type: storageType,
      },
    };

    return NextResponse.json({ success: true, specs });
  } catch (error) {
    console.error("Error reading specs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to read system specs" },
      { status: 500 },
    );
  }
}
