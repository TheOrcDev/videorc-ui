//! The gallery's pages for the controls that keep a value: Switch, Slider,
//! Tabs, Input, Textarea, ToggleGroup and SegmentedControl. Each column keeps
//! its own values, keyed by appearance.

use gpui::{
    AnyElement, App, Entity, FontWeight, IntoElement, SharedString, Window, div, prelude::*, px,
};
use videorc_kit::tokens::Color;
use videorc_kit::{
    Appearance, BarVisualizer, BarVisualizerState, Checkbox, CheckboxChecked, Field, FieldGroup,
    IconName, Input, InputGroup, InputGroupAddon, InputGroupText, InputState, Label, LiveWaveform,
    Segment, SegmentedControl, Slider, SliderState, Switch, Tabs, TabsVariant, Textarea,
    TextareaState, ToggleGroup, ToggleItem, hsla, icon,
};

use crate::section;

/// A value this column keeps between frames.
fn kept<S: 'static>(
    a: Appearance,
    name: &str,
    window: &mut Window,
    cx: &mut App,
    init: impl FnOnce(&mut Window, &mut App) -> S,
) -> Entity<S> {
    let key = SharedString::from(format!("{}/{name}", a.name()));
    window.use_keyed_state(key, cx, |window, cx| init(window, cx))
}

/// A state entity this column keeps (a slider's or a field's).
fn held<S: 'static>(
    a: Appearance,
    name: &str,
    window: &mut Window,
    cx: &mut App,
    init: impl FnOnce(&mut Window, &mut App) -> Entity<S>,
) -> Entity<S> {
    kept(a, name, window, cx, init).read(cx).clone()
}

fn flag(
    a: Appearance,
    name: &str,
    initial: bool,
    window: &mut Window,
    cx: &mut App,
) -> Entity<bool> {
    kept(a, name, window, cx, |_, _| initial)
}

fn switch(
    a: Appearance,
    name: &'static str,
    on: &Entity<bool>,
    small: bool,
    disabled: bool,
    cx: &App,
) -> AnyElement {
    let state = on.clone();
    Switch::new(name)
        .checked(*on.read(cx))
        .small(small)
        .disabled(disabled)
        .accessibility_label(name)
        .appearance(a)
        .on_change(move |next, _, cx| {
            state.update(cx, |value, cx| {
                *value = next;
                cx.notify();
            })
        })
        .into_any_element()
}

fn row(children: Vec<AnyElement>) -> impl IntoElement {
    div()
        .flex()
        .flex_wrap()
        .items_center()
        .gap(px(12.0))
        .children(children)
}

/// `checkbox`: unchecked, checked, mixed (Select all), and disabled reason.
pub fn checkbox_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let off = kept(a, "check-off", window, cx, |_, _| {
        CheckboxChecked::Unchecked
    });
    let on = kept(a, "check-on", window, cx, |_, _| CheckboxChecked::Checked);
    let mixed = kept(a, "check-mixed", window, cx, |_, _| CheckboxChecked::Mixed);
    let choose = |state: &Entity<CheckboxChecked>| {
        let state = state.clone();
        move |next: CheckboxChecked, _: &mut Window, cx: &mut App| {
            state.update(cx, |value, cx| {
                *value = next;
                cx.notify();
            })
        }
    };
    let box_ =
        |id: &'static str, state: &Entity<CheckboxChecked>, label: &'static str, cx: &App| {
            Checkbox::new(id)
                .state(*state.read(cx))
                .accessibility_label(label)
                .on_change(choose(state))
                .appearance(a)
        };
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "States",
            row(vec![
                box_("Off", &off, "Off", cx).into_any_element(),
                box_("On", &on, "On", cx).into_any_element(),
                box_("Mixed", &mixed, "Select all recordings in view", cx).into_any_element(),
            ]),
        ))
        .child(section(
            t,
            "Disabled",
            Checkbox::new("check-off-disabled")
                .disabled(true)
                .disabled_reason("Finish the import before changing the selection.")
                .accessibility_label("Select all")
                .appearance(a),
        ))
        .into_any_element()
}

