import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DevicePicker } from "@/components/device-picker";
import type {
  DevicePickerProps,
  PickerDevice,
} from "@/components/device-picker";

type Props = Omit<DevicePickerProps, "onChange">;

const onChange = vi.fn();

const devices: PickerDevice[] = [
  { id: "screen", kind: "screen", name: "Display", status: "available" },
  {
    detail: "Safari",
    id: "window-a",
    kind: "window",
    name: "Café 東京",
    status: "available",
  },
  {
    detail: "Editor",
    id: "window-b",
    kind: "window",
    name: "Café 東京",
    status: "available",
  },
  {
    detail: "Window discovery failed: denied",
    id: "locked",
    kind: "window",
    name: "Private",
    status: "permission-required",
  },
];

const cameras: PickerDevice[] = [
  {
    id: "cam-1",
    kind: "camera",
    name: "FaceTime HD Camera",
    status: "available",
  },
  { id: "cam-2", kind: "camera", name: "Desk Camera", status: "available" },
  { id: "cam-3", kind: "camera", name: "Cam Link 4K", status: "unavailable" },
];

const capture = (overrides: Partial<Props> = {}): Props => ({
  devices,
  groupByKind: true,
  kind: "capture",
  label: "Screen or window",
  noneLabel: "None",
  searchable: true,
  value: "screen",
  ...overrides,
});

const camera = (value: string | undefined, extra: Partial<Props> = {}) => ({
  devices: cameras,
  kind: "camera" as const,
  label: "Camera",
  noneLabel: "Off",
  value,
  ...extra,
});

const markup = (props: Props): string =>
  renderToStaticMarkup(<DevicePicker {...props} onChange={onChange} />);

const option = (value: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[cmdk-item][data-value="${value}"]`);

// Open, the search field is a combobox too: the trigger is found by its slot.
const trigger = (): HTMLElement => {
  const element = document.querySelector<HTMLElement>(
    "[data-slot=device-picker-trigger]"
  );
  if (!element) {
    throw new Error("No device picker trigger");
  }
  return element;
};

const searchField = (): Promise<HTMLElement> =>
  screen.findByPlaceholderText("Search screens and windows…");

beforeEach(() => {
  onChange.mockClear();
});

describe("searchable device picker", () => {
  it("chooses the right one of two same-named windows and keeps None through a search", async () => {
    const user = userEvent.setup();
    render(<DevicePicker {...capture()} onChange={onChange} />);
    await user.click(trigger());
    const controls = trigger().getAttribute("aria-controls") ?? "";
    expect(document.querySelector(`#${CSS.escape(controls)}`)).not.toBeNull();
    const input = await searchField();
    await waitFor(() => expect(input).toHaveFocus());
    await user.type(input, "editor 東京");
    expect(option("window-a")).toBeNull();
    expect(option("__none__")).not.toBeNull();
    await user.click(option("window-b") as HTMLElement);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("window-b");
  });

  it("dismisses with Escape without changing the choice, returns focus and clears the search", async () => {
    const user = userEvent.setup();
    render(<DevicePicker {...capture()} onChange={onChange} />);
    await user.click(trigger());
    await user.type(await searchField(), "nothing matches");
    expect(document.body).toHaveTextContent("No matching screens or windows");
    await user.keyboard("{Escape}");
    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger()).toHaveFocus());
    await user.click(trigger());
    expect(await searchField()).toHaveValue("");
  });

  it("disables entries that can't run and copes with one disappearing mid-search", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <DevicePicker {...capture()} onChange={onChange} />
    );
    await user.click(trigger());
    expect(option("locked")).toHaveAttribute("aria-disabled", "true");
    await user.type(await searchField(), "café");
    rerender(
      <DevicePicker
        {...capture({
          devices: [devices[0] as PickerDevice],
          value: "window-a",
        })}
        onChange={onChange}
      />
    );
    expect(trigger()).toHaveTextContent("Saved screen or window");
    expect(trigger()).toHaveTextContent("Not found");
    expect(document.body).toHaveTextContent("No matching screens or windows");
    expect(onChange).not.toHaveBeenCalled();
    await user.click(option("__none__") as HTMLElement);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it("chooses a filtered source from the keyboard", async () => {
    const user = userEvent.setup();
    render(<DevicePicker {...capture()} onChange={onChange} />);
    await user.click(trigger());
    await user.type(await searchField(), "editor");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledExactlyOnceWith("window-b");
  });

  it("names a status in words after the device, never the raw status or detail", async () => {
    const user = userEvent.setup();
    render(<DevicePicker {...capture()} onChange={onChange} />);
    await user.click(trigger());
    expect(option("locked")).toHaveTextContent(/^PrivateNeeds permission$/u);
    expect(document.body).not.toHaveTextContent("permission-required");
    expect(document.body).not.toHaveTextContent("discovery failed");
    expect(document.body).not.toHaveTextContent("Safari");
    // Screens and windows keep their own headings.
    expect(document.body).toHaveTextContent("Screens");
    expect(document.body).toHaveTextContent("Windows");
  });

  it("shows one status line while discovery runs, not two", async () => {
    const user = userEvent.setup();
    render(
      <DevicePicker
        {...capture({ devices: [], value: undefined })}
        discoveryPending
        onChange={onChange}
      />
    );
    expect(trigger()).toHaveTextContent(/^Finding screens and windows…$/u);
    await user.click(trigger());
    await screen.findByRole("dialog");
    const lines = screen.getAllByRole("status").map((line) => line.textContent);
    expect(lines).toEqual(["Finding screens and windows…"]);
  });
});

