import type { Route } from "../../../+types/farms/myfarms";
import { getFarms } from "../../../services/farm";
import FarmCard from "../../components/farm-card";
import Navigation from "~/common/components/navagation";

export async function loader({ request }: Route.LoaderArgs) {
  const farms = await getFarms();
  return { farms };
}

export function action() {
  return {};
}

export function meta() {
  return [
    { title: "My Farms - FarmAI" },
    { name: "description", content: "View and manage your farms" },
  ];
}

export default function MyFarms({ loaderData }: Route.ComponentProps) {
  const { farms } = loaderData;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-20 mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">내 농장 목록</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => (
            <div key={farm.farm_id} className="p-2">
              <FarmCard
                id={farm.farm_id}
                name={farm.name}
                location={farm.location}
                ownerName={farm.owner_name}
                lastUpdated={new Date(farm.updated_at).toLocaleDateString()}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 