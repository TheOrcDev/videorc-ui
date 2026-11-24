// The GPUI output of the theme (Videorc plan 260, S2.2a): every token in
// styles/videorc.css resolved per appearance (dark, light and each under
// Increase Contrast) into gpui/kit/src/tokens.rs, the GPUI flavour's token
// module. Colours come out as sRGB `0xRRGGBBAA` (what `gpui::rgba` takes),
// lengths in px. Plain JavaScript: nothing here needs Rust or GPUI.
//
// The stylesheet stays the one source. This resolves it the way Chromium
// does: the custom-property cascade, var(), calc()/min()/max(), oklch() and
// color-mix() (premultiplied, in srgb, oklab or oklch), gamut-clipped to
// sRGB as Chromium draws on an sRGB target.
import { parse } from "postcss";

const REM_PX = 16;
const TURN_DEG = 360;
const CHANNEL_MAX = 255;
const DECIMALS = 4;
const EPSILON = 1e-6;
const FULL_PERCENT = 100;

// ------------------------------------------------------------ text splitting

const WHITESPACE = /\s+/gu;
const clean = (value) => value.replaceAll(WHITESPACE, " ").trim();

/** Splits at `separator` outside parentheses. */
export const splitTop = (value, separator) => {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const char of value) {
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth -= 1;
    }
    const splits =
      depth === 0 &&
      (separator === " " ? WHITESPACE.test(char) : char === separator);
    WHITESPACE.lastIndex = 0;
    if (splits) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  return parts.filter((part) => part !== "");
};

// ------------------------------------------------------ numbers and lengths

const TOKEN =
  /\s*(?:(?<number>-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?)(?<unit>px|rem|%|deg)?|(?<fn>[a-z-]+)\(|(?<op>[()+\-*/,]))/uy;

const tokenize = (source) => {
  const tokens = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < source.length) {
    if (source.slice(TOKEN.lastIndex).trim() === "") {
      break;
    }
    const at = TOKEN.lastIndex;
    const match = TOKEN.exec(source);
    if (!match?.groups) {
      throw new Error(`Cannot read "${source}" at ${at}`);
    }
    tokens.push(match.groups);
  }
  return tokens;
};

const quantity = (number, unit) => {
  if (unit === "rem") {
    return { n: number * REM_PX, unit: "px" };
  }
  return { n: number, unit: unit ?? "" };
};

const sameUnit = (left, right, source) => {
  if (left.unit !== right.unit) {
    throw new Error(`Mixed units in "${source}"`);
  }
  return left.unit;
};

const MATH = {
  calc: (args) => args[0],
  max: (args) => ({
    n: Math.max(...args.map((arg) => arg.n)),
    unit: args[0].unit,
  }),
  min: (args) => ({
    n: Math.min(...args.map((arg) => arg.n)),
    unit: args[0].unit,
  }),
};

/**
 * Evaluates a CSS number or length expression (numbers, px, rem, %, deg,
 * + - * /, calc, min, max) to `{ n, unit }`, rem as px.
 */
export const evaluate = (source) => {
  const tokens = tokenize(source);
  let index = 0;
  const peek = () => tokens[index];
  const take = () => {
    const token = tokens[index];
    index += 1;
    return token;
  };
  const expect = (op) => {
    if (take()?.op !== op) {
      throw new Error(`Expected "${op}" in "${source}"`);
    }
  };

  const parser = {
    expression: () => {
      let left = parser.term();
      while (peek()?.op === "+" || peek()?.op === "-") {
        const { op } = take();
        const right = parser.term();
        const unit = sameUnit(left, right, source);
        left = { n: op === "+" ? left.n + right.n : left.n - right.n, unit };
      }
      return left;
    },
    factor: () => {
      const token = take();
      if (token?.number !== undefined) {
        return quantity(Number(token.number), token.unit);
      }
      if (token?.op === "(") {
        const inner = parser.expression();
        expect(")");
        return inner;
      }
      if (token?.op === "-") {
        const inner = parser.factor();
        return { ...inner, n: -inner.n };
      }
      const math = token?.fn ? MATH[token.fn] : undefined;
      if (!math) {
        throw new Error(`Unexpected token in "${source}"`);
      }
      const args = [parser.expression()];
      while (peek()?.op === ",") {
        take();
        args.push(parser.expression());
      }
      expect(")");
      for (const arg of args) {
        sameUnit(args[0], arg, source);
      }
      return math(args);
    },
    term: () => {
      let left = parser.factor();
      while (peek()?.op === "*" || peek()?.op === "/") {
        const { op } = take();
        const right = parser.factor();
        const unit = left.unit || right.unit;
        left = {
          n: op === "*" ? left.n * right.n : left.n / right.n,
          unit: op === "/" && left.unit === right.unit ? "" : unit,
        };
      }
      return left;
    },
  };

  const result = parser.expression();
  if (index !== tokens.length) {
    throw new Error(`Trailing input in "${source}"`);
  }
  return result;
};

