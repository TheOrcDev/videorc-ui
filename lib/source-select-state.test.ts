import { describe, expect, it } from "vitest";

import {
  DEVICE_PICKER_NONE_VALUE,
  devicePickerGroups,
  devicePickerListStatus,
  devicePickerTriggerView,
  deviceStatusLabel,
  sourceMatchesQuery,
  unlistedSelection,
} from "@/lib/source-select-state";
import type { PickerDevice } from "@/lib/source-select-state";

const cameras: PickerDevice[] = [
  {
    id: "cam-1",
    kind: "camera",
    name: "FaceTime HD Camera",
    status: "available",
  },
  {
    id: "cam-2",
    kind: "camera",
    name: "Cam Link 4K",
    status: "permission-required",
  },
];
const camera = {
  devices: cameras,
  discoveryPending: false,
  kind: "camera" as const,
};

const status = (
  deviceCount: number,
  matchCount: number,
  discoveryPending: boolean
) =>
  devicePickerListStatus({
    deviceCount,
    discoveryPending,
    kind: "microphone",
    matchCount,
  });

// A picker always has words, and every picker says them the same way:
// loading, none found, a saved id no device matches, and a device that can't
// run, never the raw status.
describe("device picker words", () => {
  it("turns device statuses into words and says nothing for a working device", () => {
    expect(deviceStatusLabel("available")).toBeNull();
    expect(deviceStatusLabel("permission-required")).toBe("Needs permission");
    expect(deviceStatusLabel("unavailable")).toBe("Unavailable");
    expect(deviceStatusLabel("missing")).toBe("Not found");
  });

  it("shows at most one list status line: discovery, then empty, then no match", () => {
    expect(status(0, 0, true)).toBe("Finding microphones…");
    expect(status(3, 0, true)).toBe("Finding microphones…");
    expect(status(0, 0, false)).toBe("No microphones found");
    expect(status(3, 0, false)).toBe("No matching microphones");
    expect(status(3, 2, false)).toBeNull();
    expect(
      devicePickerListStatus({
        deviceCount: 0,
        discoveryPending: false,
        kind: "capture",
        matchCount: 0,
      })
    ).toBe("No screens or windows found");
  });
});

describe("device picker trigger", () => {
  it("names the selected device, with its status when it can't run", () => {
    expect(
      devicePickerTriggerView({ ...camera, noneLabel: "Off", value: "cam-1" })
    ).toEqual({
      label: "FaceTime HD Camera",
      placeholder: false,
      status: null,
    });
    expect(devicePickerTriggerView({ ...camera, value: "cam-2" })).toEqual({
      label: "Cam Link 4K",
      placeholder: false,
      status: "Needs permission",
    });
  });

  it("lets discovery and an empty list win over the no-device words", () => {
    const off = { ...camera, noneLabel: "Off", value: undefined };
    expect(devicePickerTriggerView({ ...off, discoveryPending: true })).toEqual(
      {
        label: "Finding cameras…",
        placeholder: true,
        status: null,
      }
    );
    expect(devicePickerTriggerView({ ...off, devices: [] }).label).toBe(
      "No cameras found"
    );
    expect(devicePickerTriggerView(off)).toEqual({
      label: "Off",
      placeholder: false,
      status: null,
    });
    expect(devicePickerTriggerView({ ...off, noneLabel: undefined })).toEqual({
      label: "Choose a camera",
      placeholder: true,
      status: null,
    });
  });

  it("keeps a saved device by name and calls it Not found only after discovery", () => {
    const saved = { ...camera, selectedName: "Old Webcam", value: "gone" };
    expect(devicePickerTriggerView(saved)).toEqual({
      label: "Old Webcam",
      placeholder: false,
      status: "Not found",
    });
    expect(
      devicePickerTriggerView({ ...saved, discoveryPending: true }).status
    ).toBeNull();
    expect(
      devicePickerTriggerView({ ...saved, selectedName: undefined }).label
    ).toBe("Saved camera");
    expect(
      devicePickerTriggerView({
        ...saved,
        kind: "capture",
        selectedName: undefined,
      }).label
    ).toBe("Saved screen or window");
  });

  it("doesn't call a connected source the list hides Not found", () => {
    const hidden = {
      id: "screen:legacy",
      name: "Built-in Display",
      status: "available" as const,
    };
    const input = {
      ...camera,
      kind: "capture" as const,
      value: "screen:legacy",
    };
    expect(
      devicePickerTriggerView({ ...input, selectedDevice: hidden })
    ).toEqual({
      label: "Built-in Display",
      placeholder: false,
      status: null,
    });
    // A stale selectedDevice for another id is ignored.
    expect(
      unlistedSelection({
        ...input,
        selectedDevice: { ...hidden, id: "other" },
      })?.status
    ).toBe("Not found");
  });

  it("names a selection that isn't a device (the test pattern) over everything", () => {
    expect(
      devicePickerTriggerView({
        ...camera,
        discoveryPending: true,
        kind: "capture",
        noneLabel: "None",
        selectionLabel: "Test pattern",
        value: undefined,
      })
    ).toEqual({ label: "Test pattern", placeholder: false, status: null });
  });
});

