import { LivestreamIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

const ButtonGoLive = () => (
  <Button variant="go-live">
    <LivestreamIcon data-icon="inline-start" weight="fill" />
    Go live on 3 destinations
  </Button>
);

export default ButtonGoLive;