const fraction = (source) => {
  const { n, unit } = evaluate(source);
  if (unit === "%") {
    return n / FULL_PERCENT;
  }
  if (unit === "") {
    return n;
  }
  throw new Error(`"${source}" is not a number`);
};

const px = (source) => {
  const { n, unit } = evaluate(source);
  if (unit === "px" || (unit === "" && n === 0)) {
    return n;
  }
  throw new Error(`"${source}" is not a length`);
};

// ------------------------------------------------------------------- colours
//
// A colour is Oklab with alpha: { l, a, b, alpha }.

const oklchToOklab = (l, c, h) => {
  const radians = (h * Math.PI) / (TURN_DEG / 2);
  return { a: c * Math.cos(radians), b: c * Math.sin(radians), l };
};

const oklabToLinear = ({ l, a, b }) => {
  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp,
    -1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp,
    -0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp,
  ];
};

const linearToOklab = ([r, g, b]) => {
  const lp = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mp = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const sp = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    a: 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp,
    b: 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp,
    l: 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp,
  };
};

const GAMMA = 2.4;
const LINEAR_CUTOFF = 0.0031308;
const ENCODED_CUTOFF = 0.04045;
const LINEAR_SLOPE = 12.92;
const GAMMA_SCALE = 1.055;
const GAMMA_OFFSET = 0.055;

const encode = (channel) => {
  const sign = channel < 0 ? -1 : 1;
  const value = Math.abs(channel);
  if (value <= LINEAR_CUTOFF) {
    return channel * LINEAR_SLOPE;
  }
  return sign * (GAMMA_SCALE * value ** (1 / GAMMA) - GAMMA_OFFSET);
};

const decode = (channel) => {
  const sign = channel < 0 ? -1 : 1;
  const value = Math.abs(channel);
  if (value <= ENCODED_CUTOFF) {
    return channel / LINEAR_SLOPE;
  }
  return sign * ((value + GAMMA_OFFSET) / GAMMA_SCALE) ** GAMMA;
};

const toSrgb = (colour) => oklabToLinear(colour).map(encode);
const fromSrgb = (rgb, alpha) => ({
  ...linearToOklab(rgb.map(decode)),
  alpha,
});

const TRANSPARENT = { a: 0, alpha: 0, b: 0, l: 0 };
const HEX = /^#(?<hex>[\da-f]{6}|[\da-f]{8})$/iu;
const COLOR_MIX_SPACE = /^\s*in\s+(?<space>[a-z]+)\s*,(?<body>.*)$/u;
const MIX_PERCENT = /^(?<percent>[\d.]+)%$/u;

const parseHex = (hex) => {
  const channels = hex.match(/../gu).map((pair) => Number.parseInt(pair, 16));
  const [r, g, b, a = CHANNEL_MAX] = channels;
  return fromSrgb(
    [r, g, b].map((channel) => channel / CHANNEL_MAX),
    a / CHANNEL_MAX
  );
};

const parseOklch = (body) => {
  const [components, alpha] = splitTop(body, "/");
  const [l, c, h] = splitTop(components ?? "", " ").map(fraction);
  if (l === undefined || c === undefined || h === undefined) {
    throw new Error(`oklch(${body}) needs three components`);
  }
  return {
    ...oklchToOklab(l, c, h),
    alpha: alpha === undefined ? 1 : fraction(alpha),
  };
};