/// `switch`: off and on, both sizes, disabled.
pub fn switch_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let off = flag(a, "switch-off", false, window, cx);
    let on = flag(a, "switch-on", true, window, cx);
    let small_off = flag(a, "switch-small-off", false, window, cx);
    let small_on = flag(a, "switch-small-on", true, window, cx);
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Default",
            row(vec![
                switch(a, "Off", &off, false, false, cx),
                switch(a, "On", &on, false, false, cx),
            ]),
        ))
        .child(section(
            t,
            "Small",
            row(vec![
                switch(a, "Small off", &small_off, true, false, cx),
                switch(a, "Small on", &small_on, true, false, cx),
            ]),
        ))
        .child(section(
            t,
            "Disabled",
            row(vec![
                switch(a, "Disabled off", &off, false, true, cx),
                switch(a, "Disabled on", &on, false, true, cx),
            ]),
        ))
        .into_any_element()
}

/// `slider`: two values and disabled.
pub fn slider_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let make = |value: f32| {
        move |_: &mut Window, cx: &mut App| -> Entity<SliderState> {
            cx.new(|_| SliderState::new().min(0.0).max(100.0).default_value(value))
        }
    };
    let volume = held(a, "slider-volume", window, cx, make(40.0));
    let gain = held(a, "slider-gain", window, cx, make(75.0));
    let off = held(a, "slider-off", window, cx, make(60.0));
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .w(px(240.0))
        .child(section(
            t,
            "Values",
            div()
                .flex()
                .flex_col()
                .gap(px(16.0))
                .child(
                    Slider::new(&volume)
                        .accessibility_label("Volume")
                        .appearance(a),
                )
                .child(Slider::new(&gain).accessibility_label("Gain").appearance(a)),
        ))
        .child(section(
            t,
            "Disabled",
            Slider::new(&off)
                .disabled(true)
                .accessibility_label("Disabled")
                .appearance(a),
        ))
        .into_any_element()
}

/// `tabs`: the glass track and the line, with a disabled tab.
pub fn tabs_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let track = kept(a, "tabs-track", window, cx, |_, _| 0usize);
    let line = kept(a, "tabs-line", window, cx, |_, _| 1usize);
    let choose = |state: &Entity<usize>| {
        let state = state.clone();
        move |index: usize, _: &mut Window, cx: &mut App| {
            state.update(cx, |value, cx| {
                *value = index;
                cx.notify();
            })
        }
    };
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Track",
            Tabs::new("tabs-track")
                .tab("Video")
                .tab("Audio")
                .tab("Captions")
                .selected(*track.read(cx))
                .on_select(choose(&track))
                .appearance(a),
        ))
        .child(section(
            t,
            "Line",
            Tabs::new("tabs-line")
                .variant(TabsVariant::Line)
                .tab("Overview")
                .tab("Activity")
                .disabled_tab("Reports")
                .selected(*line.read(cx))
                .on_select(choose(&line))
                .appearance(a),
        ))
        .into_any_element()
}

