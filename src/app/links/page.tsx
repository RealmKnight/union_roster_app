export default function LinksPage() {
  return (
    <div className="container max-w-[calc(100vw-2rem)] mx-auto py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Links & Tools</h1>
        <p className="text-sm text-muted-foreground">Useful resources and tools</p>
      </div>

      {/* Add your links and tools content here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Example card - add more as needed */}
        <div className="p-6 border rounded-lg space-y-2">
          <h2 className="text-lg font-medium">Coming Soon</h2>
          <p className="text-sm text-muted-foreground">Links and tools will be added here.</p>
        </div>
      </div>
    </div>
  );
}