// The mix's interpolation space, each as to/from a premultipliable vector.
// A hue is "missing" when the colour has no chroma (CSS Color 4), and then
// takes the other colour's.
const SPACES = {
  oklab: {
    from: ([l, a, b], alpha) => ({ a, alpha, b, l }),
    hue: -1,
    to: (colour) => [colour.l, colour.a, colour.b],
  },
  oklch: {
    from: ([l, c, h], alpha) => ({ ...oklchToOklab(l, c, h), alpha }),
    hue: 2,
    to: (colour) => {
      const chroma = Math.hypot(colour.a, colour.b);
      const hue =
        chroma < EPSILON
          ? Number.NaN
          : (Math.atan2(colour.b, colour.a) * (TURN_DEG / 2)) / Math.PI;
      return [colour.l, chroma, hue];
    },
  },
  srgb: {
    from: (rgb, alpha) => fromSrgb(rgb, alpha),
    hue: -1,
    to: (colour) => toSrgb(colour),
  },
};

const mixHue = (first, second, weight) => {
  if (Number.isNaN(first)) {
    return second;
  }
  if (Number.isNaN(second)) {
    return first;
  }
  let delta = second - first;
  if (delta > TURN_DEG / 2) {
    delta -= TURN_DEG;
  } else if (delta < -TURN_DEG / 2) {
    delta += TURN_DEG;
  }
  return first + delta * weight;
};

const mixArgument = (argument, readColour) => {
  const parts = splitTop(argument, " ");
  const percent = parts.find((part) => MIX_PERCENT.test(part));
  const colour = parts.filter((part) => part !== percent).join(" ");
  return {
    colour: readColour(colour),
    weight: percent === undefined ? undefined : fraction(percent),
  };
};

// CSS Color 5 color-mix(): weights normalised, premultiplied, and a sum
// under 100% scales the alpha.
const parseMix = (spaceName, body, readColour) => {
  const space = SPACES[spaceName];
  if (!space) {
    throw new Error(`color-mix in ${spaceName} is not supported`);
  }
  const [first, second, extra] = splitTop(body, ",").map((argument) =>
    mixArgument(argument, readColour)
  );
  if (!first || !second || extra) {
    throw new Error(`color-mix(${body}) needs two colours`);
  }
  let p1 = first.weight ?? 1 - (second.weight ?? 0.5);
  let p2 = second.weight ?? 1 - p1;
  const sum = p1 + p2;
  p1 /= sum;
  p2 /= sum;
  const alpha = first.colour.alpha * p1 + second.colour.alpha * p2;
  const [v1, v2] = [space.to(first.colour), space.to(second.colour)];
  const mixed = v1.map((value, index) => {
    if (index === space.hue) {
      return mixHue(value, v2[index] ?? 0, p2);
    }
    const premultiplied =
      value * first.colour.alpha * p1 +
      (v2[index] ?? 0) * second.colour.alpha * p2;
    return alpha > 0 ? premultiplied / alpha : 0;
  });
  if (Number.isNaN(mixed[space.hue])) {
    mixed[space.hue] = 0;
  }
  return space.from(mixed, alpha * Math.min(sum, 1));
};

/** The body of `name(…)` when that call is the whole of `source`. */
const callBody = (source, name) => {
  if (!source.startsWith(`${name}(`) || !source.endsWith(")")) {
    return;
  }
  let depth = 0;
  for (let index = name.length; index < source.length; index += 1) {
    if (source[index] === "(") {
      depth += 1;
    } else if (source[index] === ")") {
      depth -= 1;
      if (depth === 0 && index !== source.length - 1) {
        return;
      }
    }
  }
  return source.slice(name.length + 1, -1);
};

/** Parses one CSS colour, or null if `value` is not one. */
export const parseColour = (value) => {
  const source = clean(value);
  if (source === "transparent") {
    return TRANSPARENT;
  }
  const hex = HEX.exec(source);
  if (hex?.groups) {
    return parseHex(hex.groups.hex);
  }
  const oklch = callBody(source, "oklch");
  if (oklch !== undefined) {
    return parseOklch(oklch);
  }
  const mix = COLOR_MIX_SPACE.exec(callBody(source, "color-mix") ?? "");
  if (mix?.groups) {
    return parseMix(mix.groups.space, mix.groups.body, parseColour);
  }
  return null;
};

const HEX_WIDTH = 8;

/** A colour as sRGB `0xrrggbbaa`, clipped to the sRGB gamut. */
export const toHex = (colour) => {
  const rgb = oklabToLinear(colour).map((channel) =>
    encode(Math.min(1, Math.max(0, channel)))
  );
  const bytes = [...rgb, colour.alpha].map((channel) =>
    Math.round(Math.min(1, Math.max(0, channel)) * CHANNEL_MAX)
  );
  const packed = bytes.reduce((word, byte) => word * 256 + byte, 0);
  return `0x${packed.toString(16).padStart(HEX_WIDTH, "0")}`;
};