/// `toggle-group`: filter chips, several on at once, the outline strip, and
/// a custom-child preview (Captions Style).
pub fn toggle_group_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let kinds = kept(a, "toggle-kinds", window, cx, |_, _| -> Vec<SharedString> {
        vec!["silences".into(), "fillers".into()]
    });
    let fit = kept(a, "toggle-fit", window, cx, |_, _| -> Vec<SharedString> {
        vec!["fit".into()]
    });
    let style = kept(a, "toggle-style", window, cx, |_, _| -> Vec<SharedString> {
        vec!["clean".into()]
    });
    let choose = |state: &Entity<Vec<SharedString>>| {
        let state = state.clone();
        move |next: Vec<SharedString>, _: &mut Window, cx: &mut App| {
            state.update(cx, |value, cx| {
                *value = next;
                cx.notify();
            })
        }
    };
    let style_chip = |title: &'static str, hint: &'static str, plate: Color| {
        div()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .w_full()
            .min_w(px(0.0))
            .child(
                div()
                    .h(px(48.0))
                    .w_full()
                    .rounded(px(8.0))
                    .bg(hsla(plate))
                    .flex()
                    .items_end()
                    .justify_start()
                    .p(px(8.0))
                    .child(
                        div()
                            .px(px(8.0))
                            .py(px(4.0))
                            .rounded(px(4.0))
                            .bg(hsla(t.glass_solid))
                            .text_size(px(8.0))
                            .text_color(hsla(t.foreground))
                            .child("Make every word count"),
                    ),
            )
            .child(
                div()
                    .flex()
                    .flex_col()
                    .gap(px(2.0))
                    .child(
                        div()
                            .text_size(px(12.0))
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(hsla(t.foreground))
                            .child(title),
                    )
                    .child(
                        div()
                            .text_size(px(11.0))
                            .text_color(hsla(t.muted_foreground))
                            .child(hint),
                    ),
            )
    };
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Filters",
            ToggleGroup::new("toggle-kinds")
                .multiple(true)
                .xs(true)
                .spacing(4.0)
                .accessibility_label("Kinds of cuts")
                .value(kinds.read(cx).clone())
                .item(ToggleItem::new("silences", "Silences"))
                .item(ToggleItem::new("fillers", "Ums"))
                .item(ToggleItem::new("retakes", "Retakes"))
                .item(ToggleItem::new("false-starts", "False starts"))
                .on_change(choose(&kinds))
                .appearance(a),
        ))
        .child(section(
            t,
            "Outline",
            ToggleGroup::new("toggle-fit")
                .outline(true)
                .accessibility_label("Fit")
                .value(fit.read(cx).clone())
                .item(ToggleItem::new("fit", "Fit"))
                .item(ToggleItem::new("fill", "Fill"))
                .item(ToggleItem::new("stretch", "Stretch"))
                .on_change(choose(&fit))
                .appearance(a),
        ))
        .child(section(
            t,
            "With preview",
            ToggleGroup::new("toggle-style")
                .outline(true)
                .spacing(8.0)
                .accessibility_label("Caption style")
                .value(style.read(cx).clone())
                .item(ToggleItem::new("clean", "Clean").child(style_chip(
                    "Clean",
                    "Clear plate under the words",
                    t.muted,
                )))
                .item(ToggleItem::new("bold", "Bold").child(style_chip(
                    "Bold",
                    "Heavy type on a solid band",
                    t.secondary,
                )))
                .on_change(choose(&style))
                .appearance(a),
        ))
        .into_any_element()
}

/// `segmented-control`: one of a few options on the glass Tabs track.
pub fn segmented_control_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let theme = kept(a, "segment-theme", window, cx, |_, _| {
        SharedString::from("system")
    });
    let off = kept(a, "segment-off", window, cx, |_, _| {
        SharedString::from("light")
    });
    let orient = kept(a, "segment-orient", window, cx, |_, _| {
        SharedString::from("horizontal")
    });
    let choose = |state: &Entity<SharedString>| {
        let state = state.clone();
        move |next: SharedString, _: &mut Window, cx: &mut App| {
            state.update(cx, |value, cx| {
                *value = next;
                cx.notify();
            })
        }
    };
    div()
        .flex()
        .flex_col()
        .gap(px(20.0))
        .child(section(
            t,
            "Theme",
            SegmentedControl::new("segment-theme")
                .accessibility_label("Theme")
                .value(Some(theme.read(cx).clone()))
                .option(Segment::new("light", "Light"))
                .option(Segment::new("dark", "Dark"))
                .option(Segment::new("system", "System"))
                .on_change(choose(&theme))
                .appearance(a),
        ))
        .child(section(
            t,
            "Small",
            SegmentedControl::new("segment-small")
                .small(true)
                .accessibility_label("Corner")
                .value(Some(SharedString::from("rounded")))
                .option(Segment::new("square", "Square"))
                .option(Segment::new("rounded", "Rounded"))
                .appearance(a),
        ))
        .child(section(
            t,
            "Disabled",
            SegmentedControl::new("segment-off")
                .disabled(true)
                .disabled_reason("Turn off the livestream to change the theme.")
                .accessibility_label("Theme while live")
                .value(Some(off.read(cx).clone()))
                .option(Segment::new("light", "Light"))
                .option(Segment::new("dark", "Dark"))
                .option(Segment::new("system", "System"))
                .appearance(a),
        ))
        .child(section(
            t,
            "Icons",
            SegmentedControl::new("segment-orient")
                .accessibility_label("Studio orientation")
                .value(Some(orient.read(cx).clone()))
                .option(
                    Segment::new("horizontal", "Horizontal")
                        .child(icon(IconName::Monitor, 16.0, hsla(t.foreground)))
                        .tooltip("Horizontal · 16:9"),
                )
                .option(
                    Segment::new("vertical", "Vertical")
                        .child(icon(IconName::DeviceMobile, 16.0, hsla(t.foreground)))
                        .tooltip("Vertical · 9:16"),
                )
                .on_change(choose(&orient))
                .appearance(a),
        ))
        .into_any_element()
}

