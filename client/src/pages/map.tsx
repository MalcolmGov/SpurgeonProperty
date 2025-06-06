import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyMapExplorer from "@/components/PropertyMapExplorer";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function MapPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-slate-600 dark:text-slate-400">Property Map</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Interactive Property Map
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Explore properties across South Africa with our interactive map featuring advanced filtering and clustering
          </p>
        </div>

        {/* Map Explorer */}
        <PropertyMapExplorer />
      </div>
      
      <Footer />
    </div>
  );
}