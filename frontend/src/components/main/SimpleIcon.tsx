import BoltIcon from "@icon/BoltIcon";
import CalendarIcon from "@icon/CalendarIcon";
import ChartIcon from "@icon/ChartIcon";
import PeopleIcon from "@icon/PeopleIcon";
import ShieldIcon from "@icon/ShieldIcon";
import SparkIcon from "@icon/SparkIcon";

export default function SimpleIcon({
  kind,
}: {
  kind: "calendar" | "shield" | "spark" | "chart" | "bolt" | "people";
}) {
  switch (kind) {
    case "calendar":
      return <CalendarIcon />;
    case "shield":
      return <ShieldIcon />;
    case "spark":
      return <SparkIcon />;
    case "chart":
      return <ChartIcon />;
    case "bolt":
      return <BoltIcon />;
    case "people":
      return <PeopleIcon />;
  }
}
