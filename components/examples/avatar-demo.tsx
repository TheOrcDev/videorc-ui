"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AvatarDemo = () => (
  <div className="flex items-center gap-3">
    <Avatar size="lg">
      <AvatarImage alt="Videorc" src="/brand/logo.png" />
      <AvatarFallback>VR</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>MC</AvatarFallback>
    </Avatar>
    <Avatar size="sm">
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  </div>
);

export default AvatarDemo;