/// `page-tabs`: a segmented strip under the toolbar; only the body scrolls.
pub fn page_tabs_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let tab = kept(a, "page-tabs-selected", window, cx, |_, _| 0usize);
    let choose = {
        let tab = tab.clone();
        move |index: usize, _: &mut Window, cx: &mut App| {
            tab.update(cx, |value, cx| {
                *value = index;
                cx.notify();
            })
        }
    };
    let selected = *tab.read(cx);
    let panel = match selected {
        1 => "Recording settings live here.",
        2 => "Shortcuts live here.",
        _ => "General settings live here.",
    };
    section(
        t,
        "Settings",
        div()
            .w(px(360.0))
            .h(px(220.0))
            .flex()
            .flex_col()
            .overflow_hidden()
            .rounded(px(12.0))
            .border_1()
            .border_color(hsla(t.border))
            .bg(hsla(t.glass_solid))
            .child(
                videorc_kit::PageTabs::new("page-tabs", "Settings sections")
                    .tab("General")
                    .tab("Recording")
                    .tab("Shortcuts")
                    .selected(selected)
                    .on_select(choose)
                    .appearance(a)
                    .child(
                        div()
                            .p(px(16.0))
                            .text_color(hsla(t.muted_foreground))
                            .child(panel),
                    ),
            ),
    )
    .into_any_element()
}

/// `input`: empty with a placeholder, filled, invalid and disabled.
pub fn input_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let field = |placeholder: &'static str, value: &'static str| {
        move |window: &mut Window, cx: &mut App| -> Entity<InputState> {
            cx.new(|cx| {
                InputState::new(window, cx)
                    .placeholder(placeholder)
                    .default_value(value)
            })
        }
    };
    let name = held(a, "input-name", window, cx, field("Stream title", ""));
    let filled = held(
        a,
        "input-filled",
        window,
        cx,
        field("", "Friday night build"),
    );
    let invalid = held(a, "input-invalid", window, cx, field("", "rtmp:/broken"));
    let off = held(a, "input-off", window, cx, field("Locked while live", ""));
    div()
        .flex()
        .flex_col()
        .gap(px(12.0))
        .w(px(260.0))
        .child(section(
            t,
            "Fields",
            div()
                .flex()
                .flex_col()
                .gap(px(8.0))
                .child(
                    Input::new("name", &name)
                        .accessibility_label("Stream title")
                        .appearance(a),
                )
                .child(
                    Input::new("filled", &filled)
                        .accessibility_label("Title")
                        .appearance(a),
                )
                .child(
                    Input::new("invalid", &invalid)
                        .invalid(true)
                        .accessibility_label("Server")
                        .appearance(a),
                )
                .child(
                    Input::new("off", &off)
                        .disabled(true)
                        .accessibility_label("Locked")
                        .appearance(a),
                ),
        ))
        .into_any_element()
}

