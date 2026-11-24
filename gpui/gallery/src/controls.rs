//! The gallery's pages for the controls that keep a value: Switch, Slider,
//! Tabs, Input, ToggleGroup and SegmentedControl. Each column keeps its own
//! values, keyed by appearance.

use gpui::{AnyElement, App, Entity, IntoElement, SharedString, Window, div, prelude::*, px};
use videorc_kit::{
    Appearance, Input, InputState, Segment, SegmentedControl, Slider, SliderState, Switch, Tabs,
    TabsVariant, ToggleGroup, ToggleItem,
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

/// `toggle-group`: filter chips, several on at once, and the outline strip.
pub fn toggle_group_page(a: Appearance, window: &mut Window, cx: &mut App) -> AnyElement {
    let t = a.theme();
    let kinds = kept(a, "toggle-kinds", window, cx, |_, _| -> Vec<SharedString> {
        vec!["silences".into(), "fillers".into()]
    });
    let fit = kept(a, "toggle-fit", window, cx, |_, _| -> Vec<SharedString> {
        vec!["fit".into()]
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
