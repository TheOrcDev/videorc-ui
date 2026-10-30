import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactElement } from "react";
import { describe, expect, it } from "vitest";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  SettingsRow,
} from "@/components/ui/field";
import { useFieldLabelledBy } from "@/components/ui/field-context";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// A Field names what it holds: once, fifteen of Videorc's Fields drew a label
// no screen reader tied to its control.

const find = (container: HTMLElement, selector: string): HTMLElement => {
  const element = container.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`Nothing matches ${selector}`);
  }
  return element;
};

const fieldLabel = (container: HTMLElement): HTMLLabelElement =>
  find(container, '[data-slot="field-label"]') as HTMLLabelElement;

const widthField = (withInput: boolean) => (
  <Field>
    <FieldLabel>Width</FieldLabel>
    {withInput ? <Input /> : null}
  </Field>
);

/** A group no label element can point at, the way ToggleGroup and TabsList read the Field. */
const LabelledGroup = ({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ComponentProps<"div">) => {
  const labelledBy = useFieldLabelledBy(ariaLabelledBy, ariaLabel);
  return (
    <div
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      data-slot="probe-group"
      role="group"
      {...props}
    />
  );
};

describe("Field names its control", () => {
  it.each<[string, () => ReactElement, string]>([
    ["an Input", () => <Input />, "input"],
    ["a Textarea", () => <Textarea />, "textarea"],
  ])("points its FieldLabel at %s", (_name, control, selector) => {
    const { container } = render(
      <Field>
        <FieldLabel>Stream title</FieldLabel>
        {control()}
      </Field>
    );
    const element = find(container, selector);
    expect(element.id).not.toBe("");
    expect(fieldLabel(container).htmlFor).toBe(element.id);
    expect(screen.getByLabelText("Stream title")).toBe(element);
  });

  it.each<[string, () => ReactElement, string]>([
    ["Switch", () => <Switch />, "switch"],
    ["Checkbox", () => <Checkbox />, "checkbox"],
  ])("names a %s through Base UI's hidden input", (_name, control, role) => {
    const { container } = render(
      <Field>
        <FieldLabel>Made for kids</FieldLabel>
        {control()}
      </Field>
    );
    const label = fieldLabel(container);
    const input = find(container, 'input[aria-hidden="true"]');
    // The label points at the hidden input, so a click on it toggles…
    expect(label.htmlFor).toBe(input.id);
    // …and Base UI names the visible control by that label.
    expect(screen.getByRole(role, { name: "Made for kids" })).toBeVisible();
  });

  it("keeps an explicit id and htmlFor, and follows an explicit id", () => {
    const { container, rerender } = render(
      <Field>
        <FieldLabel htmlFor="stream-title">Title</FieldLabel>
        <Input id="stream-title" />
      </Field>
    );
    expect(find(container, "input").id).toBe("stream-title");
    expect(fieldLabel(container).htmlFor).toBe("stream-title");

    rerender(
      <Field>
        <FieldLabel>Width</FieldLabel>
        <Input id="output-width" />
      </Field>
    );
    expect(fieldLabel(container).htmlFor).toBe("output-width");
  });

  it("gives two controls two ids and names the first", () => {
    const { container } = render(
      <Field>
        <FieldLabel>Category</FieldLabel>
        <Input />
        <Input aria-label="Matching categories" />
      </Field>
    );
    const [first, second] = container.querySelectorAll("input");
    expect(first?.id).not.toBe(second?.id);
    expect(fieldLabel(container).htmlFor).toBe(first?.id);
    expect(screen.getByLabelText("Matching categories")).toBe(second);
  });

  it("names a group through aria-labelledby, with no dangling htmlFor", () => {
    const { container } = render(
      <Field>
        <FieldLabel>Theme</FieldLabel>
        <LabelledGroup />
      </Field>
    );
    const label = fieldLabel(container);
    expect(
      find(container, '[data-slot="probe-group"]').getAttribute(
        "aria-labelledby"
      )
    ).toBe(label.id);
    expect(screen.getByRole("group", { name: "Theme" })).toBeVisible();
    expect(label).not.toHaveAttribute("for");
  });

  it("lets a group that names itself keep its own name", () => {
    const { container } = render(
      <Field>
        <FieldLabel>Snap (landscape)</FieldLabel>
        <LabelledGroup aria-label="Snap overlay" />
      </Field>
    );
    const group = find(container, '[data-slot="probe-group"]');
    expect(group).not.toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("group", { name: "Snap overlay" })).toBe(group);
  });

  it("drops htmlFor when the control leaves, and touches nothing outside a Field", () => {
    const { container, rerender } = render(widthField(true));
    expect(fieldLabel(container).htmlFor).toBe(find(container, "input").id);
    rerender(widthField(false));
    expect(fieldLabel(container)).not.toHaveAttribute("for");

    rerender(
      <div>
        <FieldLabel>Loose</FieldLabel>
        <Textarea />
      </div>
    );
    expect(fieldLabel(container)).not.toHaveAttribute("for");
    expect(fieldLabel(container)).not.toHaveAttribute("id");
    expect(find(container, "textarea")).not.toHaveAttribute("id");
  });
});

