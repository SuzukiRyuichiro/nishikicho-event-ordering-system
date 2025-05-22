import TabDetailsClientPage from './TabDetailsClientPage';

interface TabDetailPageProps {
  params: {
    tabId: string;
  };
}

export default function TabDetailPage({ params }: TabDetailPageProps) {
  return <TabDetailsClientPage tabId={params.tabId} />;
}

// Optional: Generate static paths if you know all tab IDs beforehand
// export async function generateStaticParams() {
//   // Fetch all tab IDs here
//   // const tabs = await fetch('/api/tabs').then(res => res.json());
//   // return tabs.map(tab => ({ tabId: tab.id }));
//   return [{ tabId: '1' }, { tabId: '2' }]; // Example
// }
