"use client";

import { useState } from "react";

import { CheckIcon, CloseIcon, CopyIcon, SearchIcon } from "@/components/icons";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

const InputGroupButtonExample = () => {
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("raid");
  return (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel>Server URL</FieldLabel>
        <InputGroup>
          <InputGroupInput readOnly value="rtmp://live.twitch.tv/app" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={() => setCopied(true)}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy"}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <InputGroup>
        <InputGroupInput
          aria-label="Search chat"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search chat…"
          value={query}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        {query ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Clear search"
              onClick={() => setQuery("")}
              size="icon-xs"
            >
              <CloseIcon />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </FieldGroup>
  );
};

export default InputGroupButtonExample;