describe("Field describes its control", () => {
  it("points every control at the Field's descriptions", () => {
    render(
      <Field>
        <FieldLabel>Recording folder</FieldLabel>
        <Input />
        <FieldDescription>Where new recordings are saved.</FieldDescription>
      </Field>
    );
    expect(
      screen.getByLabelText("Recording folder")
    ).toHaveAccessibleDescription("Where new recordings are saved.");
  });

  it("keeps a control's own aria-describedby", () => {
    render(
      <>
        <p id="own-hint">Shown on YouTube and Twitch.</p>
        <Field>
          <FieldLabel>Stream title</FieldLabel>
          <Input aria-describedby="own-hint" />
          <FieldDescription>Ignored for this input.</FieldDescription>
        </Field>
      </>
    );
    expect(screen.getByLabelText("Stream title")).toHaveAccessibleDescription(
      "Shown on YouTube and Twitch."
    );
  });

  it("wires a SettingsRow: the label names the switch, the description describes it", () => {
    const { container } = render(
      <FieldGroup variant="grouped">
        <SettingsRow
          description="YouTube limits comments and features."
          label="Made for kids"
        >
          <Switch />
        </SettingsRow>
      </FieldGroup>
    );
    const control = screen.getByRole("switch", { name: "Made for kids" });
    expect(control).toHaveAccessibleDescription(
      "YouTube limits comments and features."
    );
    const row = find(container, '[data-slot="field"]');
    expect(row).toHaveAttribute("data-settings-row");
    expect(row).toHaveAttribute("data-orientation", "horizontal");
  });

  it("announces a SettingsRow's error under its description", () => {
    render(
      <SettingsRow error="Width must be even." label="Output width">
        <Input />
      </SettingsRow>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Width must be even.");
  });
});

describe("FieldGroup", () => {
  it("draws the grouped variant as one inset group split by hairlines", () => {
    const { container } = render(<FieldGroup variant="grouped" />);
    const group = find(container, '[data-slot="field-group"]');
    expect(group).toHaveAttribute("data-variant", "grouped");
    expect(group).toHaveClass("bg-inset", "rounded-row", "divide-y");
  });
});

describe("FieldError", () => {
  it("is monochrome words with a destructive error glyph", () => {
    const { container } = render(<FieldError>Width must be even.</FieldError>);
    const error = find(container, '[data-slot="field-error"]');
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveClass("text-foreground");
    expect(error).not.toHaveClass("text-destructive");
    const icon = find(container, '[data-slot="field-error-icon"]');
    expect(icon).toHaveClass("text-destructive");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(error).toHaveTextContent("Width must be even.");
  });

  it("renders nothing without a message", () => {
    const { container } = render(<FieldError errors={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists distinct messages once each", () => {
    render(
      <FieldError
        errors={[
          { message: "Choose a folder." },
          { message: "Choose a folder." },
          { message: "The folder is read-only." },
        ]}
      />
    );
    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent)
    ).toEqual(["Choose a folder.", "The folder is read-only."]);
  });
});
