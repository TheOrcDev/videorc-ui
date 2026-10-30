"use client";

import { useState } from "react";

import { SendIcon } from "@/components/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";

const MAX_CHARACTERS = 200;

const InputGroupTextareaExample = () => {
  const [message, setMessage] = useState("");
  return (
    <InputGroup className="max-w-sm">
      <InputGroupTextarea
        aria-label="Message"
        maxLength={MAX_CHARACTERS}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Say something on stream"
        value={message}
      />
      <InputGroupAddon align="block-end">
        <InputGroupText>
          <span className="tabular-nums">
            {message.length}/{MAX_CHARACTERS}
          </span>
        </InputGroupText>
        <InputGroupButton
          className="ml-auto"
          disabled={message.trim().length === 0}
          onClick={() => setMessage("")}
          variant="default"
        >
          <SendIcon />
          Send
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default InputGroupTextareaExample;
