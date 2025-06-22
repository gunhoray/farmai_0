import { Link, useNavigate } from "react-router";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/common/components/ui/navigation-menu";
import { Separator } from "~/common/components/ui/separator";
import { Button } from "./ui/button";
import { useAuth } from "~/hooks/use-auth";

const menus: {
  name: string;
  to: string;
  items?: { name: string; description: string; to: string }[];
}[] = [
  {
    name: "Farms",
    to: "/farms/myfarms",
    items: [
      {
        name: "View Farms List",
        description: "View and manage your farms",
        to: "/farms/myfarms",
      },
      {
        name: "Add New Farm",
        description: "Register a new farm",
        to: "/farms/new",
      },
    ],
  },
  {
    name: "컨설팅",
    to: "/consulting",
  },
];

export default function Navigation() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="flex px-20 h-16 items-center justify-between backdrop-blur fixed top-0 left-0 right-0 z-50 bg-background/50">
      <div className="flex items-center">
        <Link to="/" className="font-bold tracking-tighter text-lg">
          Farmai
        </Link>
        <Separator orientation="vertical" className="h-6 mx-4" />
        {isAuthenticated && (
          <NavigationMenu>
            <NavigationMenuList>
              {menus.map((menu) => (
                <NavigationMenuItem key={menu.name}>
                  {menu.items ? (
                    <>
                      <Link to={menu.to}>
                        <NavigationMenuTrigger>{menu.name}</NavigationMenuTrigger>
                      </Link>
                      <NavigationMenuContent>
                        <div className="grid w-[400px] gap-3 p-4">
                          <ul className="grid gap-3">
                            {menu.items?.map((item) => (
                              <NavigationMenuItem
                                key={item.name}
                                className="select-none rounded-md transition-colors focus:bg-accent hover:bg-accent"
                              >
                                <NavigationMenuLink>
                                  <Link
                                    className="p-3 space-y-1 block leading-none no-underline outline-none"
                                    to={item.to}
                                  >
                                    <span className="text-sm font-medium leading-none">
                                      {item.name}
                                    </span>
                                    <p className="text-sm leading-snug text-muted-foreground">
                                      {item.description}
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </NavigationMenuItem>
                            ))}
                          </ul>
                        </div>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link className={navigationMenuTriggerStyle()} to={menu.to}>
                      {menu.name}
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
            <Button variant="destructive" onClick={() => navigate("/auth/leave")}>
              Leave
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="secondary">
              <Link to="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth/join">Join</Link>
            </Button>
            <Button asChild variant="destructive">
              <Link to="/auth/leave">Leave</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}

function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}