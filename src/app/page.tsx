import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Users, BookOpen, Scale } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="w-full bg-primary/5 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Brotherhood of Locomotive Engineers and Trainmen
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              WC/CN General Committee of Adjustment - Representing railway workers across the network
            </p>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/rosters">View Rosters</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-12 md:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <Users className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Seniority Rosters</h3>
              <p className="text-center text-sm text-muted-foreground">
                Access and track prior rights seniority across all divisions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <FileText className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Documents</h3>
              <p className="text-center text-sm text-muted-foreground">
                Access union bylaws, constitution, and current contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <BookOpen className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Resources</h3>
              <p className="text-center text-sm text-muted-foreground">Educational materials and member resources</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center space-y-4 p-6">
              <Scale className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-semibold">Member Rights</h3>
              <p className="text-center text-sm text-muted-foreground">
                Information about your rights and representation
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full border-t bg-muted/50">
        <div className="container px-4 py-12 md:py-16">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">Need Assistance?</h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground">
              Contact your local chairman or general committee representative for support
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Information</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
