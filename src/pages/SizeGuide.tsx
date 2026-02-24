import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SizeGuide = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container px-4 md:px-8 py-10 md:py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Size Guide</h1>
      <p className="text-sm text-muted-foreground mb-6">All measurements are in inches. For the best fit, measure yourself and compare with the chart below.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Size</TableHead>
            <TableHead className="font-semibold">Chest</TableHead>
            <TableHead className="font-semibold">Waist</TableHead>
            <TableHead className="font-semibold">Shoulder</TableHead>
            <TableHead className="font-semibold">Length</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[["S","36-38","30-32","16","27"],["M","38-40","32-34","17","28"],["L","40-42","34-36","18","29"],["XL","42-44","36-38","19","30"],["XXL","44-46","38-40","20","31"]].map(([size,...m])=>(
            <TableRow key={size}><TableCell className="font-medium">{size}</TableCell>{m.map((v,i)=><TableCell key={i}>{v}</TableCell>)}</TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
    <Footer />
  </div>
);

export default SizeGuide;
