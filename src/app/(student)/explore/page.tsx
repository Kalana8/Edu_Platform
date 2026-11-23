import { redirect } from "next/navigation";
import { exploreRoutes } from "@/lib/explore/routes";

export default function ExploreIndexPage() {
  redirect(exploreRoutes.discover());
}
