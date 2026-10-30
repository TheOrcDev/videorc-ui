"use client";

import { SearchIcon } from "@/components/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

const InputGroupDemo = () => (
  <InputGroup className="max-w-sm">
    <InputGroupInput
      aria-label="Search recordings"
      placeholder="Search recordings…"
    />
    <InputGroupAddon>
      <SearchIcon />
    </InputGroupAddon>
    <InputGroupAddon align="inline-end">
      <InputGroupText>12 results</InputGroupText>
    </InputGroupAddon>
  </InputGroup>
);

export default InputGroupDemo;