// ---------------------------------------------------------- value kinds

const BARE_NUMBERS = /^-?[\d.]+(?: -?[\d.]+){2}$/u;
const POSITION = /^-?[\d.]+(?:%|deg)$/u;

const tryParse = (read) => {
  try {
    return read();
  } catch {
    return null;
  }
};

const readStop = (part) => {
  const pieces = splitTop(part, " ");
  const last = pieces.at(-1) ?? "";
  const positioned = pieces.length > 1 && POSITION.test(last);
  const colour = parseColour(positioned ? pieces.slice(0, -1).join(" ") : part);
  if (!colour) {
    return;
  }
  if (!positioned) {
    return { at: undefined, colour };
  }
  const { n, unit } = evaluate(last);
  return { at: unit === "deg" ? n / TURN_DEG : n / FULL_PERCENT, colour };
};

// CSS fixes up missing stop positions: the first at 0, the last at 1, a run
// of missing ones spread evenly between its neighbours.
const placeStops = (stops) => {
  const placed = stops.map((stop) => ({ ...stop }));
  const [first] = placed;
  const last = placed.at(-1);
  if (first && first.at === undefined) {
    first.at = 0;
  }
  if (last && last.at === undefined) {
    last.at = 1;
  }
  let start = 0;
  for (let index = 1; index < placed.length; index += 1) {
    if (placed[index].at !== undefined) {
      const from = placed[start].at;
      const span = index - start;
      for (let gap = start + 1; gap < index; gap += 1) {
        placed[gap].at =
          from + ((placed[index].at - from) * (gap - start)) / span;
      }
      start = index;
    }
  }
  return placed;
};

const readShadow = (part) => {
  const pieces = splitTop(part, " ");
  const inset = pieces[0] === "inset";
  const rest = inset ? pieces.slice(1) : pieces;
  const colourAt = rest.findIndex((piece) => parseColour(piece) !== null);
  if (colourAt === -1) {
    return;
  }
  const lengths = rest.filter((_, index) => index !== colourAt).map(px);
  if (lengths.length < 2 || lengths.length > 4) {
    return;
  }
  const [x, y, blur = 0, spread = 0] = lengths;
  return { blur, colour: parseColour(rest[colourAt]), inset, spread, x, y };
};

/**
 * What a resolved value is: a colour, a number, gradient stops or shadows.
 * Three bare numbers are a colour's oklch components (--glass-base).
 */
export const classify = (value) => {
  const source = clean(value);
  if (BARE_NUMBERS.test(source)) {
    return { colour: parseColour(`oklch(${source})`), kind: "colour" };
  }
  const colour = parseColour(source);
  if (colour) {
    return { colour, kind: "colour" };
  }
  const number = tryParse(() => fraction(source));
  if (number !== null) {
    return { kind: "number", number };
  }
  const parts = splitTop(source, ",");
  const stops = parts.map((part) => tryParse(() => readStop(part)));
  if (stops.every(Boolean)) {
    return { kind: "stops", stops: placeStops(stops) };
  }
  const shadows = parts.map((part) => tryParse(() => readShadow(part)));
  if (shadows.every(Boolean)) {
    return { kind: "shadows", shadows };
  }
  throw new Error(`Cannot tell what "${source}" is`);
};

// --------------------------------------------------------------- cascade

const VAR = /var\(\s*(?<name>--[\w-]+)\s*\)/u;
const MAX_DEPTH = 32;

/** Replaces every var() in `value` from `vars`, recursively. */
export const substitute = (value, vars, depth = 0) => {
  if (depth > MAX_DEPTH) {
    throw new Error(`var() cycle in "${value}"`);
  }
  let result = value;
  let match = VAR.exec(result);
  while (match?.groups) {
    const { name } = match.groups;
    const raw = vars.get(name);
    if (raw === undefined) {
      throw new Error(`${name} is not defined`);
    }
    result = `${result.slice(0, match.index)}${substitute(raw, vars, depth + 1)}${result.slice(match.index + match[0].length)}`;
    match = VAR.exec(result);
  }
  return result;
};

