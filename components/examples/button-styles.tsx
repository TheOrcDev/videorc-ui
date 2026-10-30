import { LivestreamIcon, SparkleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

const ButtonStyles = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="lg" variant="chromatic">
      <SparkleIcon data-icon="inline-start" weight="fill" />
      Go Live…
    </Button>
    <Button size="lg" variant="solid">
      Save scene
    </Button>
    <Button size="lg" variant="glitch">
      <LivestreamIcon data-icon="inline-start" />
      On air
    </Button>
  </div>
);

export default ButtonStyles;
