"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";

const MODERATORS = [
  { id: "maya", initials: "MC" },
  { id: "jonas", initials: "JD" },
  { id: "priya", initials: "PS" },
];

const AvatarGroupExample = () => (
  <AvatarGroup>
    {MODERATORS.map((moderator) => (
      <Avatar key={moderator.id}>
        <AvatarFallback>{moderator.initials}</AvatarFallback>
      </Avatar>
    ))}
    <AvatarGroupCount>+12</AvatarGroupCount>
  </AvatarGroup>
);

export default AvatarGroupExample;