export const APPEARANCES = [
  { constName: "DARK", contrast: false, dark: true, title: "Dark" },
  { constName: "LIGHT", contrast: false, dark: false, title: "Light" },
  {
    constName: "DARK_INCREASE_CONTRAST",
    contrast: true,
    dark: true,
    title: "Dark under Increase Contrast",
  },
  {
    constName: "LIGHT_INCREASE_CONTRAST",
    contrast: true,
    dark: false,
    title: "Light under Increase Contrast",
  },
];

// The root element is :root, and carries .dark in the dark theme.
const matches = (selector, { dark }) =>
  splitTop(selector, ",").some(
    (part) => part === ":root" || (dark && part === ".dark")
  );

// Media queries the GPUI windows answer. Reduce Transparency only turns the
// coats solid, and every GPUI window already is.
const MEDIA = {
  "(prefers-contrast: more)": ({ contrast }) => contrast,
  "(prefers-reduced-transparency: reduce)": () => false,
};

const declarations = (rule) =>
  (rule.nodes ?? []).filter(
    (node) => node.type === "decl" && node.prop.startsWith("--")
  );

const cascade = (nodes, appearance, vars) => {
  for (const node of nodes) {
    if (node.type === "rule" && matches(clean(node.selector), appearance)) {
      for (const decl of declarations(node)) {
        vars.set(decl.prop, clean(decl.value));
      }
    } else if (node.type === "atrule" && node.name === "media") {
      const applies = MEDIA[clean(node.params)];
      if (!applies) {
        throw new Error(`@media ${node.params} has no GPUI answer`);
      }
      if (applies(appearance)) {
        cascade(node.nodes ?? [], appearance, vars);
      }
    }
  }
  return vars;
};

// ---------------------------------------------------------------- @theme

const themeBlock = (root) => {
  const block = root.nodes.find(
    (node) => node.type === "atrule" && node.name === "theme"
  );
  if (!block) {
    throw new Error("The stylesheet has no @theme block");
  }
  return new Map(
    declarations(block).map((decl) => [decl.prop, clean(decl.value)])
  );
};

const PREFIXED = (prefix) => new RegExp(`^--${prefix}-(?<name>[\\w-]+)$`, "u");
const RADIUS = PREFIXED("radius");
const SPACING = PREFIXED("spacing");
const FONT = PREFIXED("font");
const TEXT = /^--text-(?<name>[a-z]+)$/u;
const COLOUR = PREFIXED("color");
const FONT_WEIGHT_NORMAL = 400;
const QUOTES = /^"|"$/gu;

const metrics = (theme, vars) => {
  const named = (pattern) =>
    [...theme].flatMap(([prop, value]) => {
      const name = pattern.exec(prop)?.groups?.name;
      return name ? [{ name, value }] : [];
    });
  const length = (value) => px(substitute(value, vars));
  return {
    fonts: named(FONT).map(({ name, value }) => ({
      families: splitTop(value, ",").map((family) =>
        family.replaceAll(QUOTES, "")
      ),
      name,
    })),
    radii: named(RADIUS).map(({ name, value }) => ({
      name,
      px: length(value),
    })),
    sizes: named(SPACING).map(({ name, value }) => ({
      name,
      px: length(value),
    })),
    text: named(TEXT).map(({ name, value }) => {
      const weight = theme.get(`--text-${name}--font-weight`);
      return {
        lineHeight: length(theme.get(`--text-${name}--line-height`) ?? "0"),
        name,
        size: length(value),
        weight: weight === undefined ? FONT_WEIGHT_NORMAL : Number(weight),
      };
    }),
  };
};

// @theme colours: an alias of a theme token adds nothing; one that computes
// from the tokens (bg-inset) becomes a theme field; a literal is fixed.
const themeColours = (theme, tokens) => {
  const derived = [];
  const fixed = [];
  for (const [prop, value] of theme) {
    const name = COLOUR.exec(prop)?.groups?.name;
    if (!name || value === `var(--${name})`) {
      continue;
    }
    if (VAR.test(value)) {
      if (tokens.has(`--${name}`)) {
        throw new Error(`${prop} collides with --${name}`);
      }
      derived.push([`--${name}`, value]);
    } else {
      fixed.push({ colour: parseColour(value), name });
    }
  }
  return { derived, fixed };
};

// ------------------------------------------------------------ resolution

const SKIPPED = new Set(["--radius"]);