describe("device picker without search", () => {
  it("opens a list at the menu row height and focuses it for the keys", async () => {
    const user = userEvent.setup();
    render(<DevicePicker {...camera("cam-1")} onChange={onChange} />);
    expect(trigger()).toHaveAttribute("aria-haspopup", "listbox");
    await user.click(trigger());
    const list = await screen.findByRole("listbox", { name: "Camera" });
    expect(screen.queryByRole("textbox")).toBeNull();
    await waitFor(() => expect(list).toHaveFocus());
    expect(option("cam-1")).toHaveClass("min-h-7");
    // The highlight starts on the current choice.
    expect(option("cam-1")).toHaveAttribute("aria-selected", "true");
    act(() => {
      fireEvent.keyDown(list, { key: "ArrowDown" });
    });
    act(() => {
      fireEvent.keyDown(list, { key: "Enter" });
    });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("cam-2");
  });

  it("turns the camera Off through its none item", async () => {
    const user = userEvent.setup();
    render(<DevicePicker {...camera("cam-1")} onChange={onChange} />);
    await user.click(trigger());
    await screen.findByRole("listbox");
    expect(option("__none__")).toHaveTextContent(/^Off$/u);
    expect(option("cam-3")).toHaveTextContent(/^Cam Link 4KUnavailable$/u);
    expect(option("cam-3")).toHaveAttribute("aria-disabled", "true");
    expect(option("cam-1")).toHaveAttribute("data-checked", "true");
    await user.click(option("__none__") as HTMLElement);
    expect(onChange).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it("says Finding or none found instead of Off, and Off once cameras are listed", () => {
    expect(markup(camera(undefined, { discoveryPending: true }))).toContain(
      "Finding cameras…"
    );
    expect(markup(camera(undefined, { devices: [] }))).toContain(
      "No cameras found"
    );
    expect(markup(camera(undefined))).toContain(">Off</span>");
  });

  it("keeps a saved camera by name and calls it Not found once discovery reported", () => {
    const missing = camera("cam-gone", { selectedName: "Old Webcam" });
    expect(markup(missing)).toContain(">Old Webcam</span>");
    expect(markup(missing)).toContain("Not found");
    expect(markup({ ...missing, discoveryPending: true })).not.toContain(
      "Not found"
    );
  });

  it("a field trigger keeps its label for screen readers, an inline one is the row value", () => {
    const field = new DOMParser().parseFromString(
      markup(camera("cam-1", { labelHidden: true })),
      "text/html"
    );
    const label = field.querySelector("label");
    expect(label?.textContent).toBe("Camera");
    expect(label?.classList.contains("sr-only")).toBe(true);
    const target = label?.getAttribute("for") ?? "";
    expect(target).not.toBe("");
    expect(field.querySelector(`button#${CSS.escape(target)}`)).not.toBeNull();
    const inline = markup(camera("cam-1", { trigger: "inline" }));
    expect(inline).not.toContain("<label");
    expect(inline).toContain('title="FaceTime HD Camera"');
    expect(inline).toContain("justify-end");
  });

  it("describes a field trigger by its status line", () => {
    render(
      <DevicePicker
        {...camera("cam-1", { description: "Switching camera…" })}
        onChange={onChange}
      />
    );
    expect(trigger()).toHaveAccessibleDescription("Switching camera…");
  });
});
