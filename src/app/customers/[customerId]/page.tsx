import CustomerDetailsClientPage from './CustomerDetailsClientPage';

interface CustomerDetailPageProps {
  params: Promise<{
    customerId: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { customerId } = await params;
  return <CustomerDetailsClientPage customerId={customerId} />;
}

// Optional: Generate static paths if you know all customer IDs beforehand
// export async function generateStaticParams() {
//   // Fetch all customer IDs here
//   // const customers = await fetch('/api/customers').then(res => res.json());
//   // return customers.map(customer => ({ customerId: customer.id }));
//   return [{ customerId: '1' }, { customerId: '2' }]; // Example
// }