/** Resolves the stylesheet into every appearance's tokens and the metrics. */
export const resolveTokens = (css, from) => {
  const root = parse(css, { from });
  const theme = themeBlock(root);
  const { derived, fixed } = themeColours(
    theme,
    cascade(root.nodes, APPEARANCES[0], new Map())
  );
  const appearances = APPEARANCES.map((appearance) => {
    const vars = cascade(root.nodes, appearance, new Map());
    for (const [prop, value] of derived) {
      vars.set(prop, value);
    }
    const tokens = [...vars.keys()]
      .filter((prop) => !SKIPPED.has(prop))
      .map((prop) => ({
        prop,
        ...classify(substitute(vars.get(prop) ?? "", vars)),
      }));
    return { ...appearance, tokens, vars };
  });

  const [reference] = appearances;
  for (const appearance of appearances) {
    const names = appearance.tokens.map(({ prop, kind }) => `${prop}:${kind}`);
    const expected = reference.tokens.map(
      ({ prop, kind }) => `${prop}:${kind}`
    );
    if (names.join(",") !== expected.join(",")) {
      throw new Error(
        `${appearance.title} does not have the same tokens as ${reference.title}`
      );
    }
  }
  return {
    appearances,
    fixed,
    metrics: metrics(theme, reference.vars),
  };
};

// ------------------------------------------------------------------ Rust

const LINE_WIDTH = 100;
const ARRAY_WIDTH = 60;
const INDENT = "    ";
const DASHES = /-/gu;

const snake = (name) => name.replace(/^--/u, "").replaceAll(DASHES, "_");
const upper = (name) => snake(name).toUpperCase();

/** An f32 literal: at most four decimals, always with a point. */
export const float = (value) => {
  const rounded = Number(value.toFixed(DECIMALS));
  const text = String(Object.is(rounded, -0) ? 0 : rounded);
  return text.includes(".") ? text : `${text}.0`;
};

const RUST_TYPES = {
  colour: "Color",
  number: "f32",
  shadows: "&'static [Shadow]",
  stops: "&'static [Stop]",
};

// A list the way rustfmt lays it out: on the field's line when it fits,
// else one item per line.
const list = (lead, items, indent) => {
  const inline = `${lead}&[${items.join(", ")}],`;
  if (
    items.join(", ").length <= ARRAY_WIDTH &&
    indent.length + inline.length <= LINE_WIDTH
  ) {
    return [`${indent}${inline}`];
  }
  return [
    `${indent}${lead}&[`,
    ...items.map((item) => `${indent}${INDENT}${item},`),
    `${indent}],`,
  ];
};

const fieldValue = (token, indent) => {
  const lead = `${snake(token.prop)}: `;
  switch (token.kind) {
    case "colour": {
      return [`${indent}${lead}${toHex(token.colour)},`];
    }
    case "number": {
      return [`${indent}${lead}${float(token.number)},`];
    }
    case "stops": {
      const items = token.stops.map(
        (stop) => `stop(${toHex(stop.colour)}, ${float(stop.at)})`
      );
      return list(lead, items, indent);
    }
    default: {
      const items = token.shadows.map(
        (shadow) =>
          `shadow(${shadow.inset}, ${[shadow.x, shadow.y, shadow.blur, shadow.spread].map(float).join(", ")}, ${toHex(shadow.colour)})`
      );
      return list(lead, items, indent);
    }
  }
};

const HEADER = `//! Videorc's design tokens for GPUI: every appearance resolved to sRGB.
//!
//! Generated by \`pnpm theme:build\` from \`styles/videorc.css\` (Videorc plan
//! 260, S2.2a); \`pnpm theme:check\` fails when this file is stale. Do not edit
//! it: change the stylesheet and build again. Each field is the stylesheet's
//! custom property of the same name (\`chrome_fill_stops\` is
//! \`--chrome-fill-stops\`). Reduce Transparency changes nothing here: it only
//! turns the coats solid, and every GPUI window is opaque on the solid.

/// An sRGB colour as \`0xRRGGBBAA\`, the form \`gpui::rgba\` takes.
pub type Color = u32;

/// A gradient stop. Along a linear gradient \`at\` runs from 0 to 1; around
/// a conic one it is in turns (1 is 360°).
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Stop {
    pub color: Color,
    pub at: f32,
}

/// A box shadow as CSS draws it, in px.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Shadow {
    pub inset: bool,
    pub x: f32,
    pub y: f32,
    pub blur: f32,
    pub spread: f32,
    pub color: Color,
}

const fn stop(color: Color, at: f32) -> Stop {
    Stop { color, at }
}

const fn shadow(inset: bool, x: f32, y: f32, blur: f32, spread: f32, color: Color) -> Shadow {
    Shadow {
        inset,
        x,
        y,
        blur,
        spread,
        color,
    }
}
`;

