import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Home, FileText, Wrench, Settings, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const NavItems = () => (
    <>
      <NavigationMenuItem>
        <Link href="/" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link href="/rosters" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <FileText className="mr-2 h-4 w-4" />
            Rosters
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      {user && (
        <NavigationMenuItem>
          <Link href="/admin/dashboard" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Settings className="mr-2 h-4 w-4" />
              Admin
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      )}
      <NavigationMenuItem>
        <Link href="/links" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <Wrench className="mr-2 h-4 w-4" />
            Links/Tools
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    </>
  );

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container flex h-14 items-center justify-between">
        {/* Left placeholder for centering */}
        <div className="w-[50px] hidden md:block" />

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-2">
            <NavItems />
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link href="/rosters" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Rosters</span>
              </Link>
              {user && (
                <Link href="/admin/dashboard" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}
              <Link href="/links" className="flex items-center space-x-2">
                <Wrench className="h-4 w-4" />
                <span>Links/Tools</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center space-x-4">
          {/* Theme Switcher */}
          <ThemeSwitcher />
          {user ? (
            <SignOutButton />
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/admin/login">Admin Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