/// `textarea`: empty with a placeholder, filled, invalid and disabled.
pub fn textarea_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let field = |placeholder: &'static str, value: &'static str| {
        move |window: &mut Window, cx: &mut App| -> Entity<TextareaState> {
            cx.new(|cx| {
                TextareaState::new(window, cx)
                    .placeholder(placeholder)
                    .default_value(value)
            })
        }
    };
    let empty = held(
        a,
        "textarea-empty",
        window,
        cx,
        field("Optional description", ""),
    );
    let filled = held(
        a,
        "textarea-filled",
        window,
        cx,
        field("", "Talking through the new scene presets tonight."),
    );
    let invalid = held(
        a,
        "textarea-invalid",
        window,
        cx,
        field("", "Too long for this destination."),
    );
    let off = held(
        a,
        "textarea-off",
        window,
        cx,
        field("Locked while live", ""),
    );
    div()
        .flex()
        .flex_col()
        .gap(px(12.0))
        .w(px(320.0))
        .child(section(
            t,
            "Fields",
            div()
                .flex()
                .flex_col()
                .gap(px(8.0))
                .child(
                    Textarea::new("empty", &empty)
                        .accessibility_label("Description")
                        .appearance(a),
                )
                .child(
                    Textarea::new("filled", &filled)
                        .accessibility_label("Description")
                        .appearance(a),
                )
                .child(
                    Textarea::new("invalid", &invalid)
                        .invalid(true)
                        .accessibility_label("Description")
                        .appearance(a),
                )
                .child(
                    Textarea::new("off", &off)
                        .disabled(true)
                        .accessibility_label("Locked")
                        .appearance(a),
                ),
        ))
        .into_any_element()
}

/// `label`: 14 px / 500 words that name a control.
pub fn label_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "Label",
        div()
            .flex()
            .flex_col()
            .gap(px(8.0))
            .child(Label::new("Stream title").appearance(a))
            .child(Label::new("Disabled").disabled(true).appearance(a)),
    )
    .into_any_element()
}

/// `field`: named controls for Room sounds / routing.
pub fn field_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    section(
        t,
        "Fields",
        FieldGroup::new()
            .appearance(a)
            .child(
                Field::new("room-preview")
                    .label("Room sounds · Preview")
                    .description("Guests hear these in the room.")
                    .appearance(a)
                    .child(
                        Switch::new("room-on")
                            .checked(true)
                            .accessibility_label("Room sounds preview")
                            .appearance(a),
                    ),
            )
            .child(
                Field::new("system-gain")
                    .label("System gain · −6 dB")
                    .error("The output device is missing.")
                    .appearance(a),
            ),
    )
    .into_any_element()
}

/// `input-group`: recessed field with addons.
pub fn input_group_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let url = held(a, "input-group-url", window, cx, |window, cx| {
        cx.new(|cx| {
            InputState::new(window, cx)
                .placeholder("live.example/stream")
                .default_value("")
        })
    });
    section(
        t,
        "Addons",
        InputGroup::new("rtmp", &url)
            .accessibility_label("Ingest URL")
            .start(
                InputGroupAddon::start()
                    .appearance(a)
                    .child(InputGroupText::new("rtmp://").appearance(a)),
            )
            .appearance(a),
    )
    .into_any_element()
}

/// `bar-visualizer`: mic meter bars.
pub fn bar_visualizer_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let levels = [
        0.2, 0.45, 0.7, 0.55, 0.9, 0.6, 0.35, 0.5, 0.25, 0.4, 0.65, 0.3,
    ];
    section(
        t,
        "Levels",
        BarVisualizer::new("mic")
            .bar_count(levels.len())
            .levels(levels)
            .state(BarVisualizerState::Speaking)
            .color(t.foreground)
            .appearance(a),
    )
    .into_any_element()
}

/// `live-waveform`: centred waveform for mic preview.
pub fn live_waveform_page(a: Appearance, _: &mut Window, _: &mut App) -> AnyElement {
    let t = a.theme();
    let levels = [0.15, 0.4, 0.8, 0.55, 0.3, 0.7, 0.45, 0.2, 0.6, 0.35];
    div()
        .flex()
        .flex_col()
        .gap(px(16.0))
        .w_full()
        .child(section(
            t,
            "Active",
            LiveWaveform::new("wave-on")
                .active(true)
                .levels(levels)
                .color(t.foreground)
                .appearance(a),
        ))
        .child(section(
            t,
            "Idle",
            LiveWaveform::new("wave-off").appearance(a),
        ))
        .into_any_element()
}