const themeStruct = (tokens) => [
  "/// One appearance's tokens.",
  "#[derive(Clone, Copy, Debug, PartialEq)]",
  "pub struct Theme {",
  ...tokens.map(
    (token) => `${INDENT}pub ${snake(token.prop)}: ${RUST_TYPES[token.kind]},`
  ),
  "}",
];

const themeConst = ({ constName, title, tokens }) => [
  `/// ${title}.`,
  `pub const ${constName}: Theme = Theme {`,
  ...tokens.flatMap((token) => fieldValue(token, INDENT)),
  "};",
];

const SELECT = `impl Theme {
    /// The tokens for an appearance.
    pub fn get(dark: bool, increase_contrast: bool) -> &'static Theme {
        match (dark, increase_contrast) {
            (true, false) => &DARK,
            (false, false) => &LIGHT,
            (true, true) => &DARK_INCREASE_CONTRAST,
            (false, true) => &LIGHT_INCREASE_CONTRAST,
        }
    }
}`;

const constants = (doc, moduleName, entries) => [
  `/// ${doc}`,
  `pub mod ${moduleName} {`,
  ...entries.map((entry) => `${INDENT}${entry}`),
  "}",
];

const textModule = (text) => [
  "/// The type scale: size and line height in px, and the weight.",
  "pub mod text {",
  `${INDENT}#[derive(Clone, Copy, Debug, PartialEq)]`,
  `${INDENT}pub struct TextStyle {`,
  `${INDENT}${INDENT}pub size: f32,`,
  `${INDENT}${INDENT}pub line_height: f32,`,
  `${INDENT}${INDENT}pub weight: f32,`,
  `${INDENT}}`,
  "",
  ...text.flatMap((style) => [
    `${INDENT}pub const ${upper(style.name)}: TextStyle = TextStyle {`,
    `${INDENT}${INDENT}size: ${float(style.size)},`,
    `${INDENT}${INDENT}line_height: ${float(style.lineHeight)},`,
    `${INDENT}${INDENT}weight: ${float(style.weight)},`,
    `${INDENT}};`,
  ]),
  "}",
];

const fontEntry = ({ name, families }) => {
  const quoted = families.map((family) => `"${family}"`);
  const lead = `pub const ${upper(name)}: &[&str] = `;
  const inline = `${lead}&[${quoted.join(", ")}];`;
  if (
    quoted.join(", ").length <= ARRAY_WIDTH &&
    INDENT.length + inline.length <= LINE_WIDTH
  ) {
    return [inline];
  }
  return [`${lead}&[`, ...quoted.map((family) => `${INDENT}${family},`), "];"];
};

/** The whole tokens.rs. */
export const renderTokens = ({ appearances, fixed, metrics: sizes }) => {
  const [reference] = appearances;
  const sections = [
    HEADER.trimEnd().split("\n"),
    themeStruct(reference.tokens),
    ...appearances.map(themeConst),
    SELECT.split("\n"),
    constants(
      "Corner radii in px; the tiers are panel (containers, dialogs), row and chip.",
      "radius",
      sizes.radii.map(
        (radius) =>
          `pub const ${upper(radius.name)}: f32 = ${float(radius.px)};`
      )
    ),
    constants(
      "The desktop scale in px: one toolbar, one status bar, one row and one control height.",
      "size",
      sizes.sizes.map(
        (size) => `pub const ${upper(size.name)}: f32 = ${float(size.px)};`
      )
    ),
    textModule(sizes.text),
    constants(
      "The font stacks, in the stylesheet's order.",
      "font",
      sizes.fonts.flatMap(fontEntry)
    ),
    constants(
      "Colours that are the same in every appearance (the platforms' brand tints).",
      "fixed",
      fixed.map(
        ({ name, colour }) =>
          `pub const ${upper(name)}: super::Color = ${toHex(colour)};`
      )
    ),
  ];
  return `${sections.map((lines) => lines.join("\n")).join("\n\n")}\n`;
};