describe("device picker list", () => {
  it("leads with the no-device item, then a missing selection, then devices", () => {
    const groups = devicePickerGroups({
      ...camera,
      noneLabel: "Off",
      selectedName: "Old Webcam",
      value: "gone",
    });
    expect(
      groups.map((group) => group.items.map((item) => item.label))
    ).toEqual([["Off"], ["Old Webcam"], ["FaceTime HD Camera", "Cam Link 4K"]]);
    expect(groups[0]?.items[0]).toMatchObject({
      disabled: false,
      selected: false,
      value: DEVICE_PICKER_NONE_VALUE,
    });
    expect(groups[1]?.items[0]).toMatchObject({
      disabled: true,
      selected: true,
      status: "Not found",
      value: "gone",
    });
    expect(groups[2]?.items[1]).toMatchObject({
      disabled: true,
      status: "Needs permission",
    });
  });

  it("marks the no-device item selected when nothing is, and keeps it through a search", () => {
    const groups = devicePickerGroups({
      ...camera,
      noneLabel: "Off",
      query: "nothing",
      value: undefined,
    });
    expect(groups).toEqual([
      {
        items: [
          {
            disabled: false,
            label: "Off",
            selected: true,
            status: null,
            value: DEVICE_PICKER_NONE_VALUE,
          },
        ],
      },
    ]);
  });

  it("groups screens and windows only when both are present", () => {
    const capture: PickerDevice[] = [
      { id: "w", kind: "window", name: "Editor", status: "available" },
      { id: "s", kind: "screen", name: "Display 1", status: "available" },
    ];
    const input = {
      devices: capture,
      discoveryPending: false,
      groupByKind: true,
      kind: "capture" as const,
      value: "s",
    };
    const grouped = devicePickerGroups(input);
    expect(grouped.map((group) => group.heading)).toEqual([
      "Screens",
      "Windows",
    ]);
    expect(grouped[0]?.items[0]).toMatchObject({ selected: true, value: "s" });
    expect(devicePickerGroups({ ...input, query: "editor" })).toEqual([
      {
        items: [
          {
            disabled: false,
            label: "Editor",
            selected: false,
            status: null,
            value: "w",
          },
        ],
      },
    ]);
    expect(
      devicePickerGroups({ ...input, groupByKind: false })[0]?.heading
    ).toBeUndefined();
  });
});

describe("source search", () => {
  it("matches all trimmed words across visible fields, keeping accents and non-Latin text", () => {
    const source = {
      detail: "Safari presentation",
      kind: "window",
      name: "Café 東京",
    };
    expect(sourceMatchesQuery(source, "  SAFARI   café ")).toBe(true);
    expect(sourceMatchesQuery(source, "東京 window")).toBe(true);
    expect(sourceMatchesQuery(source, "camera")).toBe(false);
  });

  it("filters a large list without collapsing duplicate labels or searching opaque ids", () => {
    const sources = Array.from({ length: 500 }, (_, index) => ({
      detail: `App ${index}`,
      id: `opaque-${index}`,
      kind: "window",
      name: "Window",
    }));
    expect(
      sources.filter((source) => sourceMatchesQuery(source, "window"))
    ).toHaveLength(500);
    expect(
      sources.filter((source) => sourceMatchesQuery(source, "opaque"))
    ).toHaveLength(0);
    expect(
      sources
        .filter((source) => sourceMatchesQuery(source, "app 499"))
        .map((source) => source.id)
    ).toEqual(["opaque-499"]);
  });
});
